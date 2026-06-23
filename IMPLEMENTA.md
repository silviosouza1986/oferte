# IMPLEMENTA.md — Oferte

Guia de implementação em produção. Siga os passos na ordem para qualquer agente de IA ou profissional de DevOps.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Clonar o repositório](#2-clonar-o-repositório)
3. [Configurar ambiente](#3-configurar-ambiente)
4. [Configurar variáveis de ambiente](#4-configurar-variáveis-de-ambiente)
5. [Instalar dependências](#5-instalar-dependências)
6. [Migrar banco de dados](#6-migrar-banco-de-dados)
7. [Criar superusuário](#7-criar-superusuário)
8. [Popular com dados de teste (opcional)](#8-popular-com-dados-de-teste-opcional)
9. [Coletar arquivos estáticos](#9-coletar-arquivos-estáticos)
10. [Configurar servidor web (Nginx)](#10-configurar-servidor-web-nginx)
11. [Configurar Gunicorn como service](#11-configurar-gunicorn-como-service)
12. [Configurar HTTPS com Certbot](#12-configurar-https-com-certbot)
13. [Ajustar settings.py para produção](#13-ajustar-settingspy-para-produção)
14. [Verificar segurança](#14-verificar-segurança)
15. [Manutenção](#15-manutenção)

---

## 1. Pré-requisitos

- Servidor Linux (Ubuntu 22.04+ ou Debian 12+)
- Python 3.14 ou superior
- Nginx
- Git
- Acesso SSH ao servidor
- Domínio configurado apontando para o IP do servidor

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-dev nginx git certbot python3-certbot-nginx
```

## 2. Clonar o repositório

```bash
# Escolha um diretório para a aplicação
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www

# Clone
git clone https://github.com/silviosouza1986/oferte.git oferte
cd oferte
```

## 3. Configurar ambiente

```bash
python3 -m venv venv
source venv/bin/activate
```

## 4. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
nano .env
```

Conteúdo mínimo (substitua os valores):

```env
SECRET_KEY=gerar_nova_chave_aleatoria_64_caracteres
DEBUG=False
ALLOWED_HOSTS=seudominio.com,www.seudominio.com
```

> **IMPORTANTE**: Gere uma nova `SECRET_KEY` para produção. Use este comando Python:
> ```python
> import secrets; print(secrets.token_urlsafe(64))
> ```

## 5. Instalar dependências

```bash
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

## 6. Migrar banco de dados

```bash
source venv/bin/activate
python manage.py migrate
```

## 7. Criar superusuário

```bash
source venv/bin/activate
python manage.py createsuperuser
```

Siga as instruções para definir e-mail, nome, CPF e senha do administrador.

## 8. Popular com dados de teste (opcional)

Se quiser dados de demonstração:

```bash
source venv/bin/activate
python manage.py seed_data
```

Isso cria 1 admin (`admin@igreja.com` / `123456`), 15 dizimistas e ~49 ofertas.

## 9. Coletar arquivos estáticos

```bash
source venv/bin/activate
python manage.py collectstatic --noinput
```

## 10. Configurar servidor web (Nginx)

Crie o arquivo de configuração do site:

```bash
sudo nano /etc/nginx/sites-available/oferte
```

Conteúdo (substitua `seudominio.com` pelo seu domínio real):

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias /var/www/oferte/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/oferte/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_redirect off;
    }
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/oferte /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 11. Configurar Gunicorn como service

Crie o arquivo de serviço systemd:

```bash
sudo nano /etc/systemd/system/oferte.service
```

Conteúdo:

```ini
[Unit]
Description=Oferte - Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/oferte
Environment="PATH=/var/www/oferte/venv/bin"
EnvironmentFile=/var/www/oferte/.env
ExecStart=/var/www/oferte/venv/bin/gunicorn --workers 3 --bind unix:/run/gunicorn.sock core.wsgi:application

[Install]
WantedBy=multi-user.target
```

Ajuste permissões e ative:

```bash
# O diretório precisa ser acessível pelo usuário www-data
sudo chown -R www-data:www-data /var/www/oferte
sudo chmod -R 755 /var/www/oferte

# O socket do gunicorn precisa de permissão de escrita
sudo chown -R www-data:www-data /run/gunicorn.sock 2>/dev/null || true

sudo systemctl daemon-reload
sudo systemctl enable oferte
sudo systemctl start oferte
sudo systemctl status oferte
```

### Workers

Ajuste o número de workers conforme o servidor. Regra geral: `2 * num_cores + 1`.

```ini
ExecStart=/var/www/oferte/venv/bin/gunicorn --workers 5 --bind unix:/run/gunicorn.sock core.wsgi:application
```

## 12. Configurar HTTPS com Certbot

```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

Renovação automática já é configurada pelo Certbot. Para testar:

```bash
sudo certbot renew --dry-run
```

## 13. Ajustar settings.py para produção

As configurações já usam `python-decouple`, então controle tudo via `.env`. Verifique que `core/settings.py` contém os valores corretos lidos do `.env`.

Em produção, o `.env` deve ter:

```env
SECRET_KEY=<chave_aleatoria_64_caracteres>
DEBUG=False
ALLOWED_HOSTS=seudominio.com,www.seudominio.com
```

Certifique-se de que `STATIC_ROOT` e `STATICFILES_DIRS` em `settings.py` estejam corretos (já estão):

```python
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### Firewall

Se estiver usando UFW:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
sudo ufw enable
```

### Django Security Settings (opcional, recomendado)

Adicione estas linhas no final de `core/settings.py` para produção:

```python
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

> Se adicionar `SECURE_SSL_REDIRECT`, remova ou comente durante o desenvolvimento local.

## 14. Verificar segurança

Após a implementação, execute estes testes:

```bash
# O app responde?
curl -I https://seudominio.com

# Página de login?
curl -I https://seudominio.com/login/

# Estáticos servidos?
curl -I https://seudominio.com/static/css/material-theme.css

# API protegida (deve retornar 401 sem token)?
curl -I https://seudominio.com/api/usuarios/
```

Teste também pelo navegador:

- [ ] HTTPS funcionando (cadeado verde)
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] CRUD de usuários
- [ ] CRUD de ofertas
- [ ] Listagem de dizimistas
- [ ] Configurações da igreja
- [ ] Tema personalizável
- [ ] Página `/apresentacao/` acessível sem login
- [ ] Redirecionamento de HTTP para HTTPS

## 15. Manutenção

### Atualizar código

```bash
cd /var/www/oferte
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart oferte
```

### Ver logs

```bash
# Gunicorn
sudo journalctl -u oferte -f

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup do banco

```bash
cp /var/www/oferte/db.sqlite3 /var/backups/oferte/db-$(date +%Y%m%d-%H%M%S).sqlite3
```

### Reiniciar serviços

```bash
sudo systemctl restart oferte
sudo systemctl reload nginx
```

---

## Checklist final de implementação

- [ ] `SECRET_KEY` nova gerada (não usar a de desenvolvimento)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` configurado com o domínio real
- [ ] SSL/HTTPS ativo (Certbot)
- [ ] `collectstatic` rodado
- [ ] Gunicorn rodando como serviço systemd
- [ ] Nginx configurado e testado
- [ ] Firewall liberado (80, 443)
- [ ] Logs monitorados
- [ ] Backup do banco agendado (cron recomendado)

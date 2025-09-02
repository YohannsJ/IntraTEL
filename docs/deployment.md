# 🚀 Guía de Despliegue - IntraTEL

## 🎯 Introducción

Esta guía detalla los procesos de despliegue para IntraTEL en diferentes entornos, desde desarrollo local hasta producción completa.

## 🏗️ Arquitectura de Despliegue

### **Entornos Disponibles**

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Development   │   │     Staging     │   │   Production    │
│                 │   │                 │   │                 │
│ • Local dev     │   │ • Pre-release   │   │ • Live system   │
│ • Hot reload    │   │ • Testing env   │   │ • Full security │
│ • Debug mode    │   │ • QA approval   │   │ • Optimized     │
│ • Mock data     │   │ • Real data     │   │ • Monitoring    │
└─────────────────┘   └─────────────────┘   └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   localhost:5173          staging.intratel.com    intratel.com
```

## 🔧 Preparación del Entorno

### **Prerrequisitos del Sistema**

#### **Servidor de Aplicación**
- **OS**: Ubuntu 20.04 LTS / CentOS 8+ / RHEL 8+
- **Node.js**: 18.0.0 o superior
- **npm**: 9.0.0 o superior
- **Memory**: Mínimo 2GB RAM, Recomendado 4GB+
- **Storage**: Mínimo 10GB SSD, Recomendado 50GB+
- **CPU**: Mínimo 2 cores, Recomendado 4 cores+

#### **Herramientas Adicionales**
```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gestión de procesos
npm install -g pm2

# Instalar Nginx como reverse proxy
sudo apt install nginx

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx

# Herramientas de monitoreo (opcional)
sudo apt install htop iotop nethogs
```

## 🌍 Variables de Entorno por Ambiente

### **Development (.env.development)**
```env
# === Development Environment ===
NODE_ENV=development
PORT=3001
DEBUG=true

# === API Configuration ===
VITE_API_BASE_URL=http://localhost:3001
VITE_API_PREFIX=/api

# === Database ===
DB_PATH=./server/data/intratel.db
DB_BACKUP_PATH=./server/backups/

# === JWT Configuration ===
JWT_SECRET=development_secret_change_me
JWT_EXPIRES_IN=24h

# === Application ===
VITE_APP_NAME=IntraTEL (Dev)
VITE_APP_VERSION=1.0.0-dev
VITE_APP_URL=http://localhost:5173

# === Development Features ===
VITE_ENABLE_LOGGING=true
VITE_DEBUG_MODE=true
VITE_SHOW_DEV_TOOLS=true

# === Game Configuration ===
VITE_MAX_FLAG_ATTEMPTS=10
VITE_FLAG_COOLDOWN_MINUTES=1
VITE_DEFAULT_FLAG_POINTS=10

# === UI Configuration ===
VITE_ITEMS_PER_PAGE=10
VITE_ADMIN_STATS_REFRESH_INTERVAL=10000
```

### **Staging (.env.staging)**
```env
# === Staging Environment ===
NODE_ENV=staging
PORT=3001
DEBUG=false

# === API Configuration ===
VITE_API_BASE_URL=https://staging-api.intratel.com
VITE_API_PREFIX=/api

# === Database ===
DB_PATH=/var/lib/intratel/staging/intratel.db
DB_BACKUP_PATH=/var/backups/intratel-staging/

# === JWT Configuration ===
JWT_SECRET=staging_secret_super_secure_change_in_production
JWT_EXPIRES_IN=7d

# === Application ===
VITE_APP_NAME=IntraTEL (Staging)
VITE_APP_VERSION=1.0.0-rc
VITE_APP_URL=https://staging.intratel.com

# === Security ===
CORS_ORIGIN=https://staging.intratel.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# === Features ===
VITE_ENABLE_LOGGING=true
VITE_DEBUG_MODE=false
VITE_SHOW_DEV_TOOLS=false

# === Game Configuration ===
VITE_MAX_FLAG_ATTEMPTS=3
VITE_FLAG_COOLDOWN_MINUTES=5
VITE_DEFAULT_FLAG_POINTS=10
```

### **Production (.env.production)**
```env
# === Production Environment ===
NODE_ENV=production
PORT=3001
DEBUG=false

# === API Configuration ===
VITE_API_BASE_URL=https://api.intratel.com
VITE_API_PREFIX=/api

# === Database ===
DB_PATH=/var/lib/intratel/production/intratel.db
DB_BACKUP_PATH=/var/backups/intratel-production/

# === JWT Configuration ===
JWT_SECRET=production_super_secure_secret_32_chars_min
JWT_EXPIRES_IN=7d

# === Application ===
VITE_APP_NAME=IntraTEL
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://intratel.com

# === Security ===
CORS_ORIGIN=https://intratel.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=60

# === Features ===
VITE_ENABLE_LOGGING=false
VITE_DEBUG_MODE=false
VITE_SHOW_DEV_TOOLS=false

# === Performance ===
COMPRESSION=true
CACHE_STATIC_FILES=true
SESSION_TIMEOUT_HOURS=8

# === Monitoring ===
LOG_LEVEL=error
LOG_FILE=/var/log/intratel/app.log
ERROR_LOG_FILE=/var/log/intratel/error.log
```

## 📦 Proceso de Build

### **Build para Staging**
```bash
#!/bin/bash
# scripts/build-staging.sh

echo "🚀 Building IntraTEL for Staging..."

# 1. Limpiar builds anteriores
rm -rf dist/
rm -rf server/dist/

# 2. Instalar dependencias
echo "📦 Installing dependencies..."
npm ci
cd server && npm ci && cd ..

# 3. Ejecutar tests
echo "🧪 Running tests..."
npm run test
npm run test:backend

# 4. Lint y format
echo "🔍 Linting code..."
npm run lint
npm run format

# 5. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 6. Preparar archivos para despliegue
echo "📋 Preparing deployment files..."
mkdir -p deploy/
cp -r dist/ deploy/
cp -r server/ deploy/
cp package*.json deploy/
cp .env.staging deploy/.env

# 7. Crear tarball
echo "📦 Creating deployment package..."
tar -czf intratel-staging-$(date +%Y%m%d-%H%M%S).tar.gz deploy/

echo "✅ Build completed successfully!"
```

### **Build para Production**
```bash
#!/bin/bash
# scripts/build-production.sh

echo "🚀 Building IntraTEL for Production..."

# 1. Verificar branch (solo desde main)
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ Production builds must be from main branch"
    exit 1
fi

# 2. Verificar que no hay cambios uncommitted
if ! git diff-index --quiet HEAD --; then
    echo "❌ Uncommitted changes detected"
    exit 1
fi

# 3. Limpiar builds anteriores
rm -rf dist/
rm -rf server/dist/

# 4. Instalar dependencias
echo "📦 Installing dependencies..."
npm ci
cd server && npm ci && cd ..

# 5. Ejecutar suite completa de tests
echo "🧪 Running full test suite..."
npm run test:full
npm run test:e2e
npm run test:security

# 6. Análisis de seguridad
echo "🔒 Security audit..."
npm audit --audit-level moderate
cd server && npm audit --audit-level moderate && cd ..

# 7. Build optimizado para producción
echo "🏗️ Building optimized production bundle..."
NODE_ENV=production npm run build

# 8. Optimizar assets
echo "📈 Optimizing assets..."
npm run optimize:images
npm run optimize:fonts

# 9. Generar archivos de cache
echo "📋 Generating cache manifest..."
npm run generate:cache-manifest

# 10. Preparar deploy
echo "📦 Preparing production deployment..."
mkdir -p deploy-prod/
cp -r dist/ deploy-prod/
cp -r server/ deploy-prod/
cp package*.json deploy-prod/
cp .env.production deploy-prod/.env

# 11. Crear release
version=$(node -p "require('./package.json').version")
tar -czf intratel-production-v${version}-$(date +%Y%m%d-%H%M%S).tar.gz deploy-prod/

echo "✅ Production build completed successfully!"
echo "📦 Package: intratel-production-v${version}-$(date +%Y%m%d-%H%M%S).tar.gz"
```

## 🚀 Despliegue en Servidor

### **1. Configuración Inicial del Servidor**

```bash
#!/bin/bash
# scripts/server-setup.sh

echo "🔧 Setting up IntraTEL server..."

# Crear usuario para la aplicación
sudo useradd -m -s /bin/bash intratel
sudo usermod -aG www-data intratel

# Crear directorios necesarios
sudo mkdir -p /var/lib/intratel/{production,staging}
sudo mkdir -p /var/log/intratel
sudo mkdir -p /var/backups/intratel-{production,staging}
sudo mkdir -p /etc/intratel

# Configurar permisos
sudo chown -R intratel:intratel /var/lib/intratel
sudo chown -R intratel:intratel /var/log/intratel
sudo chown -R intratel:intratel /var/backups/intratel-*

# Configurar logrotate
sudo tee /etc/logrotate.d/intratel << EOF
/var/log/intratel/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 intratel intratel
    postrotate
        pm2 reload intratel-production || true
        pm2 reload intratel-staging || true
    endscript
}
EOF

echo "✅ Server setup completed!"
```

### **2. Script de Despliegue Automatizado**

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}
BACKUP_BEFORE_DEPLOY=${2:-true}
RESTART_SERVICES=${3:-true}

echo "🚀 Deploying IntraTEL to $ENVIRONMENT..."

# Configuración por ambiente
if [ "$ENVIRONMENT" = "production" ]; then
    APP_DIR="/var/lib/intratel/production"
    PM2_APP_NAME="intratel-production"
    NGINX_CONFIG="intratel-production"
    DOMAIN="intratel.com"
elif [ "$ENVIRONMENT" = "staging" ]; then
    APP_DIR="/var/lib/intratel/staging"
    PM2_APP_NAME="intratel-staging"
    NGINX_CONFIG="intratel-staging"
    DOMAIN="staging.intratel.com"
else
    echo "❌ Environment must be 'staging' or 'production'"
    exit 1
fi

# Backup antes del deploy
if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
    echo "💾 Creating backup..."
    timestamp=$(date +%Y%m%d-%H%M%S)
    backup_dir="/var/backups/intratel-$ENVIRONMENT"
    
    # Backup de la aplicación
    if [ -d "$APP_DIR" ]; then
        sudo tar -czf "$backup_dir/app-backup-$timestamp.tar.gz" -C "$APP_DIR" .
    fi
    
    # Backup de la base de datos
    if [ -f "$APP_DIR/server/data/intratel.db" ]; then
        sudo cp "$APP_DIR/server/data/intratel.db" "$backup_dir/db-backup-$timestamp.db"
    fi
    
    echo "✅ Backup created in $backup_dir"
fi

# Parar aplicación existente
echo "⏹️ Stopping existing application..."
pm2 stop "$PM2_APP_NAME" || true

# Crear directorio temporal para el nuevo deploy
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Extraer archivos del deployment
echo "📦 Extracting deployment package..."
tar -xzf "intratel-$ENVIRONMENT-*.tar.gz" -C "$TEMP_DIR" --strip-components=1

# Validar estructura de archivos
if [ ! -f "$TEMP_DIR/package.json" ] || [ ! -d "$TEMP_DIR/server" ]; then
    echo "❌ Invalid deployment package structure"
    exit 1
fi

# Instalar dependencias del backend
echo "📦 Installing backend dependencies..."
cd "$TEMP_DIR/server"
npm ci --only=production

# Mover a directorio final
echo "📂 Deploying to $APP_DIR..."
sudo rm -rf "$APP_DIR.old"
if [ -d "$APP_DIR" ]; then
    sudo mv "$APP_DIR" "$APP_DIR.old"
fi
sudo mv "$TEMP_DIR" "$APP_DIR"
sudo chown -R intratel:intratel "$APP_DIR"

# Configurar variables de entorno
echo "⚙️ Configuring environment..."
sudo cp "$APP_DIR/.env" "/etc/intratel/.env.$ENVIRONMENT"
sudo chown intratel:intratel "/etc/intratel/.env.$ENVIRONMENT"
sudo chmod 600 "/etc/intratel/.env.$ENVIRONMENT"

# Configurar PM2
echo "🔧 Configuring PM2..."
sudo -u intratel tee "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: '$APP_DIR/server/server.js',
    cwd: '$APP_DIR',
    env_file: '/etc/intratel/.env.$ENVIRONMENT',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/intratel/error.log',
    out_file: '/var/log/intratel/app.log',
    log_file: '/var/log/intratel/combined.log',
    time: true
  }]
};
EOF

# Migrar base de datos si es necesario
echo "🗄️ Running database migrations..."
cd "$APP_DIR/server"
sudo -u intratel node scripts/migrate.js || true

# Reiniciar servicios
if [ "$RESTART_SERVICES" = "true" ]; then
    echo "🔄 Starting application..."
    sudo -u intratel pm2 start "$APP_DIR/ecosystem.config.js"
    
    # Configurar Nginx si no existe
    if [ ! -f "/etc/nginx/sites-available/$NGINX_CONFIG" ]; then
        echo "🌐 Configuring Nginx..."
        sudo tee "/etc/nginx/sites-available/$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (Static files)
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
}
EOF
        
        sudo ln -sf "/etc/nginx/sites-available/$NGINX_CONFIG" "/etc/nginx/sites-enabled/"
        sudo nginx -t && sudo systemctl reload nginx
    fi
fi

# Limpiar archivos temporales
sudo rm -rf "$APP_DIR.old"

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be available at https://$DOMAIN"

# Verificar que la aplicación esté funcionando
echo "🔍 Verifying deployment..."
sleep 10
if curl -f -s "https://$DOMAIN/api/health" > /dev/null; then
    echo "✅ Health check passed - Application is running"
else
    echo "⚠️ Health check failed - Please verify manually"
fi
```

## 🔒 Configuración SSL/HTTPS

### **Obtener Certificado SSL con Let's Encrypt**

```bash
#!/bin/bash
# scripts/setup-ssl.sh

DOMAIN=${1:-intratel.com}
EMAIL=${2:-admin@intratel.com}

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Instalar Certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    sudo apt update
    sudo apt install certbot python3-certbot-nginx
fi

# Obtener certificado
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --redirect

# Configurar renovación automática
echo "🔄 Setting up automatic renewal..."
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Test de renovación
sudo certbot renew --dry-run

echo "✅ SSL certificate configured successfully!"
echo "🌐 Your site should now be available at https://$DOMAIN"
```

## 📊 Monitoreo y Logs

### **Configuración de PM2 Monitoring**

```bash
# Instalar PM2 Plus para monitoreo avanzado (opcional)
pm2 install pm2-server-monit

# Configurar métricas
pm2 set pm2:autodump true
pm2 set pm2:watch true

# Ver logs en tiempo real
pm2 logs intratel-production

# Ver métricas del sistema
pm2 monit

# Reiniciar aplicación sin downtime
pm2 reload intratel-production
```

### **Script de Monitoreo de Salud**

```bash
#!/bin/bash
# scripts/health-check.sh

ENVIRONMENT=${1:-production}
DOMAIN=${2:-intratel.com}

echo "🔍 Running health check for $ENVIRONMENT..."

# Check HTTP response
echo "Testing HTTP response..."
response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health")
if [ "$response" = "200" ]; then
    echo "✅ HTTP health check passed"
else
    echo "❌ HTTP health check failed (response: $response)"
fi

# Check database connectivity
echo "Testing database connectivity..."
db_check=$(curl -s "https://$DOMAIN/api/health/db" | jq -r '.status')
if [ "$db_check" = "ok" ]; then
    echo "✅ Database connectivity check passed"
else
    echo "❌ Database connectivity check failed"
fi

# Check PM2 processes
echo "Checking PM2 processes..."
pm2_status=$(pm2 jlist | jq -r ".[].pm2_env.status" | grep -c "online")
if [ "$pm2_status" -gt "0" ]; then
    echo "✅ PM2 processes are running ($pm2_status instances)"
else
    echo "❌ No PM2 processes running"
fi

# Check disk space
echo "Checking disk space..."
disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
if [ "$disk_usage" -lt "80" ]; then
    echo "✅ Disk space OK ($disk_usage% used)"
else
    echo "⚠️ Disk space warning ($disk_usage% used)"
fi

# Check memory usage
echo "Checking memory usage..."
mem_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
if (( $(echo "$mem_usage < 80" | bc -l) )); then
    echo "✅ Memory usage OK ($mem_usage% used)"
else
    echo "⚠️ Memory usage warning ($mem_usage% used)"
fi

echo "🏁 Health check completed"
```

## 🔄 Rollback y Recovery

### **Script de Rollback**

```bash
#!/bin/bash
# scripts/rollback.sh

ENVIRONMENT=${1:-staging}
BACKUP_TIMESTAMP=${2}

echo "🔄 Rolling back IntraTEL $ENVIRONMENT environment..."

if [ "$ENVIRONMENT" = "production" ]; then
    APP_DIR="/var/lib/intratel/production"
    PM2_APP_NAME="intratel-production"
    BACKUP_DIR="/var/backups/intratel-production"
elif [ "$ENVIRONMENT" = "staging" ]; then
    APP_DIR="/var/lib/intratel/staging"
    PM2_APP_NAME="intratel-staging"
    BACKUP_DIR="/var/backups/intratel-staging"
else
    echo "❌ Environment must be 'staging' or 'production'"
    exit 1
fi

# Listar backups disponibles si no se especifica timestamp
if [ -z "$BACKUP_TIMESTAMP" ]; then
    echo "📋 Available backups:"
    ls -la "$BACKUP_DIR"/app-backup-*.tar.gz
    echo ""
    echo "Usage: $0 $ENVIRONMENT <backup-timestamp>"
    echo "Example: $0 $ENVIRONMENT 20231201-143022"
    exit 1
fi

# Verificar que el backup existe
BACKUP_FILE="$BACKUP_DIR/app-backup-$BACKUP_TIMESTAMP.tar.gz"
DB_BACKUP_FILE="$BACKUP_DIR/db-backup-$BACKUP_TIMESTAMP.db"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️ This will restore the application to backup from $BACKUP_TIMESTAMP"
echo "Current application will be backed up as rollback-from-$(date +%Y%m%d-%H%M%S)"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 1
fi

# Backup current state before rollback
echo "💾 Backing up current state..."
current_timestamp=$(date +%Y%m%d-%H%M%S)
sudo tar -czf "$BACKUP_DIR/rollback-from-$current_timestamp.tar.gz" -C "$APP_DIR" .

# Stop application
echo "⏹️ Stopping application..."
pm2 stop "$PM2_APP_NAME"

# Restore application files
echo "📂 Restoring application files..."
sudo rm -rf "$APP_DIR.rollback"
sudo mv "$APP_DIR" "$APP_DIR.rollback"
sudo mkdir -p "$APP_DIR"
sudo tar -xzf "$BACKUP_FILE" -C "$APP_DIR"
sudo chown -R intratel:intratel "$APP_DIR"

# Restore database if backup exists
if [ -f "$DB_BACKUP_FILE" ]; then
    echo "🗄️ Restoring database..."
    sudo cp "$DB_BACKUP_FILE" "$APP_DIR/server/data/intratel.db"
    sudo chown intratel:intratel "$APP_DIR/server/data/intratel.db"
fi

# Reinstall dependencies
echo "📦 Installing dependencies..."
cd "$APP_DIR/server"
sudo -u intratel npm ci --only=production

# Restart application
echo "🔄 Starting application..."
sudo -u intratel pm2 start "$APP_DIR/ecosystem.config.js"

# Wait and verify
sleep 10
if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
    echo "✅ Rollback completed successfully!"
    echo "🗑️ Previous version backed up as: rollback-from-$current_timestamp"
else
    echo "❌ Rollback may have failed - check PM2 logs"
    pm2 logs "$PM2_APP_NAME" --lines 20
fi
```

## 📈 Optimizaciones de Performance

### **Configuración de Nginx para Performance**

```nginx
# /etc/nginx/sites-available/intratel-optimized
server {
    listen 443 ssl http2;
    server_name intratel.com;
    
    # SSL Configuration (optimizada)
    ssl_certificate /etc/letsencrypt/live/intratel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/intratel.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend con cache agresivo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/lib/intratel/production/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        
        # Pre-compressed files
        gzip_static on;
    }
    
    # Frontend HTML (sin cache)
    location / {
        root /var/lib/intratel/production/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # API con rate limiting
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

## 🔍 Testing de Deployment

### **Tests Automatizados Post-Deploy**

```bash
#!/bin/bash
# scripts/post-deploy-tests.sh

ENVIRONMENT=${1:-staging}
BASE_URL=${2:-https://staging.intratel.com}

echo "🧪 Running post-deployment tests for $ENVIRONMENT..."

# Test 1: Health check endpoint
echo "1. Testing health endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$response" = "200" ]; then
    echo "   ✅ Health endpoint OK"
else
    echo "   ❌ Health endpoint failed (HTTP $response)"
    exit 1
fi

# Test 2: Frontend loads
echo "2. Testing frontend loading..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$response" = "200" ]; then
    echo "   ✅ Frontend loads OK"
else
    echo "   ❌ Frontend failed to load (HTTP $response)"
    exit 1
fi

# Test 3: API authentication
echo "3. Testing API authentication..."
auth_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid","password":"invalid"}' \
    -w "%{http_code}")

if echo "$auth_response" | grep -q "401\|400"; then
    echo "   ✅ Auth endpoint responding correctly"
else
    echo "   ❌ Auth endpoint not responding as expected"
    exit 1
fi

# Test 4: Database connectivity
echo "4. Testing database connectivity..."
db_response=$(curl -s "$BASE_URL/api/health/db")
if echo "$db_response" | grep -q '"status":"ok"'; then
    echo "   ✅ Database connectivity OK"
else
    echo "   ❌ Database connectivity failed"
    exit 1
fi

# Test 5: Static assets
echo "5. Testing static assets..."
css_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/index.css")
if [ "$css_response" = "200" ]; then
    echo "   ✅ Static assets loading OK"
else
    echo "   ❌ Static assets failed to load"
    exit 1
fi

echo "✅ All post-deployment tests passed!"
```

---

<div align="center">

**Despliegue seguro y confiable para IntraTEL**

[⬅️ Volver al README](../README.md) | [📖 Manual de Usuario](./user-manual.md) | [🔧 Guía de Desarrollo](./development-guide.md) | [🏗️ Arquitectura](./architecture.md)

</div>

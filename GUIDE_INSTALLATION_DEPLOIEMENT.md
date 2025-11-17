# Guide d'Installation et de Déploiement - KPI Dashboard

## Table des Matières

1. [Prérequis système](#1-prérequis-système)
2. [Installation de développement](#2-installation-de-développement)
3. [Configuration de la base de données](#3-configuration-de-la-base-de-données)
4. [Configuration MQTT](#4-configuration-mqtt)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Déploiement en production](#6-déploiement-en-production)
7. [Monitoring et maintenance](#7-monitoring-et-maintenance)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prérequis système

### 1.1 Environnement de développement

#### Logiciels requis
```bash
Node.js >= 18.17.0
npm >= 9.0.0
PostgreSQL >= 14.0
Git >= 2.30.0
```

#### Recommandations matérielles
- **RAM** : Minimum 8GB, Recommandé 16GB
- **CPU** : Minimum 4 cores, Recommandé 8 cores
- **Stockage** : 50GB d'espace libre (SSD recommandé)
- **Réseau** : Connexion stable pour MQTT

### 1.2 Environnement de production

#### Serveur d'application
```bash
Ubuntu 22.04 LTS / CentOS 8
Node.js 18.x (LTS)
PM2 (Process Manager)
Nginx (Reverse Proxy)
SSL/TLS Certificate
```

#### Base de données
```bash
PostgreSQL 14+ avec extensions :
- uuid-ossp
- pg_stat_statements
- pg_repack (pour maintenance)
```

#### Infrastructure réseau
```bash
MQTT Broker (Eclipse Mosquitto ou HiveMQ)
Load Balancer (optionnel)
Firewall configuré
Monitoring (Prometheus + Grafana)
```

---

## 2. Installation de développement

### 2.1 Clonage et installation

```bash
# Cloner le repository
git clone <repository-url> kpi-dashboard
cd kpi-dashboard

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local
```

### 2.2 Structure du projet après installation

```
kpi-dashboard/
├── app/                    # App Router (Next.js 15)
│   ├── (dashboard)/       # Routes groupées
│   ├── api/               # API Routes
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx          # Page d'accueil
├── components/           # Composants React
│   ├── dashboard/       # Composants spécifiques
│   ├── layout/          # Composants layout
│   └── ui/              # Composants UI réutilisables
├── lib/                 # Utilitaires et services
│   ├── hooks/          # Custom hooks
│   ├── calculations.ts  # Calculs KPI
│   ├── mqtt-service.ts # Service MQTT
│   └── prisma.ts       # Configuration Prisma
├── prisma/             # Configuration base de données
│   ├── schema.prisma   # Schéma de données
│   └── seed.ts         # Données de test
├── types/              # Définitions TypeScript
└── public/            # Assets statiques
```

### 2.3 Scripts de développement

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 3. Configuration de la base de données

### 3.1 Installation PostgreSQL

#### Ubuntu/Debian
```bash
# Installation
sudo apt update
sudo apt install postgresql postgresql-contrib

# Démarrage du service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configuration utilisateur
sudo -u postgres createuser --interactive
sudo -u postgres createdb kpi_dashboard
```

#### Docker (Alternative)
```bash
# Lancer PostgreSQL avec Docker
docker run --name postgres-kpi \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=kpi_dashboard \
  -p 5432:5432 \
  -d postgres:14

# Vérification
docker logs postgres-kpi
```

### 3.2 Configuration Prisma

#### Générer le client Prisma
```bash
# Générer le client
npx prisma generate

# Appliquer le schéma
npx prisma db push

# Seeder les données de test
npx prisma db seed
```

#### Migrations en production
```bash
# Générer une migration
npx prisma migrate dev --name init

# Appliquer en production
npx prisma migrate deploy
```

### 3.3 Optimisation base de données

#### Configuration PostgreSQL (`postgresql.conf`)
```ini
# Mémoire
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connections
max_connections = 200
listen_addresses = '*'

# Logging
log_statement = 'all'
log_min_duration_statement = 1000

# Performance
effective_cache_size = 1GB
random_page_cost = 1.1
```

#### Index de performance
```sql
-- Index pour les requêtes fréquentes
CREATE INDEX CONCURRENTLY idx_production_timestamp 
ON "ProductionData" (timestamp DESC);

CREATE INDEX CONCURRENTLY idx_kpi_line_timestamp 
ON "KPISnapshot" (line_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_alerts_active 
ON "Alert" (status, created_at DESC) 
WHERE status = 'ACTIVE';
```

---

## 4. Configuration MQTT

### 4.1 Installation Eclipse Mosquitto

#### Ubuntu/Debian
```bash
# Installation
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Configuration
sudo nano /etc/mosquitto/mosquitto.conf
```

#### Configuration de base (`mosquitto.conf`)
```ini
# Port et interface
port 1883
listener 1883 0.0.0.0

# Sécurité
allow_anonymous false
password_file /etc/mosquitto/password_file

# Persistence
persistence true
persistence_location /var/lib/mosquitto/

# Logging
log_dest file /var/log/mosquitto/mosquitto.log
log_type all

# Limites
max_connections 1000
max_queued_messages 1000
```

### 4.2 Authentification MQTT

```bash
# Créer un utilisateur MQTT
sudo mosquitto_passwd -c /etc/mosquitto/password_file kpi_user

# Redémarrer le service
sudo systemctl restart mosquitto
sudo systemctl enable mosquitto
```

### 4.3 Test de la connexion

```bash
# Terminal 1 - Subscriber
mosquitto_sub -h localhost -t production/+/data -u kpi_user -P your_password

# Terminal 2 - Publisher
mosquitto_pub -h localhost -t production/line1/data -u kpi_user -P your_password \
  -m '{"timestamp":"2024-01-15T10:00:00Z","count":100,"rate":50}'
```

---

## 5. Variables d'environnement

### 5.1 Fichier `.env.local` (développement)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kpi_dashboard"

# MQTT Configuration
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_USERNAME="kpi_user"
MQTT_PASSWORD="your_password"
MQTT_CLIENT_ID="kpi-dashboard-dev"

# Application
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED=1

# Redis Cache (optionnel)
REDIS_URL="redis://localhost:6379"

# Monitoring
LOG_LEVEL="debug"
ENABLE_METRICS=true
```

### 5.2 Variables de production

```env
# Database
DATABASE_URL="postgresql://user:pass@db-host:5432/kpi_dashboard?sslmode=require"

# MQTT Configuration
MQTT_BROKER_URL="mqtts://production-broker:8883"
MQTT_USERNAME="prod_kpi_user"
MQTT_PASSWORD="secure_password"
MQTT_CLIENT_ID="kpi-dashboard-prod"

# Application
NEXTAUTH_SECRET="super-secure-secret-key-production"
NEXTAUTH_URL="https://kpi-dashboard.company.com"

# Environment
NODE_ENV="production"

# Security
FORCE_HTTPS=true
TRUST_PROXY=1

# Performance
WEB_CONCURRENCY=4
WEB_MEMORY=2048

# Monitoring
LOG_LEVEL="info"
SENTRY_DSN="https://your-sentry-dsn"
```

### 5.3 Validation des variables

```typescript
// lib/config.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'MQTT_BROKER_URL',
  'NEXTAUTH_SECRET'
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

---

## 6. Déploiement en production

### 6.1 Préparation du build

```bash
# Vérifications pre-build
npm run lint
npm run type-check
npx prisma validate

# Build de production
npm run build

# Test du build local
npm start
```

### 6.2 Déploiement avec PM2

#### Installation PM2
```bash
# Installation globale
npm install -g pm2

# Configuration PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'kpi-dashboard',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
```

#### Démarrage avec PM2
```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Auto-démarrage au boot
pm2 startup

# Monitoring
pm2 monit
```

### 6.3 Configuration Nginx

#### Configuration du virtual host
```nginx
# /etc/nginx/sites-available/kpi-dashboard
server {
    listen 80;
    server_name kpi-dashboard.company.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kpi-dashboard.company.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        alias /app/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.4 Configuration Docker (Alternative)

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MQTT_BROKER_URL=${MQTT_BROKER_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: kpi_dashboard
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 7. Monitoring et maintenance

### 7.1 Health Checks

#### API Health Check
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    
    // Application status
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    };
    
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

### 7.2 Logs et monitoring

#### Configuration des logs
```bash
# Structure des logs
mkdir -p /var/log/kpi-dashboard
chown -R $USER:$USER /var/log/kpi-dashboard

# Rotation des logs avec logrotate
cat > /etc/logrotate.d/kpi-dashboard << EOF
/var/log/kpi-dashboard/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### 7.3 Métriques de performance

#### Monitoring des KPI
```bash
# Métriques à surveiller
- Response time < 200ms (P95)
- Error rate < 1%
- Database connections < 80% du max
- Memory usage < 80%
- CPU usage < 70%
- MQTT connection status
- Queue size MQTT < 1000 messages
```

---

## 8. Troubleshooting

### 8.1 Problèmes courants

#### Base de données
```bash
# Connection refused
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Migrations failed
npx prisma db reset
npx prisma db push

# Performance issues
EXPLAIN ANALYZE SELECT * FROM "ProductionData" WHERE timestamp > NOW() - INTERVAL '1 hour';
```

#### MQTT
```bash
# Test de connectivité
telnet mqtt-broker 1883

# Vérifier les logs
sudo journalctl -u mosquitto -f

# Test de publication
mosquitto_pub -h localhost -t test/topic -m "test message"
```

#### Application
```bash
# Memory leaks
pm2 restart kpi-dashboard

# Port already in use
sudo lsof -i :3000
sudo kill -9 <PID>

# Build issues
rm -rf .next node_modules
npm install
npm run build
```

### 8.2 Commandes utiles

```bash
# Status général
pm2 status
pm2 logs --lines 100

# Database maintenance
pg_dump kpi_dashboard > backup.sql
VACUUM ANALYZE;

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Monitoring en temps réel
htop
iotop
netstat -tuln
```

### 8.3 Procédures d'urgence

#### Rollback rapide
```bash
# Retour version précédente
pm2 stop kpi-dashboard
git checkout HEAD~1
npm install
npm run build
pm2 restart kpi-dashboard
```

#### Maintenance mode
```nginx
# Configuration Nginx maintenance
if (-f /var/www/maintenance.html) {
    return 503;
}

error_page 503 @maintenance;
location @maintenance {
    root /var/www;
    rewrite ^(.*)$ /maintenance.html break;
}
```

Ce guide d'installation et de déploiement couvre tous les aspects techniques nécessaires pour mettre en place le système KPI Dashboard, de l'environnement de développement jusqu'à la production avec monitoring et maintenance.
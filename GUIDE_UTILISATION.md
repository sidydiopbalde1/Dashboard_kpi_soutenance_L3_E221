# 🚀 Guide d'Utilisation - Dashboard KPI Temps Réel

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Installation et Configuration](#installation-et-configuration)
4. [Lancement de l'Application](#lancement-de-lapplication)
5. [APIs Disponibles](#apis-disponibles)
6. [Service MQTT](#service-mqtt)
7. [Temps Réel (SSE)](#temps-réel-sse)
8. [Utilisation dans le Frontend](#utilisation-dans-le-frontend)
9. [Structure des Données](#structure-des-données)
10. [Troubleshooting](#troubleshooting)

---

## 📖 Introduction

Ce projet est un système MES (Manufacturing Execution System) complet pour le suivi en temps réel des indicateurs de performance industrielle. Il permet de :

- ✅ Suivre la production en temps réel via MQTT
- ✅ Calculer automatiquement les KPIs (TRS, OEE, MTBF, MTTR)
- ✅ Gérer la maintenance, la qualité, les équipes, l'énergie et la sécurité
- ✅ Générer des alertes automatiques
- ✅ Visualiser les données avec des graphiques interactifs
- ✅ Recevoir des mises à jour en temps réel via Server-Sent Events (SSE)

---

## 🏗️ Architecture

```
┌─────────────────┐
│ Machines IoT    │  (Simulées par test-mqtt.py)
└────────┬────────┘
         │ MQTT
         ▼
┌─────────────────┐
│ Service MQTT    │  (scripts/mqtt-listener.ts)
│ (Background)    │
└────────┬────────┘
         │ Prisma ORM
         ▼
┌─────────────────┐
│ Base PostgreSQL │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────┐
│ APIs │  │ SSE  │
│ REST │  │Stream│
└───┬──┘  └───┬──┘
    │         │
    └────┬────┘
         ▼
   ┌─────────────┐
   │  Frontend   │
   │  Next.js    │
   └─────────────┘
```

---

## 💻 Installation et Configuration

### 1. Prérequis

- Node.js 20+
- PostgreSQL 14+
- Broker MQTT (Mosquitto recommandé)
- Python 3.8+ (pour le simulateur)

### 2. Installation des dépendances

```bash
# Installer les dépendances Node.js
npm install

# Installer paho-mqtt pour Python
pip install paho-mqtt
```

### 3. Configuration de la base de données

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dashboard_kpi"
MQTT_BROKER_URL="mqtt://localhost:1883"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Créer la base de données :**

```bash
# Linux/Mac
sudo -u postgres psql
CREATE DATABASE dashboard_kpi;

# Windows (avec PostgreSQL installé)
psql -U postgres
CREATE DATABASE dashboard_kpi;
```

### 4. Initialisation de la base de données

```bash
# Appliquer le schéma Prisma
npx prisma db push

# Générer le client Prisma
npx prisma generate

# Peupler la base avec des données réalistes (24h de données)
npm run db:seed
```

### 5. Installation du broker MQTT

**Linux (Ubuntu/Debian) :**
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

**macOS :**
```bash
brew install mosquitto
brew services start mosquitto
```

**Windows :**
Télécharger depuis https://mosquitto.org/download/

---

## 🚀 Lancement de l'Application

### Option 1 : Lancement séparé (Recommandé pour le développement)

**Terminal 1 - Application Next.js :**
```bash
npm run dev
```
Application accessible sur http://localhost:3000

**Terminal 2 - Service MQTT (Optionnel) :**
```bash
npm run mqtt:start
```
Écoute les messages MQTT et met à jour la base de données en temps réel.

**Terminal 3 - Simulateur IoT (Optionnel) :**
```bash
python3 test-mqtt.py
```
Simule une machine industrielle envoyant des données toutes les 2 secondes.

### Option 2 : Lancement avec docker-compose (Production)

```bash
# À créer : docker-compose.yml
docker-compose up -d
```

---

## 🔌 APIs Disponibles

### 1. Dashboard Principal

**Endpoint :** `GET /api/dashboard/current`

**Réponse :**
```json
{
  "kpi": {
    "trs": 82.1
  },
  "production": {
    "totalProduced": 2480,
    "currentRate": 103,
    "objectif": 2500,
    "isRunning": true,
    "temperature": 23.5,
    "pressure": 2.6
  },
  "downtime": {
    "total": 45,
    "active": 1
  },
  "quality": {
    "defectRate": 3.2,
    "conformityRate": 96.8
  },
  "hourlyProduction": [...],
  "trsComponents": [...],
  "equipmentStatus": [...],
  "alerts": [...]
}
```

### 2. Maintenance

**Endpoint :** `GET /api/maintenance?status=all&type=all`

**Paramètres :**
- `status` : all, planned, in_progress, completed, overdue
- `type` : all, preventive, corrective, emergency

**Réponse :**
```json
{
  "tasks": [...],
  "metrics": {
    "mtbf": 342.5,
    "mttr": 45.2,
    "availability": 96.2,
    "totalCost": 2450.50
  },
  "trends": [...],
  "tasksByType": [...]
}
```

### 3. Qualité

**Endpoint :** `GET /api/quality?severity=all&status=all&period=today`

**Paramètres :**
- `severity` : all, minor, major, critical
- `status` : all, open, investigating, corrected, closed
- `period` : today, week, month

**Réponse :**
```json
{
  "defects": [...],
  "metrics": {
    "conformityRate": 96.8,
    "defectRate": 3.2,
    "firstPassYield": 94.5,
    "totalQualityCost": 850.00
  },
  "defectsByType": [...],
  "spcChart": {
    "data": [...],
    "centerLine": 2.5,
    "upperControlLimit": 5.2,
    "lowerControlLimit": 0
  }
}
```

### 4. Production

**Endpoint :** `GET /api/production/orders?status=all&line=all`

**Réponse :**
```json
{
  "orders": [...],
  "metrics": {
    "oee": 85.3,
    "availability": 96.5,
    "performance": 91.2,
    "quality": 97.0,
    "activeOrders": 2,
    "completedOrders": 15
  },
  "productionByLine": [...],
  "productionMix": [...],
  "oeeComponents": [...]
}
```

### 5. Équipes

**Endpoint :** `GET /api/teams?shift=all`

**Paramètres :**
- `shift` : all, MATIN, APRES_MIDI, NUIT

**Réponse :**
```json
{
  "employees": [...],
  "metrics": {
    "totalEmployees": 20,
    "avgPerformance": 92.5,
    "avgEfficiency": 95.2,
    "topPerformers": [...]
  },
  "shiftPerformance": [...]
}
```

### 6. Énergie

**Endpoint :** `GET /api/energy?period=24h`

**Paramètres :**
- `period` : 24h, 7d, 30d

**Réponse :**
```json
{
  "metrics": {
    "currentConsumption": 245.8,
    "totalConsumption": 5900.0,
    "totalCost": 780.50,
    "avgEfficiency": 87.3,
    "totalCarbonFootprint": 2843.0
  },
  "consumptionByEquipment": [...],
  "trend": [...],
  "tariffDistribution": [...]
}
```

### 7. Sécurité

**Endpoint :** `GET /api/safety?type=all&status=all`

**Réponse :**
```json
{
  "incidents": [...],
  "metrics": {
    "daysSinceLastAccident": 45,
    "totalIncidents": 12,
    "frequencyRate": 5.2,
    "severityRate": 0.8
  },
  "incidentsByType": [...],
  "trend": [...]
}
```

---

## 📡 Service MQTT

### Configuration

Le service MQTT écoute sur les topics suivants :

- `production/+/data` : Données de production en temps réel
- `production/+/status` : Statuts des machines (arrêts, redémarrages)

### Format des Messages

**Topic : `production/ligne1/data`**
```json
{
  "timestamp": "2024-01-12T14:30:00.000Z",
  "count": 2,
  "rate": 118,
  "targetRate": 120,
  "defects": 0,
  "running": true,
  "temperature": 23.5,
  "pressure": 2.6
}
```

**Topic : `production/ligne1/status`**
```json
{
  "running": false,
  "reason": "PANNE",
  "message": "Bourrage ligne détecté"
}
```

### Fonctionnalités du Service

1. **Enregistrement automatique** des données de production
2. **Calcul automatique des KPIs** (TRS, OEE)
3. **Création automatique d'alertes** selon les seuils configurés
4. **Gestion des temps d'arrêt** avec début/fin automatique
5. **Mise à jour des équipements** en temps réel

### Lancement

```bash
npm run mqtt:start
```

### Logs

Le service affiche :
- ✅ Connexion établie
- 📥 Messages reçus
- 💾 Données enregistrées
- 🚨 Alertes créées
- 📈 KPIs mis à jour

---

## ⚡ Temps Réel (SSE)

### Connexion au Flux

**Endpoint :** `GET /api/kpi/stream`

**Type :** Server-Sent Events (SSE)

**Fréquence :** Mise à jour toutes les 5 secondes

### Format des Événements

```javascript
data: {
  "timestamp": "2024-01-12T14:30:05.000Z",
  "production": {
    "bottlesProduced": 118,
    "actualRate": 118,
    "targetRate": 120,
    "isRunning": true,
    "temperature": 23.5,
    "pressure": 2.6
  },
  "kpi": {
    "trs": 82.1,
    "availability": 95.2,
    "performance": 87.4,
    "quality": 96.8
  },
  "alerts": {
    "active": 2,
    "downtime": 1
  }
}
```

---

## 🎨 Utilisation dans le Frontend

### Hook personnalisé `useRealtimeKPI`

```typescript
import { useRealtimeKPI } from '@/lib/hooks/useRealtimeKPI';

function Dashboard() {
  const { data, isConnected, error } = useRealtimeKPI();

  if (!isConnected) {
    return <div>Connexion au flux temps réel...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div>
      <h1>TRS: {data?.kpi.trs}%</h1>
      <p>Cadence: {data?.production.actualRate} b/min</p>
      <p>Alertes actives: {data?.alerts.active}</p>
    </div>
  );
}
```

### Appel API avec fetch

```typescript
// Récupérer les données de maintenance
async function fetchMaintenance() {
  const res = await fetch('/api/maintenance?status=in_progress');
  const data = await res.json();
  return data;
}

// Exemple avec useEffect
useEffect(() => {
  const loadData = async () => {
    const data = await fetchMaintenance();
    setTasks(data.tasks);
    setMetrics(data.metrics);
  };

  loadData();

  // Rafraîchir toutes les 30 secondes
  const interval = setInterval(loadData, 30000);

  return () => clearInterval(interval);
}, []);
```

### Polling automatique

```typescript
// Hook personnalisé pour polling
function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = 30000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchFn();
        setData(result);
      } catch (error) {
        console.error('Polling error:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
    const intervalId = setInterval(load, interval);

    return () => clearInterval(intervalId);
  }, [fetchFn, interval]);

  return { data, loading };
}

// Utilisation
const { data: maintenanceData } = usePolling(
  () => fetch('/api/maintenance').then(r => r.json()),
  30000
);
```

---

## 📊 Structure des Données

### Tables Principales

| Table | Description | Enregistrements |
|-------|-------------|-----------------|
| `ProductionData` | Données de production minute par minute | 1440/jour |
| `Equipment` | Équipements industriels | 5 |
| `MaintenanceTask` | Tâches de maintenance | Variable |
| `QualityControl` | Contrôles qualité | Variable |
| `Employee` | Personnel | 4 |
| `EnergyConsumption` | Consommation énergétique | 24/jour |
| `SafetyIncident` | Incidents de sécurité | Variable |
| `ProductionOrder` | Ordres de fabrication | Variable |
| `Alert` | Alertes système | Variable |
| `Downtime` | Temps d'arrêt | Variable |
| `KPISnapshot` | Snapshots des KPIs | 3 (current + shifts) |

### Calculs des KPIs

**TRS (Taux de Rendement Synthétique) :**
```
TRS = Disponibilité × Performance × Qualité

Disponibilité = (Temps production / Temps total) × 100
Performance = (Production réelle / Production théorique) × 100
Qualité = (Pièces conformes / Pièces produites) × 100
```

**MTBF (Mean Time Between Failures) :**
```
MTBF = Temps total de production / Nombre de pannes
```

**MTTR (Mean Time To Repair) :**
```
MTTR = Temps total de réparation / Nombre de réparations
```

**OEE (Overall Equipment Effectiveness) :**
```
OEE = TRS (même calcul)
```

---

## 🔧 Troubleshooting

### Problème : Base de données non accessible

**Erreur :** `Can't reach database server`

**Solution :**
```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Vérifier les credentials dans .env
cat .env

# Tester la connexion
psql -U username -d dashboard_kpi -h localhost
```

### Problème : Broker MQTT non accessible

**Erreur :** `MQTT connection failed`

**Solution :**
```bash
# Vérifier que Mosquitto tourne
sudo systemctl status mosquitto

# Tester le broker
mosquitto_sub -h localhost -t test

# Dans un autre terminal
mosquitto_pub -h localhost -t test -m "hello"
```

### Problème : SSE ne fonctionne pas

**Erreur :** Pas de mises à jour temps réel

**Solution :**
1. Vérifier dans les DevTools > Network que `/api/kpi/stream` est bien connecté
2. Vérifier les logs du serveur Next.js
3. S'assurer que le navigateur supporte SSE (tous les navigateurs modernes)
4. Vérifier qu'il n'y a pas de proxy/firewall bloquant les connexions longues

### Problème : Données anciennes après seed

**Solution :**
```bash
# Re-seed la base de données
npm run db:seed

# Cela créera de nouvelles données avec timestamps actuels
```

### Problème : Performances lentes

**Solutions :**
1. Ajouter des index sur les colonnes fréquemment requêtées
2. Utiliser le Prisma singleton (`lib/prisma.ts`)
3. Augmenter le pool de connexions PostgreSQL
4. Activer le cache Next.js pour les APIs

```typescript
// Dans les routes API
export const revalidate = 30; // Cache 30 secondes
```

---

## 📈 Prochaines Étapes

1. **Authentification** : Ajouter NextAuth.js
2. **WebSocket** : Remplacer SSE par WebSocket pour bidirectionnel
3. **Tests** : Ajouter Jest + React Testing Library
4. **Docker** : Containeriser l'application complète
5. **CI/CD** : Pipeline GitHub Actions
6. **Rapports PDF** : Génération automatique de rapports
7. **Notifications** : Push notifications pour alertes critiques
8. **Machine Learning** : Prédiction des pannes avec l'historique

---

## 📞 Support

Pour toute question ou problème :
- Consulter les logs : `npm run dev` (mode verbose)
- Vérifier la base de données : `npx prisma studio`
- Tester les APIs : Postman ou `curl`

---

**Bon développement ! 🚀**

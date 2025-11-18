# Guide - Intégration MQTT et Remplissage Automatique des Données

## 📋 Vue d'ensemble

Le système est maintenant configuré pour **remplir automatiquement** les tables `ProductionData` et `ProductionOrder` lorsque le script `test-mqtt.py` envoie des données via MQTT.

## 🚀 Démarrage rapide

### 1. Démarrer le broker MQTT (Mosquitto)

```bash
# Installation si nécessaire
sudo apt-get install mosquitto mosquitto-clients

# Démarrer le broker
sudo systemctl start mosquitto
sudo systemctl status mosquitto
```

### 2. Démarrer le service d'écoute MQTT

Dans un premier terminal :

```bash
npm run mqtt:start
```

Vous devriez voir :
```
🚀 Démarrage du service MQTT...
🔌 Connexion au broker MQTT: mqtt://localhost:1883
✅ Connecté au broker MQTT
📡 Abonné au topic: production/+/data
📡 Abonné au topic: production/+/status
✨ Service MQTT démarré avec succès
📡 En écoute des messages MQTT...
```

### 3. Lancer le script de test Python

Dans un second terminal :

```bash
python3 test-mqtt.py
```

Vous devriez voir :
```
🔌 Connexion à localhost:1883...
✅ Connecté ! Envoi de données toutes les 2 secondes...

[1] 📊 Données envoyées: cadence=115 b/min, défauts=0
[2] 📊 Données envoyées: cadence=122 b/min, défauts=0
[3] 📊 Données envoyées: cadence=108 b/min, défauts=1
```

### 4. Vérifier les données dans le terminal du service MQTT

Vous devriez voir dans le premier terminal :
```
📥 Message reçu sur production/ligne1/data: {...}
✅ Données production enregistrées: 2 bouteilles, cadence 115 b/min
📦 Nouvel ordre de production créé: ORD-1234567890-XY2Z4 (10000 unités)
📦 Ordre ORD-1234567890-XY2Z4: 2/10000 (0%)
📈 KPIs mis à jour: TRS=82.3%
```

## 📊 Ce qui se passe automatiquement

### Table `ProductionData`

À chaque message MQTT reçu, une nouvelle ligne est créée :

```typescript
{
  timestamp: DateTime,
  bottlesProduced: 2,        // data.count
  targetRate: 120,           // data.targetRate
  actualRate: 115,           // data.rate
  defectCount: 0,            // data.defects
  isRunning: true,           // data.running
  shiftId: "MATIN",          // Calculé automatiquement
  temperature: 22.5,         // data.temperature
  pressure: 2.48             // data.pressure
}
```

### Table `ProductionOrder`

#### Premier message reçu :
- Crée automatiquement un nouvel ordre de production
- Quantité par défaut : 10 000 unités
- Type de produit : "Bouteille Standard 1L"
- Ligne : "Ligne 1" (extrait du topic MQTT)

```typescript
{
  orderNumber: "ORD-1737123456-XY2Z4",
  productType: "Bouteille Standard 1L",
  quantity: 10000,
  produced: 0,
  targetRate: 120,
  actualRate: 115,
  startTime: DateTime,
  estimatedEndTime: DateTime, // Calculé selon targetRate
  status: "running",
  priority: "medium",
  line: "Ligne 1",
  shift: "MATIN",
  operator: "Auto MQTT"
}
```

#### Messages suivants :
- Met à jour l'ordre actif
- Incrémente le nombre produit
- Actualise la cadence réelle
- Complète automatiquement l'ordre quand `produced >= quantity`

```typescript
// Après 10 messages de 2 bouteilles chacun
{
  produced: 20,              // Incrémenté automatiquement
  actualRate: 118,           // Mis à jour
  status: "running",         // ou "completed" si terminé
  updatedAt: DateTime
}
```

## 🔄 Gestion du cycle de vie

### Création automatique

✅ Un nouvel ordre est créé automatiquement si :
- Aucun ordre n'est en status `running` ou `waiting`
- Des données MQTT arrivent

### Mise à jour continue

✅ L'ordre actif est mis à jour à chaque message :
- `produced` += nombre de bouteilles du message
- `actualRate` = cadence actuelle
- `updatedAt` = maintenant

### Complétion automatique

✅ L'ordre passe en `completed` quand :
- `produced >= quantity`
- `endTime` est défini à ce moment
- Un nouvel ordre sera créé au prochain message

## 📈 Métriques calculées automatiquement

Le service calcule et met à jour automatiquement :

### KPISnapshot (table)
- **TRS** (Taux de Rendement Synthétique)
- **Disponibilité** (% temps en marche)
- **Performance** (% cadence réelle vs objectif)
- **Qualité** (% produits conformes)
- **OEE** (Overall Equipment Effectiveness)

### Alertes automatiques (table Alert)
- Cadence trop faible
- Température trop élevée
- Taux de défauts élevé
- Arrêts machine

### Temps d'arrêt (table Downtime)
- Créés automatiquement lors des arrêts
- Résolus automatiquement au redémarrage
- Durée calculée automatiquement

## 🛠️ Configuration

### Variables d'environnement (.env)

```bash
# Broker MQTT (optionnel, par défaut localhost:1883)
MQTT_BROKER_URL=mqtt://localhost:1883
```

### Personnalisation des ProductionOrder

Pour modifier les paramètres par défaut, éditez `lib/mqtt-service.ts` ligne 191 :

```typescript
const targetQuantity = 10000; // Modifiez la quantité
const productType = 'Bouteille Standard 1L'; // Modifiez le type
```

## 📝 Logs et monitoring

### Logs du service MQTT

```bash
npm run mqtt:start
```

Affiche en temps réel :
- ✅ Connexion au broker
- 📥 Messages reçus
- ✅ Données enregistrées
- 📦 Ordres créés/mis à jour
- 📈 KPIs calculés
- 🚨 Alertes générées

### Vérifier les données en base

```bash
# Console Prisma Studio
npx prisma studio

# Ou via psql
psql -U postgres -d dashboard_kpi
SELECT * FROM "ProductionData" ORDER BY timestamp DESC LIMIT 10;
SELECT * FROM "ProductionOrder" ORDER BY "createdAt" DESC LIMIT 5;
```

## 🎯 Mode test

Pour tester rapidement :

```bash
# Envoie 3 messages puis s'arrête
python3 test-mqtt.py --test
```

## 🔧 Dépannage

### Le service MQTT ne se connecte pas

```bash
# Vérifier que Mosquitto est démarré
sudo systemctl status mosquitto

# Tester la connexion
mosquitto_sub -h localhost -t "production/#" -v
```

### Les données ne s'enregistrent pas

```bash
# Vérifier que la base de données est accessible
npx prisma db pull

# Vérifier les logs du service MQTT
npm run mqtt:start
```

### Python ne trouve pas le module paho

```bash
pip3 install paho-mqtt
```

## 📚 Architecture

```
test-mqtt.py (Publisher)
    ↓
    📡 MQTT Broker (Mosquitto)
    ↓
mqtt-listener.ts (Subscriber)
    ↓
mqtt-service.ts (Handler)
    ↓
    ├─→ ProductionData (créé)
    ├─→ ProductionOrder (créé/mis à jour)
    ├─→ Alert (si seuils dépassés)
    ├─→ Downtime (sur arrêts)
    └─→ KPISnapshot (calculé)
```

## 🎉 Résultat final

Après quelques minutes d'exécution :

- ✅ Table `ProductionData` : Nouvelles lignes toutes les 2 secondes
- ✅ Table `ProductionOrder` : Ordres créés et mis à jour automatiquement
- ✅ Table `Alert` : Alertes générées si problèmes
- ✅ Table `Downtime` : Arrêts enregistrés
- ✅ Table `KPISnapshot` : Métriques calculées
- ✅ Dashboard : Données en temps réel !

---

**🚀 C'est tout ! Le système fonctionne maintenant de manière complètement automatique.**

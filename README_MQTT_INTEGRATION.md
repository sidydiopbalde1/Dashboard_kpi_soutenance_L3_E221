# Intégration MQTT - Test Python automatique

## Vue d'ensemble

Cette fonctionnalité permet d'exécuter automatiquement le script Python `test-mqtt.py` directement depuis l'interface web de l'application KPI Dashboard. Lorsque vous cliquez sur "Se connecter" dans la page Appareils, le script Python se lance en arrière-plan et commence à envoyer des données simulées via MQTT.

## 🔧 Installation et Configuration

### 1. Configuration automatique

Exécutez le script de configuration :

```bash
./setup-mqtt-test.sh
```

Ce script va :
- ✅ Vérifier l'installation de Python3
- ✅ Installer `paho-mqtt` si nécessaire  
- ✅ Vérifier et démarrer le broker MQTT (Mosquitto)

### 2. Configuration manuelle (alternative)

Si vous préférez configurer manuellement :

```bash
# Installer les dépendances Python
pip3 install paho-mqtt

# Installer et démarrer Mosquitto (Ubuntu/Debian)
sudo apt-get install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto

# macOS avec Homebrew
brew install mosquitto
brew services start mosquitto
```

## 🚀 Utilisation

### Depuis l'interface web

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Naviguer vers la page Appareils** :
   ```
   http://localhost:3000/appareils
   ```

3. **Cliquer sur "Se connecter"** :
   - Le bouton lance automatiquement `test-mqtt.py`
   - Le statut s'affiche en temps réel
   - Les données sont envoyées toutes les 2 secondes

4. **Arrêter le test** :
   - Cliquer sur "Arrêter le test" 
   - Ou sur "Déconnecter"

### Depuis la ligne de commande (test manuel)

```bash
python3 test-mqtt.py
```

## 📡 Fonctionnement technique

### Architecture

```
Interface Web (React) 
    ↓ POST /api/mqtt/test
API Next.js (Node.js)
    ↓ spawn('python3', ['test-mqtt.py'])
Script Python 
    ↓ MQTT Messages
Broker MQTT (Mosquitto)
    ↓ Subscription
Application Dashboard
```

### API Endpoints

#### `POST /api/mqtt/test`
Démarre ou arrête le script Python.

**Démarrer** :
```json
{
  "action": "start"
}
```

**Arrêter** :
```json
{
  "action": "stop"
}
```

**Réponse de démarrage** :
```json
{
  "success": true,
  "message": "Test MQTT démarré avec succès",
  "processId": "mqtt-test-1673123456789",
  "pid": 12345
}
```

#### `GET /api/mqtt/test`
Vérifie le statut des processus actifs.

**Réponse** :
```json
{
  "running": true,
  "processes": [
    {
      "id": "mqtt-test-1673123456789",
      "pid": 12345,
      "running": true
    }
  ]
}
```

### Données simulées

Le script `test-mqtt.py` envoie des données réalistes :

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "count": 2,
  "rate": 115,
  "targetRate": 120,
  "defects": 0,
  "running": true,
  "temperature": 23.5,
  "pressure": 2.5
}
```

**Topics MQTT** :
- `production/ligne1/data` - Données de production
- `production/ligne1/status` - Statut de la ligne (simule les pannes)

## 🎛️ Interface utilisateur

### Indicateurs visuels

1. **Statut du simulateur** :
   - 🟢 **ACTIF** : Script en cours d'exécution
   - ⚫ **INACTIF** : Script arrêté

2. **Boutons dynamiques** :
   - **"Se connecter"** : Démarre le test (bouton bleu)
   - **"Arrêter le test"** : Arrête le test (bouton rouge)
   - **"Test en cours"** : État intermédiaire avec icône check

3. **Messages de statut** :
   - ✅ Test MQTT démarré (PID: 12345)
   - 🛑 Test MQTT arrêté
   - ❌ Erreur : [détails de l'erreur]

## 🔍 Monitoring et Debug

### Logs serveur

Les logs du processus Python sont visibles dans la console Next.js :

```bash
[MQTT Test stdout]: ✅ Connecté au broker MQTT
[MQTT Test stdout]: [1] 📊 Données envoyées: cadence=115 b/min, défauts=0
```

### Vérification manuelle

```bash
# Vérifier les messages MQTT
mosquitto_sub -h localhost -t "production/ligne1/data"

# Vérifier les processus Python actifs
ps aux | grep test-mqtt.py

# Vérifier le statut du broker
systemctl status mosquitto
```

## 🛠️ Troubleshooting

### Problèmes courants

#### 1. "Python3 non trouvé"
```bash
# Installer Python3
sudo apt-get install python3 python3-pip
# ou
brew install python3
```

#### 2. "Module paho.mqtt non trouvé"
```bash
pip3 install paho-mqtt
```

#### 3. "Connexion MQTT échouée"
```bash
# Vérifier si Mosquitto fonctionne
sudo systemctl status mosquitto
sudo systemctl start mosquitto

# Tester la connexion
mosquitto_pub -h localhost -t test/topic -m "hello"
```

#### 4. "Processus ne s'arrête pas"
```bash
# Trouver et tuer le processus
ps aux | grep test-mqtt.py
kill -9 [PID]
```

#### 5. "Port 1883 déjà utilisé"
```bash
# Vérifier quel processus utilise le port
sudo lsof -i :1883
```

### Debug avancé

#### Logs détaillés
Activer les logs détaillés dans `app/api/mqtt/test/route.ts` :

```typescript
// Activer debug
const DEBUG = true;

if (DEBUG) {
  console.log('Debug: Script path:', scriptPath);
  console.log('Debug: Working directory:', process.cwd());
}
```

#### Test de connectivité MQTT
```bash
# Test publication
mosquitto_pub -h localhost -t "test/topic" -m "test message"

# Test souscription
mosquitto_sub -h localhost -t "test/topic"
```

## 📋 Checklist de validation

### Tests à effectuer

- [ ] ✅ Script de setup s'exécute sans erreur
- [ ] ✅ Interface affiche "INACTIF" au démarrage
- [ ] ✅ Clic sur "Se connecter" démarre le processus
- [ ] ✅ Statut passe à "ACTIF" avec animation
- [ ] ✅ Messages apparaissent dans les logs
- [ ] ✅ Bouton devient "Arrêter le test"
- [ ] ✅ Clic sur "Arrêter" stoppe le processus
- [ ] ✅ Statut repasse à "INACTIF"
- [ ] ✅ Processus se termine proprement

### Performances

- [ ] ✅ Démarrage en moins de 2 secondes
- [ ] ✅ Arrêt en moins de 5 secondes
- [ ] ✅ Pas de fuite mémoire
- [ ] ✅ CPU usage raisonnable (<5%)

## 🔄 Améliorations futures

### Fonctionnalités envisagées

1. **Configuration dynamique** :
   - Modifier la fréquence d'envoi
   - Changer les valeurs simulées
   - Multiple lignes de production

2. **Monitoring avancé** :
   - Graphiques temps réel des données envoyées
   - Statistiques de performance
   - Alertes en cas d'erreur

3. **Simulation avancée** :
   - Scénarios prédéfinis (pannes, pic de production)
   - Données historiques replay
   - Integration avec des vrais capteurs

## 📞 Support

En cas de problème :

1. Vérifiez les logs dans la console du navigateur (F12)
2. Consultez les logs serveur Next.js
3. Testez manuellement `python3 test-mqtt.py`
4. Vérifiez la configuration MQTT avec `mosquitto_pub/sub`

---

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2024  
**Compatibilité** : Python 3.7+, Node.js 18+, Next.js 15
# Test de l'Intégration MQTT - Guide Rapide

## ✅ Vérification de l'installation

### 1. Fichiers créés/modifiés

- ✅ `app/api/mqtt/test/route.ts` - API principale
- ✅ `app/api/mqtt/test/logs/route.ts` - Streaming SSE des logs
- ✅ `app/(dashboard)/appareils/page.tsx` - Interface mise à jour
- ✅ `setup-mqtt-test.sh` - Script d'installation
- ✅ `test-mqtt.py` - Script Python (existant)

### 2. Nouvelles fonctionnalités ajoutées

#### Interface utilisateur
- 🟢 **Indicateur de statut** : ACTIF/INACTIF avec animation
- 🔄 **Boutons dynamiques** : Se connecter → Arrêter le test
- 📊 **Console en temps réel** : Logs Python avec style terminal
- 📡 **Données MQTT live** : Messages structurés avec détails
- 🔢 **Compteurs** : Nombre de logs et messages
- 🧹 **Boutons Effacer** : Pour nettoyer les affichages
- ↕️ **Auto-scroll** : Les nouveaux messages restent visibles

#### Backend
- 🚀 **Gestion des processus** : Spawn/Kill du script Python
- 📤 **Streaming SSE** : Envoi des logs en temps réel
- 🔍 **Parsing intelligent** : Extraction des données JSON
- 💾 **Stockage temporaire** : Garde les derniers logs/données
- ⚡ **Heartbeat** : Maintien des connexions SSE

## 🧪 Procédure de test

### Test 1 : Configuration initiale
```bash
# 1. Installer les dépendances
./setup-mqtt-test.sh

# 2. Vérifier que le script Python fonctionne
python3 test-mqtt.py
# Devrait afficher: "✅ Connecté au broker MQTT" puis des données
```

### Test 2 : Interface web
```bash
# 1. Démarrer l'application
npm run dev

# 2. Aller sur http://localhost:3000/appareils

# 3. Vérifier l'interface :
- [ ] Section "Simulateur de données" visible
- [ ] Statut "INACTIF" affiché
- [ ] Bouton "Se connecter" disponible
```

### Test 3 : Lancement du test
```bash
# Dans l'interface web :
# 1. Cliquer sur "Se connecter"
# 2. Vérifier :
- [ ] Statut passe à "ACTIF" avec animation
- [ ] Deux nouvelles sections apparaissent
- [ ] Console Python affiche les logs en vert
- [ ] Section MQTT affiche les données structurées
- [ ] Compteurs augmentent en temps réel
- [ ] Auto-scroll fonctionne
```

### Test 4 : Données en temps réel
```bash
# Observer pendant 30 secondes :
- [ ] Nouveaux logs toutes les 2 secondes
- [ ] Messages MQTT avec count, rate, temperature, etc.
- [ ] Horodatage correct sur chaque message
- [ ] Pas d'erreurs dans la console navigateur
```

### Test 5 : Arrêt du test
```bash
# Dans l'interface :
# 1. Cliquer sur "Arrêter le test"
# 2. Vérifier :
- [ ] Statut repasse à "INACTIF"
- [ ] Sections logs/MQTT disparaissent
- [ ] Log final "Test MQTT terminé"
- [ ] Bouton redevient "Se connecter"
```

## 🎯 Résultats attendus

### Console Python (exemple)
```
[10:30:15] 🚀 Démarrage du test MQTT (PID: 12345)
[10:30:16] 📤 ✅ Connecté au broker MQTT
[10:30:18] 📤 [1] 📊 Données envoyées: cadence=115 b/min, défauts=0
[10:30:20] 📤 [2] 📊 Données envoyées: cadence=118 b/min, défauts=1
[10:30:22] 📤 [3] 📊 Données envoyées: cadence=112 b/min, défauts=0
```

### Données MQTT (exemple)
```json
{
  "timestamp": "2024-01-15T10:30:18Z",
  "count": 2,
  "rate": 115,
  "targetRate": 120,
  "defects": 0,
  "running": true,
  "temperature": 23.5,
  "pressure": 2.5
}
```

## 🐛 Problèmes possibles et solutions

### Erreur : "Module paho.mqtt not found"
```bash
pip3 install paho-mqtt
```

### Erreur : "Connection refused" MQTT
```bash
# Vérifier Mosquitto
sudo systemctl status mosquitto
sudo systemctl start mosquitto
```

### Erreur : "Permission denied" sur le script
```bash
chmod +x setup-mqtt-test.sh
```

### Logs ne s'affichent pas
```bash
# Vérifier dans la console navigateur (F12)
# Vérifier l'URL SSE : http://localhost:3000/api/mqtt/test/logs
```

### Processus ne s'arrête pas
```bash
# Vérifier les processus Python
ps aux | grep test-mqtt.py
kill -9 <PID>
```

## 📱 Interface finale

L'interface devrait maintenant ressembler à ceci :

```
┌─────────────────────────────────────────────────────────┐
│ 🎛️ Simulateur de données (test-mqtt.py)        [ACTIF] │
│ 📡 Le script Python envoie des données simulées...     │
│ ✅ Données en cours d'envoi : cadence, température...  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Console Python (Logs) [15]              [Effacer]     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [10:30:15] 🚀 Démarrage du test MQTT (PID: 12345) │ │
│ │ [10:30:16] 📤 ✅ Connecté au broker MQTT          │ │
│ │ [10:30:18] 📤 [1] 📊 Données envoyées...          │ │
│ │ ▼ auto-scroll                                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📡 Données MQTT Envoyées [8]            [Effacer]     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Message #1                            10:30:18     │ │
│ │ 📊 Count: 2    ⚡ Rate: 115                        │ │
│ │ 🎯 Target: 120 ❌ Défauts: 0                       │ │
│ │ 🌡️ Temp: 23.5°C 📈 Press: 2.5 bar                 │ │
│ │ ✅ En fonctionnement                               │ │
│ │ ▼ auto-scroll                                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## ✨ Fonctionnalités bonus

- 🎨 **Style terminal** pour les logs Python
- 📱 **Responsive design** sur mobile/tablet
- ⏱️ **Horodatage** sur tous les messages
- 🔄 **Reconnexion automatique** SSE en cas de déconnexion
- 🎯 **Parsing intelligent** des données MQTT
- 💡 **Indicateurs visuels** clairs pour l'utilisateur

L'intégration est maintenant complète et fonctionnelle ! 🎉
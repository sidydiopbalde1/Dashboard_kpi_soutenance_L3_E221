#!/bin/bash

# Script de démarrage rapide du système de production MQTT

echo "🚀 Démarrage du système de production..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que Mosquitto est démarré
echo -e "${BLUE}📡 Vérification du broker MQTT...${NC}"
if ! systemctl is-active --quiet mosquitto; then
    echo -e "${YELLOW}⚠️  Mosquitto n'est pas démarré. Démarrage...${NC}"
    sudo systemctl start mosquitto
    sleep 2
fi

if systemctl is-active --quiet mosquitto; then
    echo -e "${GREEN}✅ Broker MQTT actif${NC}"
else
    echo -e "${YELLOW}⚠️  Impossible de démarrer Mosquitto${NC}"
    echo "   Installez-le avec: sudo apt-get install mosquitto"
    exit 1
fi

echo ""
echo -e "${BLUE}🔌 Démarrage du service d'écoute MQTT...${NC}"
echo "   Terminal 1: Service MQTT"
echo ""

# Créer un nouveau terminal pour le service MQTT
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "npm run mqtt:start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "npm run mqtt:start; exec bash" &
else
    echo "Démarrez manuellement dans un terminal:"
    echo "  npm run mqtt:start"
fi

sleep 3

echo ""
echo -e "${BLUE}📊 Démarrage du simulateur de production...${NC}"
echo "   Terminal 2: Python MQTT Publisher"
echo ""

# Créer un nouveau terminal pour Python
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "python3 test-mqtt.py; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "python3 test-mqtt.py; exec bash" &
else
    echo "Démarrez manuellement dans un terminal:"
    echo "  python3 test-mqtt.py"
fi

echo ""
echo -e "${GREEN}✨ Système démarré !${NC}"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Vérifiez que les deux terminaux fonctionnent"
echo "  2. Ouvrez le dashboard: http://localhost:3000"
echo "  3. Consultez la page Production pour voir les données"
echo ""
echo "🛑 Pour arrêter:"
echo "  - Appuyez sur Ctrl+C dans chaque terminal"
echo ""

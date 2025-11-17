#!/bin/bash

# Script de configuration pour le test MQTT
# Ce script installe les dépendances Python nécessaires

echo "🔧 Configuration du test MQTT..."

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Python3 trouvé: $(python3 --version)"

# Vérifier si pip est installé
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ pip3 trouvé"

# Installer paho-mqtt si pas déjà installé
echo "📦 Installation/vérification de paho-mqtt..."
pip3 install paho-mqtt

if [ $? -eq 0 ]; then
    echo "✅ paho-mqtt installé avec succès"
else
    echo "❌ Erreur lors de l'installation de paho-mqtt"
    exit 1
fi

# Vérifier si le broker MQTT est en cours d'exécution
echo "🔍 Vérification du broker MQTT..."
if command -v mosquitto &> /dev/null; then
    echo "✅ Mosquitto trouvé"
    
    # Vérifier si mosquitto est en cours d'exécution
    if pgrep mosquitto > /dev/null; then
        echo "✅ Mosquitto est en cours d'exécution"
    else
        echo "⚠️  Mosquitto n'est pas en cours d'exécution"
        echo "💡 Démarrage de Mosquitto..."
        
        # Essayer de démarrer mosquitto
        if command -v systemctl &> /dev/null; then
            sudo systemctl start mosquitto
            echo "✅ Mosquitto démarré via systemctl"
        elif command -v service &> /dev/null; then
            sudo service mosquitto start
            echo "✅ Mosquitto démarré via service"
        else
            echo "⚠️  Veuillez démarrer mosquitto manuellement"
        fi
    fi
else
    echo "⚠️  Mosquitto n'est pas installé"
    echo "💡 Installation recommandée:"
    echo "   Ubuntu/Debian: sudo apt-get install mosquitto mosquitto-clients"
    echo "   macOS: brew install mosquitto"
    echo "   Windows: Télécharger depuis https://mosquitto.org/download/"
fi

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Pour tester manuellement:"
echo "   python3 test-mqtt.py"
echo ""
echo "🌐 Pour tester depuis l'interface web:"
echo "   1. Démarrez l'application: npm run dev"
echo "   2. Allez sur: http://localhost:3000/appareils"
echo "   3. Cliquez sur 'Se connecter'"
echo ""
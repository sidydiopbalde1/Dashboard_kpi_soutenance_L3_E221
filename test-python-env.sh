#!/bin/bash

# Script pour tester l'environnement Python et résoudre les problèmes

echo "🔍 Test de l'environnement Python..."

# Test des différentes commandes Python
echo "📋 Versions Python disponibles:"

if command -v python3 &> /dev/null; then
    echo "✅ python3: $(python3 --version 2>&1)"
else
    echo "❌ python3 non trouvé"
fi

if command -v python &> /dev/null; then
    echo "✅ python: $(python --version 2>&1)"
else
    echo "❌ python non trouvé"
fi

# Test direct du script
echo ""
echo "🧪 Test direct du script test-mqtt.py..."

# Test avec python3
echo "Test avec python3:"
if python3 test-mqtt.py --test 2>&1; then
    echo "✅ python3 fonctionne"
    PYTHON_CMD="python3"
else
    echo "❌ python3 a échoué"
    
    # Test avec python
    echo "Test avec python:"
    if python test-mqtt.py --test 2>&1; then
        echo "✅ python fonctionne"
        PYTHON_CMD="python"
    else
        echo "❌ python a aussi échoué"
    fi
fi

# Test avec environnement nettoyé
echo ""
echo "🧹 Test avec environnement nettoyé..."

# Nettoyer l'environnement
unset NODE_OPTIONS
unset VSCODE_INJECTION  
unset ELECTRON_RUN_AS_NODE

echo "Variables nettoyées: NODE_OPTIONS, VSCODE_INJECTION, ELECTRON_RUN_AS_NODE"

# Re-test
if env -u NODE_OPTIONS -u VSCODE_INJECTION -u ELECTRON_RUN_AS_NODE python3 test-mqtt.py --test 2>&1; then
    echo "✅ Environnement nettoyé fonctionne avec python3"
    FINAL_CMD="env -u NODE_OPTIONS -u VSCODE_INJECTION -u ELECTRON_RUN_AS_NODE python3"
else
    echo "❌ Problème persiste même avec environnement nettoyé"
fi

echo ""
echo "💡 Recommandations:"
echo "1. Utilisez: $FINAL_CMD test-mqtt.py"
echo "2. Ou désactivez temporairement l'extension Console Ninja dans VS Code"
echo "3. Ou lancez depuis un terminal externe (pas le terminal intégré VS Code)"

echo ""
echo "📝 Créer un wrapper script..."

# Créer un wrapper
cat > run-mqtt-test.sh << 'EOF'
#!/bin/bash
# Wrapper pour lancer test-mqtt.py sans conflits

# Nettoyer l'environnement
unset NODE_OPTIONS
unset VSCODE_INJECTION  
unset ELECTRON_RUN_AS_NODE

# Lancer le script Python
exec python3 test-mqtt.py "$@"
EOF

chmod +x run-mqtt-test.sh

echo "✅ Wrapper créé: ./run-mqtt-test.sh"
echo "   Vous pouvez maintenant utiliser: ./run-mqtt-test.sh"
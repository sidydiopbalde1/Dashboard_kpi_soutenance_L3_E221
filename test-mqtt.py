# test-mqtt.py
import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

# Configuration
BROKER = "localhost"  # Changez selon votre broker
PORT = 1883
TOPIC_DATA = "production/ligne1/data"
TOPIC_STATUS = "production/ligne1/status"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connecté au broker MQTT")
    else:
        print(f"❌ Échec connexion, code: {rc}")

def on_publish(client, userdata, mid):
    print(f"📤 Message publié (mid: {mid})")

# Créer le client
client = mqtt.Client(client_id="test-device-001")
client.on_connect = on_connect
client.on_publish = on_publish

# Se connecter
print(f"🔌 Connexion à {BROKER}:{PORT}...")
try:
    client.connect(BROKER, PORT, 60)
    client.loop_start()
    
    print("✅ Connecté ! Envoi de données toutes les 2 secondes...")
    print("Appuyez sur Ctrl+C pour arrêter\n")
    
    counter = 0
    while True:
        counter += 1
        
        # Générer des données réalistes
        rate = random.randint(100, 130)
        data = {
            "timestamp": datetime.now().isoformat(),
            "count": random.randint(1, 3),
            "rate": rate,
            "targetRate": 120,
            "defects": 1 if random.random() < 0.02 else 0,
            "running": True,
            "temperature": round(22 + random.uniform(-1, 2), 1),
            "pressure": round(2.5 + random.uniform(-0.2, 0.2), 2)
        }
        
        # Publier
        result = client.publish(TOPIC_DATA, json.dumps(data), qos=1)
        
        print(f"[{counter}] 📊 Données envoyées: cadence={rate} b/min, défauts={data['defects']}")
        
        # Simuler un arrêt occasionnel (5% de chance)
        if random.random() < 0.05:
            status = {
                "running": False,
                "reason": "PANNE",
                "message": "Bourrage ligne détecté"
            }
            client.publish(TOPIC_STATUS, json.dumps(status), qos=1)
            print("⚠️  ARRÊT SIMULÉ - Machine en panne")
            time.sleep(10)
            
            # Redémarrage
            status["running"] = True
            status["message"] = "Machine redémarrée"
            client.publish(TOPIC_STATUS, json.dumps(status), qos=1)
            print("✅ Machine redémarrée")
        
        time.sleep(2)

except KeyboardInterrupt:
    print("\n\n🛑 Arrêt du test...")
    client.loop_stop()
    client.disconnect()
    print("👋 Au revoir!")

except Exception as e:
    print(f"❌ Erreur: {e}")
    client.loop_stop()
    client.disconnect()
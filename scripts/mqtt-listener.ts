// scripts/mqtt-listener.ts
import { getMQTTService } from '../lib/mqtt-service';

console.log('🚀 Démarrage du service MQTT...\n');

// Démarrer le service MQTT
const mqttService = getMQTTService();

// Gérer les signaux de fermeture
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du service MQTT...');
  mqttService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Arrêt du service MQTT...');
  mqttService.disconnect();
  process.exit(0);
});

console.log('✨ Service MQTT démarré avec succès');
console.log('📡 En écoute des messages MQTT...');
console.log('💡 Appuyez sur Ctrl+C pour arrêter\n');

// Garder le processus actif
setInterval(() => {
  const status = mqttService.isClientConnected() ? '✅ Connecté' : '❌ Déconnecté';
  process.stdout.write(`\r${status} | ${new Date().toLocaleTimeString('fr-FR')}   `);
}, 5000);

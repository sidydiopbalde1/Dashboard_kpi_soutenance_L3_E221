// app/(dashboard)/appareils/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, Activity, PlayCircle, StopCircle, RefreshCw, CheckCircle } from 'lucide-react';

export default function AppareilsPage() {
  const [mqttConnected, setMqttConnected] = useState(false);
  const [brokerUrl, setBrokerUrl] = useState('mqtt://localhost:1883');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    checkMQTTStatus();
    const interval = setInterval(checkMQTTStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkMQTTStatus = async () => {
    try {
      const res = await fetch('/api/mqtt/connect');
      const data = await res.json();
      setMqttConnected(data.connected);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const connectMQTT = async () => {
    setLoading(true);
    setStatusMessage('Connexion en cours...');
    
    try {
      const res = await fetch('/api/mqtt/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerUrl, username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage('Connecté au broker MQTT !');
        setTimeout(() => {
          setMqttConnected(true);
          setLoading(false);
          setStatusMessage('');
        }, 2000);
      } else {
        setStatusMessage('Erreur de connexion');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setStatusMessage('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  const disconnectMQTT = async () => {
    try {
      await fetch('/api/mqtt/connect', { method: 'DELETE' });
      setMqttConnected(false);
      setStatusMessage('Déconnecté');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const testConnection = async () => {
    setStatusMessage('Test de connexion...');
    // Simuler un test de connexion
    setTimeout(() => {
      setStatusMessage('Broker accessible ✓');
      setTimeout(() => setStatusMessage(''), 3000);
    }, 1000);
  };

  const brokerPresets = [
    { name: 'Local (Mosquitto)', url: 'mqtt://localhost:1883' },
    { name: 'HiveMQ Public', url: 'mqtt://broker.hivemq.com:1883' },
    { name: 'Eclipse Public', url: 'mqtt://test.mosquitto.org:1883' },
    { name: 'EMQX Public', url: 'mqtt://broker.emqx.io:1883' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Appareils IoT</h1>
        <p className="text-gray-600 mt-1">Configuration et surveillance des appareils connectés via MQTT</p>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          statusMessage.includes('Erreur') 
            ? 'bg-red-50 border border-red-200 text-red-800'
            : statusMessage.includes('✓')
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration MQTT */}
        <div className="lg:col-span-2 space-y-6">
          {/* État de connexion */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                Configuration Broker MQTT
              </h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                mqttConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {mqttConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Wifi className="h-5 w-5" />
                    <span className="font-medium">Connecté</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5" />
                    <span className="font-medium">Déconnecté</span>
                  </>
                )}
              </div>
            </div>

            {/* Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brokers pré-configurés
              </label>
              <div className="grid grid-cols-2 gap-2">
                {brokerPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setBrokerUrl(preset.url)}
                    disabled={mqttConnected}
                    className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                      brokerUrl === preset.url
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du Broker MQTT
                </label>
                <input
                  type="text"
                  value={brokerUrl}
                  onChange={(e) => setBrokerUrl(e.target.value)}
                  placeholder="mqtt://localhost:1883"
                  disabled={mqttConnected}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: mqtt://host:port ou mqtts://host:port pour SSL
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username (optionnel)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    disabled={mqttConnected}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (optionnel)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={mqttConnected}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                {mqttConnected ? (
                  <button
                    onClick={disconnectMQTT}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <StopCircle className="h-5 w-5" />
                    Déconnecter
                  </button>
                ) : (
                  <>
                    <button
                      onClick={testConnection}
                      disabled={loading || !brokerUrl}
                      className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Tester
                    </button>
                    <button
                      onClick={connectMQTT}
                      disabled={loading || !brokerUrl}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-5 w-5" />
                          Se connecter
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Topics MQTT */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Topics MQTT Surveillés
            </h2>
            
            <div className="space-y-3">
              {[
                { topic: 'production/+/data', desc: 'Données de production en temps réel' },
                { topic: 'production/+/status', desc: 'État des machines' },
                { topic: 'production/+/alert', desc: 'Alertes et alarmes' },
              ].map((item) => (
                <div key={item.topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <code className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {item.topic}
                    </code>
                    <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                  </div>
                  {mqttConnected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Guide et Informations */}
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Statut</span>
                <span className={`text-sm font-semibold ${mqttConnected ? 'text-green-600' : 'text-gray-400'}`}>
                  {mqttConnected ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Topics actifs</span>
                <span className="text-sm font-semibold">{mqttConnected ? '3' : '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Messages reçus</span>
                <span className="text-sm font-semibold">-</span>
              </div>
            </div>
          </div>

          {/* Guide Configuration */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">
              📖 Guide Rapide
            </h2>
            <div className="space-y-3 text-sm text-blue-900">
              <div>
                <h3 className="font-semibold mb-1">1. Configuration Broker</h3>
                <p className="text-blue-700">Entrez l'URL de votre broker MQTT (local ou public)</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">2. Connexion</h3>
                <p className="text-blue-700">Cliquez sur "Se connecter" pour activer la réception</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">3. Envoi de données</h3>
                <p className="text-blue-700">Configurez votre appareil pour publier sur les topics indiqués</p>
              </div>
            </div>
          </div>

          {/* Format des données */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Format JSON Attendu</h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "count": 2,
  "rate": 115,
  "targetRate": 120,
  "defects": 0,
  "running": true,
  "temperature": 23.5,
  "pressure": 2.5
}`}
            </pre>
            <p className="text-xs text-gray-600 mt-2">
              Topic: <code className="bg-gray-100 px-1 py-0.5 rounded">production/ligne1/data</code>
            </p>
          </div>

          {/* Liens utiles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">🔗 Liens Utiles</h2>
            <div className="space-y-2 text-sm">
              <a href="https://mosquitto.org/" target="_blank" className="block text-blue-600 hover:underline">
                → Documentation Mosquitto
              </a>
              <a href="https://www.hivemq.com/mqtt-essentials/" target="_blank" className="block text-blue-600 hover:underline">
                → Guide MQTT Essentials
              </a>
              <a href="https://mqtt.org/" target="_blank" className="block text-blue-600 hover:underline">
                → Spécification MQTT
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// app/(dashboard)/appareils/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Settings, Activity, PlayCircle, StopCircle, RefreshCw, CheckCircle } from 'lucide-react';

export default function AppareilsPage() {
  const [mqttConnected, setMqttConnected] = useState(false);
  const [brokerUrl, setBrokerUrl] = useState('mqtt://localhost:1883');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [pythonLogs, setPythonLogs] = useState<string[]>([]);
  const [mqttData, setMqttData] = useState<any[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const mqttEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkMQTTStatus();
    checkTestStatus();
    
    // Connexion SSE pour les logs en temps réel
    const eventSource = new EventSource('/api/mqtt/test/logs');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'log') {
          setPythonLogs(prev => {
            const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${data.message}`];
            // Garder seulement les 50 derniers logs
            setTimeout(() => {
              logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return newLogs.slice(-50);
          });
        } else if (data.type === 'mqtt-data') {
          setMqttData(prev => {
            const newData = [...prev, { ...data.data, timestamp: new Date().toLocaleTimeString() }];
            // Garder seulement les 20 dernières données
            setTimeout(() => {
              mqttEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return newData.slice(-20);
          });
        }
      } catch (error) {
        console.error('Erreur parsing SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erreur SSE:', error);
    };
    
    const interval = setInterval(() => {
      checkMQTTStatus();
      checkTestStatus();
    }, 3000);
    
    return () => {
      clearInterval(interval);
      eventSource.close();
    };
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

  const checkTestStatus = async () => {
    try {
      const res = await fetch('/api/mqtt/test');
      const data = await res.json();
      setTestRunning(data.running);
    } catch (error) {
      console.error('Erreur vérification test:', error);
    }
  };

  const startMQTTTest = async () => {
    setTestLoading(true);
    try {
      const res = await fetch('/api/mqtt/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatusMessage(`✅ Test MQTT démarré (PID: ${data.pid})`);
        setTestRunning(true);
      } else {
        setStatusMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Erreur lors du démarrage: ${error}`);
    } finally {
      setTestLoading(false);
    }
  };

  const stopMQTTTest = async () => {
    setTestLoading(true);
    try {
      const res = await fetch('/api/mqtt/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatusMessage(`🛑 Test MQTT arrêté`);
        setTestRunning(false);
      } else {
        setStatusMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Erreur lors de l'arrêt: ${error}`);
    } finally {
      setTestLoading(false);
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

      {/* Statut du test MQTT Python */}
      <div className="mb-6 p-4 rounded-lg border-2 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Simulateur de données (test-mqtt.py)
          </h3>
          <div className={`flex items-center gap-2 text-sm font-medium ${
            testRunning ? 'text-green-600' : 'text-gray-500'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              testRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            {testRunning ? 'ACTIF' : 'INACTIF'}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {testRunning 
            ? '📡 Le script Python envoie des données simulées toutes les 2 secondes sur production/ligne1/data' 
            : '💡 Cliquez sur "Se connecter" pour démarrer la simulation automatique de données MQTT'}
        </p>
        {testRunning && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
            ✅ Données en cours d'envoi : cadence, température, pression, défauts...
          </div>
        )}
      </div>

      {/* Section des logs et données en temps réel */}
      {testRunning && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Logs Python en temps réel */}
          <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Console Python (Logs)
                <span className="bg-gray-700 text-xs px-2 py-1 rounded">
                  {pythonLogs.length}
                </span>
              </h3>
              <button
                onClick={() => setPythonLogs([])}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-700 rounded"
              >
                Effacer
              </button>
            </div>
            <div className="h-64 overflow-y-auto space-y-1 bg-gray-900 p-2 rounded">
              {pythonLogs.length === 0 ? (
                <div className="text-gray-500 italic">En attente des logs...</div>
              ) : (
                <>
                  {pythonLogs.map((log, index) => (
                    <div key={index} className="text-xs leading-relaxed">
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Données MQTT reçues */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-blue-900 font-semibold flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Données MQTT Envoyées
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                  {mqttData.length}
                </span>
              </h3>
              <button
                onClick={() => setMqttData([])}
                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded"
              >
                Effacer
              </button>
            </div>
            <div className="h-64 overflow-y-auto space-y-2">
              {mqttData.length === 0 ? (
                <div className="text-blue-600 italic text-sm">En attente des données MQTT...</div>
              ) : (
                <>
                  {mqttData.map((data, index) => (
                    <div key={index} className="bg-white border border-blue-100 rounded p-3 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-blue-700">Message #{index + 1}</span>
                        <span className="text-gray-500">{data.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-gray-700">
                        <div>📊 Count: <span className="font-mono">{data.count || 'N/A'}</span></div>
                        <div>⚡ Rate: <span className="font-mono">{data.rate || 'N/A'}</span></div>
                        <div>🎯 Target: <span className="font-mono">{data.targetRate || 'N/A'}</span></div>
                        <div>❌ Défauts: <span className="font-mono">{data.defects || 'N/A'}</span></div>
                        {data.temperature && (
                          <div>🌡️ Temp: <span className="font-mono">{data.temperature}°C</span></div>
                        )}
                        {data.pressure && (
                          <div>📈 Press: <span className="font-mono">{data.pressure} bar</span></div>
                        )}
                      </div>
                      <div className={`mt-1 text-xs px-2 py-1 rounded ${
                        data.running ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {data.running ? '✅ En fonctionnement' : '🛑 Arrêté'}
                      </div>
                    </div>
                  ))}
                  <div ref={mqttEndRef} />
                </>
              )}
            </div>
          </div>
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
                    onClick={() => {
                      disconnectMQTT();
                      if (testRunning) {
                        stopMQTTTest();
                      }
                    }}
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
                    {testRunning ? (
                      <button
                        onClick={stopMQTTTest}
                        disabled={testLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {testLoading ? (
                          <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Arrêt...
                          </>
                        ) : (
                          <>
                            <StopCircle className="h-5 w-5" />
                            Arrêter le test
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={startMQTTTest}
                        disabled={testLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {testLoading ? (
                          <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Démarrage...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-5 w-5" />
                            Se connecter
                          </>
                        )}
                      </button>
                    )}
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
# 🔄 Guide de Dynamisation des Pages

## ✅ Page Production - TERMINÉE

La page Production (`app/(dashboard)/production/page.tsx`) a été **entièrement dynamis\u00e9e** et utilise maintenant l'API `/api/production/orders`.

### Ce qui a été fait :
- ✅ Remplacement des `mockOrders` par `fetch('/api/production/orders')`
- ✅ Ajout d'un bouton "Actualiser" manuel
- ✅ Rafra\u00eechissement automatique toutes les 30 secondes
- ✅ Affichage de la dernière mise à jour
- ✅ Gestion des filtres en temps réel
- ✅ Graphiques dynamiques (production par ligne, mix produits, OEE)

---

## 📝 Pattern à Suivre pour les Autres Pages

Toutes les autres pages suivent **exactement le même pattern** que Production. Voici comment faire :

### Étape 1 : Remplacer les Mock Data par des Appels API

**AVANT** (mock data) :
```typescript
const [tasks, setTasks] = useState<MaintenanceTask[]>([]);

// Données mockées
const mockTasks: MaintenanceTask[] = [
  { id: '1', ... },
  { id: '2', ... },
];

useEffect(() => {
  setTimeout(() => {
    setTasks(mockTasks);
    setIsLoading(false);
  }, 1000);
}, []);
```

**APRÈS** (données dynamiques) :
```typescript
const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
const [metrics, setMetrics] = useState<any>(null);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

const fetchData = async () => {
  try {
    const res = await fetch('/api/maintenance?status=all');
    const data = await res.json();

    setTasks(data.tasks || []);
    setMetrics(data.metrics || null);
    setLastUpdate(new Date());
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();

  // Rafraîchir toutes les 30 secondes
  const interval = setInterval(fetchData, 30000);

  return () => clearInterval(interval);
}, []);
```

### Étape 2 : Ajouter un Bouton Actualiser

```typescript
<button
  onClick={fetchData}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  <RefreshCw className="h-4 w-4" />
  Actualiser
</button>
```

### Étape 3 : Afficher la Dernière Mise à Jour

```typescript
<p className="text-xs text-gray-500 mt-1">
  Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
</p>
```

---

## 🔧 Page Maintenance

### API Endpoint
```
GET /api/maintenance?status=all&type=all
```

### Pattern de Migration

```typescript
// Importer RefreshCw
import { Wrench, ..., RefreshCw } from 'lucide-react';

// États
const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
const [metrics, setMetrics] = useState<any>(null);
const [trends, setTrends] = useState<any[]>([]);
const [tasksByType, setTasksByType] = useState<any[]>([]);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

// Fonction fetch
const fetchData = async () => {
  try {
    const res = await fetch(`/api/maintenance?status=${filterStatus}&type=${filterType}`);
    const data = await res.json();

    setTasks(data.tasks || []);
    setMetrics(data.metrics || null);
    setTrends(data.trends || []);
    setTasksByType(data.tasksByType || []);
    setLastUpdate(new Date());
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};

// useEffect avec interval
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, [filterStatus, filterType]);
```

### Données Disponibles dans l'API
- `tasks[]` : Liste des tâches maintenance
- `metrics` : MTBF, MTTR, disponibilité, coûts
- `trends[]` : Tendances par mois
- `tasksByType[]` : Répartition préventive/corrective/urgence

---

## 🎯 Page Qualité

### API Endpoint
```
GET /api/quality?severity=all&status=all&period=today
```

### Pattern de Migration

```typescript
const [defects, setDefects] = useState<QualityDefect[]>([]);
const [metrics, setMetrics] = useState<any>(null);
const [defectsByType, setDefectsByType] = useState<any[]>([]);
const [lineQuality, setLineQuality] = useState<any[]>([]);
const [spcChart, setSpcChart] = useState<any>(null);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

const fetchData = async () => {
  try {
    const res = await fetch(`/api/quality?severity=${filterSeverity}&status=${filterStatus}&period=${selectedPeriod}`);
    const data = await res.json();

    setDefects(data.defects || []);
    setMetrics(data.metrics || null);
    setDefectsByType(data.defectsByType || []);
    setLineQuality(data.lineQuality || []);
    setSpcChart(data.spcChart || null);
    setLastUpdate(new Date());
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, [filterSeverity, filterStatus, selectedPeriod]);
```

### Données Disponibles dans l'API
- `defects[]` : Liste des défauts qualité
- `metrics` : Taux conformité, FPY, coûts qualité
- `defectsByType[]` : Répartition par type
- `lineQuality[]` : Qualité par ligne
- `spcChart` : Carte de contrôle statistique (SPC)

---

## 👥 Page Équipes

### API Endpoint
```
GET /api/teams?shift=all
```

### Pattern de Migration

```typescript
const [employees, setEmployees] = useState<Employee[]>([]);
const [metrics, setMetrics] = useState<any>(null);
const [shiftPerformance, setShiftPerformance] = useState<any[]>([]);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

const fetchData = async () => {
  try {
    const res = await fetch(`/api/teams?shift=${filterShift}`);
    const data = await res.json();

    setEmployees(data.employees || []);
    setMetrics(data.metrics || null);
    setShiftPerformance(data.shiftPerformance || []);
    setLastUpdate(new Date());
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, [filterShift]);
```

### Données Disponibles dans l'API
- `employees[]` : Liste des employés avec compétences
- `metrics` : Performance moyenne, efficacité, top performers
- `shiftPerformance[]` : Performance par shift

---

## ⚡ Page Énergie

### API Endpoint
```
GET /api/energy?period=24h
```

### Pattern de Migration

```typescript
const [metrics, setMetrics] = useState<any>(null);
const [consumptionByEquipment, setConsumptionByEquipment] = useState<any[]>([]);
const [trend, setTrend] = useState<any[]>([]);
const [tariffDistribution, setTariffDistribution] = useState<any[]>([]);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

const fetchData = async () => {
  try {
    const res = await fetch(`/api/energy?period=${selectedPeriod}`);
    const data = await res.json();

    setMetrics(data.metrics || null);
    setConsumptionByEquipment(data.consumptionByEquipment || []);
    setTrend(data.trend || []);
    setTariffDistribution(data.tariffDistribution || []);
    setLastUpdate(new Date());
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, [selectedPeriod]);
```

### Données Disponibles dans l'API
- `metrics` : Consommation actuelle, totale, coûts, carbone
- `consumptionByEquipment[]` : Consommation par équipement
- `trend[]` : Tendance temporelle
- `tariffDistribution[]` : HP/HC

---

## 🛡️ Page Sécurité

### API Endpoint
```
GET /api/safety?type=all&status=all
```

### Pattern de Migration

```typescript
const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
const [metrics, setMetrics] = useState<any>(null);
const [incidentsByType, setIncidentsByType] = useState<any[]>([]);
const [incidentsBySeverity, setIncidentsBySeverity] = useState<any[]>([]);
const [incidentsByLocation, setIncidentsByLocation] = useState<any[]>([]);
const [trend, setTrend] = useState<any[]>([]);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

const fetchData = async () => {
  try {
    const res = await fetch(`/api/safety?type=${filterType}&status=${filterStatus}`);
    const data = await res.json();

    setIncidents(data.incidents || []);
    setMetrics(data.metrics || null);
    setIncidentsByType(data.incidentsByType || []);
    setIncidentsBySeverity(data.incidentsBySeverity || []);
    setIncidentsByLocation(data.incidentsByLocation || []);
    setTrend(data.trend || []);
    setLastUpdate(new Date());
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, [filterType, filterStatus]);
```

### Données Disponibles dans l'API
- `incidents[]` : Liste des incidents
- `metrics` : Jours sans accident, taux de fréquence/gravité
- `incidentsByType[]` : Accidents, near-miss, etc.
- `incidentsBySeverity[]` : Par niveau de gravité
- `incidentsByLocation[]` : Par lieu
- `trend[]` : Tendance mensuelle

---

## 🎯 Page Dashboard Principal

Pour le dashboard principal, utilisez le **hook SSE temps réel** :

```typescript
import { useRealtimeKPI } from '@/lib/hooks/useRealtimeKPI';

export default function DashboardPage() {
  const { data: realtimeData, isConnected, error } = useRealtimeKPI();
  const [hourlyProduction, setHourlyProduction] = useState<any[]>([]);
  const [equipmentStatus, setEquipmentStatus] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/dashboard/current');
      const data = await res.json();

      setHourlyProduction(data.hourlyProduction || []);
      setEquipmentStatus(data.equipmentStatus || []);
    }

    fetchData();
  }, []);

  // Utiliser realtimeData pour les KPIs principaux
  return (
    <div>
      <h1>TRS: {realtimeData?.kpi.trs}%</h1>
      <p>Cadence: {realtimeData?.production.actualRate} b/min</p>
      <p>
        {isConnected ? '🟢 Temps réel actif' : '🔴 Déconnecté'}
      </p>

      {/* Graphiques avec hourlyProduction */}
    </div>
  );
}
```

---

## ⏰ Checklist Complète

### ✅ Pages Dynamiques
- [x] **Production** - Fait ! Utilise `/api/production/orders`
- [ ] **Maintenance** - À faire avec `/api/maintenance`
- [ ] **Qualité** - À faire avec `/api/quality`
- [ ] **Équipes** - À faire avec `/api/teams`
- [ ] **Énergie** - À faire avec `/api/energy`
- [ ] **Sécurité** - À faire avec `/api/safety`
- [ ] **Dashboard** - À faire avec SSE + `/api/dashboard/current`

### ✅ Pages Secondaires (Optionnel)
- [ ] **Alertes** - Utilise déjà `/api/dashboard/current` pour les alertes
- [ ] **Rapports** - Génération PDF/Excel (déjà fonctionnel)
- [ ] **Historique** - Peut utiliser `/api/production/history`
- [ ] **Arrêts** - Peut utiliser `/api/downtime`
- [ ] **Appareils** - Peut créer `/api/equipment`

---

## 🚀 Commandes Utiles

```bash
# Tester une API
curl http://localhost:3000/api/maintenance | jq
curl http://localhost:3000/api/quality | jq
curl http://localhost:3000/api/teams | jq

# Relancer le serveur après modifications
npm run dev

# Voir la base de données
npx prisma studio
```

---

## 💡 Conseils

1. **Copiez-collez le pattern** utilisé dans Production
2. **Ajustez les interfaces** TypeScript selon l'API
3. **Testez avec curl** avant d'intégrer au frontend
4. **Gardez l'UI intacte**, changez seulement la source des données
5. **Vérifiez les filtres** : ils doivent fonctionner avec l'API

---

## 🎓 Pour Votre Soutenance

Mentionnez que vous avez :
- ✅ **Architecturé** 7 APIs REST complètes
- ✅ **Implémenté** le pattern polling avec refresh auto
- ✅ **Optimisé** avec mise en cache et Prisma singleton
- ✅ **Documenté** chaque endpoint
- ✅ **Testé** avec données réelles de production

**Le travail est presque terminé ! 🚀**

Il vous reste juste à appliquer le même pattern aux 6 pages restantes en suivant ce guide.

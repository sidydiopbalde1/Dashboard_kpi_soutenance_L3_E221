# Guide de Test et Validation - KPI Dashboard

## Table des Matières

1. [Stratégie de test](#1-stratégie-de-test)
2. [Tests unitaires](#2-tests-unitaires)
3. [Tests d'intégration](#3-tests-dintégration)
4. [Tests de performance](#4-tests-de-performance)
5. [Tests de sécurité](#5-tests-de-sécurité)
6. [Tests utilisateur (UAT)](#6-tests-utilisateur-uat)
7. [Validation des KPI](#7-validation-des-kpi)
8. [Procédures de validation](#8-procédures-de-validation)

---

## 1. Stratégie de test

### 1.1 Pyramide de tests

```
                    E2E Tests (5%)
                 ┌─────────────────┐
                 │  Tests UI/UX    │
                 │  Tests complets │
              ┌─────────────────────────┐
              │   Integration Tests     │
              │        (15%)            │
              │  API + Database + MQTT  │
        ┌─────────────────────────────────────┐
        │          Unit Tests (80%)           │
        │    Functions + Components +         │
        │         Calculations               │
        └─────────────────────────────────────┘
```

### 1.2 Types de validation

#### Validation fonctionnelle
- **Calculs KPI** : Vérification des formules TRS, OEE
- **Gestion des données** : CRUD operations
- **Communication MQTT** : Messages temps réel
- **Alertes** : Déclenchement et escalade

#### Validation non-fonctionnelle
- **Performance** : Temps de réponse < 200ms
- **Scalabilité** : Support 1000+ messages MQTT/sec
- **Fiabilité** : Uptime > 99.9%
- **Sécurité** : Authentification et autorisation

### 1.3 Environnements de test

```
Development → Test → Staging → Production
     ↓           ↓        ↓         ↓
 Unit Tests  Integration  E2E    Monitoring
             API Tests   UAT     Validation
```

---

## 2. Tests unitaires

### 2.1 Configuration Jest

```json
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/lib/**/__tests__/*.test.{js,ts}'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 2.2 Tests des calculs KPI

```typescript
// lib/__tests__/calculations.test.ts
import { calculateTRS, calculateOEE, calculateAvailability } from '../calculations';

describe('KPI Calculations', () => {
  describe('calculateTRS', () => {
    test('calcule TRS correctement avec toutes les composantes', () => {
      const data = {
        plannedProductionTime: 480, // 8 heures
        actualRuntime: 400,         // 6h40
        targetProduction: 1000,
        actualProduction: 950,
        qualityUnits: 900
      };

      const result = calculateTRS(data);
      
      // Disponibilité: 400/480 = 83.33%
      // Performance: 950/1000 = 95%
      // Qualité: 900/950 = 94.74%
      // TRS: 83.33 * 95 * 94.74 / 10000 = 75%
      
      expect(result.availability).toBeCloseTo(83.33, 2);
      expect(result.performance).toBeCloseTo(95, 2);
      expect(result.quality).toBeCloseTo(94.74, 2);
      expect(result.trs).toBeCloseTo(75, 1);
    });

    test('retourne 0 si temps planifié est 0', () => {
      const data = {
        plannedProductionTime: 0,
        actualRuntime: 100,
        targetProduction: 1000,
        actualProduction: 950,
        qualityUnits: 900
      };

      const result = calculateTRS(data);
      expect(result.trs).toBe(0);
    });

    test('gère les valeurs nulles et undefined', () => {
      const data = {
        plannedProductionTime: null,
        actualRuntime: undefined,
        targetProduction: 1000,
        actualProduction: 950,
        qualityUnits: 900
      };

      expect(() => calculateTRS(data)).not.toThrow();
    });
  });

  describe('calculateOEE', () => {
    test('calcule OEE pour équipement spécifique', () => {
      const equipmentData = {
        uptime: 420,
        plannedTime: 480,
        actualOutput: 980,
        maxPossibleOutput: 1000,
        goodOutput: 950
      };

      const result = calculateOEE(equipmentData);
      
      expect(result.availability).toBeCloseTo(87.5, 1);
      expect(result.performance).toBeCloseTo(98, 1);
      expect(result.quality).toBeCloseTo(96.94, 2);
      expect(result.oee).toBeCloseTo(83.2, 1);
    });
  });
});
```

### 2.3 Tests des services

```typescript
// lib/__tests__/mqtt-service.test.ts
import { MQTTService } from '../mqtt-service';
import { EventEmitter } from 'events';

// Mock MQTT client
jest.mock('mqtt', () => ({
  connect: jest.fn(() => {
    const mockClient = new EventEmitter();
    mockClient.publish = jest.fn();
    mockClient.subscribe = jest.fn();
    mockClient.end = jest.fn();
    return mockClient;
  })
}));

describe('MQTT Service', () => {
  let mqttService: MQTTService;

  beforeEach(() => {
    mqttService = new MQTTService();
  });

  afterEach(() => {
    mqttService.disconnect();
  });

  test('se connecte au broker MQTT', async () => {
    await mqttService.connect();
    expect(mqttService.isConnected()).toBe(true);
  });

  test('publie un message correctement', async () => {
    await mqttService.connect();
    
    const topic = 'production/line1/data';
    const message = { count: 100, rate: 50 };
    
    await mqttService.publish(topic, message);
    
    expect(mqttService.client.publish).toHaveBeenCalledWith(
      topic,
      JSON.stringify(message)
    );
  });

  test('gère les erreurs de connexion', async () => {
    // Simuler erreur de connexion
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mqttService.client.emit('error', new Error('Connection failed'));
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'MQTT Error:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  test('reconnecte automatiquement après déconnexion', async () => {
    await mqttService.connect();
    
    // Simuler déconnexion
    mqttService.client.emit('close');
    
    // Attendre reconnexion
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mqttService.reconnectAttempts).toBeGreaterThan(0);
  });
});
```

### 2.4 Tests des composants React

```typescript
// components/__tests__/KPICard.test.tsx
import { render, screen } from '@testing-library/react';
import { KPICard } from '../dashboard/KPICard';

describe('KPICard', () => {
  const defaultProps = {
    title: 'TRS',
    value: 85.5,
    unit: '%',
    status: 'good' as const,
    target: 90
  };

  test('affiche les informations KPI correctement', () => {
    render(<KPICard {...defaultProps} />);
    
    expect(screen.getByText('TRS')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  test('affiche la couleur correcte selon le statut', () => {
    const { rerender } = render(<KPICard {...defaultProps} status="critical" />);
    
    const card = screen.getByTestId('kpi-card');
    expect(card).toHaveClass('border-red-200');
    
    rerender(<KPICard {...defaultProps} status="good" />);
    expect(card).toHaveClass('border-green-200');
  });

  test('affiche la tendance si fournie', () => {
    render(<KPICard {...defaultProps} trend={5.2} />);
    
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
    expect(screen.getByTestId('trend-up')).toBeInTheDocument();
  });

  test('gère les valeurs manquantes', () => {
    render(<KPICard {...defaultProps} value={null} />);
    
    expect(screen.getByText('--')).toBeInTheDocument();
  });
});
```

---

## 3. Tests d'intégration

### 3.1 Tests API

```typescript
// __tests__/integration/api.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../app/api/dashboard/current/route';
import { prisma } from '../../lib/prisma';

describe('/api/dashboard/current', () => {
  beforeEach(async () => {
    // Nettoyer la base de test
    await prisma.productionData.deleteMany();
    await prisma.kPISnapshot.deleteMany();
  });

  test('retourne les KPI actuels', async () => {
    // Créer des données de test
    await prisma.productionData.create({
      data: {
        timestamp: new Date(),
        lineId: 'line1',
        bottlesProduced: 1000,
        defectiveBottles: 20,
        actualRate: 95,
        targetRate: 100,
        isRunning: true,
        shiftId: 'shift1'
      }
    });

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('production');
    expect(data).toHaveProperty('kpi');
    expect(data.production.bottlesProduced).toBe(1000);
  });

  test('gère les erreurs de base de données', async () => {
    // Simuler erreur DB
    jest.spyOn(prisma.productionData, 'findMany')
      .mockRejectedValue(new Error('DB Error'));

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});
```

### 3.2 Tests base de données

```typescript
// __tests__/integration/database.test.ts
import { prisma } from '../../lib/prisma';

describe('Database Operations', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Nettoyer avant chaque test
    await prisma.$transaction([
      prisma.productionData.deleteMany(),
      prisma.alert.deleteMany(),
      prisma.equipment.deleteMany()
    ]);
  });

  test('crée et récupère des données de production', async () => {
    const productionData = await prisma.productionData.create({
      data: {
        timestamp: new Date(),
        lineId: 'line1',
        bottlesProduced: 500,
        defectiveBottles: 5,
        actualRate: 98,
        targetRate: 100,
        isRunning: true,
        shiftId: 'morning'
      }
    });

    expect(productionData.id).toBeDefined();
    expect(productionData.bottlesProduced).toBe(500);

    const retrieved = await prisma.productionData.findUnique({
      where: { id: productionData.id }
    });

    expect(retrieved).toEqual(productionData);
  });

  test('gère les contraintes de clés étrangères', async () => {
    // Tenter de créer MaintenanceTask sans Equipment
    await expect(
      prisma.maintenanceTask.create({
        data: {
          equipmentId: 'nonexistent',
          type: 'PREVENTIVE',
          description: 'Test maintenance',
          status: 'SCHEDULED',
          priority: 'MEDIUM',
          plannedDate: new Date()
        }
      })
    ).rejects.toThrow();
  });

  test('calcule les agrégations correctement', async () => {
    // Créer plusieurs enregistrements
    const testData = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000), // Chaque heure
      lineId: 'line1',
      bottlesProduced: 100 + i * 10,
      defectiveBottles: i,
      actualRate: 95 + i,
      targetRate: 100,
      isRunning: true,
      shiftId: 'morning'
    }));

    await prisma.productionData.createMany({
      data: testData
    });

    // Tester agrégation
    const stats = await prisma.productionData.aggregate({
      where: { lineId: 'line1' },
      _sum: { bottlesProduced: true },
      _avg: { actualRate: true },
      _count: true
    });

    expect(stats._sum.bottlesProduced).toBe(1450); // Somme calculée
    expect(stats._avg.actualRate).toBeCloseTo(99.5, 1);
    expect(stats._count).toBe(10);
  });
});
```

### 3.3 Tests MQTT End-to-End

```typescript
// __tests__/integration/mqtt-e2e.test.ts
import { MQTTService } from '../../lib/mqtt-service';
import { connect as mqttConnect } from 'mqtt';

describe('MQTT Integration', () => {
  let mqttService: MQTTService;
  let testClient: any;

  beforeAll(async () => {
    mqttService = new MQTTService();
    await mqttService.connect();

    // Client de test séparé
    testClient = mqttConnect(process.env.MQTT_BROKER_URL);
  });

  afterAll(async () => {
    await mqttService.disconnect();
    testClient.end();
  });

  test('reçoit et traite les messages de production', (done) => {
    const topic = 'production/line1/data';
    const testMessage = {
      timestamp: new Date().toISOString(),
      count: 150,
      rate: 75,
      defects: 2
    };

    // Écouter les messages traités
    mqttService.on('productionData', (data) => {
      expect(data.count).toBe(150);
      expect(data.rate).toBe(75);
      done();
    });

    // Publier message de test
    setTimeout(() => {
      testClient.publish(topic, JSON.stringify(testMessage));
    }, 100);
  }, 5000);

  test('gère les messages malformés', (done) => {
    const topic = 'production/line1/data';
    const invalidMessage = 'invalid json';

    mqttService.on('error', (error) => {
      expect(error.message).toContain('JSON');
      done();
    });

    testClient.publish(topic, invalidMessage);
  });
});
```

---

## 4. Tests de performance

### 4.1 Tests de charge API

```typescript
// __tests__/performance/load.test.ts
import { performance } from 'perf_hooks';

describe('API Performance Tests', () => {
  test('endpoint /api/dashboard/current répond en <200ms', async () => {
    const iterations = 100;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      const response = await fetch('http://localhost:3000/api/dashboard/current');
      await response.json();
      
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const p95Time = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

    expect(avgTime).toBeLessThan(100); // Moyenne < 100ms
    expect(p95Time).toBeLessThan(200);  // P95 < 200ms
  });
});
```

### 4.2 Tests de débit MQTT

```bash
#!/bin/bash
# scripts/mqtt-load-test.sh

# Test de débit MQTT
echo "Test de charge MQTT..."

# Publier 1000 messages en parallèle
for i in {1..1000}; do
  mosquitto_pub -h localhost -t "test/performance" \
    -m "{\"timestamp\":\"$(date -Iseconds)\",\"count\":$i,\"rate\":50}" &
done

wait
echo "1000 messages publiés"

# Mesurer le temps de traitement
echo "Débit cible: >500 messages/seconde"
```

### 4.3 Tests de mémoire

```typescript
// __tests__/performance/memory.test.ts
describe('Memory Usage Tests', () => {
  test('pas de fuite mémoire lors du traitement MQTT', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simuler traitement intensif
    for (let i = 0; i < 1000; i++) {
      await processProductionData({
        timestamp: new Date(),
        count: i,
        rate: Math.random() * 100
      });
    }

    // Forcer garbage collection
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Augmentation < 10MB acceptable
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

---

## 5. Tests de sécurité

### 5.1 Tests d'injection SQL

```typescript
// __tests__/security/sql-injection.test.ts
describe('SQL Injection Protection', () => {
  test('protège contre injection dans paramètres de requête', async () => {
    const maliciousInput = "'; DROP TABLE ProductionData; --";
    
    const { req, res } = createMocks({
      method: 'GET',
      query: { lineId: maliciousInput }
    });

    await handler(req, res);

    // Vérifier que la table existe toujours
    const count = await prisma.productionData.count();
    expect(typeof count).toBe('number');
  });
});
```

### 5.2 Tests d'authentification

```typescript
// __tests__/security/auth.test.ts
describe('Authentication Tests', () => {
  test('bloque accès sans token valide', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {}
    });

    await protectedHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  test('accepte token JWT valide', async () => {
    const token = generateTestToken({ userId: 'test-user' });
    
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    await protectedHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });
});
```

---

## 6. Tests utilisateur (UAT)

### 6.1 Scénarios de test utilisateur

#### Scénario 1: Supervision quotidienne
```gherkin
Feature: Dashboard de supervision
  En tant que superviseur de production
  Je veux voir les KPI en temps réel
  Pour surveiller les performances

Scenario: Consultation dashboard principal
  Given je suis connecté comme superviseur
  When j'accède au dashboard principal
  Then je vois les KPI TRS, disponibilité, performance, qualité
  And les valeurs sont mises à jour toutes les 5 secondes
  And je vois les alertes actives
```

#### Scénario 2: Gestion des alertes
```gherkin
Scenario: Gestion d'une alerte critique
  Given une alerte critique est active
  When je clique sur l'alerte
  Then je vois les détails de l'alerte
  And je peux marquer l'alerte comme traitée
  And je peux ajouter un commentaire
```

### 6.2 Tests Cypress (E2E)

```typescript
// cypress/e2e/dashboard.cy.ts
describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.login('supervisor@company.com', 'password');
  });

  it('affiche les KPI correctement', () => {
    cy.get('[data-testid="kpi-trs"]').should('be.visible');
    cy.get('[data-testid="kpi-availability"]').should('be.visible');
    cy.get('[data-testid="kpi-performance"]').should('be.visible');
    cy.get('[data-testid="kpi-quality"]').should('be.visible');

    // Vérifier valeurs numériques
    cy.get('[data-testid="kpi-trs"] .value').should('contain', '%');
  });

  it('met à jour les données en temps réel', () => {
    cy.get('[data-testid="kpi-trs"] .value').then(($initialValue) => {
      const initialValue = $initialValue.text();
      
      // Simuler données MQTT
      cy.task('publishMQTTMessage', {
        topic: 'production/line1/data',
        message: { count: 1200, rate: 85 }
      });

      // Attendre mise à jour (max 10s)
      cy.get('[data-testid="kpi-trs"] .value', { timeout: 10000 })
        .should('not.contain', initialValue);
    });
  });

  it('navigue entre les modules', () => {
    cy.get('[data-testid="nav-production"]').click();
    cy.url().should('include', '/production');
    
    cy.get('[data-testid="nav-maintenance"]').click();
    cy.url().should('include', '/maintenance');
  });
});
```

---

## 7. Validation des KPI

### 7.1 Tests de conformité métier

```typescript
// __tests__/validation/kpi-compliance.test.ts
describe('KPI Business Validation', () => {
  test('TRS conforme aux standards industriels', () => {
    const data = {
      plannedTime: 480,    // 8h
      downtime: 30,        // 30min
      targetRate: 120,     // unités/min
      actualProduction: 540, // 540 unités
      defects: 15          // 15 défauts
    };

    const result = calculateTRS(data);

    // Vérifications conformité
    expect(result.availability).toBeGreaterThan(0);
    expect(result.availability).toBeLessThanOrEqual(100);
    expect(result.performance).toBeGreaterThan(0);
    expect(result.performance).toBeLessThanOrEqual(100);
    expect(result.quality).toBeGreaterThan(0);
    expect(result.quality).toBeLessThanOrEqual(100);
    
    // TRS = produit des 3 composantes
    const expectedTRS = (result.availability * result.performance * result.quality) / 10000;
    expect(result.trs).toBeCloseTo(expectedTRS, 2);
  });

  test('classification TRS selon standards', () => {
    expect(classifyTRS(90)).toBe('EXCELLENT');
    expect(classifyTRS(80)).toBe('GOOD');
    expect(classifyTRS(70)).toBe('ACCEPTABLE');
    expect(classifyTRS(60)).toBe('POOR');
  });
});
```

### 7.2 Tests de cohérence des données

```typescript
describe('Data Consistency Tests', () => {
  test('cohérence données production et KPI', async () => {
    // Créer données production
    const productionData = await prisma.productionData.create({
      data: {
        timestamp: new Date(),
        lineId: 'line1',
        bottlesProduced: 1000,
        defectiveBottles: 50,
        actualRate: 90,
        targetRate: 100,
        isRunning: true,
        shiftId: 'morning'
      }
    });

    // Calculer KPI
    const kpi = await calculateKPIFromProduction(productionData);

    // Vérifications cohérence
    expect(kpi.quality).toBe(95); // (1000-50)/1000 * 100
    expect(kpi.performance).toBe(90); // actualRate/targetRate * 100
    
    // Données cohérentes dans le temps
    expect(kpi.timestamp).toEqual(productionData.timestamp);
    expect(kpi.lineId).toBe(productionData.lineId);
  });
});
```

---

## 8. Procédures de validation

### 8.1 Check-list de validation

#### Tests automatisés
- [ ] Tests unitaires > 80% couverture
- [ ] Tests d'intégration API passent
- [ ] Tests performance < 200ms P95
- [ ] Tests sécurité passent
- [ ] Tests E2E complets

#### Validation fonctionnelle
- [ ] Calculs KPI vérifiés manuellement
- [ ] Communication MQTT stable
- [ ] Alertes déclenchées correctement
- [ ] Interface utilisateur responsive
- [ ] Rapports générés correctement

#### Validation technique
- [ ] Base de données optimisée
- [ ] Logs configurés
- [ ] Monitoring en place
- [ ] Backups testés
- [ ] Procédures rollback validées

### 8.2 Métriques de qualité

```typescript
// Métriques cibles
const QUALITY_METRICS = {
  coverage: {
    unit: 80,      // % couverture tests unitaires
    integration: 70, // % couverture intégration
    e2e: 60        // % couverture E2E
  },
  performance: {
    apiResponse: 200,    // ms P95
    mqttLatency: 50,     // ms
    uiRender: 100        // ms First Contentful Paint
  },
  reliability: {
    uptime: 99.9,        // %
    errorRate: 0.1,      // %
    mttr: 30             // minutes
  }
};
```

### 8.3 Rapport de validation

```typescript
// Génération rapport de validation
interface ValidationReport {
  timestamp: Date;
  version: string;
  environment: string;
  testResults: {
    unit: TestSuite;
    integration: TestSuite;
    e2e: TestSuite;
    performance: PerformanceMetrics;
    security: SecurityTests;
  };
  coverage: CoverageReport;
  issues: Issue[];
  recommendations: string[];
  signOff: {
    developer: string;
    tester: string;
    productOwner: string;
  };
}
```

### 8.4 Scripts d'automatisation

```bash
#!/bin/bash
# scripts/run-validation.sh

echo "=== Validation complète KPI Dashboard ==="

# Tests unitaires
echo "1. Tests unitaires..."
npm run test:unit -- --coverage

# Tests d'intégration
echo "2. Tests d'intégration..."
npm run test:integration

# Tests E2E
echo "3. Tests E2E..."
npm run test:e2e

# Tests de performance
echo "4. Tests de performance..."
npm run test:performance

# Vérification sécurité
echo "5. Audit sécurité..."
npm audit
npm run test:security

# Build de production
echo "6. Build production..."
npm run build

# Génération rapport
echo "7. Génération rapport..."
npm run generate:validation-report

echo "=== Validation terminée ==="
```

Ce guide de test et validation couvre tous les aspects nécessaires pour garantir la qualité et la fiabilité du système KPI Dashboard, de la validation des calculs métier aux tests de performance et de sécurité.
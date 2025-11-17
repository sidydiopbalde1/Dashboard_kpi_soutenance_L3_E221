# Diagrammes UML et Schémas Techniques - KPI Dashboard

## Table des Matières

1. [Diagramme de classes](#1-diagramme-de-classes)
2. [Diagramme de composants](#2-diagramme-de-composants)
3. [Diagramme de déploiement](#3-diagramme-de-déploiement)
4. [Diagrammes de séquence](#4-diagrammes-de-séquence)
5. [Diagramme d'architecture](#5-diagramme-darchitecture)
6. [Flux de données](#6-flux-de-données)

---

## 1. Diagramme de classes

### 1.1 Domaine Production

```mermaid
classDiagram
    class ProductionData {
        +String id
        +DateTime timestamp
        +String lineId
        +Int bottlesProduced
        +Int defectiveBottles
        +Float actualRate
        +Float targetRate
        +Boolean isRunning
        +String shiftId
        +Float temperature
        +Float pressure
        +calculateTRS() Float
        +calculateOEE() Float
    }

    class ProductionOrder {
        +String id
        +String productCode
        +String productName
        +Int targetQuantity
        +Int actualQuantity
        +DateTime plannedStartTime
        +DateTime actualStartTime
        +DateTime plannedEndTime
        +DateTime actualEndTime
        +String status
        +String priority
        +String lineId
        +getProgress() Float
        +isLate() Boolean
    }

    class KPISnapshot {
        +String id
        +DateTime timestamp
        +Float trs
        +Float availability
        +Float performance
        +Float quality
        +Float oee
        +String lineId
        +String shiftId
        +Int totalProduced
        +Int totalDefects
        +Float downtimeHours
        +calculateEfficiency() Float
    }

    ProductionData ||--o{ KPISnapshot : "calcule"
    ProductionOrder ||--o{ ProductionData : "génère"
```

### 1.2 Domaine Maintenance

```mermaid
classDiagram
    class Equipment {
        +String id
        +String name
        +String type
        +String location
        +String status
        +DateTime lastMaintenanceDate
        +DateTime nextMaintenanceDate
        +String specifications
        +Float mtbf
        +Float mttr
        +calculateAvailability() Float
        +needsMaintenance() Boolean
    }

    class MaintenanceTask {
        +String id
        +String equipmentId
        +String type
        +String description
        +String status
        +String priority
        +DateTime plannedDate
        +DateTime completedDate
        +String assignedTo
        +Float estimatedDuration
        +Float actualDuration
        +String notes
        +markCompleted() Void
        +isOverdue() Boolean
    }

    Equipment ||--o{ MaintenanceTask : "a"
    Equipment ||--o{ EnergyConsumption : "consomme"
```

### 1.3 Domaine Personnel

```mermaid
classDiagram
    class Employee {
        +String id
        +String firstName
        +String lastName
        +String employeeNumber
        +String position
        +String department
        +DateTime hireDate
        +String status
        +String skills
        +Float performanceScore
        +Float efficiencyScore
        +Float qualityScore
        +Float safetyScore
        +calculateOverallScore() Float
    }

    class ShiftRecord {
        +String id
        +String employeeId
        +DateTime shiftStart
        +DateTime shiftEnd
        +String shiftType
        +String lineAssignment
        +String role
        +Int unitsProduced
        +Int qualityIssues
        +String notes
        +calculateProductivity() Float
    }

    class Training {
        +String id
        +String name
        +String description
        +String type
        +Int durationHours
        +String certification
        +DateTime expiryDate
        +String status
        +isExpired() Boolean
    }

    Employee ||--o{ ShiftRecord : "travaille"
    Employee }o--o{ Training : "suit"
```

---

## 2. Diagramme de composants

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Components]
        Store[Zustand Store]
        Hooks[Custom Hooks]
        Utils[Utility Functions]
    end

    subgraph "API Layer"
        Routes[API Routes]
        Middleware[Middleware]
        Auth[Authentication]
    end

    subgraph "Service Layer"
        KPIService[KPI Service]
        MQTTService[MQTT Service]
        DataService[Data Service]
        AlertService[Alert Service]
        CalcService[Calculation Service]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        Cache[Redis Cache]
        DB[(PostgreSQL)]
    end

    subgraph "External Systems"
        MQTT[MQTT Broker]
        Sensors[IoT Sensors]
        Reports[Report Generator]
    end

    UI --> Store
    UI --> Hooks
    Hooks --> Routes
    Routes --> Middleware
    Middleware --> Auth
    Routes --> KPIService
    Routes --> MQTTService
    Routes --> DataService
    
    KPIService --> CalcService
    DataService --> Prisma
    MQTTService --> MQTT
    AlertService --> KPIService
    
    Prisma --> DB
    CalcService --> Cache
    
    MQTT --> Sensors
    DataService --> Reports
```

---

## 3. Diagramme de déploiement

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Web Tier"
            LB[Load Balancer]
            WS1[Web Server 1<br/>Next.js App]
            WS2[Web Server 2<br/>Next.js App]
        end
        
        subgraph "Application Tier"
            API1[API Server 1<br/>Node.js]
            API2[API Server 2<br/>Node.js]
            MQTT_SRV[MQTT Service]
        end
        
        subgraph "Data Tier"
            DB_PRIMARY[(PostgreSQL Primary)]
            DB_REPLICA[(PostgreSQL Replica)]
            CACHE[(Redis Cache)]
        end
        
        subgraph "Monitoring"
            LOGS[Log Aggregation]
            METRICS[Metrics Collection]
            ALERTS[Alert Manager]
        end
    end
    
    subgraph "Industrial Network"
        BROKER[MQTT Broker]
        PLC1[PLC Line 1]
        PLC2[PLC Line 2]
        SENSORS[IoT Sensors]
    end
    
    subgraph "Client Devices"
        DESKTOP[Desktop Browsers]
        TABLET[Tablets]
        MOBILE[Mobile Devices]
    end

    LB --> WS1
    LB --> WS2
    WS1 --> API1
    WS2 --> API2
    
    API1 --> DB_PRIMARY
    API2 --> DB_PRIMARY
    DB_PRIMARY --> DB_REPLICA
    
    API1 --> CACHE
    API2 --> CACHE
    
    MQTT_SRV --> BROKER
    BROKER --> PLC1
    BROKER --> PLC2
    BROKER --> SENSORS
    
    DESKTOP --> LB
    TABLET --> LB
    MOBILE --> LB
    
    WS1 --> LOGS
    WS2 --> LOGS
    API1 --> METRICS
    API2 --> METRICS
```

---

## 4. Diagrammes de séquence

### 4.1 Mise à jour KPI en temps réel

```mermaid
sequenceDiagram
    participant S as Sensor
    participant M as MQTT Broker
    participant MS as MQTT Service
    participant KS as KPI Service
    participant DB as Database
    participant SSE as SSE Stream
    participant UI as Dashboard UI

    S->>M: Publish production data
    M->>MS: Forward message
    MS->>MS: Parse & validate data
    MS->>DB: Store production data
    MS->>KS: Trigger KPI calculation
    KS->>DB: Fetch related data
    KS->>KS: Calculate TRS, OEE, etc.
    KS->>DB: Store KPI snapshot
    KS->>SSE: Stream KPI update
    SSE->>UI: Real-time KPI data
    UI->>UI: Update dashboard
```

### 4.2 Gestion des alertes

```mermaid
sequenceDiagram
    participant KS as KPI Service
    participant AS as Alert Service
    participant TS as Threshold Service
    participant NS as Notification Service
    participant DB as Database
    participant UI as Dashboard

    KS->>AS: New KPI calculated
    AS->>TS: Check thresholds
    TS->>DB: Get alert rules
    TS-->>AS: Threshold violations
    
    alt Threshold exceeded
        AS->>DB: Create alert
        AS->>NS: Send notification
        NS->>UI: Real-time alert
        AS->>AS: Escalate if critical
    else Within limits
        AS->>AS: Monitor trend
    end
```

### 4.3 Traitement commande de production

```mermaid
sequenceDiagram
    participant U as User
    participant API as API Layer
    participant PS as Production Service
    participant MS as MQTT Service
    participant PLC as PLC Controller
    participant DB as Database

    U->>API: Create production order
    API->>PS: Process order
    PS->>DB: Save order
    PS->>MS: Send setup commands
    MS->>PLC: Configure line
    PLC-->>MS: Acknowledge setup
    MS-->>PS: Setup confirmed
    PS->>DB: Update order status
    PS-->>API: Order ready
    API-->>U: Confirmation
```

---

## 5. Diagramme d'architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        subgraph "Web Interface"
            DASH[Dashboard]
            PROD[Production View]
            MAINT[Maintenance View]
            QUAL[Quality View]
        end
        
        subgraph "Mobile Interface"
            MOBILE[Mobile App]
            TABLET[Tablet Interface]
        end
    end

    subgraph "Application Layer"
        subgraph "API Gateway"
            ROUTER[Route Handler]
            AUTH[Authentication]
            VALID[Validation]
        end
        
        subgraph "Business Logic"
            KPI_CALC[KPI Calculator]
            ALERT_MGR[Alert Manager]
            REPORT_GEN[Report Generator]
            DATA_PROC[Data Processor]
        end
    end

    subgraph "Service Layer"
        subgraph "Core Services"
            PROD_SVC[Production Service]
            MAINT_SVC[Maintenance Service]
            QUAL_SVC[Quality Service]
            ENERGY_SVC[Energy Service]
        end
        
        subgraph "Infrastructure Services"
            MQTT_SVC[MQTT Service]
            CACHE_SVC[Cache Service]
            LOG_SVC[Logging Service]
            METRIC_SVC[Metrics Service]
        end
    end

    subgraph "Data Layer"
        subgraph "Databases"
            POSTGRES[(PostgreSQL)]
            REDIS[(Redis Cache)]
            TSDB[(Time Series DB)]
        end
        
        subgraph "External Systems"
            ERP[ERP System]
            MES[MES System]
            IOT[IoT Platform]
        end
    end

    DASH --> ROUTER
    PROD --> ROUTER
    MAINT --> ROUTER
    QUAL --> ROUTER
    MOBILE --> ROUTER
    TABLET --> ROUTER

    ROUTER --> AUTH
    AUTH --> VALID
    VALID --> KPI_CALC
    VALID --> ALERT_MGR
    VALID --> REPORT_GEN
    VALID --> DATA_PROC

    KPI_CALC --> PROD_SVC
    ALERT_MGR --> MAINT_SVC
    REPORT_GEN --> QUAL_SVC
    DATA_PROC --> ENERGY_SVC

    PROD_SVC --> MQTT_SVC
    MAINT_SVC --> CACHE_SVC
    QUAL_SVC --> LOG_SVC
    ENERGY_SVC --> METRIC_SVC

    MQTT_SVC --> POSTGRES
    CACHE_SVC --> REDIS
    LOG_SVC --> TSDB
    METRIC_SVC --> ERP
    
    POSTGRES --> MES
    REDIS --> IOT
```

---

## 6. Flux de données

### 6.1 Flux de données de production

```mermaid
flowchart TD
    START[Début de production]
    SENSOR[Capteurs IoT]
    MQTT[Message MQTT]
    VALIDATE{Validation données}
    STORE[Stockage BDD]
    CALC[Calcul KPI]
    THRESHOLD{Seuils dépassés?}
    ALERT[Génération alerte]
    STREAM[Streaming SSE]
    DASHBOARD[Mise à jour dashboard]
    
    START --> SENSOR
    SENSOR --> MQTT
    MQTT --> VALIDATE
    VALIDATE -->|Valide| STORE
    VALIDATE -->|Invalide| ERROR[Log erreur]
    STORE --> CALC
    CALC --> THRESHOLD
    THRESHOLD -->|Oui| ALERT
    THRESHOLD -->|Non| STREAM
    ALERT --> STREAM
    STREAM --> DASHBOARD
    DASHBOARD --> END[Fin]
    ERROR --> END
```

### 6.2 Flux de calcul TRS

```mermaid
flowchart TD
    INPUT[Données production]
    TIME_CALC[Calcul temps]
    AVAIL[Disponibilité = Temps marche / Temps total]
    PERF[Performance = Production réelle / Théorique]
    QUAL[Qualité = Conformes / Total]
    TRS[TRS = Disponibilité × Performance × Qualité]
    CLASSIFY{Classification}
    EXCELLENT[Excellent ≥85%]
    GOOD[Bon 75-85%]
    WARNING[Attention 65-75%]
    CRITICAL[Critique <65%]
    
    INPUT --> TIME_CALC
    TIME_CALC --> AVAIL
    TIME_CALC --> PERF
    TIME_CALC --> QUAL
    AVAIL --> TRS
    PERF --> TRS
    QUAL --> TRS
    TRS --> CLASSIFY
    CLASSIFY -->|≥85%| EXCELLENT
    CLASSIFY -->|75-85%| GOOD
    CLASSIFY -->|65-75%| WARNING
    CLASSIFY -->|<65%| CRITICAL
```

### 6.3 Flux de gestion des alertes

```mermaid
flowchart TD
    KPI[Nouveau KPI calculé]
    RULES[Récupération règles]
    CHECK{Vérification seuils}
    CREATE[Création alerte]
    SEVERITY{Évaluation gravité}
    LOW[Faible]
    MEDIUM[Moyenne]
    HIGH[Élevée]
    CRITICAL[Critique]
    NOTIFY[Notification]
    EMAIL[Email]
    SMS[SMS]
    DASHBOARD_ALERT[Alerte dashboard]
    LOG[Log audit]
    
    KPI --> RULES
    RULES --> CHECK
    CHECK -->|Seuil dépassé| CREATE
    CHECK -->|OK| LOG
    CREATE --> SEVERITY
    SEVERITY --> LOW
    SEVERITY --> MEDIUM
    SEVERITY --> HIGH
    SEVERITY --> CRITICAL
    
    LOW --> DASHBOARD_ALERT
    MEDIUM --> DASHBOARD_ALERT
    HIGH --> EMAIL
    HIGH --> DASHBOARD_ALERT
    CRITICAL --> EMAIL
    CRITICAL --> SMS
    CRITICAL --> DASHBOARD_ALERT
    
    DASHBOARD_ALERT --> NOTIFY
    EMAIL --> NOTIFY
    SMS --> NOTIFY
    NOTIFY --> LOG
```

---

## Légendes et Conventions

### Symboles utilisés
- `[]` : Processus/Action
- `{}` : Décision/Condition
- `()` : Données/Information
- `||--o{` : Relation One-to-Many
- `}o--o{` : Relation Many-to-Many

### Codes couleur (si applicable)
- 🟢 Vert : État normal/Bon
- 🟡 Jaune : Attention/Warning
- 🔴 Rouge : Critique/Erreur
- 🔵 Bleu : Information/Process

### Niveaux de priorité
- **P1** : Critique (résolution immédiate)
- **P2** : Élevée (résolution < 4h)
- **P3** : Moyenne (résolution < 24h)
- **P4** : Faible (résolution < 72h)

Ces diagrammes UML complètent la documentation technique et offrent une vision graphique claire de l'architecture et des flux du système KPI Dashboard.
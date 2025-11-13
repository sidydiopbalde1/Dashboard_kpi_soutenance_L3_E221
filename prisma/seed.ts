// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction utilitaire pour générer des dates
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);

async function main() {
  console.log('🌱 Début du seeding de la base de données...\n');

  // ===== NETTOYAGE =====
  console.log('🧹 Nettoyage des tables...');
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.safetyIncident.deleteMany();
  await prisma.training.deleteMany();
  await prisma.shiftRecord.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.energyConsumption.deleteMany();
  await prisma.qualityControl.deleteMany();
  await prisma.maintenanceTask.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.downtime.deleteMany();
  await prisma.kPISnapshot.deleteMany();
  await prisma.productionData.deleteMany();
  await prisma.alertThreshold.deleteMany();
  console.log('✅ Tables nettoyées\n');

  // ===== ÉQUIPEMENTS =====
  console.log('🏭 Création des équipements...');
  const equipment1 = await prisma.equipment.create({
    data: {
      name: 'Ligne 1',
      location: 'Atelier A',
      type: 'production_line',
      model: 'KHS Innofill Glass DRS',
      serialNumber: 'KHS-2018-001',
      installationDate: daysAgo(1200),
      status: 'running',
      efficiency: 94.2,
      lastMaintenance: daysAgo(7),
      nextMaintenance: daysAgo(-21),
      isActive: true
    }
  });

  const equipment2 = await prisma.equipment.create({
    data: {
      name: 'Ligne 2',
      location: 'Atelier A',
      type: 'production_line',
      model: 'KHS Innofill Glass DRS',
      serialNumber: 'KHS-2019-002',
      installationDate: daysAgo(900),
      status: 'warning',
      efficiency: 87.5,
      lastMaintenance: daysAgo(14),
      nextMaintenance: daysAgo(-7),
      isActive: true
    }
  });

  const equipment3 = await prisma.equipment.create({
    data: {
      name: 'Ligne 3',
      location: 'Atelier B',
      type: 'production_line',
      model: 'Sidel Matrix SF300',
      serialNumber: 'SDL-2020-003',
      installationDate: daysAgo(600),
      status: 'running',
      efficiency: 96.8,
      lastMaintenance: daysAgo(3),
      nextMaintenance: daysAgo(-27),
      isActive: true
    }
  });

  const equipmentQC = await prisma.equipment.create({
    data: {
      name: 'Contrôle Qualité',
      location: 'Lab Qualité',
      type: 'quality_control',
      model: 'HEUFT Spectrum II',
      serialNumber: 'HFT-2019-QC1',
      installationDate: daysAgo(800),
      status: 'running',
      efficiency: 98.5,
      lastMaintenance: daysAgo(5),
      nextMaintenance: daysAgo(-25),
      isActive: true
    }
  });

  const equipmentCompressor = await prisma.equipment.create({
    data: {
      name: 'Compresseur Principal',
      location: 'Salle des machines',
      type: 'compressor',
      model: 'Atlas Copco GA110',
      serialNumber: 'ATC-2017-CMP1',
      installationDate: daysAgo(1500),
      status: 'running',
      efficiency: 91.2,
      lastMaintenance: daysAgo(10),
      nextMaintenance: daysAgo(-20),
      isActive: true
    }
  });

  console.log(`✅ ${5} équipements créés\n`);

  // ===== MAINTENANCE =====
  console.log('🔧 Création des tâches de maintenance...');
  await prisma.maintenanceTask.createMany({
    data: [
      {
        equipmentId: equipment1.id,
        type: 'preventive',
        status: 'completed',
        priority: 'medium',
        title: 'Maintenance préventive mensuelle',
        description: 'Graissage, vérification des roulements et inspection visuelle',
        assignedTo: 'Technicien Martin',
        scheduledDate: daysAgo(7),
        startedAt: daysAgo(7),
        completedAt: daysAgo(7),
        estimatedDuration: 120,
        actualDuration: 110,
        cost: 250.50,
        spareParts: ['Graisse industrielle', 'Filtres à air'],
        comments: 'Aucun problème détecté'
      },
      {
        equipmentId: equipment2.id,
        type: 'corrective',
        status: 'in_progress',
        priority: 'high',
        title: 'Réparation système pneumatique',
        description: 'Fuite détectée sur circuit pneumatique principal',
        assignedTo: 'Technicien Dubois',
        scheduledDate: hoursAgo(2),
        startedAt: hoursAgo(1),
        estimatedDuration: 180,
        cost: 450.00,
        spareParts: ['Raccords pneumatiques', 'Joints toriques', 'Tuyau 8mm'],
        comments: 'Réparation en cours'
      },
      {
        equipmentId: equipment3.id,
        type: 'preventive',
        status: 'planned',
        priority: 'medium',
        title: 'Inspection trimestrielle',
        description: 'Inspection complète et calibration des capteurs',
        assignedTo: 'Technicien Martin',
        scheduledDate: daysAgo(-2),
        estimatedDuration: 240,
        cost: 380.00,
        spareParts: ['Kit de calibration']
      },
      {
        equipmentId: equipmentCompressor.id,
        type: 'preventive',
        status: 'planned',
        priority: 'high',
        title: 'Révision compresseur',
        description: 'Révision complète avec changement d\'huile et filtres',
        assignedTo: 'Technicien Lefebvre',
        scheduledDate: daysAgo(-5),
        estimatedDuration: 360,
        cost: 850.00,
        spareParts: ['Huile compresseur 20L', 'Filtre à huile', 'Filtre séparateur', 'Filtre à air']
      },
      {
        equipmentId: equipment1.id,
        type: 'emergency',
        status: 'completed',
        priority: 'critical',
        title: 'Arrêt urgence - Bourrage',
        description: 'Bourrage bouteilles au niveau du convoyeur',
        assignedTo: 'Technicien Dubois',
        scheduledDate: daysAgo(3),
        startedAt: daysAgo(3),
        completedAt: daysAgo(3),
        estimatedDuration: 30,
        actualDuration: 45,
        cost: 120.00,
        spareParts: [],
        comments: 'Nettoyage et redémarrage effectués'
      }
    ]
  });
  console.log('✅ Tâches de maintenance créées\n');

  // ===== EMPLOYÉS =====
  console.log('👥 Création des employés...');
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        employeeNumber: 'EMP001',
        firstName: 'Jean',
        lastName: 'Martin',
        role: 'Opérateur',
        shift: 'MATIN',
        workstation: 'Ligne 1',
        skills: ['Opération machines', 'Contrôle qualité', 'Maintenance N1'],
        certifications: ['CACES 3', 'Habilitation électrique'],
        hireDate: daysAgo(730),
        isActive: true,
        performanceScore: 92.5,
        efficiencyScore: 95.2,
        qualityScore: 94.8,
        safetyScore: 98.0,
        lastTraining: daysAgo(45),
        nextTraining: daysAgo(-45),
        experience: 5
      }
    }),
    prisma.employee.create({
      data: {
        employeeNumber: 'EMP002',
        firstName: 'Marie',
        lastName: 'Dubois',
        role: 'Chef d\'équipe',
        shift: 'MATIN',
        workstation: 'Ligne 1-2',
        skills: ['Management', 'Opération machines', 'Formation', 'Maintenance N2'],
        certifications: ['CACES 3', 'Formation management', 'SST'],
        hireDate: daysAgo(1460),
        isActive: true,
        performanceScore: 96.8,
        efficiencyScore: 97.5,
        qualityScore: 96.2,
        safetyScore: 99.5,
        lastTraining: daysAgo(30),
        nextTraining: daysAgo(-60),
        experience: 8
      }
    }),
    prisma.employee.create({
      data: {
        employeeNumber: 'EMP003',
        firstName: 'Pierre',
        lastName: 'Lefebvre',
        role: 'Opérateur',
        shift: 'APRES_MIDI',
        workstation: 'Ligne 2',
        skills: ['Opération machines', 'Changement format'],
        certifications: ['CACES 3'],
        hireDate: daysAgo(365),
        isActive: true,
        performanceScore: 88.3,
        efficiencyScore: 90.1,
        qualityScore: 89.5,
        safetyScore: 95.0,
        lastTraining: daysAgo(60),
        nextTraining: daysAgo(-30),
        experience: 3
      }
    }),
    prisma.employee.create({
      data: {
        employeeNumber: 'EMP004',
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: 'Opérateur',
        shift: 'NUIT',
        workstation: 'Ligne 3',
        skills: ['Opération machines', 'Contrôle qualité'],
        certifications: ['CACES 3'],
        hireDate: daysAgo(180),
        isActive: true,
        performanceScore: 85.7,
        efficiencyScore: 87.8,
        qualityScore: 91.2,
        safetyScore: 93.5,
        lastTraining: daysAgo(15),
        nextTraining: daysAgo(-75),
        experience: 2
      }
    })
  ]);
  console.log(`✅ ${employees.length} employés créés\n`);

  // ===== DONNÉES DE PRODUCTION =====
  console.log('📊 Génération des données de production (dernières 24h)...');
  const productionData = [];
  const now = new Date();

  // Générer des données par minute pour les dernières 24 heures
  for (let i = 0; i < 1440; i++) { // 1440 minutes = 24h
    const timestamp = new Date(now.getTime() - (1440 - i) * 60 * 1000);
    const hour = timestamp.getHours();

    let shift = 'NUIT';
    if (hour >= 6 && hour < 14) shift = 'MATIN';
    else if (hour >= 14 && hour < 22) shift = 'APRES_MIDI';

    // Simuler des variations réalistes
    const baseRate = 120;
    const variation = Math.sin(i / 60) * 10; // Variation sinusoïdale
    const randomVariation = (Math.random() - 0.5) * 20;
    const actualRate = Math.max(0, Math.floor(baseRate + variation + randomVariation));

    // Simuler des arrêts (3% de chance)
    const isRunning = Math.random() > 0.03;

    // Simuler des défauts (2% quand en fonctionnement)
    const hasDefect = isRunning && Math.random() < 0.02;

    productionData.push({
      timestamp,
      bottlesProduced: isRunning ? actualRate : 0,
      targetRate: 120,
      actualRate: isRunning ? actualRate : 0,
      defectCount: hasDefect ? Math.floor(Math.random() * 3) + 1 : 0,
      isRunning,
      shiftId: shift,
      temperature: isRunning ? 20 + Math.random() * 5 : null,
      pressure: isRunning ? 2.3 + Math.random() * 0.4 : null
    });
  }

  await prisma.productionData.createMany({ data: productionData });
  console.log(`✅ ${productionData.length} points de données de production créés\n`);

  // ===== TEMPS D'ARRÊT =====
  console.log('⏸️  Création des temps d\'arrêt...');
  await prisma.downtime.createMany({
    data: [
      {
        startTime: hoursAgo(18),
        endTime: hoursAgo(17.75),
        duration: 15,
        reason: 'Changement format',
        category: 'changeover',
        description: 'Changement format bouteille 1L vers 0.5L',
        operator: 'Jean Martin',
        resolved: true
      },
      {
        startTime: hoursAgo(12),
        endTime: hoursAgo(11.5),
        duration: 30,
        reason: 'Maintenance préventive',
        category: 'maintenance',
        description: 'Graissage planifié ligne 1',
        operator: 'Technicien Martin',
        resolved: true
      },
      {
        startTime: hoursAgo(8),
        endTime: hoursAgo(7.25),
        duration: 45,
        reason: 'Panne électrique',
        category: 'breakdown',
        description: 'Disjoncteur déclenché - surcharge',
        operator: 'Pierre Lefebvre',
        resolved: true
      },
      {
        startTime: hoursAgo(4),
        endTime: hoursAgo(3.75),
        duration: 15,
        reason: 'Attente matière première',
        category: 'material',
        description: 'Attente livraison étiquettes',
        operator: 'Marie Dubois',
        resolved: true
      },
      {
        startTime: hoursAgo(1.5),
        endTime: hoursAgo(1.2),
        duration: 18,
        reason: 'Bourrage',
        category: 'breakdown',
        description: 'Bourrage convoyeur sortie',
        operator: 'Sophie Bernard',
        resolved: true
      }
    ]
  });
  console.log('✅ Temps d\'arrêt créés\n');

  // ===== CONTRÔLE QUALITÉ =====
  console.log('🎯 Création des données qualité...');
  await prisma.qualityControl.createMany({
    data: [
      {
        timestamp: hoursAgo(2),
        lotNumber: 'LOT-2024-1112-001',
        productType: 'Bouteille 1L',
        defectType: 'Étiquetage incorrect',
        severity: 'major',
        quantity: 45,
        totalProduced: 1500,
        operator: 'Jean Martin',
        line: 'Ligne 1',
        shift: 'MATIN',
        status: 'corrected',
        inspector: 'Contrôleur QC',
        correctedAction: 'Réajustement position étiqueteuse',
        comments: 'Problème résolu après ajustement'
      },
      {
        timestamp: hoursAgo(5),
        lotNumber: 'LOT-2024-1112-002',
        productType: 'Bouteille 0.5L',
        defectType: 'Niveau de remplissage',
        severity: 'minor',
        quantity: 12,
        totalProduced: 2400,
        operator: 'Pierre Lefebvre',
        line: 'Ligne 2',
        shift: 'APRES_MIDI',
        status: 'closed',
        inspector: 'Contrôleur QC',
        correctedAction: 'Calibration remplisseuse',
        comments: 'Conformité rétablie'
      },
      {
        timestamp: hoursAgo(8),
        lotNumber: 'LOT-2024-1111-015',
        productType: 'Bouteille 1L',
        defectType: 'Capsule défectueuse',
        severity: 'critical',
        quantity: 120,
        totalProduced: 1800,
        operator: 'Sophie Bernard',
        line: 'Ligne 3',
        shift: 'NUIT',
        status: 'investigating',
        inspector: 'Chef Qualité',
        comments: 'Investigation en cours - problème capsuleuse'
      },
      {
        timestamp: hoursAgo(15),
        lotNumber: 'LOT-2024-1111-012',
        productType: 'Bouteille 0.5L',
        defectType: 'Date impression illisible',
        severity: 'major',
        quantity: 35,
        totalProduced: 2200,
        operator: 'Jean Martin',
        line: 'Ligne 1',
        shift: 'MATIN',
        status: 'corrected',
        inspector: 'Contrôleur QC',
        correctedAction: 'Remplacement cartouche jet d\'encre',
        comments: 'Impression normale après remplacement'
      }
    ]
  });
  console.log('✅ Données qualité créées\n');

  // ===== CONSOMMATION ÉNERGÉTIQUE =====
  console.log('⚡ Génération des données énergétiques...');
  const energyData = [];

  for (let i = 0; i < 24; i++) { // Données horaires pour 24h
    const timestamp = hoursAgo(24 - i);
    const hour = timestamp.getHours();

    // Tarif heures pleines/creuses
    const isPeakHour = hour >= 6 && hour < 22;
    const tariff = isPeakHour ? 'peak' : 'off_peak';

    // Consommation varie selon l'activité
    const baseConsumption = 180;
    const activityFactor = isPeakHour ? 1.3 : 0.8;
    const consumption = baseConsumption * activityFactor + (Math.random() - 0.5) * 40;

    const costPerKWh = isPeakHour ? 0.15 : 0.09;
    const cost = consumption * costPerKWh;

    energyData.push({
      timestamp,
      equipmentId: equipment1.id,
      consumption: Math.round(consumption * 10) / 10,
      cost: Math.round(cost * 100) / 100,
      efficiency: Math.round((85 + Math.random() * 15) * 10) / 10,
      carbonFootprint: Math.round(consumption * 0.08 * 10) / 10,
      peakDemand: Math.round((consumption * 1.15) * 10) / 10,
      tariffPeriod: tariff,
      renewable: false
    });
  }

  await prisma.energyConsumption.createMany({ data: energyData });
  console.log(`✅ ${energyData.length} points de données énergétiques créés\n`);

  // ===== INCIDENTS DE SÉCURITÉ =====
  console.log('🛡️  Création des incidents de sécurité...');
  await prisma.safetyIncident.createMany({
    data: [
      {
        timestamp: daysAgo(45),
        type: 'accident',
        severity: 'low',
        title: 'Coupure mineure',
        description: 'Coupure au doigt lors du changement de lame',
        location: 'Ligne 2',
        reportedBy: 'Pierre Lefebvre',
        involvedPersons: 1,
        injuryType: 'Coupure',
        bodyPart: 'Main droite',
        rootCause: 'Non-respect procédure sécurité',
        correctiveActions: ['Formation rappel', 'Mise à disposition gants anti-coupure'],
        status: 'closed',
        daysLost: 0,
        cost: 50.00,
        investigator: 'Responsable Sécurité',
        closedAt: daysAgo(44)
      },
      {
        timestamp: daysAgo(15),
        type: 'near_miss',
        severity: 'medium',
        title: 'Chute d\'objet évitée',
        description: 'Palette mal arrimée sur rack de stockage',
        location: 'Zone stockage',
        reportedBy: 'Marie Dubois',
        involvedPersons: 0,
        rootCause: 'Mauvais empilage',
        correctiveActions: ['Sensibilisation équipe', 'Contrôle empilage renforcé'],
        status: 'corrected',
        cost: 0,
        investigator: 'Chef d\'équipe'
      },
      {
        timestamp: daysAgo(3),
        type: 'unsafe_condition',
        severity: 'high',
        title: 'Fuite produit chimique',
        description: 'Fuite de solution de nettoyage CIP',
        location: 'Salle CIP',
        reportedBy: 'Technicien Martin',
        involvedPersons: 0,
        rootCause: 'Joint défectueux',
        correctiveActions: ['Remplacement joint', 'Inspection tous les raccords'],
        status: 'investigating',
        cost: 300.00,
        investigator: 'Responsable Maintenance'
      }
    ]
  });
  console.log('✅ Incidents de sécurité créés\n');

  // ===== ORDRES DE PRODUCTION =====
  console.log('📦 Création des ordres de production...');
  await prisma.productionOrder.createMany({
    data: [
      {
        orderNumber: 'OF-2024-1112-001',
        productType: 'Bouteille 1L - Eau minérale',
        quantity: 5000,
        produced: 5000,
        targetRate: 120,
        actualRate: 118,
        startTime: hoursAgo(10),
        endTime: hoursAgo(6),
        estimatedEndTime: hoursAgo(6),
        status: 'completed',
        priority: 'medium',
        line: 'Ligne 1',
        operator: 'Jean Martin',
        shift: 'MATIN',
        customer: 'CARREFOUR',
        setupTime: 15,
        downtime: 20
      },
      {
        orderNumber: 'OF-2024-1112-002',
        productType: 'Bouteille 0.5L - Eau gazeuse',
        quantity: 8000,
        produced: 5200,
        targetRate: 120,
        actualRate: 115,
        startTime: hoursAgo(5),
        estimatedEndTime: hoursAgo(-2),
        status: 'running',
        priority: 'high',
        line: 'Ligne 2',
        operator: 'Pierre Lefebvre',
        shift: 'APRES_MIDI',
        customer: 'AUCHAN',
        setupTime: 20,
        downtime: 35
      },
      {
        orderNumber: 'OF-2024-1112-003',
        productType: 'Bouteille 1.5L - Eau de source',
        quantity: 6000,
        produced: 0,
        targetRate: 120,
        estimatedEndTime: daysAgo(-1),
        status: 'waiting',
        priority: 'medium',
        line: 'Ligne 3',
        customer: 'LECLERC',
        downtime: 0
      },
      {
        orderNumber: 'OF-2024-1111-025',
        productType: 'Bouteille 1L - Eau minérale',
        quantity: 4500,
        produced: 3800,
        targetRate: 120,
        actualRate: 105,
        startTime: hoursAgo(20),
        estimatedEndTime: hoursAgo(-2),
        status: 'paused',
        priority: 'low',
        line: 'Ligne 1',
        operator: 'Sophie Bernard',
        shift: 'NUIT',
        customer: 'INTERMARCHE',
        setupTime: 12,
        downtime: 90,
        comments: 'En attente pièce détachée'
      }
    ]
  });
  console.log('✅ Ordres de production créés\n');

  // ===== ALERTES =====
  console.log('🚨 Création des alertes...');
  await prisma.alert.createMany({
    data: [
      {
        timestamp: minutesAgo(15),
        type: 'warning',
        severity: 'medium',
        message: 'Température élevée sur ligne 2',
        threshold: 25,
        actualValue: 27.3,
        isResolved: false
      },
      {
        timestamp: minutesAgo(45),
        type: 'error',
        severity: 'high',
        message: 'Taux de défauts supérieur au seuil',
        threshold: 2,
        actualValue: 3.8,
        isResolved: false
      },
      {
        timestamp: hoursAgo(2),
        type: 'warning',
        severity: 'medium',
        message: 'Cadence inférieure à l\'objectif',
        threshold: 110,
        actualValue: 105,
        isResolved: true,
        resolvedAt: hoursAgo(1.5),
        resolvedBy: 'Jean Martin'
      },
      {
        timestamp: hoursAgo(3),
        type: 'info',
        severity: 'low',
        message: 'Maintenance préventive due dans 7 jours',
        isResolved: false
      },
      {
        timestamp: hoursAgo(5),
        type: 'warning',
        severity: 'medium',
        message: 'Stock étiquettes faible',
        threshold: 1000,
        actualValue: 450,
        isResolved: true,
        resolvedAt: hoursAgo(4),
        resolvedBy: 'Responsable logistique'
      }
    ]
  });
  console.log('✅ Alertes créées\n');

  // ===== SNAPSHOTS KPI =====
  console.log('📈 Calcul et création des snapshots KPI...');

  // Calculer les KPIs actuels
  const totalProduced = productionData.reduce((sum, d) => sum + d.bottlesProduced, 0);
  const totalDefects = productionData.reduce((sum, d) => sum + d.defectCount, 0);
  const runningMinutes = productionData.filter(d => d.isRunning).length;
  const totalMinutes = productionData.length;

  const availability = (runningMinutes / totalMinutes) * 100;
  const performance = (totalProduced / (120 * totalMinutes)) * 100;
  const quality = totalProduced > 0 ? ((totalProduced - totalDefects) / totalProduced) * 100 : 100;
  const trs = (availability * performance * quality) / 10000;

  await prisma.kPISnapshot.createMany({
    data: [
      {
        period: 'current',
        trs: Math.round(trs * 10) / 10,
        availability: Math.round(availability * 10) / 10,
        performance: Math.round(performance * 10) / 10,
        quality: Math.round(quality * 10) / 10,
        totalProduced,
        totalDefects,
        totalDowntime: 123, // Total des durées d'arrêt
        oee: Math.round(trs * 10) / 10,
        mtbf: 342.5,
        mttr: 45.2,
        shiftId: 'CURRENT'
      },
      {
        timestamp: hoursAgo(8),
        period: 'shift',
        trs: 85.3,
        availability: 96.5,
        performance: 91.2,
        quality: 97.0,
        totalProduced: 57600,
        totalDefects: 180,
        totalDowntime: 35,
        oee: 85.3,
        shiftId: 'MATIN'
      },
      {
        timestamp: hoursAgo(16),
        period: 'shift',
        trs: 79.8,
        availability: 94.2,
        performance: 88.5,
        quality: 95.8,
        totalProduced: 54200,
        totalDefects: 245,
        totalDowntime: 48,
        oee: 79.8,
        shiftId: 'APRES_MIDI'
      }
    ]
  });
  console.log('✅ Snapshots KPI créés\n');

  // ===== SEUILS D'ALERTE =====
  console.log('⚙️  Configuration des seuils d\'alerte...');
  await prisma.alertThreshold.createMany({
    data: [
      { kpiType: 'TRS', minValue: 75, severity: 'medium', isActive: true },
      { kpiType: 'CADENCE', minValue: 100, severity: 'medium', isActive: true },
      { kpiType: 'QUALITY', minValue: 97, severity: 'high', isActive: true },
      { kpiType: 'TEMPERATURE', maxValue: 26, severity: 'medium', isActive: true },
      { kpiType: 'DEFECT_RATE', maxValue: 2, severity: 'high', isActive: true }
    ]
  });
  console.log('✅ Seuils d\'alerte configurés\n');

  // ===== CONFIGURATION SYSTÈME =====
  console.log('⚙️  Configuration système...');
  await prisma.systemConfig.createMany({
    data: [
      {
        category: 'targets',
        key: 'target_trs',
        value: '85',
        dataType: 'number',
        description: 'Objectif TRS global'
      },
      {
        category: 'targets',
        key: 'target_rate',
        value: '120',
        dataType: 'number',
        description: 'Cadence cible (bouteilles/minute)'
      },
      {
        category: 'alerts',
        key: 'alert_temperature_max',
        value: '26',
        dataType: 'number',
        description: 'Température maximale avant alerte (°C)'
      },
      {
        category: 'alerts',
        key: 'alert_defect_rate_max',
        value: '2',
        dataType: 'number',
        description: 'Taux de défauts max avant alerte (%)'
      }
    ]
  });
  console.log('✅ Configuration système créée\n');

  // ===== RÉSUMÉ =====
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEEDING TERMINÉ AVEC SUCCÈS !');
  console.log('='.repeat(60));

  const counts = {
    equipment: await prisma.equipment.count(),
    maintenanceTasks: await prisma.maintenanceTask.count(),
    employees: await prisma.employee.count(),
    productionData: await prisma.productionData.count(),
    downtimes: await prisma.downtime.count(),
    qualityControls: await prisma.qualityControl.count(),
    energyData: await prisma.energyConsumption.count(),
    safetyIncidents: await prisma.safetyIncident.count(),
    productionOrders: await prisma.productionOrder.count(),
    alerts: await prisma.alert.count(),
    kpiSnapshots: await prisma.kPISnapshot.count(),
    alertThresholds: await prisma.alertThreshold.count(),
    systemConfigs: await prisma.systemConfig.count()
  };

  console.log('\n📊 Statistiques :');
  console.log(`   - Équipements : ${counts.equipment}`);
  console.log(`   - Tâches de maintenance : ${counts.maintenanceTasks}`);
  console.log(`   - Employés : ${counts.employees}`);
  console.log(`   - Données de production : ${counts.productionData}`);
  console.log(`   - Temps d'arrêt : ${counts.downtimes}`);
  console.log(`   - Contrôles qualité : ${counts.qualityControls}`);
  console.log(`   - Données énergétiques : ${counts.energyData}`);
  console.log(`   - Incidents sécurité : ${counts.safetyIncidents}`);
  console.log(`   - Ordres de production : ${counts.productionOrders}`);
  console.log(`   - Alertes : ${counts.alerts}`);
  console.log(`   - Snapshots KPI : ${counts.kpiSnapshots}`);
  console.log(`   - Seuils d'alerte : ${counts.alertThresholds}`);
  console.log(`   - Configurations : ${counts.systemConfigs}`);

  console.log('\n✨ La base de données est prête à l\'emploi !');
  console.log('🚀 Vous pouvez maintenant lancer l\'application.\n');
}

main()
  .catch((e) => {
    console.error('\n❌ ERREUR lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

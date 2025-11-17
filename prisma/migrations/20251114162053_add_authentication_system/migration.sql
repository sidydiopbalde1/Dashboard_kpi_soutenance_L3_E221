-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'TECHNICIAN', 'OPERATOR', 'VIEWER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ProductionData" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bottlesProduced" INTEGER NOT NULL,
    "targetRate" INTEGER NOT NULL DEFAULT 120,
    "actualRate" INTEGER NOT NULL,
    "defectCount" INTEGER NOT NULL DEFAULT 0,
    "isRunning" BOOLEAN NOT NULL DEFAULT true,
    "shiftId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "pressure" DOUBLE PRECISION,

    CONSTRAINT "ProductionData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Downtime" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "reason" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "operator" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Downtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPISnapshot" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,
    "trs" DOUBLE PRECISION NOT NULL,
    "availability" DOUBLE PRECISION NOT NULL,
    "performance" DOUBLE PRECISION NOT NULL,
    "quality" DOUBLE PRECISION NOT NULL,
    "totalProduced" INTEGER NOT NULL,
    "totalDefects" INTEGER NOT NULL,
    "totalDowntime" INTEGER NOT NULL,
    "oee" DOUBLE PRECISION,
    "mtbf" DOUBLE PRECISION,
    "mttr" DOUBLE PRECISION,
    "shiftId" TEXT,

    CONSTRAINT "KPISnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertThreshold" (
    "id" SERIAL NOT NULL,
    "kpiType" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "severity" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT,
    "serialNumber" TEXT,
    "installationDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "efficiency" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignedTo" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedDuration" INTEGER NOT NULL,
    "actualDuration" INTEGER,
    "cost" DOUBLE PRECISION,
    "spareParts" TEXT[],
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityControl" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lotNumber" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "defectType" TEXT,
    "severity" TEXT,
    "quantity" INTEGER NOT NULL,
    "totalProduced" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "correctedAction" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "inspector" TEXT,
    "comments" TEXT,

    CONSTRAINT "QualityControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyConsumption" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipmentId" TEXT,
    "consumption" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION,
    "efficiency" DOUBLE PRECISION,
    "carbonFootprint" DOUBLE PRECISION,
    "peakDemand" DOUBLE PRECISION,
    "tariffPeriod" TEXT,
    "renewable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EnergyConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "workstation" TEXT NOT NULL,
    "skills" TEXT[],
    "certifications" TEXT[],
    "hireDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "performanceScore" DOUBLE PRECISION,
    "efficiencyScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "safetyScore" DOUBLE PRECISION,
    "lastTraining" TIMESTAMP(3),
    "nextTraining" TIMESTAMP(3),
    "experience" INTEGER,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'present',
    "productivity" DOUBLE PRECISION,
    "comments" TEXT,

    CONSTRAINT "ShiftRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "instructor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyIncident" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "involvedPersons" INTEGER NOT NULL DEFAULT 0,
    "injuryType" TEXT,
    "bodyPart" TEXT,
    "rootCause" TEXT,
    "correctiveActions" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'open',
    "daysLost" INTEGER,
    "cost" DOUBLE PRECISION,
    "investigator" TEXT,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "SafetyIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "produced" INTEGER NOT NULL DEFAULT 0,
    "targetRate" INTEGER NOT NULL,
    "actualRate" INTEGER,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "estimatedEndTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "line" TEXT NOT NULL,
    "operator" TEXT,
    "shift" TEXT,
    "customer" TEXT,
    "setupTime" INTEGER,
    "downtime" INTEGER NOT NULL DEFAULT 0,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "error" TEXT,
    "generatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeToTraining" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeToTraining_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ProductionData_timestamp_idx" ON "ProductionData"("timestamp");

-- CreateIndex
CREATE INDEX "ProductionData_shiftId_idx" ON "ProductionData"("shiftId");

-- CreateIndex
CREATE INDEX "Downtime_startTime_idx" ON "Downtime"("startTime");

-- CreateIndex
CREATE INDEX "Downtime_category_idx" ON "Downtime"("category");

-- CreateIndex
CREATE INDEX "Alert_timestamp_isResolved_idx" ON "Alert"("timestamp", "isResolved");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "KPISnapshot_timestamp_period_idx" ON "KPISnapshot"("timestamp", "period");

-- CreateIndex
CREATE INDEX "KPISnapshot_shiftId_idx" ON "KPISnapshot"("shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertThreshold_kpiType_key" ON "AlertThreshold"("kpiType");

-- CreateIndex
CREATE INDEX "AlertThreshold_kpiType_idx" ON "AlertThreshold"("kpiType");

-- CreateIndex
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");

-- CreateIndex
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");

-- CreateIndex
CREATE INDEX "MaintenanceTask_status_idx" ON "MaintenanceTask"("status");

-- CreateIndex
CREATE INDEX "MaintenanceTask_type_idx" ON "MaintenanceTask"("type");

-- CreateIndex
CREATE INDEX "MaintenanceTask_scheduledDate_idx" ON "MaintenanceTask"("scheduledDate");

-- CreateIndex
CREATE INDEX "QualityControl_timestamp_idx" ON "QualityControl"("timestamp");

-- CreateIndex
CREATE INDEX "QualityControl_status_idx" ON "QualityControl"("status");

-- CreateIndex
CREATE INDEX "QualityControl_severity_idx" ON "QualityControl"("severity");

-- CreateIndex
CREATE INDEX "EnergyConsumption_timestamp_idx" ON "EnergyConsumption"("timestamp");

-- CreateIndex
CREATE INDEX "EnergyConsumption_equipmentId_idx" ON "EnergyConsumption"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");

-- CreateIndex
CREATE INDEX "Employee_shift_idx" ON "Employee"("shift");

-- CreateIndex
CREATE INDEX "Employee_role_idx" ON "Employee"("role");

-- CreateIndex
CREATE INDEX "ShiftRecord_date_idx" ON "ShiftRecord"("date");

-- CreateIndex
CREATE INDEX "ShiftRecord_shift_idx" ON "ShiftRecord"("shift");

-- CreateIndex
CREATE INDEX "Training_type_idx" ON "Training"("type");

-- CreateIndex
CREATE INDEX "Training_status_idx" ON "Training"("status");

-- CreateIndex
CREATE INDEX "SafetyIncident_timestamp_idx" ON "SafetyIncident"("timestamp");

-- CreateIndex
CREATE INDEX "SafetyIncident_type_idx" ON "SafetyIncident"("type");

-- CreateIndex
CREATE INDEX "SafetyIncident_severity_idx" ON "SafetyIncident"("severity");

-- CreateIndex
CREATE INDEX "SafetyIncident_status_idx" ON "SafetyIncident"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrder_orderNumber_key" ON "ProductionOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "ProductionOrder_status_idx" ON "ProductionOrder"("status");

-- CreateIndex
CREATE INDEX "ProductionOrder_priority_idx" ON "ProductionOrder"("priority");

-- CreateIndex
CREATE INDEX "ProductionOrder_line_idx" ON "ProductionOrder"("line");

-- CreateIndex
CREATE INDEX "SystemConfig_category_idx" ON "SystemConfig"("category");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_category_key_key" ON "SystemConfig"("category", "key");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "_EmployeeToTraining_B_index" ON "_EmployeeToTraining"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyConsumption" ADD CONSTRAINT "EnergyConsumption_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftRecord" ADD CONSTRAINT "ShiftRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToTraining" ADD CONSTRAINT "_EmployeeToTraining_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToTraining" ADD CONSTRAINT "_EmployeeToTraining_B_fkey" FOREIGN KEY ("B") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "role" TEXT NOT NULL DEFAULT 'DOCTOR',
    "hospitalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patient" (
    "recordID" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "ipdId" TEXT,
    "patientId" TEXT,
    "fileNo" TEXT,
    "ipNumber" TEXT,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "dateOfAdmission" TEXT NOT NULL,
    "admissionTime" TEXT,
    "dateOfOperation" TEXT,
    "dateOfDischarge" TEXT,
    "stayDuration" TEXT,
    "postOpStay" TEXT,
    "wardName" TEXT DEFAULT 'A SURESH WAGLE GENERAL WARD',
    "roomType" TEXT DEFAULT 'SINGLE BED CABIN',
    "bedNo" TEXT,
    "inchargeDoctor" TEXT DEFAULT 'Dr. Niraj Bam',
    "additionalDoctors" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Admitted',
    "diagnosis" TEXT,
    "natureOfDisease" TEXT,
    "durationOfIllness" TEXT,
    "historyOfPresentIllness" TEXT,
    "pastHistory" TEXT,
    "comorbidities" TEXT,
    "generalExam" TEXT,
    "weight" TEXT,
    "height" TEXT,
    "abdomenExam" TEXT,
    "otherFindings" TEXT,
    "usg" TEXT DEFAULT 'Normal',
    "ctScan" TEXT DEFAULT 'Normal',
    "attachments" TEXT,
    "operation" TEXT,
    "operationFindings" TEXT,
    "surgeon" TEXT,
    "assistant1" TEXT,
    "assistant2" TEXT,
    "postOpProgress" TEXT,
    "hpeReport" TEXT,
    "bloodTransfusion" TEXT DEFAULT 'No',
    "wbPrbcUnits" TEXT DEFAULT '0',
    "ffpUnits" TEXT DEFAULT '0',
    "prpUnits" TEXT DEFAULT '0',
    "complications" TEXT,
    "complicationGrade" TEXT DEFAULT 'I',
    "hospitalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vitals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "hr" INTEGER NOT NULL,
    "bpSystolic" INTEGER NOT NULL,
    "bpDiastolic" INTEGER NOT NULL,
    "temp" REAL NOT NULL,
    "spo2" INTEGER NOT NULL,
    "rr" INTEGER NOT NULL,
    "sugar" INTEGER NOT NULL,
    "recordedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vitals_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("recordID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "author" TEXT,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("recordID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "hb" TEXT,
    "tc" TEXT,
    "neu" TEXT,
    "lym" TEXT,
    "platelets" TEXT,
    "pt" TEXT,
    "inr" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("recordID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "indication" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("recordID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

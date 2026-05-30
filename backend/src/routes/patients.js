const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { logAudit } = require('./audit');

const prisma = new PrismaClient();

// Get all patients for the clinician's hospital
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { hospitalId: req.user.hospitalId },
      include: {
        vitalsHistory: true,
        dailyReports: true,
        investigations: true,
        medications: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format fields (e.g. deserialize arrays stored as string)
    const formattedPatients = patients.map(p => ({
      ...p,
      additionalDoctors: p.additionalDoctors ? p.additionalDoctors.split(',').map(d => d.trim()).filter(d => d) : [],
      complications: p.complications ? p.complications.split(',').map(c => c.trim()).filter(c => c) : [],
      attachments: p.attachments ? JSON.parse(p.attachments) : [],
    }));

    res.json(formattedPatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching patients.' });
  }
});

// Create a new patient
router.post('/', authenticateToken, async (req, res) => {
  const data = req.body;

  if (!data.fullName || !data.age || !data.gender) {
    return res.status(400).json({ error: 'Full Name, Age, and Gender are required.' });
  }

  try {
    // Extract relations
    const initialInvestigations = data.investigations || [];
    const initialVitals = data.vitalsHistory || [];
    const initialNotes = data.dailyReports || [];
    const initialMedications = data.medications || [];

    // Parse array variables to strings for database storage
    const additionalDoctorsStr = Array.isArray(data.additionalDoctors) ? data.additionalDoctors.join(', ') : (data.additionalDoctors || '');
    const complicationsStr = Array.isArray(data.complications) ? data.complications.join(', ') : (data.complications || '');
    const attachmentsStr = Array.isArray(data.attachments) ? JSON.stringify(data.attachments) : '[]';

    const patient = await prisma.patient.create({
      data: {
        fullName: data.fullName,
        ipid: data.ipid || Math.floor(10000000 + Math.random() * 90000000).toString(),
        type: data.type || 'IPD',
        age: parseInt(data.age, 10) || 0,
        gender: data.gender,
        address: data.address || '',
        dateOfAdmission: data.dateOfAdmission,
        admissionTime: data.admissionTime || '',
        dateOfOperation: data.dateOfOperation || '',
        dateOfDischarge: data.dateOfDischarge || '',
        stayDuration: data.stayDuration || '',
        postOpStay: data.postOpStay || '',
        wardName: data.wardName || 'General Ward',
        roomType: data.roomType || 'SINGLE BED CABIN',
        bedNo: data.bedNo || '',
        inchargeDoctor: data.inchargeDoctor || req.user.name,
        additionalDoctors: additionalDoctorsStr,
        status: data.status || 'Admitted',
        
        diagnosis: data.diagnosis || '',
        natureOfDisease: data.natureOfDisease || '',
        durationOfIllness: data.durationOfIllness || '',
        historyOfPresentIllness: data.historyOfPresentIllness || '',
        pastHistory: data.pastHistory || '',
        comorbidities: data.comorbidities || '',
        
        generalExam: data.generalExam || '',
        weight: data.weight || '',
        height: data.height || '',
        abdomenExam: data.abdomenExam || '',
        otherFindings: data.otherFindings || '',
        
        usg: data.usg || 'Normal',
        ctScan: data.ctScan || 'Normal',
        attachments: attachmentsStr,
        
        operation: data.operation || '',
        operationFindings: data.operationFindings || '',
        surgeon: data.surgeon || '',
        assistant1: data.assistant1 || '',
        assistant2: data.assistant2 || '',
        postOpProgress: data.postOpProgress || '',
        hpeReport: data.hpeReport || '',
        
        bloodTransfusion: data.bloodTransfusion || 'No',
        wbPrbcUnits: data.wbPrbcUnits || '0',
        ffpUnits: data.ffpUnits || '0',
        prpUnits: data.prpUnits || '0',
        complications: complicationsStr,
        complicationGrade: data.complicationGrade || 'I',

        hospitalId: req.user.hospitalId,
        
        // Nested creations
        investigations: {
          create: initialInvestigations.map(inv => ({
            date: inv.date,
            hb: inv.hb || '',
            tc: inv.tc || '',
            neu: inv.neu || '',
            lym: inv.lym || '',
            platelets: inv.platelets || '',
            pt: inv.pt || '',
            inr: inv.inr || ''
          }))
        },
        vitalsHistory: {
          create: initialVitals.map(v => ({
            date: v.date,
            time: v.time,
            hr: parseInt(v.hr) || 0,
            bpSystolic: parseInt(v.bpSystolic) || 0,
            bpDiastolic: parseInt(v.bpDiastolic) || 0,
            temp: parseFloat(v.temp) || 0,
            spo2: parseInt(v.spo2) || 0,
            rr: parseInt(v.rr) || 0,
            sugar: parseInt(v.sugar) || 0,
            recordedBy: v.recordedBy || req.user.name
          }))
        },
        dailyReports: {
          create: initialNotes.map(n => ({
            date: n.date,
            time: n.time,
            note: n.note,
            author: n.author || req.user.name,
            role: n.role || (req.user.role === 'DOCTOR' ? 'Doctor' : 'Nurse')
          }))
        },
        medications: {
          create: initialMedications.map(m => ({
            name: m.name,
            route: m.route,
            frequency: m.frequency,
            indication: m.indication,
            status: m.status || 'active'
          }))
        }
      },
      include: {
        vitalsHistory: true,
        dailyReports: true,
        investigations: true,
        medications: true,
      }
    });

    // Format back to matching array interface
    const responseData = {
      ...patient,
      additionalDoctors: patient.additionalDoctors ? patient.additionalDoctors.split(',').map(d => d.trim()).filter(d => d) : [],
      complications: patient.complications ? patient.complications.split(',').map(c => c.trim()).filter(c => c) : [],
      attachments: patient.attachments ? JSON.parse(patient.attachments) : [],
    };

    logAudit(req.user.id, req.user.name, 'CREATE', 'PATIENT', patient.recordID, patient.recordID, JSON.stringify({ fullName: data.fullName }));
    res.status(201).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating patient.' });
  }
});

// Get all upcoming scheduled appointments across all patients in the clinician's hospital
router.get('/appointments/upcoming', authenticateToken, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        patient: {
          hospitalId: req.user.hospitalId
        },
        status: 'Scheduled'
      },
      include: {
        patient: {
          select: {
            recordID: true,
            fullName: true,
            ipid: true,
            gender: true,
            age: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Fetch upcoming appointments error:', error);
    res.status(500).json({ error: 'Server error fetching upcoming appointments.' });
  }
});

// Update appointment status (Completed / Cancelled)
router.put('/appointments/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Completed | Cancelled

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    logAudit(
      req.user.id,
      req.user.name,
      'STATUS_CHANGE',
      'APPOINTMENT',
      id,
      updated.patientId,
      JSON.stringify({ status })
    );

    res.json(updated);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Server error updating appointment status.' });
  }
});

// Update patient
router.put('/:recordID', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const data = req.body;

  try {
    const existing = await prisma.patient.findFirst({
      where: { recordID, hospitalId: req.user.hospitalId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Patient not found in your hospital.' });
    }

    const additionalDoctorsStr = Array.isArray(data.additionalDoctors) ? data.additionalDoctors.join(', ') : (data.additionalDoctors || existing.additionalDoctors);
    const complicationsStr = Array.isArray(data.complications) ? data.complications.join(', ') : (data.complications || existing.complications);
    const attachmentsStr = Array.isArray(data.attachments) ? JSON.stringify(data.attachments) : (data.attachments || existing.attachments);

    const updated = await prisma.patient.update({
      where: { recordID },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : existing.fullName,
        ipid: data.ipid !== undefined ? data.ipid : existing.ipid,
        type: data.type !== undefined ? data.type : existing.type,
        age: data.age !== undefined ? parseInt(data.age, 10) : existing.age,
        gender: data.gender !== undefined ? data.gender : existing.gender,
        address: data.address !== undefined ? data.address : existing.address,
        dateOfAdmission: data.dateOfAdmission !== undefined ? data.dateOfAdmission : existing.dateOfAdmission,
        admissionTime: data.admissionTime !== undefined ? data.admissionTime : existing.admissionTime,
        dateOfOperation: data.dateOfOperation !== undefined ? data.dateOfOperation : existing.dateOfOperation,
        dateOfDischarge: data.dateOfDischarge !== undefined ? data.dateOfDischarge : existing.dateOfDischarge,
        stayDuration: data.stayDuration !== undefined ? data.stayDuration : existing.stayDuration,
        postOpStay: data.postOpStay !== undefined ? data.postOpStay : existing.postOpStay,
        wardName: data.wardName !== undefined ? data.wardName : existing.wardName,
        roomType: data.roomType !== undefined ? data.roomType : existing.roomType,
        bedNo: data.bedNo !== undefined ? data.bedNo : existing.bedNo,
        inchargeDoctor: data.inchargeDoctor !== undefined ? data.inchargeDoctor : existing.inchargeDoctor,
        additionalDoctors: additionalDoctorsStr,
        status: data.status !== undefined ? data.status : existing.status,
        
        diagnosis: data.diagnosis !== undefined ? data.diagnosis : existing.diagnosis,
        natureOfDisease: data.natureOfDisease !== undefined ? data.natureOfDisease : existing.natureOfDisease,
        durationOfIllness: data.durationOfIllness !== undefined ? data.durationOfIllness : existing.durationOfIllness,
        historyOfPresentIllness: data.historyOfPresentIllness !== undefined ? data.historyOfPresentIllness : existing.historyOfPresentIllness,
        pastHistory: data.pastHistory !== undefined ? data.pastHistory : existing.pastHistory,
        comorbidities: data.comorbidities !== undefined ? data.comorbidities : existing.comorbidities,
        
        generalExam: data.generalExam !== undefined ? data.generalExam : existing.generalExam,
        weight: data.weight !== undefined ? data.weight : existing.weight,
        height: data.height !== undefined ? data.height : existing.height,
        abdomenExam: data.abdomenExam !== undefined ? data.abdomenExam : existing.abdomenExam,
        otherFindings: data.otherFindings !== undefined ? data.otherFindings : existing.otherFindings,
        
        usg: data.usg !== undefined ? data.usg : existing.usg,
        ctScan: data.ctScan !== undefined ? data.ctScan : existing.ctScan,
        attachments: attachmentsStr,
        
        operation: data.operation !== undefined ? data.operation : existing.operation,
        operationFindings: data.operationFindings !== undefined ? data.operationFindings : existing.operationFindings,
        surgeon: data.surgeon !== undefined ? data.surgeon : existing.surgeon,
        assistant1: data.assistant1 !== undefined ? data.assistant1 : existing.assistant1,
        assistant2: data.assistant2 !== undefined ? data.assistant2 : existing.assistant2,
        postOpProgress: data.postOpProgress !== undefined ? data.postOpProgress : existing.postOpProgress,
        hpeReport: data.hpeReport !== undefined ? data.hpeReport : existing.hpeReport,
        
        bloodTransfusion: data.bloodTransfusion !== undefined ? data.bloodTransfusion : existing.bloodTransfusion,
        wbPrbcUnits: data.wbPrbcUnits !== undefined ? data.wbPrbcUnits : existing.wbPrbcUnits,
        ffpUnits: data.ffpUnits !== undefined ? data.ffpUnits : existing.ffpUnits,
        prpUnits: data.prpUnits !== undefined ? data.prpUnits : existing.prpUnits,
        complications: complicationsStr,
        complicationGrade: data.complicationGrade !== undefined ? data.complicationGrade : existing.complicationGrade,
      },
      include: {
        vitalsHistory: true,
        dailyReports: true,
        investigations: true,
        medications: true,
      }
    });

    const responseData = {
      ...updated,
      additionalDoctors: updated.additionalDoctors ? updated.additionalDoctors.split(',').map(d => d.trim()).filter(d => d) : [],
      complications: updated.complications ? updated.complications.split(',').map(c => c.trim()).filter(c => c) : [],
      attachments: updated.attachments ? JSON.parse(updated.attachments) : [],
    };

    logAudit(req.user.id, req.user.name, 'UPDATE', 'PATIENT', recordID, recordID, null);
    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating patient.' });
  }
});

// Update patient status
router.put('/:recordID/status', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const patient = await prisma.patient.update({
      where: { recordID },
      data: { status }
    });
    logAudit(req.user.id, req.user.name, 'STATUS_CHANGE', 'PATIENT', recordID, recordID, JSON.stringify({ newStatus: status }));
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating status.' });
  }
});

// Add Vitals log
router.post('/:recordID/vitals', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const vital = req.body;

  try {
    const newVital = await prisma.vitals.create({
      data: {
        patientId: recordID,
        date: vital.date,
        time: vital.time,
        hr: parseInt(vital.hr) || 0,
        bpSystolic: parseInt(vital.bpSystolic) || 0,
        bpDiastolic: parseInt(vital.bpDiastolic) || 0,
        temp: parseFloat(vital.temp) || 0,
        spo2: parseInt(vital.spo2) || 0,
        rr: parseInt(vital.rr) || 0,
        sugar: parseInt(vital.sugar) || 0,
        recordedBy: vital.recordedBy || req.user.name,
      }
    });
    logAudit(req.user.id, req.user.name, 'CREATE', 'VITALS', newVital.id, recordID, null);
    res.status(201).json(newVital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error logging vitals.' });
  }
});

// Add Progress Report Note
router.post('/:recordID/notes', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const note = req.body;

  try {
    const newNote = await prisma.progressNote.create({
      data: {
        patientId: recordID,
        date: note.date,
        time: note.time,
        note: note.note,
        author: note.author || req.user.name,
        role: note.role || (req.user.role === 'DOCTOR' ? 'Doctor' : 'Nurse')
      }
    });
    logAudit(req.user.id, req.user.name, 'CREATE', 'NOTE', newNote.id, recordID, null);
    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error logging progress note.' });
  }
});

// Add Lab Investigation Report
router.post('/:recordID/labs', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const lab = req.body;

  try {
    const newLab = await prisma.labReport.create({
      data: {
        patientId: recordID,
        date: lab.date,
        hb: lab.hb || '',
        tc: lab.tc || '',
        neu: lab.neu || '',
        lym: lab.lym || '',
        platelets: lab.platelets || '',
        pt: lab.pt || '',
        inr: lab.inr || ''
      }
    });
    logAudit(req.user.id, req.user.name, 'CREATE', 'LAB', newLab.id, recordID, null);
    res.status(201).json(newLab);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error logging lab report.' });
  }
});

// --- Phase 3: Medication CRUD ---

// Add a medication
router.post('/:recordID/medications', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const med = req.body;

  if (!med.name || !med.route || !med.frequency) {
    return res.status(400).json({ error: 'Drug name, route, and frequency are required.' });
  }

  try {
    const newMed = await prisma.medication.create({
      data: {
        patientId: recordID,
        name: med.name,
        route: med.route,
        frequency: med.frequency,
        indication: med.indication || '',
        status: med.status || 'active'
      }
    });
    logAudit(req.user.id, req.user.name, 'CREATE', 'MEDICATION', newMed.id, recordID, JSON.stringify({ name: med.name }));
    res.status(201).json(newMed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error adding medication.' });
  }
});

// Update a medication
router.put('/:recordID/medications/:medId', authenticateToken, async (req, res) => {
  const { recordID, medId } = req.params;
  const data = req.body;

  try {
    const updated = await prisma.medication.update({
      where: { id: medId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.route !== undefined && { route: data.route }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.indication !== undefined && { indication: data.indication }),
        ...(data.status !== undefined && { status: data.status }),
      }
    });
    logAudit(req.user.id, req.user.name, 'UPDATE', 'MEDICATION', medId, recordID, JSON.stringify(data));
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating medication.' });
  }
});

// Delete a medication
router.delete('/:recordID/medications/:medId', authenticateToken, async (req, res) => {
  const { recordID, medId } = req.params;

  try {
    await prisma.medication.delete({ where: { id: medId } });
    logAudit(req.user.id, req.user.name, 'DELETE', 'MEDICATION', medId, recordID, null);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting medication.' });
  }
});

// --- Phase 3: Discharge Summary ---

// Generate & save a discharge summary
router.post('/:recordID/discharge', authenticateToken, async (req, res) => {
  const { recordID } = req.params;

  try {
    const patient = await prisma.patient.findFirst({
      where: { recordID, hospitalId: req.user.hospitalId },
      include: {
        medications: true,
        vitalsHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        dailyReports: { orderBy: { createdAt: 'desc' }, take: 3 },
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const activeMeds = (patient.medications || []).filter(m => m.status === 'active');
    const medNames = activeMeds.map(m => `${m.name} (${m.route}, ${m.frequency})`).join('; ');

    const summary = await prisma.dischargeSummary.create({
      data: {
        patientId: recordID,
        admissionDate: patient.dateOfAdmission || '',
        dischargeDate: patient.dateOfDischarge || new Date().toLocaleDateString(),
        diagnosis: patient.diagnosis || 'Not specified',
        procedures: patient.operation || 'None',
        medicationsOnDischarge: medNames || 'None',
        followUpInstructions: req.body.followUpInstructions || 'Follow up in OPD after 1 week. Report immediately if any complications arise.',
        generatedBy: req.user.name,
      }
    });

    logAudit(req.user.id, req.user.name, 'CREATE', 'DISCHARGE', summary.id, recordID, null);
    res.status(201).json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error generating discharge summary.' });
  }
});

// Fetch discharge summaries for a patient
router.get('/:recordID/discharge', authenticateToken, async (req, res) => {
  const { recordID } = req.params;

  try {
    const summaries = await prisma.dischargeSummary.findMany({
      where: { patientId: recordID },
      orderBy: { createdAt: 'desc' }
    });
    res.json(summaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching discharge summaries.' });
  }
});

// --- Phase 4: Patient Appointment Routes ---

// Schedule a new appointment for a patient
router.post('/:recordID/appointments', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const { doctorName, date, time, notes } = req.body;

  if (!doctorName || !date || !time) {
    return res.status(400).json({ error: 'Doctor name, date, and time are required.' });
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: recordID,
        doctorName,
        date,
        time,
        notes: notes || null
      }
    });

    logAudit(
      req.user.id,
      req.user.name,
      'CREATE',
      'APPOINTMENT',
      appointment.id,
      recordID,
      JSON.stringify({ doctorName, date, time })
    );

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error scheduling appointment.' });
  }
});

// Fetch appointments for a specific patient
router.get('/:recordID/appointments', authenticateToken, async (req, res) => {
  const { recordID } = req.params;

  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: recordID },
      orderBy: { date: 'desc' }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Fetch patient appointments error:', error);
    res.status(500).json({ error: 'Server error fetching patient appointments.' });
  }
});


// --- Phase 4: Medication Administration Record (MAR) ---

// Record a medication dose administration
router.post('/:recordID/medications/:medId/administer', authenticateToken, async (req, res) => {
  const { recordID, medId } = req.params;
  const { status, notes } = req.body; // Given | Held | Refused

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const admin = await prisma.medicationAdministration.create({
      data: {
        medicationId: medId,
        administeredBy: req.user.name,
        status,
        notes: notes || null
      }
    });

    logAudit(
      req.user.id,
      req.user.name,
      'CREATE',
      'MEDICATION_ADMINISTRATION',
      admin.id,
      recordID,
      JSON.stringify({ medicationId: medId, status })
    );

    res.status(201).json(admin);
  } catch (error) {
    console.error('Record MAR error:', error);
    res.status(500).json({ error: 'Server error recording medication administration.' });
  }
});

// Fetch administration logs for a medication
router.get('/:recordID/medications/:medId/administer', authenticateToken, async (req, res) => {
  const { medId } = req.params;

  try {
    const logs = await prisma.medicationAdministration.findMany({
      where: { medicationId: medId },
      orderBy: { administeredAt: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    console.error('Fetch MAR logs error:', error);
    res.status(500).json({ error: 'Server error fetching administration logs.' });
  }
});


// --- Phase 4: Shift Handovers ---

// Record a shift handover
router.post('/:recordID/handovers', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const { date, shift, incomingStaff, notes } = req.body;

  if (!date || !shift || !incomingStaff || !notes) {
    return res.status(400).json({ error: 'Date, shift, incoming staff, and notes are required.' });
  }

  try {
    const handover = await prisma.shiftHandover.create({
      data: {
        patientId: recordID,
        date,
        shift,
        outgoingStaff: req.user.name,
        incomingStaff,
        notes
      }
    });

    logAudit(
      req.user.id,
      req.user.name,
      'CREATE',
      'SHIFT_HANDOVER',
      handover.id,
      recordID,
      JSON.stringify({ shift, outgoingStaff: req.user.name, incomingStaff })
    );

    res.status(201).json(handover);
  } catch (error) {
    console.error('Create shift handover error:', error);
    res.status(500).json({ error: 'Server error recording shift handover.' });
  }
});

// Fetch shift handovers for a patient
router.get('/:recordID/handovers', authenticateToken, async (req, res) => {
  const { recordID } = req.params;

  try {
    const handovers = await prisma.shiftHandover.findMany({
      where: { patientId: recordID },
      orderBy: { createdAt: 'desc' }
    });
    res.json(handovers);
  } catch (error) {
    console.error('Fetch shift handovers error:', error);
    res.status(500).json({ error: 'Server error fetching shift handovers.' });
  }
});


// --- Phase 4: Nursing Care Plans ---

// Create a nursing care plan
router.post('/:recordID/careplans', authenticateToken, async (req, res) => {
  const { recordID } = req.params;
  const { nursingDiagnosis, goals, interventions } = req.body;

  if (!nursingDiagnosis || !goals || !interventions) {
    return res.status(400).json({ error: 'Nursing Diagnosis, Goals, and Interventions are required.' });
  }

  try {
    const carePlan = await prisma.carePlan.create({
      data: {
        patientId: recordID,
        nursingDiagnosis,
        goals,
        interventions,
        authoredBy: req.user.name
      }
    });

    logAudit(
      req.user.id,
      req.user.name,
      'CREATE',
      'CARE_PLAN',
      carePlan.id,
      recordID,
      JSON.stringify({ nursingDiagnosis })
    );

    res.status(201).json(carePlan);
  } catch (error) {
    console.error('Create care plan error:', error);
    res.status(500).json({ error: 'Server error creating nursing care plan.' });
  }
});

// Update or evaluate a care plan
router.put('/:recordID/careplans/:id', authenticateToken, async (req, res) => {
  const { recordID, id } = req.params;
  const { evaluation } = req.body;

  if (!evaluation) {
    return res.status(400).json({ error: 'Evaluation notes are required.' });
  }

  try {
    const carePlan = await prisma.carePlan.update({
      where: { id },
      data: { evaluation }
    });

    logAudit(
      req.user.id,
      req.user.name,
      'UPDATE',
      'CARE_PLAN',
      id,
      recordID,
      JSON.stringify({ evaluation })
    );

    res.json(carePlan);
  } catch (error) {
    console.error('Update care plan error:', error);
    res.status(500).json({ error: 'Server error updating nursing care plan.' });
  }
});

// Fetch care plans for a patient
router.get('/:recordID/careplans', authenticateToken, async (req, res) => {
  const { recordID } = req.params;

  try {
    const carePlans = await prisma.carePlan.findMany({
      where: { patientId: recordID },
      orderBy: { createdAt: 'desc' }
    });
    res.json(carePlans);
  } catch (error) {
    console.error('Fetch care plans error:', error);
    res.status(500).json({ error: 'Server error fetching nursing care plans.' });
  }
});

// POST /seed-demo - Public route to clear and seed 20 rich demo patients for Sandeep Bhandari
router.post('/seed-demo', async (req, res) => {
  const secret = req.query.secret || req.body.secret;
  if (secret !== 'doctorsaap123') {
    return res.status(403).json({ error: 'Forbidden: Invalid or missing secret.' });
  }

  try {
    const { getDemoPatients } = require('../utils/demoData');
    const hospitalId = req.query.hospitalId || req.body.hospitalId || 'tuth_01';
    const doctorName = req.query.doctorName || req.body.doctorName || 'Dr. Sandeep Bhandari';

    console.log(`Clearing existing patients for hospital: ${hospitalId}...`);
    await prisma.patient.deleteMany({
      where: { hospitalId }
    });

    const demoPatients = getDemoPatients(hospitalId);
    
    // Override doctor name if passed
    if (doctorName) {
      demoPatients.forEach(p => {
        p.inchargeDoctor = doctorName;
        if (p.surgeon) {
          p.surgeon = doctorName;
        }
      });
    }

    console.log(`Seeding ${demoPatients.length} rich demo patients...`);
    for (const patientData of demoPatients) {
      await prisma.patient.create({
        data: patientData
      });
    }

    // Seed mock doctors and nurses
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('doctorsaap123', 10);
    
    const mockUsers = [
      { phone: '9851000000', name: 'Dr. Sandeep Bhandari', specialty: 'Cardiothoracic Surgery', role: 'DOCTOR' },
      { phone: '9851000001', name: 'Dr. Niraj Bam', specialty: 'Pulmonology', role: 'DOCTOR' },
      { phone: '9851000002', name: 'Dr. Susan Giri', specialty: 'General Surgery', role: 'DOCTOR' },
      { phone: '9851000003', name: 'Dr. Alok Pradhan', specialty: 'Orthopedics', role: 'DOCTOR' },
      { phone: '9851000010', name: 'Nurse Priya Thapa', specialty: 'General Ward', role: 'NURSE' },
      { phone: '9851000011', name: 'Nurse Sita Dahal', specialty: 'ICU', role: 'NURSE' },
      { phone: '9851000012', name: 'Nurse Ranjita KC', specialty: 'OT', role: 'NURSE' },
      { phone: '9851000013', name: 'Nurse Anupa Sen', specialty: 'General Ward', role: 'NURSE' }
    ];

    console.log('Seeding mock users...');
    for (const u of mockUsers) {
      await prisma.user.upsert({
        where: { phone: u.phone },
        update: {
          name: u.name,
          specialty: u.specialty,
          role: u.role,
          hospitalId
        },
        create: {
          phone: u.phone,
          password: hashedPassword,
          name: u.name,
          specialty: u.specialty,
          role: u.role,
          hospitalId
        }
      });
    }

    // Add them to default rooms
    const defaultRooms = await prisma.chatRoom.findMany({
      where: {
        hospitalId,
        type: 'GROUP',
        name: { in: ['General Ward Channel', 'ICU Channel', 'OT Channel'] }
      }
    });

    const dbUsers = await prisma.user.findMany({
      where: { phone: { in: mockUsers.map(mu => mu.phone) } }
    });

    for (const room of defaultRooms) {
      for (const user of dbUsers) {
        await prisma.chatRoomMember.upsert({
          where: {
            chatRoomId_userId: {
              chatRoomId: room.id,
              userId: user.id
            }
          },
          update: {},
          create: {
            chatRoomId: room.id,
            userId: user.id
          }
        }).catch(err => console.log('Error adding user to room:', err.message));
      }
    }

    res.json({ 
      success: true, 
      message: `Successfully seeded ${demoPatients.length} demo patients, 4 doctors, and 4 nurses in hospital ${hospitalId}.` 
    });
  } catch (error) {
    console.error('Error seeding demo patients:', error);
    res.status(500).json({ error: 'Failed to seed demo patients.', details: error.message });
  }
});

module.exports = router;


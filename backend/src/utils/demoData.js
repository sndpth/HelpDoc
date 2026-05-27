// Detailed demo data with 20 rich patient records for Dr. Sandeep Bhandari
const getDemoPatients = (hospitalId = 'tuth_01') => [
  {
    recordID: 'p_001',
    fullName: 'Sumitra Ale',
    ipdId: '783918',
    patientId: '81552753',
    fileNo: 'F-8910',
    ipNumber: 'IP-2026-783',
    age: 21,
    gender: 'Female',
    address: 'Kathmandu, Nepal',
    dateOfAdmission: '2026-05-20',
    admissionTime: '12:05 PM',
    dateOfOperation: '2026-05-21',
    dateOfDischarge: '',
    stayDuration: '4 days',
    postOpStay: '3 days',
    wardName: 'General Surgery Ward',
    roomType: 'SINGLE BED CABIN',
    bedNo: '1701',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri, Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Acute Appendicitis with Localized Peritonitis',
    natureOfDisease: 'Acute Inflammatory',
    durationOfIllness: '3 days',
    historyOfPresentIllness: 'Severe right lower quadrant abdominal pain accompanied by low-grade fever, nausea, and vomiting for the past 72 hours.',
    pastHistory: 'No major past medical or surgical history.',
    comorbidities: 'None',
    generalExam: 'Mild pallor, febrile (38.2°C), hydration status fair.',
    weight: '65',
    height: '5.50 ft',
    abdomenExam: 'Tenderness and guarding present in the right iliac fossa (RIF). Rebound tenderness positive.',
    otherFindings: 'Systemic examinations normal.',
    usg: 'Aperistaltic, non-compressible blind-ended tubular structure in RIF, max diameter 8.5mm, surrounded by minimal free fluid.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Laparoscopic Appendectomy',
    operationFindings: 'Inflamed, gangrenous appendix at the retrocecal position with minimal purulent fluid in the pelvis. Rest of abdominal organs normal.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Satisfactory. Patient started on clear liquid diet on Post-Op Day 1 and tolerated well.',
    hpeReport: 'Acute suppurative appendicitis with periappendicitis.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-20', time: '12:05 PM', hr: 98, bpSystolic: 120, bpDiastolic: 80, temp: 38.2, spo2: 98, rr: 18, sugar: 104, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-21', time: '09:00 AM', hr: 82, bpSystolic: 115, bpDiastolic: 75, temp: 37.2, spo2: 99, rr: 16, sugar: 95, recordedBy: 'Dr. Susan Giri' },
        { date: '2026-05-23', time: '04:00 PM', hr: 76, bpSystolic: 120, bpDiastolic: 80, temp: 36.8, spo2: 98, rr: 14, sugar: 92, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-21', time: '08:00 AM', note: 'Pre-op Note: Consent obtained. Vitals stable. NPO status maintained.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-22', time: '09:00 AM', note: 'Post-op Day 1 Note: Patient ambulatory. Wound dressing intact. Started on liquid diet.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-20', hb: '12.8', tc: '14200', platelets: '280000', inr: '1.05' },
        { date: '2026-05-22', hb: '12.1', tc: '9800', platelets: '295000', inr: '1.08' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Ceftriaxone 1g', route: 'IV', frequency: 'Twice daily (1-0-1)', indication: 'Post-Op Prophylaxis', status: 'active' },
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'PRN (Max 4x daily)', indication: 'Pain/Fever', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Morning', outgoingStaff: 'Nurse Anupa', incomingStaff: 'Nurse Reeta', notes: 'Patient is post-op day 2. Pain managed with oral meds. Active bowel sounds. Tolerating soft diet.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Acute post-surgical pain related to laparoscopy incision', goals: 'Maintain pain score below 3/10 during shift', interventions: 'Administer analgesics as prescribed, assist in splinting abdomen during coughing', evaluation: 'Pain managed at 2/10', authoredBy: 'Nurse Anupa' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-01', time: '10:00 AM', status: 'Scheduled', notes: 'Follow-up for suture removal and pathology review.' }
      ]
    }
  },
  {
    recordID: 'p_002',
    fullName: 'Ram Bahadur Thapa',
    ipdId: '783925',
    patientId: '81552890',
    fileNo: 'F-8812',
    ipNumber: 'IP-2026-790',
    age: 54,
    gender: 'Male',
    address: 'Lalitpur, Nepal',
    dateOfAdmission: '2026-05-18',
    admissionTime: '02:15 PM',
    dateOfOperation: '',
    dateOfDischarge: '',
    stayDuration: '6 days',
    postOpStay: 'N/A',
    wardName: 'Pulmonology Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1705',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Lobar Pneumonia (Right Middle Lobe)',
    natureOfDisease: 'Infectious',
    durationOfIllness: '5 days',
    historyOfPresentIllness: 'Productive cough with rusty sputum, high-grade fever with chills, and pleuritic chest pain on the right side for the last 5 days.',
    pastHistory: 'Type 2 Diabetes Mellitus on Oral Hypoglycemics.',
    comorbidities: 'Diabetes Mellitus',
    generalExam: 'Dehydrated, tachypneic, febrile (39.0°C), pulse 104/min, chest crepitations present.',
    weight: '72',
    height: '5.60 ft',
    abdomenExam: 'Soft, non-tender. No organomegaly.',
    otherFindings: 'Decreased breath sounds in right middle lung zone.',
    usg: 'Not performed.',
    ctScan: 'Chest X-ray shows right middle lobe consolidation.',
    attachments: '[]',
    operation: 'None',
    operationFindings: '',
    surgeon: '',
    assistant1: '',
    assistant2: '',
    postOpProgress: '',
    hpeReport: '',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Moderate Dehydration',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-18', time: '02:15 PM', hr: 104, bpSystolic: 130, bpDiastolic: 85, temp: 39.0, spo2: 94, rr: 24, sugar: 180, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-19', time: '08:00 AM', hr: 96, bpSystolic: 125, bpDiastolic: 80, temp: 38.4, spo2: 95, rr: 22, sugar: 160, recordedBy: 'Dr. Alok Pradhan' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-19', time: '08:30 AM', note: 'Fever spiked at night. Nebulization given. Oxygen support continued at 2L/min.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-18', hb: '13.5', tc: '16800', platelets: '250000', inr: '1.09' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Piperacillin-Tazobactam 4.5g', route: 'IV', frequency: 'Thrice daily (8hrly)', indication: 'Pneumonia', status: 'active' },
        { name: 'Tab. Metformin 500mg', route: 'Oral', frequency: 'Twice daily', indication: 'Diabetes management', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Vitals stable. SpO2 96% on room air. Sugar was 152 before dinner.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Impaired gas exchange related to alveolar consolidation', goals: 'Maintain SpO2 above 95% on room air', interventions: 'Monitor oxygen saturation, administer oxygen as required, encourage deep breathing exercises', evaluation: 'SpO2 stable at 96% on room air', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-05', time: '11:00 AM', status: 'Scheduled', notes: 'Review chest X-ray and clinical resolution.' }
      ]
    }
  },
  {
    recordID: 'p_003',
    fullName: 'Aarav Devkota',
    ipdId: '783905',
    patientId: '81552600',
    fileNo: 'F-8700',
    ipNumber: 'IP-2026-700',
    age: 42,
    gender: 'Male',
    address: 'Pokhara, Nepal',
    dateOfAdmission: '2026-05-15',
    admissionTime: '10:00 AM',
    dateOfOperation: '2026-05-17',
    dateOfDischarge: '2026-05-20',
    stayDuration: '5 days',
    postOpStay: '3 days',
    wardName: 'General Surgery Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1708',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Discharged',
    type: 'IPD',
    diagnosis: 'Right Indirect Inguinal Hernia',
    natureOfDisease: 'Congenital defect',
    durationOfIllness: '6 months',
    historyOfPresentIllness: 'Reducible swelling in the right groin for 6 months, associated with dragging pain on lifting heavy weights.',
    pastHistory: 'None',
    comorbidities: 'None',
    generalExam: 'Afebril, normal systemic exams.',
    weight: '70',
    height: '5.80 ft',
    abdomenExam: '4x3cm reducible swelling in right inguinal region, cough impulse positive.',
    otherFindings: 'None',
    usg: 'Right indirect inguinal hernia containing omentum, neck of hernia 1.8cm.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Lichtenstein Tension-Free Hernioplasty',
    operationFindings: 'Indirect hernia sac isolated, reduced. Prolene mesh (3x5 inch) placed and secured.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Uneventful recovery. Wound healed without active discharge.',
    hpeReport: 'Hernial sac showing fibrocollagenous tissue.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-15', time: '10:00 AM', hr: 72, bpSystolic: 120, bpDiastolic: 80, temp: 36.6, spo2: 99, rr: 14, sugar: 90, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-18', time: '09:00 AM', note: 'Post-op Day 1: Wound healthy. Started oral diet.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-15', hb: '14.2', tc: '7800', platelets: '310000', inr: '1.02' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Ibuprofen 400mg', route: 'Oral', frequency: 'Thrice daily', indication: 'Pain relief', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-19', shift: 'Morning', outgoingStaff: 'Nurse Dilip', incomingStaff: 'Nurse Sarita', notes: 'Discharge planned for tomorrow. Suture line clean.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Risk for infection related to surgical incision', goals: 'Wound remains free of infection during hospital stay', interventions: 'Inspect wound daily, maintain aseptic technique during dressing', evaluation: 'Wound dry and healing well', authoredBy: 'Nurse Dilip' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-05-27', time: '09:30 AM', status: 'Completed', notes: 'Suture removal done. Wound healed perfectly.' }
      ]
    }
  },
  {
    recordID: 'p_004',
    fullName: 'Maya Devi Shrestha',
    ipdId: '783930',
    patientId: '81552912',
    fileNo: 'F-8930',
    ipNumber: 'IP-2026-795',
    age: 68,
    gender: 'Female',
    address: 'Bhaktapur, Nepal',
    dateOfAdmission: '2026-05-21',
    admissionTime: '08:30 AM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '3 days',
    postOpStay: '2 days',
    wardName: 'General Surgery Ward',
    roomType: 'SINGLE BED CABIN',
    bedNo: '1712',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Cholelithiasis with Acute Cholecystitis',
    natureOfDisease: 'Calculus Cholecystitis',
    durationOfIllness: '4 days',
    historyOfPresentIllness: 'Severe right upper quadrant pain radiating to the right shoulder, exacerbated by fatty meals, associated with vomiting and fever.',
    pastHistory: 'Hypertension on Telmisartan 40mg.',
    comorbidities: 'Hypertension',
    generalExam: 'Mild jaundice (icterus), febrile (38.5°C), dehydrated.',
    weight: '58',
    height: '5.20 ft',
    abdomenExam: 'Murphy sign positive, tenderness in right hypochondrium.',
    otherFindings: 'Lungs clear, cardiovascular system normal.',
    usg: 'Distended gallbladder with thickened wall (5.2mm), multiple gallstones, pericholecystic fluid present.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Laparoscopic Cholecystectomy',
    operationFindings: 'Gallbladder was highly distended, edematous, and adherent to the omentum. Cystic artery and duct identified and clipped.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Satisfactory. Pain controlled with IV analgesics. Tolerating liquids.',
    hpeReport: 'Acute on chronic cholecystitis with cholelithiasis.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-21', time: '08:30 AM', hr: 92, bpSystolic: 140, bpDiastolic: 90, temp: 38.5, spo2: 97, rr: 18, sugar: 120, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-22', time: '06:00 PM', hr: 80, bpSystolic: 130, bpDiastolic: 80, temp: 37.0, spo2: 98, rr: 16, sugar: 110, recordedBy: 'Dr. Susan Giri' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-22', time: '08:00 AM', note: 'Pre-op assessment: Hydration optimized. Prepared for Lap Cholecystectomy.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-23', time: '09:00 AM', note: 'Post-op Day 1: Abdomen soft, mild port site tenderness. Started oral sips.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-21', hb: '11.5', tc: '13500', platelets: '220000', inr: '1.10' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Cefuroxime 750mg', route: 'IV', frequency: 'Three times daily', indication: 'Infection prophylaxis', status: 'active' },
        { name: 'Tab. Telmisartan 40mg', route: 'Oral', frequency: 'Once daily', indication: 'Hypertension', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Evening', outgoingStaff: 'Nurse Sarita', incomingStaff: 'Nurse Reeta', notes: 'Tolerated oral diet. Output from port site dry. Mobilized twice.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Risk for deficient fluid volume related to post-operative NPO state', goals: 'Maintain adequate fluid balance and urine output >30ml/hr', interventions: 'Monitor intake/output, administer IV fluids as ordered', evaluation: 'Urine output adequate, patient hydrated', authoredBy: 'Nurse Sarita' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-03', time: '10:30 AM', status: 'Scheduled', notes: 'Routine post-op review.' }
      ]
    }
  },
  {
    recordID: 'p_005',
    fullName: 'Hari Prasad Kafle',
    ipdId: '783935',
    patientId: '81552930',
    fileNo: 'F-8941',
    ipNumber: 'IP-2026-801',
    age: 58,
    gender: 'Male',
    address: 'Kirtipur, Nepal',
    dateOfAdmission: '2026-05-19',
    admissionTime: '11:30 AM',
    dateOfOperation: '2026-05-20',
    dateOfDischarge: '',
    stayDuration: '5 days',
    postOpStay: '4 days',
    wardName: 'General Surgery Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1720',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Diabetic Foot Ulcer (Right Foot, Wagner Grade 3)',
    natureOfDisease: 'Chronic Metabolic Complication',
    durationOfIllness: '3 weeks',
    historyOfPresentIllness: 'Painless ulcer on the plantar aspect of the right foot with purulent discharge and foul smell for 3 weeks, accompanied by swelling of the foot.',
    pastHistory: 'Long standing Type 2 Diabetes (15 years) with poor glycemic control.',
    comorbidities: 'Diabetes Mellitus, Diabetic Neuropathy',
    generalExam: 'Afebril, tachycardia (96/min), distal pulses weak in right leg.',
    weight: '76',
    height: '5.70 ft',
    abdomenExam: 'Soft, non-tender, no abnormalities.',
    otherFindings: 'Deep ulcer 4x3cm on right foot plantar surface exposing deep fascia. Surrounding erythema.',
    usg: 'Arterial Doppler shows mild atheromatous changes with monophasic flow in distal arteries.',
    ctScan: 'X-ray Right Foot shows no signs of osteomyelitis.',
    attachments: '[]',
    operation: 'Surgical Debridement & Wound Dressing',
    operationFindings: 'Necrotic tissues, slough, and infected fascia debrided until healthy bleeding margins reached. Copious irrigation with saline.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Alok Pradhan',
    assistant2: '',
    postOpProgress: 'Wound bed healthy with granulation tissue appearing. Daily antiseptic dressings.',
    hpeReport: 'Debrided tissue shows acute and chronic inflammatory cells with necrosis.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Peripheral Arterial Disease',
    complicationGrade: 'II',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-19', time: '11:30 AM', hr: 96, bpSystolic: 130, bpDiastolic: 80, temp: 37.3, spo2: 98, rr: 18, sugar: 245, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-20', time: '04:00 PM', hr: 88, bpSystolic: 120, bpDiastolic: 75, temp: 36.8, spo2: 99, rr: 16, sugar: 180, recordedBy: 'Dr. Alok Pradhan' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-20', time: '08:30 AM', note: 'Patient prepared for debridement. Glycemic control managed with regular insulin scaling.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-22', time: '10:00 AM', note: 'Post-debridement day 2: Healthy granulation bed. Wound dressing performed under aseptic conditions.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-19', hb: '11.0', tc: '15400', platelets: '290000', inr: '1.05' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Ceftriaxone 1g', route: 'IV', frequency: 'Twice daily', indication: 'Infection control', status: 'active' },
        { name: 'Inj. Regular Insulin', route: 'SC', frequency: 'TID as per sliding scale', indication: 'Hyperglycemia', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Wound dressing dry. Blood sugar was 165mg/dl before sleep.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Impaired skin integrity related to diabetic neuropathy and vascular insufficiency', goals: 'Promote wound healing and prevent further infection', interventions: 'Perform daily sterile dressings, inspect pressure points, maintain tight glycemic control', evaluation: 'Granulation tissue forming, no new slough', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-08', time: '09:00 AM', status: 'Scheduled', notes: 'Wound assessment and plan for graft if healing is optimal.' }
      ]
    }
  },
  {
    recordID: 'p_006',
    fullName: 'Sita Kumari Chaudhary',
    ipdId: '783940',
    patientId: '81552945',
    fileNo: 'F-8952',
    ipNumber: 'IP-2026-805',
    age: 35,
    gender: 'Female',
    address: 'Chitwan, Nepal',
    dateOfAdmission: '2026-05-20',
    admissionTime: '09:00 AM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '4 days',
    postOpStay: '2 days',
    wardName: 'General Surgery Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1722',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Multinodular Goiter (Euthyroid)',
    natureOfDisease: 'Neoplastic / Hyperplastic',
    durationOfIllness: '1 year',
    historyOfPresentIllness: 'Gradually progressive swelling in the anterior neck for 1 year, causing occasional pressure symptoms on swallowing.',
    pastHistory: 'None',
    comorbidities: 'None',
    generalExam: 'Afebril, clinically euthyroid. Pulse 78/min. No eye signs of thyroid disease.',
    weight: '60',
    height: '5.30 ft',
    abdomenExam: 'Soft, non-tender, normal bowel sounds.',
    otherFindings: 'Anterior neck swelling, 6x5cm, moves with deglutition, non-tender, lobulated.',
    usg: 'Enlarged bilateral thyroid lobes with multiple cystic and solid nodules. Left lobe largest nodule 3.2cm.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Left Hemithyroidectomy',
    operationFindings: 'Enlarged left thyroid lobe with multiple nodules. Recurrent laryngeal nerve and parathyroid glands identified and preserved.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Satisfactory. Voice clear. No signs of hypocalcemia (Chvostek sign negative). Dry neck drain.',
    hpeReport: 'Adenomatous hyperplasia. No evidence of malignancy.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-20', time: '09:00 AM', hr: 78, bpSystolic: 120, bpDiastolic: 80, temp: 36.5, spo2: 99, rr: 14, sugar: 94, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-22', time: '04:00 PM', hr: 82, bpSystolic: 110, bpDiastolic: 70, temp: 36.7, spo2: 99, rr: 16, sugar: 100, recordedBy: 'Dr. Susan Giri' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-21', time: '10:00 AM', note: 'Pre-op thyroid profile checked: Free T3/T4 and TSH normal. Vocal cords checked.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-23', time: '09:00 AM', note: 'Post-op Day 1: Voice clear. Drain output 15ml. Wound healing well.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-20', hb: '12.4', tc: '6800', platelets: '320000', inr: '1.01' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'Three times daily', indication: 'Mild pain relief', status: 'active' },
        { name: 'Tab. Calcium carbonate 500mg', route: 'Oral', frequency: 'Once daily', indication: 'Calcium supplementation', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Morning', outgoingStaff: 'Nurse Dilip', incomingStaff: 'Nurse Sarita', notes: 'Voice tested, normal. Neck dressing dry. Drain to be removed today.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Risk for airway clearance impairment related to post-surgical neck hematoma', goals: 'Maintain patent airway and early recognition of hematoma', interventions: 'Monitor respiratory rate and effort, check for neck swelling, keep tracheostomy set at bedside', evaluation: 'Breathing easy, no neck swelling', authoredBy: 'Nurse Dilip' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-02', time: '11:30 AM', status: 'Scheduled', notes: 'Wound inspection and check thyroid panel.' }
      ]
    }
  },
  {
    recordID: 'p_007',
    fullName: 'Bishnu Maya Gurung',
    ipdId: '783945',
    patientId: '81552960',
    fileNo: 'F-8965',
    ipNumber: 'IP-2026-810',
    age: 72,
    gender: 'Female',
    address: 'Gorkha, Nepal',
    dateOfAdmission: '2026-05-17',
    admissionTime: '04:30 PM',
    dateOfOperation: '2026-05-19',
    dateOfDischarge: '',
    stayDuration: '7 days',
    postOpStay: '5 days',
    wardName: 'Orthopedic Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1725',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Fracture Neck of Femur (Right, Displaced)',
    natureOfDisease: 'Traumatic / Degenerative',
    durationOfIllness: '2 days',
    historyOfPresentIllness: 'Slipped and fell at home, unable to bear weight on the right leg, with severe pain in the right groin.',
    pastHistory: 'Osteoporosis, Senile dementia.',
    comorbidities: 'Osteoporosis',
    generalExam: 'Elderly lady, in pain, right leg shortened and externally rotated.',
    weight: '50',
    height: '5.00 ft',
    abdomenExam: 'Soft, non-tender, normal.',
    otherFindings: 'Tenderness over right hip, active straight leg raise (SLR) not possible.',
    usg: 'Not performed.',
    ctScan: 'X-ray Hip shows displaced intracapsular fracture neck of right femur.',
    attachments: '[]',
    operation: 'Bipolar Hemiarthroplasty (Right Hip)',
    operationFindings: 'Subcapital fracture identified. Femoral head extracted. Canal prepared. Cemented bipolar prosthesis inserted and reduced. Hip stable.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Alok Pradhan',
    assistant2: '',
    postOpProgress: 'Started on bedside mobilization and isometric exercises. Pain controlled with round-the-clock analgesics.',
    hpeReport: 'Femoral head bone tissue showing degenerative changes, no tumor cells.',
    bloodTransfusion: 'Yes',
    wbPrbcUnits: '1',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Post-operative Anemia',
    complicationGrade: 'II',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-17', time: '04:30 PM', hr: 88, bpSystolic: 110, bpDiastolic: 70, temp: 36.8, spo2: 96, rr: 18, sugar: 112, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-19', time: '06:00 PM', hr: 82, bpSystolic: 120, bpDiastolic: 75, temp: 37.0, spo2: 98, rr: 16, sugar: 105, recordedBy: 'Dr. Alok Pradhan' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-18', time: '09:00 AM', note: 'Pre-op clearance obtained from Cardiology. Prepared for hemiarthroplasty.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-20', time: '10:00 AM', note: 'Post-op Day 1: Mobilized to chair. Dressing intact. Transfused 1 unit PRBC for Hb 8.2g/dl.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-17', hb: '10.5', tc: '8900', platelets: '210000', inr: '1.08' },
        { date: '2026-05-20', hb: '8.2', tc: '9100', platelets: '205000', inr: '1.06' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Tramadol 50mg', route: 'Oral', frequency: 'TID', indication: 'Moderate pain', status: 'active' },
        { name: 'Inj. Enoxaparin 40mg', route: 'SC', frequency: 'Once daily', indication: 'DVT prophylaxis', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Sarita', incomingStaff: 'Nurse Dilip', notes: 'Abduction pillow in place. Voided well. Complained of mild pain at 10 PM, paracetamol given.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Impaired physical mobility related to hip fracture and surgical repair', goals: 'Mobilize out of bed with assistance safely', interventions: 'Keep abduction pillow between legs, instruct patient to avoid crossing legs, assist in walker ambulation', evaluation: 'Ambulating with walker under physiotherapist guidance', authoredBy: 'Nurse Sarita' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-15', time: '10:00 AM', status: 'Scheduled', notes: 'Check hip X-ray and weight bearing capacity.' }
      ]
    }
  },
  {
    recordID: 'p_008',
    fullName: 'Ramesh Worlikar',
    ipdId: '783950',
    patientId: '81552975',
    fileNo: 'F-8972',
    ipNumber: 'IP-2026-815',
    age: 45,
    gender: 'Male',
    address: 'Kathmandu, Nepal',
    dateOfAdmission: '2026-05-22',
    admissionTime: '11:00 AM',
    dateOfOperation: '2026-05-23',
    dateOfDischarge: '',
    stayDuration: '2 days',
    postOpStay: '1 day',
    wardName: 'General Surgery Ward',
    roomType: 'SINGLE BED CABIN',
    bedNo: '1728',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Acute Calculus Cholecystitis',
    natureOfDisease: 'Inflammatory / Obstructive',
    durationOfIllness: '3 days',
    historyOfPresentIllness: 'Right upper quadrant colicky pain radiating to the back for 3 days, accompanied by nausea and low grade fever.',
    pastHistory: 'No major illnesses.',
    comorbidities: 'None',
    generalExam: 'Afebril, mild dehydration, pulse 84/min.',
    weight: '82',
    height: '5.90 ft',
    abdomenExam: 'Tenderness in right hypochondrium, positive Murphy sign.',
    otherFindings: 'None.',
    usg: 'Gallbladder walls thickened (4.5mm), 3 large gallstones in lumen, impacted stone at gallbladder neck.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Laparoscopic Cholecystectomy',
    operationFindings: 'Gallbladder empyema with thick pus. Decompressed. Cystic duct and artery dissected and clipped. Gallbladder dissected off liver bed.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Excellent. Patient tolerated oral diet and was fully mobile.',
    hpeReport: 'Pending.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-22', time: '11:00 AM', hr: 84, bpSystolic: 120, bpDiastolic: 80, temp: 37.8, spo2: 99, rr: 16, sugar: 98, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-23', time: '09:00 AM', note: 'Pre-op Note: Hydrated with IV fluids. Antibiotics started.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-22', hb: '14.5', tc: '12400', platelets: '280000', inr: '1.01' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Pantoprazole 40mg', route: 'IV', frequency: 'OD', indication: 'Acidity prophylaxis', status: 'active' },
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'TID', indication: 'Pain', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Evening', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Patient tolerating soft diet. Port site dressing dry. Mobile.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Acute pain related to surgical laparoscopy wounds', goals: 'Pain reported below 3/10', interventions: 'Administer pain meds, check port sites for hematoma', evaluation: 'Pain score 2/10', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-03', time: '12:00 PM', status: 'Scheduled', notes: 'Follow-up in clinic for suture review.' }
      ]
    }
  },
  {
    recordID: 'p_009',
    fullName: 'Ganesh Bahadur Singh',
    ipdId: '783955',
    patientId: '81552990',
    fileNo: 'F-8980',
    ipNumber: 'IP-2026-820',
    age: 61,
    gender: 'Male',
    address: 'Dhangadhi, Nepal',
    dateOfAdmission: '2026-05-18',
    admissionTime: '01:00 PM',
    dateOfOperation: '2026-05-20',
    dateOfDischarge: '',
    stayDuration: '6 days',
    postOpStay: '4 days',
    wardName: 'Urology Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1730',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Benign Prostatic Hyperplasia (BPH)',
    natureOfDisease: 'Hyperplastic',
    durationOfIllness: '1 year',
    historyOfPresentIllness: 'Progressive lower urinary tract symptoms (weak stream, hesitancy, nocturia x 4) for 1 year, presenting with acute urinary retention.',
    pastHistory: 'None',
    comorbidities: 'None',
    generalExam: 'Afebril, cardiorespiratory clinically stable, indwelling Foley catheter in situ.',
    weight: '68',
    height: '5.65 ft',
    abdomenExam: 'Suprapubic fullness relieved after catheterization.',
    otherFindings: 'Digital Rectal Exam (DRE) shows enlarged, smooth, non-tender prostate (approx. 50g), median sulcus obliterated.',
    usg: 'Prostate volume 55cc, post-void residual urine 150ml (pre-catheter), bilateral kidney normal.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Transurethral Resection of the Prostate (TURP)',
    operationFindings: 'Enlarged lateral and median lobes of prostate. Resected until surgical capsule reached. Three-way Foley catheter inserted, continuous bladder irrigation started.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Alok Pradhan',
    assistant2: '',
    postOpProgress: 'Continuous bladder irrigation clear. Foley catheter removed on POD 3, patient voiding well with minimal hematuria.',
    hpeReport: 'Benign prostatic hyperplasia with chronic prostatitis.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Mild Hematuria',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-18', time: '01:00 PM', hr: 76, bpSystolic: 130, bpDiastolic: 80, temp: 36.8, spo2: 98, rr: 16, sugar: 110, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-20', time: '06:00 PM', hr: 80, bpSystolic: 120, bpDiastolic: 75, temp: 37.0, spo2: 99, rr: 14, sugar: 105, recordedBy: 'Dr. Alok Pradhan' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-19', time: '09:00 AM', note: 'Pre-op clearance obtained. Bladder irrigated. Urinalysis negative for infection.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-21', time: '09:30 AM', note: 'Post-op Day 1: Bladder irrigation running clear pink. Vitals stable.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-18', hb: '13.8', tc: '7200', platelets: '280000', inr: '1.04' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Tamsulosin 0.4mg', route: 'Oral', frequency: 'Once daily at night', indication: 'BPH', status: 'active' },
        { name: 'Tab. Ciprofloxacin 500mg', route: 'Oral', frequency: 'Twice daily', indication: 'UTI Prophylaxis', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Dilip', incomingStaff: 'Nurse Reeta', notes: 'Bladder catheter removed. Patient voiding on his own, slight pink coloration in urine. Encouraged oral fluid intake.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Impaired urinary elimination related to bladder neck trauma from surgery', goals: 'Patient voids without difficulty or retention after catheter removal', interventions: 'Monitor urine color, volume, and frequency; encourage fluid intake >2.5L/day; check for bladder distension', evaluation: 'Voiding adequate volumes, no distension', authoredBy: 'Nurse Dilip' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-10', time: '11:00 AM', status: 'Scheduled', notes: 'Assess uroflowmetry and voiding efficiency.' }
      ]
    }
  },
  {
    recordID: 'p_010',
    fullName: 'Aasha Tamang',
    ipdId: '783960',
    patientId: '81553010',
    fileNo: 'F-8992',
    ipNumber: 'IP-2026-830',
    age: 29,
    gender: 'Female',
    address: 'Kavre, Nepal',
    dateOfAdmission: '2026-05-21',
    admissionTime: '10:00 AM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '3 days',
    postOpStay: '2 days',
    wardName: 'Gynecology Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1735',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Ovarian Cyst (Right, Benign-appearing)',
    natureOfDisease: 'Neoplastic (Benign)',
    durationOfIllness: '2 months',
    historyOfPresentIllness: 'Dull aching pain in the right lower abdomen for 2 months, worsening during menstruation.',
    pastHistory: 'None.',
    comorbidities: 'None',
    generalExam: 'Afebril, hemodynamically stable.',
    weight: '55',
    height: '5.10 ft',
    abdomenExam: 'Soft, tenderness in right iliac fossa. No palpable masses.',
    otherFindings: 'Pelvic examination reveals right adnexal fullness.',
    usg: 'Right ovarian simple cyst, 6x5cm, thin-walled, no septations or solid components.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Laparoscopic Ovarian Cystectomy',
    operationFindings: 'Right ovarian simple cyst cyst wall peeled off. Healthy ovarian tissue preserved. Left ovary and bilateral tubes normal.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Uneventful. Pain controlled with oral analgesics. Discharged planned soon.',
    hpeReport: 'Benign serous cystadenoma.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-21', time: '10:00 AM', hr: 78, bpSystolic: 110, bpDiastolic: 70, temp: 36.6, spo2: 99, rr: 16, sugar: 88, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-22', time: '09:00 AM', note: 'Pre-op preparation. Consent checked. Patient calm.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-21', hb: '12.0', tc: '7500', platelets: '300000', inr: '1.02' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Ibuprofen 400mg', route: 'Oral', frequency: 'Twice daily', indication: 'Pain relief', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Evening', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Patient is walking around. Tolerating normal diet. No bleeding from port sites.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Acute pain related to pelvic surgery', goals: 'Patient reports pain score <3/10', interventions: 'Administer oral NSAIDs, encourage mobilization', evaluation: 'Pain score 1/10', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-02', time: '02:00 PM', status: 'Scheduled', notes: 'Post-op clinical review.' }
      ]
    }
  },
  {
    recordID: 'p_011',
    fullName: 'Subash Chandra Regmi',
    ipdId: '783965',
    patientId: '81553025',
    fileNo: 'F-9005',
    ipNumber: 'IP-2026-840',
    age: 50,
    gender: 'Male',
    address: 'Pokhara, Nepal',
    dateOfAdmission: '2026-05-22',
    admissionTime: '08:00 AM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '2 days',
    postOpStay: '1 day',
    wardName: 'Urology Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1738',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Left Ureteric Calculus (Lower Third)',
    natureOfDisease: 'Obstructive Uropathy',
    durationOfIllness: '1 week',
    historyOfPresentIllness: 'Severe left flank pain radiating to the groin for 1 week, associated with gross hematuria and burning micturition.',
    pastHistory: 'None.',
    comorbidities: 'None',
    generalExam: 'Afebril, in severe distress due to renal colic.',
    weight: '70',
    height: '5.80 ft',
    abdomenExam: 'Soft, left renal angle tenderness present.',
    otherFindings: 'Systemic exams normal.',
    usg: 'Left hydroureteronephrosis, 8mm stone in left distal ureter.',
    ctScan: 'NCCT KUB confirms 8mm calculus in left distal ureter with proximal dilatation.',
    attachments: '[]',
    operation: 'URSL (Ureteroscopic Lithotripsy) & DJ Stenting',
    operationFindings: 'Stone identified in distal ureter, fragmented using pneumatic lithotripter. Clear fragments extracted. DJ Stent placed under fluoroscopy.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Alok Pradhan',
    assistant2: '',
    postOpProgress: 'Renal colic resolved. Mild dysuria and hematuria due to DJ stent. Responding well to hydration.',
    hpeReport: 'Stone analysis pending.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Mild stent-induced dysuria',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-22', time: '08:00 AM', hr: 98, bpSystolic: 140, bpDiastolic: 90, temp: 37.0, spo2: 98, rr: 18, sugar: 104, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-23', time: '09:00 AM', note: 'Colic resolved post-procedure. Urine output clear. Advised abundant oral hydration.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-22', hb: '14.1', tc: '8900', platelets: '260000', inr: '1.03' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Flavoxate 200mg', route: 'Oral', frequency: 'Twice daily', indication: 'Bladder spasm / stent comfort', status: 'active' },
        { name: 'Tab. Levofloxacin 500mg', route: 'Oral', frequency: 'Once daily', indication: 'UTI prevention', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Patient voiding. Encouraged to drink water. Stent discomfort managed.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Altered urinary elimination related to ureteral stent insertion', goals: 'Patient experiences minimal dysuria and no retention', interventions: 'Encourage high oral fluid intake, administer bladder spasmolytics, monitor output', evaluation: 'Tolerating stent with minimal discomfort', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-20', time: '10:00 AM', status: 'Scheduled', notes: 'Review for cystoscopic DJ stent removal.' }
      ]
    }
  },
  {
    recordID: 'p_012',
    fullName: 'Devi Lal Shrestha',
    ipdId: '783970',
    patientId: '81553040',
    fileNo: 'F-9020',
    ipNumber: 'IP-2026-855',
    age: 65,
    gender: 'Male',
    address: 'Biratnagar, Nepal',
    dateOfAdmission: '2026-05-18',
    admissionTime: '02:00 PM',
    dateOfOperation: '2026-05-20',
    dateOfDischarge: '',
    stayDuration: '6 days',
    postOpStay: '4 days',
    wardName: 'General Surgery Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1742',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Left Direct Inguinal Hernia',
    natureOfDisease: 'Anatomical Defect',
    durationOfIllness: '1 year',
    historyOfPresentIllness: 'Reducible bulge in left groin for 1 year, causing dragging pain, increasing in size on coughing.',
    pastHistory: 'Chronic smoker, Chronic bronchitis.',
    comorbidities: 'Chronic Bronchitis',
    generalExam: 'Afebril, active cough, chest crepitations present.',
    weight: '62',
    height: '5.50 ft',
    abdomenExam: 'Left direct inguinal hernia, approx 5x4cm, reducible. Hernial site cough impulse positive.',
    otherFindings: 'None.',
    usg: 'Left inguinal hernia containing omentum, direct type.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Lichtenstein Tension-Free Hernioplasty',
    operationFindings: 'Direct hernia sac, posterior wall weakness. Mesh (3x5 inch) secured with Prolene.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Recovering well. Coughing treated with bronchodilators to protect mesh.',
    hpeReport: 'Hernia sac - benign fibroadipose tissue.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Chronic Coughing',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-18', time: '02:00 PM', hr: 82, bpSystolic: 130, bpDiastolic: 80, temp: 36.8, spo2: 96, rr: 18, sugar: 110, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-21', time: '09:00 AM', note: 'Post-op Day 1: Wound check shows no hematoma. Chest physiotherapist visited.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-18', hb: '13.2', tc: '8200', platelets: '250000', inr: '1.05' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'Three times daily', indication: 'Pain', status: 'active' },
        { name: 'Syr. Ambroxol 10ml', route: 'Oral', frequency: 'Thrice daily', indication: 'Cough / Mucolytic', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Morning', outgoingStaff: 'Nurse Sarita', incomingStaff: 'Nurse Reeta', notes: 'Coughing slightly decreased. Guided to splint the wound while coughing.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Risk for surgical wound dehiscence related to chronic coughing', goals: 'Wound remains intact without hematoma or breakdown', interventions: 'Teach wound splinting, administer cough suppressants/bronchodilators as ordered', evaluation: 'Wound secure, mesh intact', authoredBy: 'Nurse Sarita' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-03', time: '11:00 AM', status: 'Scheduled', notes: 'Post-op hernia review.' }
      ]
    }
  },
  {
    recordID: 'p_013',
    fullName: 'Pooja Adhikari',
    ipdId: '783975',
    patientId: '81553055',
    fileNo: 'F-9035',
    ipNumber: 'IP-2026-865',
    age: 24,
    gender: 'Female',
    address: 'Hetauda, Nepal',
    dateOfAdmission: '2026-05-22',
    admissionTime: '03:15 PM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '2 days',
    postOpStay: '1 day',
    wardName: 'ENT Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1745',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Acute Tonsillitis with Peritonsillar Abscess (Quinsy)',
    natureOfDisease: 'Infectious / Inflammatory',
    durationOfIllness: '4 days',
    historyOfPresentIllness: 'Severe throat pain, difficulty swallowing (dysphagia), drooling of saliva, and hot potato voice for 4 days.',
    pastHistory: 'Recurrent tonsillitis.',
    comorbidities: 'None',
    generalExam: 'Dehydrated, trismus (difficulty opening mouth), febrile (38.8°C).',
    weight: '50',
    height: '5.20 ft',
    abdomenExam: 'Soft, non-tender, normal.',
    otherFindings: 'Uvula deviated to opposite side, bulging of left tonsillar pillar, congested tonsils.',
    usg: 'Not performed.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Incision & Drainage of Peritonsillar Abscess',
    operationFindings: 'Abscess incised at point of maximum bulge, approx 8ml of foul-smelling pus drained. Oral cavity irrigated.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Severe pain relieved immediately. Swallowing improved. Patient started on cold liquids.',
    hpeReport: 'Pus culture shows Streptococcus pyogenes.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Trismus',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-22', time: '03:15 PM', hr: 102, bpSystolic: 110, bpDiastolic: 70, temp: 38.8, spo2: 98, rr: 20, sugar: 92, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-23', time: '09:00 AM', note: 'Immediate relief in throat pain. Tolerating soft cold diet. Iv antibiotics running.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-22', hb: '12.5', tc: '16200', platelets: '285000', inr: '1.02' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Amoxy-Clav 1.2g', route: 'IV', frequency: 'Twice daily', indication: 'Infection treatment', status: 'active' },
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'Three times daily', indication: 'Pain/Fever', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Evening', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Eating cold custard. Trismus reduced. Encouraged warm saline gargles.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Impaired swallowing related to throat pain and edema', goals: 'Patient tolerates soft/liquid oral intake without choking', interventions: 'Provide cold liquid diet, administer analgesics 30 mins before meals, monitor hydration', evaluation: 'Tolerating soft diet comfortably', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-15', time: '02:30 PM', status: 'Scheduled', notes: 'Review for elective tonsillectomy in 6 weeks.' }
      ]
    }
  },
  {
    recordID: 'p_014',
    fullName: 'Dil Bahadur Rana',
    ipdId: '783980',
    patientId: '81553070',
    fileNo: 'F-9050',
    ipNumber: 'IP-2026-875',
    age: 57,
    gender: 'Male',
    address: 'Palpa, Nepal',
    dateOfAdmission: '2026-05-16',
    admissionTime: '11:00 AM',
    dateOfOperation: '2026-05-18',
    dateOfDischarge: '',
    stayDuration: '8 days',
    postOpStay: '6 days',
    wardName: 'General Surgery Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1750',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Chronic Duodenal Ulcer with Gastric Outlet Obstruction',
    natureOfDisease: 'Obstructive Gastrointestinal',
    durationOfIllness: '3 months',
    historyOfPresentIllness: 'Recurrent projectile vomiting of undigested food eaten 24-48 hours ago, weight loss, and early satiety for 3 months.',
    pastHistory: 'Peptic ulcer disease for 5 years.',
    comorbidities: 'Malnutrition',
    generalExam: 'Severely emaciated, visible gastric peristalsis (VGP), dry skin.',
    weight: '48',
    height: '5.50 ft',
    abdomenExam: 'Succussion splash positive, gastric dilatation visible in epigastrium.',
    otherFindings: 'Lungs hyperresonant, cachectic.',
    usg: 'Distended stomach filled with fluid/debris, normal hepatobiliary system.',
    ctScan: 'Endoscopy shows scarred, stenosed pyloric canal, biopsy negative for malignancy.',
    attachments: '[]',
    operation: 'Truncal Vagotomy & Gastrojejunostomy',
    operationFindings: 'Duodenum heavily scarred. Dilated stomach. Truncal vagotomy performed. Loop of jejunum anastomosed to stomach posterior wall.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Alok Pradhan',
    assistant2: '',
    postOpProgress: 'Nasogastric (NG) tube aspirate decreased. Flatus passed on POD 3. Started on oral liquids on POD 4. Tolerating.',
    hpeReport: 'Pyloric tissue shows chronic ulceration and fibrosis, benign.',
    bloodTransfusion: 'Yes',
    wbPrbcUnits: '1',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Hypokalemic Hypochloremic Alkalosis (Pre-op)',
    complicationGrade: 'II',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-16', time: '11:00 AM', hr: 92, bpSystolic: 100, bpDiastolic: 60, temp: 36.5, spo2: 98, rr: 16, sugar: 85, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-18', time: '08:00 PM', hr: 84, bpSystolic: 110, bpDiastolic: 70, temp: 36.8, spo2: 99, rr: 14, sugar: 94, recordedBy: 'Dr. Alok Pradhan' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-17', time: '09:00 AM', note: 'Pre-op optimization: Gastric lavage performed. Corrected electrolytes (potassium given).', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-19', time: '10:00 AM', note: 'Post-op Day 1: NG tube aspirate 300ml. IV fluids running with potassium.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-16', hb: '10.0', tc: '6500', platelets: '220000', inr: '1.09' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Pantoprazole 40mg', route: 'IV', frequency: 'Twice daily', indication: 'Ulcer management', status: 'active' },
        { name: 'IV KCl Infusion (in NS)', route: 'IV', frequency: 'As directed', indication: 'Hypokalemia correction', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Sarita', incomingStaff: 'Nurse Dilip', notes: 'NG tube removed today. Tolerating water. Urine output 1200ml per shift.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Imbalanced nutrition: less than body requirements related to gastric obstruction', goals: 'Gradually increase nutrient intake and tolerate soft diet', interventions: 'Administer IV fluids with electrolytes, remove NG tube when aspirate <50ml, monitor weight', evaluation: 'Tolerating oral fluids, electrolyte values normalized', authoredBy: 'Nurse Sarita' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-12', time: '10:00 AM', status: 'Scheduled', notes: 'Review nutritional status and wound healing.' }
      ]
    }
  },
  {
    recordID: 'p_015',
    fullName: 'Kalpana Pandey',
    ipdId: '783985',
    patientId: '81553085',
    fileNo: 'F-9061',
    ipNumber: 'IP-2026-881',
    age: 38,
    gender: 'Female',
    address: 'Butwal, Nepal',
    dateOfAdmission: '2026-05-22',
    admissionTime: '10:30 AM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '2 days',
    postOpStay: '1 day',
    wardName: 'General Surgery Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1752',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Fibroadenoma (Left Breast, Benign)',
    natureOfDisease: 'Neoplastic (Benign)',
    durationOfIllness: '4 months',
    historyOfPresentIllness: 'Painless, mobile lump in the left breast noticed 4 months ago, slowly increasing in size.',
    pastHistory: 'None.',
    comorbidities: 'None',
    generalExam: 'Afebril, clinically stable.',
    weight: '56',
    height: '5.20 ft',
    abdomenExam: 'Soft, normal.',
    otherFindings: 'Left breast: 3x2cm firm, non-tender, mobile lump in the upper outer quadrant. Axillary lymph nodes not palpable.',
    usg: 'Well-circumscribed hypo-echoic mass in left breast, BIRADS 2.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Excision Biopsy of Left Breast Lump',
    operationFindings: 'Firm, lobulated, grayish-white mass circumscribed, excised completely with intact capsule. Sent for HPE.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Satisfactory. Wound dry. Pain managed with oral analgesics.',
    hpeReport: 'Breast tissue showing features of fibroadenoma, no atypia.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-22', time: '10:30 AM', hr: 72, bpSystolic: 120, bpDiastolic: 80, temp: 36.4, spo2: 99, rr: 14, sugar: 90, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-23', time: '09:00 AM', note: 'Wound healthy. Compression dressing in place. Discharge planned.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-22', hb: '12.8', tc: '7100', platelets: '290000', inr: '1.01' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'Three times daily', indication: 'Pain Relief', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Morning', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Sarita', notes: 'Wound compression bandage intact. Discharge instructions given.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Risk for bleeding/hematoma related to highly vascular breast tissue excision', goals: 'No signs of bleeding or hematoma on incision site', interventions: 'Keep compression dressing snug, check bandage for soakage', evaluation: 'No soakage, compression bandage dry', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-02', time: '09:00 AM', status: 'Scheduled', notes: 'Suture removal and histopathology discussion.' }
      ]
    }
  },
  {
    recordID: 'p_016',
    fullName: 'Niranjan Prasad Joshi',
    ipdId: '783990',
    patientId: '81553100',
    fileNo: 'F-9080',
    ipNumber: 'IP-2026-890',
    age: 70,
    gender: 'Male',
    address: 'Mahendranagar, Nepal',
    dateOfAdmission: '2026-05-19',
    admissionTime: '04:00 PM',
    dateOfOperation: '',
    dateOfDischarge: '',
    stayDuration: '5 days',
    postOpStay: 'N/A',
    wardName: 'General Medicine Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1755',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Urinary Tract Infection (UTI) with Urosepsis',
    natureOfDisease: 'Infectious / Septic',
    durationOfIllness: '4 days',
    historyOfPresentIllness: 'High-grade fever with chills, altered mental state, dysuria, and decreased urine output for 4 days.',
    pastHistory: 'Benign Prostatic Hyperplasia (BPH).',
    comorbidities: 'BPH',
    generalExam: 'Confused, febrile (39.5°C), toxic look, hypotension (BP 90/60 mmHg).',
    weight: '60',
    height: '5.60 ft',
    abdomenExam: 'Soft, suprapubic tenderness present.',
    otherFindings: 'Lungs clear, heart sounds normal.',
    usg: 'Prostate volume 45cc, post-void urine residual 120ml.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'None',
    operationFindings: '',
    surgeon: '',
    assistant1: '',
    assistant2: '',
    postOpProgress: '',
    hpeReport: '',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Septic Shock (Initial)',
    complicationGrade: 'III',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-19', time: '04:00 PM', hr: 112, bpSystolic: 90, bpDiastolic: 60, temp: 39.5, spo2: 93, rr: 24, sugar: 140, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-20', time: '08:00 AM', hr: 94, bpSystolic: 110, bpDiastolic: 70, temp: 38.0, spo2: 96, rr: 20, sugar: 120, recordedBy: 'Dr. Alok Pradhan' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-20', time: '09:00 AM', note: 'Blood and urine cultures sent. IV fluids running. Inotropic support avoided as BP responded to fluids.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-19', hb: '11.8', tc: '18500', platelets: '190000', inr: '1.12' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Meropenem 1g', route: 'IV', frequency: 'TID', indication: 'Severe Urosepsis', status: 'active' },
        { name: 'IV Fluids Normal Saline', route: 'IV infusion', frequency: '100 ml/hr', indication: 'Hydration & BP support', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Mentation improved, alert. Urine output 450ml over night. Temperature 37.2°C.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Deficient fluid volume related to hyperthermia and systemic infection', goals: 'Maintain mean arterial pressure >65mmHg and urine output >0.5ml/kg/hr', interventions: 'Administer aggressive IV crystalloids, monitor hourly vitals and urine output', evaluation: 'Hemodynamics stabilized, urine output adequate', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-15', time: '11:30 AM', status: 'Scheduled', notes: 'Outpatient clinic review post-infection clearance.' }
      ]
    }
  },
  {
    recordID: 'p_017',
    fullName: 'Sunita Maharjan',
    ipdId: '783995',
    patientId: '81553120',
    fileNo: 'F-9100',
    ipNumber: 'IP-2026-900',
    age: 47,
    gender: 'Female',
    address: 'Patan, Nepal',
    dateOfAdmission: '2026-05-18',
    admissionTime: '10:00 AM',
    dateOfOperation: '2026-05-20',
    dateOfDischarge: '',
    stayDuration: '6 days',
    postOpStay: '4 days',
    wardName: 'Gynecology Ward',
    roomType: 'SINGLE BED CABIN',
    bedNo: '1760',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Uterine Fibroids (Multiple Symptomatic)',
    natureOfDisease: 'Neoplastic (Benign)',
    durationOfIllness: '1 year',
    historyOfPresentIllness: 'Menorrhagia (heavy menstrual bleeding) for 1 year, associated with severe dysmenorrhea and pressure symptoms on bladder.',
    pastHistory: 'None.',
    comorbidities: 'Anemia secondary to blood loss.',
    generalExam: 'Severely pale, afebril, cardiovascular system hyperdynamic.',
    weight: '65',
    height: '5.25 ft',
    abdomenExam: 'Uterus palpated at 14 weeks size, firm, mobile.',
    otherFindings: 'Pelvic USG confirms intramural and subserosal fibroids.',
    usg: 'Uterus enlarged, multiple fibroids (largest 7x6cm intramural).',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Total Abdominal Hysterectomy with Bilateral Salpingo-oophorectomy (TAH-BSO)',
    operationFindings: 'Uterus enlarged to 14 weeks size with multiple fibroids. Bilateral tubes and ovaries normal. Total hysterectomy and bilateral salpingo-oophorectomy performed.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Patient transfused 2 units of PRBC. Recovery satisfactory. Bowel sounds returned POD 2.',
    hpeReport: 'Leiomyomata with secretory endometrium.',
    bloodTransfusion: 'Yes',
    wbPrbcUnits: '2',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Severe Anemia (Pre-op)',
    complicationGrade: 'II',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-18', time: '10:00 AM', hr: 88, bpSystolic: 100, bpDiastolic: 60, temp: 36.6, spo2: 98, rr: 16, sugar: 94, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-19', time: '09:00 AM', note: 'Pre-op: Hemoglobin was 7.8g/dl. Crossmatching done. Planned for hysterectomy with blood standby.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-18', hb: '7.8', tc: '6200', platelets: '240000', inr: '1.05' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Iron Supplement', route: 'Oral', frequency: 'Twice daily', indication: 'Iron deficiency anemia', status: 'active' },
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'Three times daily', indication: 'Pain relief', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Dilip', incomingStaff: 'Nurse Reeta', notes: 'Abdominal dressing dry and clean. Foley catheter draining clear urine. Tolerating soft diet.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Acute pain related to abdominal surgical incision', goals: 'Maintain pain score <4/10', interventions: 'Administer analgesics, splint abdomen with pillow during movements, check catheter output', evaluation: 'Pain score 3/10', authoredBy: 'Nurse Dilip' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-18', time: '10:00 AM', status: 'Scheduled', notes: 'Check abdominal wound healing and review pathology report.' }
      ]
    }
  },
  {
    recordID: 'p_018',
    fullName: 'Krishna Bahadur Karki',
    ipdId: '784000',
    patientId: '81553140',
    fileNo: 'F-9120',
    ipNumber: 'IP-2026-915',
    age: 63,
    gender: 'Male',
    address: 'Ramechhap, Nepal',
    dateOfAdmission: '2026-05-19',
    admissionTime: '08:00 AM',
    dateOfOperation: '',
    dateOfDischarge: '',
    stayDuration: '5 days',
    postOpStay: 'N/A',
    wardName: 'Pulmonology Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1765',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Alok Pradhan',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Acute Exacerbation of Chronic Obstructive Pulmonary Disease (COPD)',
    natureOfDisease: 'Chronic Respiratory Disease',
    durationOfIllness: '10 years',
    historyOfPresentIllness: 'Worsening dyspnea, increased cough with purulent sputum, and chest tightness for the past 3 days.',
    pastHistory: 'Chronic smoker (40 pack-years), Hypertension.',
    comorbidities: 'Hypertension',
    generalExam: 'Tachypneic, accessory muscles of respiration active, barrel chest, cyanosed.',
    weight: '58',
    height: '5.50 ft',
    abdomenExam: 'Soft, liver felt 1.5cm below costal margin (congestive hepatomegaly).',
    otherFindings: 'Bilateral diffuse wheezing and prolonged expiration.',
    usg: 'Not performed.',
    ctScan: 'Chest X-ray shows hyperinflated lungs, flat diaphragms, no consolidation.',
    attachments: '[]',
    operation: 'None',
    operationFindings: '',
    surgeon: '',
    assistant1: '',
    assistant2: '',
    postOpProgress: '',
    hpeReport: '',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'Type II Respiratory Failure',
    complicationGrade: 'II',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-19', time: '08:00 AM', hr: 104, bpSystolic: 140, bpDiastolic: 90, temp: 37.2, spo2: 86, rr: 28, sugar: 115, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-20', time: '08:00 AM', hr: 92, bpSystolic: 130, bpDiastolic: 80, temp: 36.8, spo2: 92, rr: 20, sugar: 102, recordedBy: 'Dr. Alok Pradhan' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-20', time: '09:00 AM', note: 'ABG shows respiratory acidosis. Started on non-invasive ventilation (BiPAP) and IV bronchodilators.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-19', hb: '15.2', tc: '9800', platelets: '240000', inr: '1.02' }
      ]
    },
    medications: {
      create: [
        { name: 'Nebulization Duolin (Salbutamol+Ipratropium)', route: 'Inhalation', frequency: 'QID', indication: 'Bronchodilatation', status: 'active' },
        { name: 'Tab. Prednisolone 40mg', route: 'Oral', frequency: 'Once daily', indication: 'Inflammation reduction', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Night', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Dilip', notes: 'Dyspnea settled. SpO2 93% on nasal prongs 2L/min. BiPAP kept standby.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Ineffective breathing pattern related to bronchospasm and hyperinflation', goals: 'Respiratory rate returns to 16-20/min, SpO2 >90%', interventions: 'Position patient in high-Fowler, administer oxygen therapy cautiously, nebulize as scheduled', evaluation: 'Breathing easier, respiratory rate 18/min', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-15', time: '02:00 PM', status: 'Scheduled', notes: 'Check pulmonary function test (PFT) and adjust inhalers.' }
      ]
    }
  },
  {
    recordID: 'p_019',
    fullName: 'Rajesh Kumar Shah',
    ipdId: '784005',
    patientId: '81553160',
    fileNo: 'F-9142',
    ipNumber: 'IP-2026-920',
    age: 33,
    gender: 'Male',
    address: 'Janakpur, Nepal',
    dateOfAdmission: '2026-05-21',
    admissionTime: '10:00 AM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '3 days',
    postOpStay: '2 days',
    wardName: 'General Surgery Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1768',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Fistula-in-Ano (Low Anal)',
    natureOfDisease: 'Inflammatory / Chronic Fistulous',
    durationOfIllness: '4 months',
    historyOfPresentIllness: 'Intermittent purulent discharge and pain around the anal region for 4 months, worsening on defecation.',
    pastHistory: 'History of perianal abscess incision and drainage 6 months ago.',
    comorbidities: 'None',
    generalExam: 'Afebril, systemically stable.',
    weight: '70',
    height: '5.70 ft',
    abdomenExam: 'Soft, non-tender, normal.',
    otherFindings: 'Perianal exam: External opening at 5 o\'clock position, 2cm from anal verge. Induration felt.',
    usg: 'Not performed.',
    ctScan: 'MRI Perianal shows low transsphincteric fistula-in-ano with no secondary tracts.',
    attachments: '[]',
    operation: 'Fistulotomy and Curettage',
    operationFindings: 'Fistula tract tracked using probe. External opening connected to internal opening at dentate line. Tract laid open. Curettage done.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Satisfactory. Wound packed with medicated gauze. Daily sitz bath started POD 1.',
    hpeReport: 'Fistulous tract showing chronic non-specific inflammatory tissue.',
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: 'None',
    complicationGrade: 'I',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-21', time: '10:00 AM', hr: 74, bpSystolic: 120, bpDiastolic: 80, temp: 36.6, spo2: 99, rr: 14, sugar: 92, recordedBy: 'Dr. Sandeep Bhandari' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-22', time: '09:00 AM', note: 'Pre-op note: Prepared for fistulotomy. Bowel prep completed.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-21', hb: '14.8', tc: '7800', platelets: '280000', inr: '1.02' }
      ]
    },
    medications: {
      create: [
        { name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'Three times daily', indication: 'Pain relief', status: 'active' },
        { name: 'Syp. Lactulose 15ml', route: 'Oral', frequency: 'Once daily at night', indication: 'Stool softener', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Morning', outgoingStaff: 'Nurse Reeta', incomingStaff: 'Nurse Sarita', notes: 'Sitz bath done. Wound repacked. Pain score 2/10. Defecated without significant pain.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Deficient knowledge related to post-operative perianal wound care', goals: 'Patient demonstrates correct sitz bath technique and wound care', interventions: 'Instruct on sitz bath procedure, advise on high fiber diet and stool softeners', evaluation: 'Patient performed sitz bath independently', authoredBy: 'Nurse Reeta' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-05', time: '11:00 AM', status: 'Scheduled', notes: 'Wound healing review.' }
      ]
    }
  },
  {
    recordID: 'p_020',
    fullName: 'Manju Sob',
    ipdId: '784010',
    patientId: '81553180',
    fileNo: 'F-9155',
    ipNumber: 'IP-2026-930',
    age: 31,
    gender: 'Female',
    address: 'Surkhet, Nepal',
    dateOfAdmission: '2026-05-22',
    admissionTime: '01:30 PM',
    dateOfOperation: '2026-05-22',
    dateOfDischarge: '',
    stayDuration: '2 days',
    postOpStay: '1 day',
    wardName: 'Gynecology Ward',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1772',
    inchargeDoctor: 'Dr. Sandeep Bhandari',
    additionalDoctors: 'Dr. Susan Giri',
    status: 'Admitted',
    type: 'IPD',
    diagnosis: 'Ruptured Ectopic Pregnancy (Right Tubal)',
    natureOfDisease: 'Acute Gynecological Emergency',
    durationOfIllness: '1 day',
    historyOfPresentIllness: 'Sudden onset severe lower abdominal pain with fainting spell, following 6 weeks of amenorrhea.',
    pastHistory: 'None.',
    comorbidities: 'Hemorrhagic Shock',
    generalExam: 'Severe pallor, cold clammy skin, tachycardia (118/min), hypotension (BP 80/50 mmHg).',
    weight: '54',
    height: '5.10 ft',
    abdomenExam: 'Distended, diffuse tenderness, rebound tenderness positive.',
    otherFindings: 'Cervical motion tenderness present.',
    usg: 'Empty uterus, large amount of free fluid with internal echoes in pelvis and abdomen, right adnexal mass.',
    ctScan: 'Not performed.',
    attachments: '[]',
    operation: 'Emergency Laparotomy and Right Salpingectomy',
    operationFindings: 'Hemoperitoneum of approx 1500ml. Ruptured right fallopian tube at ampullary region with active bleeding. Right salpingectomy done. Peritoneal lavage.',
    surgeon: 'Dr. Sandeep Bhandari',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Transfused 3 units of PRBC. BP stabilized to 110/70 mmHg. Urine output monitored.',
    hpeReport: 'Fallopian tube showing chorionic villi, ruptured.',
    bloodTransfusion: 'Yes',
    wbPrbcUnits: '3',
    ffpUnits: '2',
    prpUnits: '0',
    complications: 'Hemorrhagic Shock (Pre-op & Intra-op)',
    complicationGrade: 'III',
    hospitalId,
    vitalsHistory: {
      create: [
        { date: '2026-05-22', time: '01:30 PM', hr: 118, bpSystolic: 80, bpDiastolic: 50, temp: 36.0, spo2: 95, rr: 24, sugar: 100, recordedBy: 'Dr. Sandeep Bhandari' },
        { date: '2026-05-23', time: '08:00 AM', hr: 84, bpSystolic: 110, bpDiastolic: 70, temp: 36.8, spo2: 99, rr: 16, sugar: 95, recordedBy: 'Dr. Susan Giri' }
      ]
    },
    dailyReports: {
      create: [
        { date: '2026-05-22', time: '11:00 PM', note: 'Post-op Note: Transfused 3 units PRBC and 2 units FFP. Vitals stabilized. Urine output 45ml/hr.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' },
        { date: '2026-05-23', time: '09:00 AM', note: 'Post-op Day 1: Stable. Bowel sounds sluggish. Dressing dry.', author: 'Dr. Sandeep Bhandari', role: 'Doctor' }
      ]
    },
    investigations: {
      create: [
        { date: '2026-05-22', hb: '6.5', tc: '14500', platelets: '210000', inr: '1.20' }
      ]
    },
    medications: {
      create: [
        { name: 'Inj. Ceftriaxone 1g', route: 'IV', frequency: 'Twice daily', indication: 'Surgical prophylaxis', status: 'active' },
        { name: 'Tab. Iron Supplement', route: 'Oral', frequency: 'Twice daily', indication: 'Anemia recovery', status: 'active' }
      ]
    },
    shiftHandovers: {
      create: [
        { date: '2026-05-23', shift: 'Morning', outgoingStaff: 'Nurse Dilip', incomingStaff: 'Nurse Sarita', notes: 'Hemodynamics stable. Fluid intake/output monitored. Pain managed with IV Tramadol.' }
      ]
    },
    carePlans: {
      create: [
        { nursingDiagnosis: 'Ineffective tissue perfusion related to blood loss and hemorrhagic shock', goals: 'Maintain stable blood pressure, hemoglobin >9g/dl, and warm extremities', interventions: 'Administer IV fluids and blood products as ordered, monitor urine output hourly, keep patient warm', evaluation: 'Extremities warm, blood pressure stabilized', authoredBy: 'Nurse Dilip' }
      ]
    },
    appointments: {
      create: [
        { doctorName: 'Dr. Sandeep Bhandari', date: '2026-06-10', time: '02:00 PM', status: 'Scheduled', notes: 'Post-operative check and check hemoglobin level.' }
      ]
    }
  }
];

module.exports = { getDemoPatients };

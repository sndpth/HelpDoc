import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Constants from 'expo-constants';

const getApiUrl = () => {
  // Extract host IP dynamically from Metro bundler address
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  return 'http://localhost:3000';
};

const DEFAULT_API_URL = getApiUrl();

const api = axios.create({
  baseURL: `${DEFAULT_API_URL}/api`,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const state = useStore.getState();
      const customUrl = state.apiUrl || DEFAULT_API_URL;
      config.baseURL = `${customUrl}/api`;
      
      const token = state.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('Error setting auth header:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Generate a stable ID once; persist middleware will preserve it across restarts.
const generateId = () => 'u_' + Math.random().toString(36).substr(2, 6);

const MOCK_PATIENTS = [
  {
    recordID: 'p_001',
    fullName: 'Sumitra Ale',
    ipdId: '783918',
    patientId: '81552753',
    fileNo: 'N/A',
    ipNumber: 'IP-2025-783',
    age: 21,
    gender: 'Female',
    address: 'Kathmandu, Nepal',
    dateOfAdmission: '2025-11-23',
    admissionTime: '12:05 PM',
    dateOfOperation: '2025-11-25',
    dateOfDischarge: '',
    stayDuration: '9 days',
    postOpStay: '7 days',
    wardName: 'A SURESH WAGLE GENERAL WARD',
    roomType: 'SINGLE BED CABIN',
    bedNo: '1701',
    inchargeDoctor: 'Dr. Niraj Bam',
    additionalDoctors: ['Dr. Susan Giri', 'Dr. Alok Pradhan'],
    status: 'Admitted',
    
    diagnosis: 'Acute Appendicitis with Localized Peritonitis',
    natureOfDisease: 'Acute Inflammatory',
    durationOfIllness: '3 days',
    historyOfPresentIllness: 'Severe right lower quadrant abdominal pain accompanied by low-grade fever, nausea, and vomiting for the past 72 hours.',
    pastHistory: 'No major past medical or surgical history.',
    comorbidities: 'None',
    
    generalExam: 'Mild pallor, febrile (38.2°C), hydration status fair.',
    weight: '65',
    height: '5.50 ft',
    abdomenExam: 'Tenderness and guarding present in the right iliac fossa (Rif). Rebound tenderness positive.',
    otherFindings: 'Systemic examinations normal.',
    
    usg: 'Aperistaltic, non-compressible blind-ended tubular structure in RIF, max diameter 8.5mm, surrounded by minimal free fluid.',
    ctScan: 'Not performed.',
    attachments: [],
    medications: [
      { id: 'med_001', name: 'Inj. Ceftriaxone 1g', route: 'IV', frequency: 'Twice daily (1-0-1)', indication: 'Post-Op Prophylaxis', status: 'active' },
      { id: 'med_002', name: 'Tab. Paracetamol 500mg', route: 'Oral', frequency: 'PRN (Max 4x daily)', indication: 'Pain/Fever', status: 'active' },
      { id: 'med_003', name: 'IV Fluids Normal Saline', route: 'IV infusion', frequency: '75 ml/hr', indication: 'Maintain hydration', status: 'active' }
    ],
    
    operation: 'Laparoscopic Appendectomy',
    operationFindings: 'Inflamed, gangrenous appendix at the retrocecal position with minimal purulent fluid in the pelvis. Rest of abdominal organs normal.',
    surgeon: 'Dr. Niraj Bam',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Satisfactory. Patient started on clear liquid diet on Post-Op Day 1 and tolerated well.',
    hpeReport: 'Acute suppurative appendicitis with periappendicitis.',
    
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: ['None'],
    complicationGrade: 'I',
    
    investigations: [
      { date: '2025-11-23', hb: '12.8', tc: '14200', neu: '82', lym: '14', platelets: '280000', pt: '12.5', inr: '1.05' },
      { date: '2025-11-26', hb: '12.1', tc: '9800', neu: '68', lym: '25', platelets: '295000', pt: '12.8', inr: '1.08' }
    ],
    followUps: [
      { date: '2025-11-30', duration: '1', symptoms: 'Mild wound discomfort, no fever.', status: 'Healing well' }
    ],
    vitalsHistory: [
      { date: '2025-11-23', time: '12:05 PM', hr: 98, bpSystolic: 120, bpDiastolic: 80, temp: 38.2, spo2: 98, rr: 18, sugar: 104 },
      { date: '2025-11-23', time: '02:35 PM', hr: 88, bpSystolic: 110, bpDiastolic: 70, temp: 37.8, spo2: 99, rr: 16, sugar: 98 },
      { date: '2025-11-24', time: '09:00 AM', hr: 82, bpSystolic: 115, bpDiastolic: 75, temp: 37.2, spo2: 99, rr: 16, sugar: 95 },
      { date: '2025-11-25', time: '04:00 PM', hr: 76, bpSystolic: 120, bpDiastolic: 80, temp: 36.8, spo2: 98, rr: 14, sugar: 92 }
    ],
    vitals: { hr: 76, bp: '120/80', temp: '36.8°C' },
    dailyReports: [
      { date: '2025-11-24', time: '08:00 AM', note: 'Clinical Note: Patient slept well. Pain scale 4/10. Vitals stable. Bowel sounds present.' },
      { date: '2025-11-25', time: '09:00 AM', note: 'Clinical Note: Post-op Day 1. Patient ambulatory. Wound dressing intact and dry. Started on liquid diet.' }
    ]
  },
  {
    recordID: 'p_002',
    fullName: 'Ram Bahadur Thapa',
    ipdId: '783925',
    patientId: '81552890',
    fileNo: 'F-8812',
    ipNumber: 'IP-2025-790',
    age: 54,
    gender: 'Male',
    address: 'Lalitpur, Nepal',
    dateOfAdmission: '2025-11-24',
    admissionTime: '02:15 PM',
    dateOfOperation: '',
    dateOfDischarge: '',
    stayDuration: '8 days',
    postOpStay: 'N/A',
    wardName: 'A SURESH WAGLE GENERAL WARD',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1705',
    inchargeDoctor: 'Dr. Niraj Bam',
    additionalDoctors: ['Dr. Alok Pradhan'],
    status: 'Admitted',
    
    diagnosis: 'Lobar Pneumonia (Right Middle Lobe)',
    natureOfDisease: 'Infectious',
    durationOfIllness: '5 days',
    historyOfPresentIllness: 'Productive cough with rusty sputum, high-grade fever with chills, and pleuritic chest pain on the right side.',
    pastHistory: 'Type 2 Diabetes Mellitus on Oral Hypoglycemics.',
    comorbidities: 'Diabetes Mellitus',
    
    generalExam: 'Dehydrated, tachypneic, febrile (39.0°C).',
    weight: '72',
    height: '5.60 ft',
    abdomenExam: 'Soft, non-tender. No organomegaly.',
    otherFindings: 'Decreased breath sounds and crepitations in the right middle lung zone.',
    
    usg: 'Not performed.',
    ctScan: 'Chest X-ray shows right middle lobe consolidation.',
    attachments: [],
    medications: [
      { id: 'med_010', name: 'Inj. Piperacillin-Tazobactam 4.5g', route: 'IV', frequency: 'Thrice daily', indication: 'Pneumonia', status: 'active' },
      { id: 'med_011', name: 'Tab. Metformin 500mg', route: 'Oral', frequency: 'Twice daily', indication: 'DM Type 2', status: 'active' }
    ],
    
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
    complications: ['Dehydration'],
    complicationGrade: 'I',
    
    investigations: [
      { date: '2025-11-24', hb: '13.5', tc: '16800', neu: '88', lym: '10', platelets: '250000', pt: '13.0', inr: '1.09' }
    ],
    followUps: [],
    vitalsHistory: [
      { date: '2025-11-24', time: '02:15 PM', hr: 104, bpSystolic: 130, bpDiastolic: 85, temp: 39.0, spo2: 94, rr: 24, sugar: 180 },
      { date: '2025-11-25', time: '08:00 AM', hr: 96, bpSystolic: 125, bpDiastolic: 80, temp: 38.4, spo2: 95, rr: 22, sugar: 160 }
    ],
    vitals: { hr: 96, bp: '125/80', temp: '38.4°C' },
    dailyReports: [
      { date: '2025-11-25', time: '08:30 AM', note: 'Clinical Note: Fever spiked at night. Nebulization given. Oxygen support continued at 2L/min.' }
    ]
  },
  {
    recordID: 'p_003',
    fullName: 'Aarav Devkota',
    ipdId: '783905',
    patientId: '81552600',
    fileNo: 'F-8700',
    ipNumber: 'IP-2025-700',
    age: 42,
    gender: 'Male',
    address: 'Pokhara, Nepal',
    dateOfAdmission: '2025-11-15',
    admissionTime: '10:00 AM',
    dateOfOperation: '2025-11-17',
    dateOfDischarge: '2025-11-20',
    stayDuration: '5 days',
    postOpStay: '3 days',
    wardName: 'A SURESH WAGLE GENERAL WARD',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1708',
    inchargeDoctor: 'Dr. Niraj Bam',
    additionalDoctors: ['Dr. Susan Giri'],
    status: 'Discharged',
    
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
    attachments: [],
    
    operation: 'Lichtenstein Tension-Free Hernioplasty',
    operationFindings: 'Indirect hernia sac isolated, reduced. Prolene mesh (3x5 inch) placed and secured.',
    surgeon: 'Dr. Niraj Bam',
    assistant1: 'Dr. Susan Giri',
    assistant2: '',
    postOpProgress: 'Uneventful recovery. Healing well.',
    hpeReport: 'Hernial sac showing fibrocollagenous tissue.',
    
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: ['None'],
    complicationGrade: 'I',
    
    investigations: [
      { date: '2025-11-15', hb: '14.2', tc: '8500', neu: '62', lym: '30', platelets: '240000', pt: '12.0', inr: '1.00' }
    ],
    followUps: [],
    vitalsHistory: [
      { date: '2025-11-15', time: '10:00 AM', hr: 72, bpSystolic: 120, bpDiastolic: 80, temp: 36.6, spo2: 99, rr: 14, sugar: 90 },
      { date: '2025-11-17', time: '08:00 AM', hr: 78, bpSystolic: 118, bpDiastolic: 78, temp: 36.8, spo2: 98, rr: 15, sugar: 94 }
    ],
    vitals: { hr: 78, bp: '118/78', temp: '36.8°C' },
    dailyReports: [
      { date: '2025-11-17', time: '04:00 PM', note: 'Clinical Note: Post-op day 0. Patient alert, tolerating sips of water.' }
    ]
  },
  {
    recordID: 'p_004',
    fullName: 'Maya Sherpa',
    ipdId: '783930',
    patientId: '81552945',
    fileNo: 'F-8910',
    ipNumber: 'IP-2025-910',
    age: 38,
    gender: 'Female',
    address: 'Solukhumbu, Nepal',
    dateOfAdmission: '2025-11-18',
    admissionTime: '08:00 AM',
    dateOfOperation: '2025-11-19',
    dateOfDischarge: '2025-11-22',
    stayDuration: '4 days',
    postOpStay: '3 days',
    wardName: 'A SURESH WAGLE GENERAL WARD',
    roomType: 'SINGLE BED CABIN',
    bedNo: '1712',
    inchargeDoctor: 'Dr. Niraj Bam',
    additionalDoctors: ['Dr. Alok Pradhan'],
    status: 'Discharged',
    
    diagnosis: 'Chronic Cholecystitis with Cholelithiasis',
    natureOfDisease: 'Calculous Disease',
    durationOfIllness: '1 year',
    historyOfPresentIllness: 'Recurrent episodes of right upper quadrant abdominal pain radiating to the right shoulder, triggered by fatty meals.',
    pastHistory: 'None',
    comorbidities: 'None',
    
    generalExam: 'Afebril, mild icterus absent.',
    weight: '58',
    height: '5.20 ft',
    abdomenExam: 'Soft, mild tenderness in right hypochondrium.',
    otherFindings: 'None',
    
    usg: 'Multiple small gallstones, largest 1.2cm, with gall bladder wall thickening of 3.5mm.',
    ctScan: 'Not performed.',
    attachments: [],
    
    operation: 'Laparoscopic Cholecystectomy',
    operationFindings: 'Thickened gall bladder containing multiple mixed gallstones. Cystic duct and artery isolated and clipped.',
    surgeon: 'Dr. Niraj Bam',
    assistant1: 'Dr. Alok Pradhan',
    assistant2: '',
    postOpProgress: 'Uneventful recovery. Oral diet resumed and tolerated.',
    hpeReport: 'Chronic calculous cholecystitis.',
    
    bloodTransfusion: 'No',
    wbPrbcUnits: '0',
    ffpUnits: '0',
    prpUnits: '0',
    complications: ['None'],
    complicationGrade: 'I',
    
    investigations: [
      { date: '2025-11-18', hb: '11.8', tc: '7200', neu: '58', lym: '35', platelets: '310000', pt: '12.2', inr: '1.02' }
    ],
    followUps: [],
    vitalsHistory: [
      { date: '2025-11-18', time: '08:00 AM', hr: 68, bpSystolic: 110, bpDiastolic: 70, temp: 36.5, spo2: 99, rr: 14, sugar: 88 }
    ],
    vitals: { hr: 68, bp: '110/70', temp: '36.5°C' },
    dailyReports: [
      { date: '2025-11-19', time: '05:00 PM', note: 'Clinical Note: Post-op day 0. Patient comfortable, pain well controlled.' }
    ]
  },
  {
    recordID: 'p_005',
    fullName: 'Krishna Prasad Oli',
    ipdId: '783850',
    patientId: '81552100',
    fileNo: 'F-8100',
    ipNumber: 'IP-2025-100',
    age: 68,
    gender: 'Male',
    address: 'Jhapa, Nepal',
    dateOfAdmission: '2025-11-20',
    admissionTime: '01:00 AM',
    dateOfOperation: '',
    dateOfDischarge: '',
    stayDuration: '5 days',
    postOpStay: 'N/A',
    wardName: 'ICU / CRITICAL CARE UNIT',
    roomType: 'VENTILATION BED',
    bedNo: 'ICU-3',
    inchargeDoctor: 'Dr. Niraj Bam',
    additionalDoctors: ['Dr. Susan Giri', 'Dr. Alok Pradhan'],
    status: 'Deceased',
    
    diagnosis: 'Ruptured Retroperitoneal Abscess leading to Septic Shock',
    natureOfDisease: 'Severe Infectious',
    durationOfIllness: '10 days',
    historyOfPresentIllness: 'Admitted in altered sensorium, severe abdominal pain, high-grade fever, and persistent hypotension.',
    pastHistory: 'Chronic Kidney Disease Stage 3, Hypertension.',
    comorbidities: 'CKD, Hypertension',
    
    generalExam: 'Toxic look, hypothermic (35.0°C), severely hypotensive (80/50 mmHg), anuric.',
    weight: '62',
    height: '5.40 ft',
    abdomenExam: 'Distended, diffuse tenderness, rigidity.',
    otherFindings: 'Tachycardia (124 bpm), cold extremities.',
    
    usg: 'Diffuse collections in retroperitoneum, free fluid in abdomen.',
    ctScan: 'Large ruptured retroperitoneal abscess with extensive muscle necrosis.',
    attachments: [],
    
    operation: 'None (Unfit for surgery due to refractory shock)',
    operationFindings: '',
    surgeon: '',
    assistant1: '',
    assistant2: '',
    postOpProgress: '',
    hpeReport: '',
    
    bloodTransfusion: 'Yes',
    wbPrbcUnits: '2',
    ffpUnits: '4',
    prpUnits: '0',
    complications: ['Septic Shock', 'Multi-Organ Dysfunction Syndrome'],
    complicationGrade: 'V',
    
    investigations: [
      { date: '2025-11-20', hb: '9.5', tc: '24500', neu: '92', lym: '5', platelets: '110000', pt: '18.5', inr: '1.65' }
    ],
    followUps: [],
    vitalsHistory: [
      { date: '2025-11-20', time: '01:00 AM', hr: 124, bpSystolic: 80, bpDiastolic: 50, temp: 35.0, spo2: 89, rr: 28, sugar: 210 },
      { date: '2025-11-23', time: '02:00 PM', hr: 110, bpSystolic: 85, bpDiastolic: 52, temp: 36.2, spo2: 90, rr: 26, sugar: 190 }
    ],
    vitals: { hr: 110, bp: '85/52', temp: '36.2°C' },
    dailyReports: [
      { date: '2025-11-23', time: '09:00 PM', note: 'Nurse Note: Patient on double inotropic support. Urine output less than 10ml/hour.' }
    ]
  },
  {
    recordID: 'p_006',
    fullName: 'Sita Kumari Gurung',
    ipdId: '783935',
    patientId: '81552990',
    fileNo: 'F-8990',
    ipNumber: 'IP-2025-990',
    age: 62,
    gender: 'Female',
    address: 'Kaski, Nepal',
    dateOfAdmission: '2025-11-25',
    admissionTime: '11:30 AM',
    dateOfOperation: '',
    dateOfDischarge: '',
    stayDuration: '2 days',
    postOpStay: 'N/A',
    wardName: 'A SURESH WAGLE GENERAL WARD',
    roomType: 'DOUBLE BED CABIN',
    bedNo: '1715',
    inchargeDoctor: 'Dr. Niraj Bam',
    additionalDoctors: ['Dr. Susan Giri'],
    status: 'Admitted',
    
    diagnosis: 'Type 2 Diabetes Mellitus with Diabetic Foot Ulcer Grade III',
    natureOfDisease: 'Metabolic & Infectious',
    durationOfIllness: '2 weeks',
    historyOfPresentIllness: 'Ulcer in the plantar aspect of the right foot with purulent discharge, swelling, and redness radiating up to the ankle.',
    pastHistory: 'Type 2 DM for 15 years, poor glycemic control.',
    comorbidities: 'DM, Diabetic Neuropathy',
    
    generalExam: 'Afebril, systemic exams normal except for right lower limb.',
    weight: '68',
    height: '5.10 ft',
    abdomenExam: 'Soft, non-tender.',
    otherFindings: 'Pulses in right foot palpable but weak.',
    
    usg: 'Not performed.',
    ctScan: 'Foot X-ray shows soft tissue gas, no osteomyelitis.',
    attachments: [],
    
    operation: 'Debridement scheduled.',
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
    complications: ['Cellulitis'],
    complicationGrade: 'II',
    
    investigations: [
      { date: '2025-11-25', hb: '10.5', tc: '13800', neu: '78', lym: '18', platelets: '320000', pt: '13.2', inr: '1.10' }
    ],
    followUps: [],
    vitalsHistory: [
      { date: '2025-11-25', time: '11:30 AM', hr: 84, bpSystolic: 135, bpDiastolic: 82, temp: 37.1, spo2: 98, rr: 16, sugar: 245 }
    ],
    vitals: { hr: 84, bp: '135/82', temp: '37.1°C' },
    dailyReports: [
      { date: '2025-11-25', time: '02:00 PM', note: 'Clinical Note: Dressing performed with saline wash. IV Antibiotics started.' }
    ]
  }
,
  {
      "recordID": "p_gen_100",
      "fullName": "Bipin Adhikari",
      "ipdId": "783940",
      "patientId": "81553000",
      "fileNo": "F-8900",
      "ipNumber": "IP-2025-800",
      "age": 19,
      "gender": "Male",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-19",
      "admissionTime": "10:00 AM",
      "dateOfOperation": "2025-11-19",
      "dateOfDischarge": "2025-11-21",
      "stayDuration": "7 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1720",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Discharged",
      "diagnosis": "Inguinal Hernia",
      "natureOfDisease": "Anatomical defect",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to inguinal hernia for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "61",
      "height": "5.5 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Inguinal Hernia",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-19",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-19",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-19",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_101",
      "fullName": "Sandesh Shrestha",
      "ipdId": "783941",
      "patientId": "81553001",
      "fileNo": "F-8901",
      "ipNumber": "IP-2025-801",
      "age": 18,
      "gender": "Female",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-17",
      "admissionTime": "8:30 PM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1721",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Cholecystitis with Cholelithiasis",
      "natureOfDisease": "Calculous Disease",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to cholecystitis with cholelithiasis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "55",
      "height": "5.2 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Cholecystitis with Cholelithiasis",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-17",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-17",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-17",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_102",
      "fullName": "Pemba Sherpa",
      "ipdId": "783942",
      "patientId": "81553002",
      "fileNo": "F-8902",
      "ipNumber": "IP-2025-802",
      "age": 51,
      "gender": "Male",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-10",
      "admissionTime": "6:00 AM",
      "dateOfOperation": "2025-11-19",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1722",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Acute Pancreatitis",
      "natureOfDisease": "Inflammatory",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to acute pancreatitis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "64",
      "height": "5.3 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Acute Pancreatitis",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-10",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-10",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-10",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_103",
      "fullName": "Pasang Lhamu",
      "ipdId": "783943",
      "patientId": "81553003",
      "fileNo": "F-8903",
      "ipNumber": "IP-2025-803",
      "age": 71,
      "gender": "Female",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "3:30 PM",
      "dateOfOperation": "2025-11-16",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1723",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Urolithiasis (Renal Calculus)",
      "natureOfDisease": "Obstructive",
      "durationOfIllness": "2 months",
      "historyOfPresentIllness": "Patient presented with complaints related to urolithiasis (renal calculus) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "59",
      "height": "5.6 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Urolithiasis (Renal Calculus)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_104",
      "fullName": "Gita Devi",
      "ipdId": "783944",
      "patientId": "81553004",
      "fileNo": "F-8904",
      "ipNumber": "IP-2025-804",
      "age": 65,
      "gender": "Male",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-12",
      "admissionTime": "10:00 AM",
      "dateOfOperation": "2025-11-16",
      "dateOfDischarge": "2025-11-22",
      "stayDuration": "4 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1724",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Discharged",
      "diagnosis": "Benign Prostatic Hyperplasia (BPH)",
      "natureOfDisease": "Hyperplastic",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to benign prostatic hyperplasia (bph) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "75",
      "height": "5.6 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Benign Prostatic Hyperplasia (BPH)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-12",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-12",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-12",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_105",
      "fullName": "Laxmi Prasad",
      "ipdId": "783945",
      "patientId": "81553005",
      "fileNo": "F-8905",
      "ipNumber": "IP-2025-805",
      "age": 19,
      "gender": "Female",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-12",
      "admissionTime": "9:30 PM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1725",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "COPD Exacerbation",
      "natureOfDisease": "Respiratory Obstructive",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to copd exacerbation for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "54",
      "height": "5.9 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for COPD Exacerbation",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-12",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-12",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-12",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_106",
      "fullName": "Ram Chandra",
      "ipdId": "783946",
      "patientId": "81553006",
      "fileNo": "F-8906",
      "ipNumber": "IP-2025-806",
      "age": 73,
      "gender": "Male",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-15",
      "admissionTime": "3:00 AM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1726",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Hemorrhoids Grade III",
      "natureOfDisease": "Vascular/Anorectal",
      "durationOfIllness": "1 months",
      "historyOfPresentIllness": "Patient presented with complaints related to hemorrhoids grade iii for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "73",
      "height": "5.7 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Hemorrhoids Grade III",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-15",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-15",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-15",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_107",
      "fullName": "Sita Gurung",
      "ipdId": "783947",
      "patientId": "81553007",
      "fileNo": "F-8907",
      "ipNumber": "IP-2025-807",
      "age": 59,
      "gender": "Female",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-17",
      "admissionTime": "11:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1727",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Varicose Veins of Lower Limbs",
      "natureOfDisease": "Vascular",
      "durationOfIllness": "1 months",
      "historyOfPresentIllness": "Patient presented with complaints related to varicose veins of lower limbs for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "66",
      "height": "5.4 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Varicose Veins of Lower Limbs",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-17",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-17",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-17",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_108",
      "fullName": "Hari Bahadur Thapa",
      "ipdId": "783948",
      "patientId": "81553008",
      "fileNo": "F-8908",
      "ipNumber": "IP-2025-808",
      "age": 75,
      "gender": "Male",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-19",
      "admissionTime": "12:00 AM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "2025-11-24",
      "stayDuration": "3 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1728",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Discharged",
      "diagnosis": "Thyroid Goiter Multinodular",
      "natureOfDisease": "Endocrine",
      "durationOfIllness": "1 months",
      "historyOfPresentIllness": "Patient presented with complaints related to thyroid goiter multinodular for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "57",
      "height": "5.6 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Thyroid Goiter Multinodular",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-19",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-19",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-19",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_109",
      "fullName": "Pooja KC",
      "ipdId": "783949",
      "patientId": "81553009",
      "fileNo": "F-8909",
      "ipNumber": "IP-2025-809",
      "age": 18,
      "gender": "Female",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "2:30 PM",
      "dateOfOperation": "",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "ICU / CRITICAL CARE UNIT",
      "roomType": "VENTILATION BED",
      "bedNo": "ICU-5",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Deceased",
      "diagnosis": "Breast Fibroadenoma",
      "natureOfDisease": "Benign Neoplastic",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to breast fibroadenoma for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "62",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "None",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_110",
      "fullName": "Subash Tamang",
      "ipdId": "783950",
      "patientId": "81553010",
      "fileNo": "F-8910",
      "ipNumber": "IP-2025-810",
      "age": 40,
      "gender": "Male",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-19",
      "admissionTime": "11:00 AM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1730",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Diabetic Foot Ulcer",
      "natureOfDisease": "Metabolic & Infectious",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to diabetic foot ulcer for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "66",
      "height": "5.3 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Diabetic Foot Ulcer",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-19",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-19",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-19",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_111",
      "fullName": "Deepak Raj",
      "ipdId": "783951",
      "patientId": "81553011",
      "fileNo": "F-8911",
      "ipNumber": "IP-2025-811",
      "age": 26,
      "gender": "Female",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-16",
      "admissionTime": "11:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "5 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1731",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Lobar Pneumonia",
      "natureOfDisease": "Infectious",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to lobar pneumonia for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "62",
      "height": "5.0 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Lobar Pneumonia",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-16",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-16",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-16",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_112",
      "fullName": "Niranjan Bam",
      "ipdId": "783952",
      "patientId": "81553012",
      "fileNo": "F-8912",
      "ipNumber": "IP-2025-812",
      "age": 28,
      "gender": "Male",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "9:00 AM",
      "dateOfOperation": "",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "ICU / CRITICAL CARE UNIT",
      "roomType": "VENTILATION BED",
      "bedNo": "ICU-3",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Deceased",
      "diagnosis": "Septic Shock secondary to Peritonitis",
      "natureOfDisease": "Severe Infectious",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to septic shock secondary to peritonitis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "50",
      "height": "5.3 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "None",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_113",
      "fullName": "Ramesh Karki",
      "ipdId": "783953",
      "patientId": "81553013",
      "fileNo": "F-8913",
      "ipNumber": "IP-2025-813",
      "age": 48,
      "gender": "Female",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-17",
      "admissionTime": "4:30 PM",
      "dateOfOperation": "2025-11-19",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1733",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Inguinal Hernia",
      "natureOfDisease": "Anatomical defect",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to inguinal hernia for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "56",
      "height": "5.1 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Inguinal Hernia",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-17",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-17",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-17",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_114",
      "fullName": "Aasha Shrestha",
      "ipdId": "783954",
      "patientId": "81553014",
      "fileNo": "F-8914",
      "ipNumber": "IP-2025-814",
      "age": 61,
      "gender": "Male",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-16",
      "admissionTime": "7:00 AM",
      "dateOfOperation": "2025-11-16",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1734",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Cholecystitis with Cholelithiasis",
      "natureOfDisease": "Calculous Disease",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to cholecystitis with cholelithiasis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "72",
      "height": "5.9 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Cholecystitis with Cholelithiasis",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-16",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-16",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-16",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_115",
      "fullName": "Bimal Ghimire",
      "ipdId": "783955",
      "patientId": "81553015",
      "fileNo": "F-8915",
      "ipNumber": "IP-2025-815",
      "age": 53,
      "gender": "Female",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-18",
      "admissionTime": "1:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1735",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Acute Pancreatitis",
      "natureOfDisease": "Inflammatory",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to acute pancreatitis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "65",
      "height": "5.2 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Acute Pancreatitis",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-18",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-18",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-18",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_116",
      "fullName": "Sarita Pokharel",
      "ipdId": "783956",
      "patientId": "81553016",
      "fileNo": "F-8916",
      "ipNumber": "IP-2025-816",
      "age": 66,
      "gender": "Male",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-16",
      "admissionTime": "6:00 AM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "2025-11-22",
      "stayDuration": "5 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1736",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Discharged",
      "diagnosis": "Urolithiasis (Renal Calculus)",
      "natureOfDisease": "Obstructive",
      "durationOfIllness": "2 months",
      "historyOfPresentIllness": "Patient presented with complaints related to urolithiasis (renal calculus) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "61",
      "height": "5.1 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Urolithiasis (Renal Calculus)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-16",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-16",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-16",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_117",
      "fullName": "Kabita Bhattarai",
      "ipdId": "783957",
      "patientId": "81553017",
      "fileNo": "F-8917",
      "ipNumber": "IP-2025-817",
      "age": 31,
      "gender": "Female",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-15",
      "admissionTime": "2:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1737",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Benign Prostatic Hyperplasia (BPH)",
      "natureOfDisease": "Hyperplastic",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to benign prostatic hyperplasia (bph) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "54",
      "height": "5.0 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Benign Prostatic Hyperplasia (BPH)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-15",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-15",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-15",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_118",
      "fullName": "Pradeep Sen",
      "ipdId": "783958",
      "patientId": "81553018",
      "fileNo": "F-8918",
      "ipNumber": "IP-2025-818",
      "age": 44,
      "gender": "Male",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "4:00 AM",
      "dateOfOperation": "",
      "dateOfDischarge": "",
      "stayDuration": "6 days",
      "postOpStay": "N/A",
      "wardName": "ICU / CRITICAL CARE UNIT",
      "roomType": "VENTILATION BED",
      "bedNo": "ICU-4",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Deceased",
      "diagnosis": "COPD Exacerbation",
      "natureOfDisease": "Respiratory Obstructive",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to copd exacerbation for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "65",
      "height": "6.0 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "None",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_119",
      "fullName": "Roshani Rana",
      "ipdId": "783959",
      "patientId": "81553019",
      "fileNo": "F-8919",
      "ipNumber": "IP-2025-819",
      "age": 66,
      "gender": "Female",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-11",
      "admissionTime": "7:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1739",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Hemorrhoids Grade III",
      "natureOfDisease": "Vascular/Anorectal",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to hemorrhoids grade iii for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "61",
      "height": "5.3 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Hemorrhoids Grade III",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-11",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-11",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-11",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_120",
      "fullName": "Sabin Maharjan",
      "ipdId": "783960",
      "patientId": "81553020",
      "fileNo": "F-8920",
      "ipNumber": "IP-2025-820",
      "age": 24,
      "gender": "Male",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "4:00 AM",
      "dateOfOperation": "2025-11-16",
      "dateOfDischarge": "2025-11-22",
      "stayDuration": "7 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1740",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Discharged",
      "diagnosis": "Varicose Veins of Lower Limbs",
      "natureOfDisease": "Vascular",
      "durationOfIllness": "2 months",
      "historyOfPresentIllness": "Patient presented with complaints related to varicose veins of lower limbs for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "63",
      "height": "5.9 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Varicose Veins of Lower Limbs",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_121",
      "fullName": "Karuna Shrestha",
      "ipdId": "783961",
      "patientId": "81553021",
      "fileNo": "F-8921",
      "ipNumber": "IP-2025-821",
      "age": 42,
      "gender": "Female",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-15",
      "admissionTime": "1:30 PM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1741",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Thyroid Goiter Multinodular",
      "natureOfDisease": "Endocrine",
      "durationOfIllness": "1 months",
      "historyOfPresentIllness": "Patient presented with complaints related to thyroid goiter multinodular for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "50",
      "height": "5.4 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Thyroid Goiter Multinodular",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-15",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-15",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-15",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_122",
      "fullName": "Anil Gurung",
      "ipdId": "783962",
      "patientId": "81553022",
      "fileNo": "F-8922",
      "ipNumber": "IP-2025-822",
      "age": 71,
      "gender": "Male",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-19",
      "admissionTime": "12:00 AM",
      "dateOfOperation": "2025-11-16",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1742",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Breast Fibroadenoma",
      "natureOfDisease": "Benign Neoplastic",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to breast fibroadenoma for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "71",
      "height": "5.7 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Breast Fibroadenoma",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-19",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-19",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-19",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_123",
      "fullName": "Monika Giri",
      "ipdId": "783963",
      "patientId": "81553023",
      "fileNo": "F-8923",
      "ipNumber": "IP-2025-823",
      "age": 48,
      "gender": "Female",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-13",
      "admissionTime": "3:30 PM",
      "dateOfOperation": "2025-11-17",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1743",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Diabetic Foot Ulcer",
      "natureOfDisease": "Metabolic & Infectious",
      "durationOfIllness": "2 months",
      "historyOfPresentIllness": "Patient presented with complaints related to diabetic foot ulcer for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "73",
      "height": "5.3 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Diabetic Foot Ulcer",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-13",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-13",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-13",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_124",
      "fullName": "Sudip Lamsal",
      "ipdId": "783964",
      "patientId": "81553024",
      "fileNo": "F-8924",
      "ipNumber": "IP-2025-824",
      "age": 63,
      "gender": "Male",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-10",
      "admissionTime": "3:00 AM",
      "dateOfOperation": "2025-11-19",
      "dateOfDischarge": "2025-11-23",
      "stayDuration": "6 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1744",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Discharged",
      "diagnosis": "Lobar Pneumonia",
      "natureOfDisease": "Infectious",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to lobar pneumonia for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "70",
      "height": "5.2 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Lobar Pneumonia",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-10",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-10",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-10",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_125",
      "fullName": "Manju Khatri",
      "ipdId": "783965",
      "patientId": "81553025",
      "fileNo": "F-8925",
      "ipNumber": "IP-2025-825",
      "age": 60,
      "gender": "Female",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "4:30 PM",
      "dateOfOperation": "",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "ICU / CRITICAL CARE UNIT",
      "roomType": "VENTILATION BED",
      "bedNo": "ICU-1",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Deceased",
      "diagnosis": "Septic Shock secondary to Peritonitis",
      "natureOfDisease": "Severe Infectious",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to septic shock secondary to peritonitis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "69",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "None",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_126",
      "fullName": "Pawan Acharya",
      "ipdId": "783966",
      "patientId": "81553026",
      "fileNo": "F-8926",
      "ipNumber": "IP-2025-826",
      "age": 63,
      "gender": "Male",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-11",
      "admissionTime": "3:00 AM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "6 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1746",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Inguinal Hernia",
      "natureOfDisease": "Anatomical defect",
      "durationOfIllness": "2 months",
      "historyOfPresentIllness": "Patient presented with complaints related to inguinal hernia for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "78",
      "height": "5.6 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Inguinal Hernia",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-11",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-11",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-11",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_127",
      "fullName": "Sunita Rimal",
      "ipdId": "783967",
      "patientId": "81553027",
      "fileNo": "F-8927",
      "ipNumber": "IP-2025-827",
      "age": 55,
      "gender": "Female",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-12",
      "admissionTime": "7:30 PM",
      "dateOfOperation": "",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "ICU / CRITICAL CARE UNIT",
      "roomType": "VENTILATION BED",
      "bedNo": "ICU-3",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Deceased",
      "diagnosis": "Cholecystitis with Cholelithiasis",
      "natureOfDisease": "Calculous Disease",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to cholecystitis with cholelithiasis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "71",
      "height": "5.9 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "None",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-12",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-12",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-12",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_128",
      "fullName": "Dinesh Regmi",
      "ipdId": "783968",
      "patientId": "81553028",
      "fileNo": "F-8928",
      "ipNumber": "IP-2025-828",
      "age": 40,
      "gender": "Male",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-10",
      "admissionTime": "9:00 AM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "2025-11-21",
      "stayDuration": "4 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1748",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Discharged",
      "diagnosis": "Acute Pancreatitis",
      "natureOfDisease": "Inflammatory",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to acute pancreatitis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "59",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Acute Pancreatitis",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-10",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-10",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-10",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_129",
      "fullName": "Radha Karki",
      "ipdId": "783969",
      "patientId": "81553029",
      "fileNo": "F-8929",
      "ipNumber": "IP-2025-829",
      "age": 72,
      "gender": "Female",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-18",
      "admissionTime": "7:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1749",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Urolithiasis (Renal Calculus)",
      "natureOfDisease": "Obstructive",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to urolithiasis (renal calculus) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "64",
      "height": "5.5 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Urolithiasis (Renal Calculus)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-18",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-18",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-18",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_130",
      "fullName": "Umesh Baral",
      "ipdId": "783970",
      "patientId": "81553030",
      "fileNo": "F-8930",
      "ipNumber": "IP-2025-830",
      "age": 54,
      "gender": "Male",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-12",
      "admissionTime": "10:00 AM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1750",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Benign Prostatic Hyperplasia (BPH)",
      "natureOfDisease": "Hyperplastic",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to benign prostatic hyperplasia (bph) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "68",
      "height": "5.5 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Benign Prostatic Hyperplasia (BPH)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-12",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-12",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-12",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_131",
      "fullName": "Kalpana Sharma",
      "ipdId": "783971",
      "patientId": "81553031",
      "fileNo": "F-8931",
      "ipNumber": "IP-2025-831",
      "age": 57,
      "gender": "Female",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-13",
      "admissionTime": "11:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "5 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1751",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "COPD Exacerbation",
      "natureOfDisease": "Respiratory Obstructive",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to copd exacerbation for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "76",
      "height": "5.2 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for COPD Exacerbation",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-13",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-13",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-13",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_132",
      "fullName": "Raju Lama",
      "ipdId": "783972",
      "patientId": "81553032",
      "fileNo": "F-8932",
      "ipNumber": "IP-2025-832",
      "age": 32,
      "gender": "Male",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-18",
      "admissionTime": "8:00 AM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "2025-11-23",
      "stayDuration": "6 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1752",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Discharged",
      "diagnosis": "Hemorrhoids Grade III",
      "natureOfDisease": "Vascular/Anorectal",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to hemorrhoids grade iii for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "71",
      "height": "5.3 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Hemorrhoids Grade III",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-18",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-18",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-18",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_133",
      "fullName": "Nisha Joshi",
      "ipdId": "783973",
      "patientId": "81553033",
      "fileNo": "F-8933",
      "ipNumber": "IP-2025-833",
      "age": 53,
      "gender": "Female",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-17",
      "admissionTime": "9:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1753",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Varicose Veins of Lower Limbs",
      "natureOfDisease": "Vascular",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to varicose veins of lower limbs for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "68",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Varicose Veins of Lower Limbs",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-17",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-17",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-17",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_134",
      "fullName": "Surendra KC",
      "ipdId": "783974",
      "patientId": "81553034",
      "fileNo": "F-8934",
      "ipNumber": "IP-2025-834",
      "age": 32,
      "gender": "Male",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-12",
      "admissionTime": "8:00 AM",
      "dateOfOperation": "2025-11-19",
      "dateOfDischarge": "",
      "stayDuration": "6 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1754",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Thyroid Goiter Multinodular",
      "natureOfDisease": "Endocrine",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to thyroid goiter multinodular for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "79",
      "height": "5.3 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Thyroid Goiter Multinodular",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-12",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-12",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-12",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_135",
      "fullName": "Rita Bhandari",
      "ipdId": "783975",
      "patientId": "81553035",
      "fileNo": "F-8935",
      "ipNumber": "IP-2025-835",
      "age": 58,
      "gender": "Female",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-11",
      "admissionTime": "6:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1755",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Breast Fibroadenoma",
      "natureOfDisease": "Benign Neoplastic",
      "durationOfIllness": "1 months",
      "historyOfPresentIllness": "Patient presented with complaints related to breast fibroadenoma for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "73",
      "height": "5.7 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Breast Fibroadenoma",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-11",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-11",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-11",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_136",
      "fullName": "Ganesh Dahal",
      "ipdId": "783976",
      "patientId": "81553036",
      "fileNo": "F-8936",
      "ipNumber": "IP-2025-836",
      "age": 51,
      "gender": "Male",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-11",
      "admissionTime": "10:00 AM",
      "dateOfOperation": "2025-11-16",
      "dateOfDischarge": "2025-11-25",
      "stayDuration": "7 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1756",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Discharged",
      "diagnosis": "Diabetic Foot Ulcer",
      "natureOfDisease": "Metabolic & Infectious",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to diabetic foot ulcer for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "78",
      "height": "5.7 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Diabetic Foot Ulcer",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-11",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-11",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-11",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_137",
      "fullName": "Sushma Oli",
      "ipdId": "783977",
      "patientId": "81553037",
      "fileNo": "F-8937",
      "ipNumber": "IP-2025-837",
      "age": 69,
      "gender": "Female",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-11",
      "admissionTime": "8:30 PM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1757",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Lobar Pneumonia",
      "natureOfDisease": "Infectious",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to lobar pneumonia for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "73",
      "height": "5.6 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Lobar Pneumonia",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-11",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-11",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-11",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_138",
      "fullName": "Ashok Shrestha",
      "ipdId": "783978",
      "patientId": "81553038",
      "fileNo": "F-8938",
      "ipNumber": "IP-2025-838",
      "age": 26,
      "gender": "Male",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "6:00 AM",
      "dateOfOperation": "",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "ICU / CRITICAL CARE UNIT",
      "roomType": "VENTILATION BED",
      "bedNo": "ICU-4",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Deceased",
      "diagnosis": "Septic Shock secondary to Peritonitis",
      "natureOfDisease": "Severe Infectious",
      "durationOfIllness": "2 months",
      "historyOfPresentIllness": "Patient presented with complaints related to septic shock secondary to peritonitis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "72",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "None",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_139",
      "fullName": "Bina Tamang",
      "ipdId": "783979",
      "patientId": "81553039",
      "fileNo": "F-8939",
      "ipNumber": "IP-2025-839",
      "age": 39,
      "gender": "Female",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "9:30 PM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1759",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Inguinal Hernia",
      "natureOfDisease": "Anatomical defect",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to inguinal hernia for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "69",
      "height": "5.1 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Inguinal Hernia",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_140",
      "fullName": "Santosh Poudel",
      "ipdId": "783980",
      "patientId": "81553040",
      "fileNo": "F-8940",
      "ipNumber": "IP-2025-840",
      "age": 66,
      "gender": "Male",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-11",
      "admissionTime": "7:00 AM",
      "dateOfOperation": "2025-11-15",
      "dateOfDischarge": "2025-11-21",
      "stayDuration": "7 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1760",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Discharged",
      "diagnosis": "Cholecystitis with Cholelithiasis",
      "natureOfDisease": "Calculous Disease",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to cholecystitis with cholelithiasis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "58",
      "height": "5.6 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Cholecystitis with Cholelithiasis",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-11",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-11",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-11",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_141",
      "fullName": "Mamta Thapa",
      "ipdId": "783981",
      "patientId": "81553041",
      "fileNo": "F-8941",
      "ipNumber": "IP-2025-841",
      "age": 63,
      "gender": "Female",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-15",
      "admissionTime": "5:30 PM",
      "dateOfOperation": "2025-11-17",
      "dateOfDischarge": "",
      "stayDuration": "3 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1761",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Acute Pancreatitis",
      "natureOfDisease": "Inflammatory",
      "durationOfIllness": "3 months",
      "historyOfPresentIllness": "Patient presented with complaints related to acute pancreatitis for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "53",
      "height": "5.1 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Acute Pancreatitis",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-15",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-15",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-15",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_142",
      "fullName": "Rajan Koirala",
      "ipdId": "783982",
      "patientId": "81553042",
      "fileNo": "F-8942",
      "ipNumber": "IP-2025-842",
      "age": 40,
      "gender": "Male",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-13",
      "admissionTime": "6:00 AM",
      "dateOfOperation": "2025-11-18",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1762",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Admitted",
      "diagnosis": "Urolithiasis (Renal Calculus)",
      "natureOfDisease": "Obstructive",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to urolithiasis (renal calculus) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "55",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Urolithiasis (Renal Calculus)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-13",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-13",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-13",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_143",
      "fullName": "Sanjana KC",
      "ipdId": "783983",
      "patientId": "81553043",
      "fileNo": "F-8943",
      "ipNumber": "IP-2025-843",
      "age": 61,
      "gender": "Female",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-15",
      "admissionTime": "5:30 PM",
      "dateOfOperation": "2025-11-17",
      "dateOfDischarge": "",
      "stayDuration": "5 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1763",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Benign Prostatic Hyperplasia (BPH)",
      "natureOfDisease": "Hyperplastic",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to benign prostatic hyperplasia (bph) for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "51",
      "height": "5.2 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Benign Prostatic Hyperplasia (BPH)",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-15",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-15",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-15",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_144",
      "fullName": "Prakash Adhikari",
      "ipdId": "783984",
      "patientId": "81553044",
      "fileNo": "F-8944",
      "ipNumber": "IP-2025-844",
      "age": 40,
      "gender": "Male",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-17",
      "admissionTime": "7:00 AM",
      "dateOfOperation": "2025-11-17",
      "dateOfDischarge": "2025-11-23",
      "stayDuration": "5 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1764",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Discharged",
      "diagnosis": "COPD Exacerbation",
      "natureOfDisease": "Respiratory Obstructive",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to copd exacerbation for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "68",
      "height": "5.6 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for COPD Exacerbation",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-17",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-17",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-17",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_145",
      "fullName": "Anita Ghimire",
      "ipdId": "783985",
      "patientId": "81553045",
      "fileNo": "F-8945",
      "ipNumber": "IP-2025-845",
      "age": 20,
      "gender": "Female",
      "address": "Lalitpur, Nepal",
      "dateOfAdmission": "2025-11-11",
      "admissionTime": "10:30 PM",
      "dateOfOperation": "",
      "dateOfDischarge": "",
      "stayDuration": "6 days",
      "postOpStay": "N/A",
      "wardName": "ICU / CRITICAL CARE UNIT",
      "roomType": "VENTILATION BED",
      "bedNo": "ICU-1",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Deceased",
      "diagnosis": "Hemorrhoids Grade III",
      "natureOfDisease": "Vascular/Anorectal",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to hemorrhoids grade iii for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "56",
      "height": "5.7 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "None",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-11",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-11",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-11",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_146",
      "fullName": "Manoj Shrestha",
      "ipdId": "783986",
      "patientId": "81553046",
      "fileNo": "F-8946",
      "ipNumber": "IP-2025-846",
      "age": 46,
      "gender": "Male",
      "address": "Kathmandu, Nepal",
      "dateOfAdmission": "2025-11-16",
      "admissionTime": "11:00 AM",
      "dateOfOperation": "2025-11-19",
      "dateOfDischarge": "",
      "stayDuration": "7 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1766",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Varicose Veins of Lower Limbs",
      "natureOfDisease": "Vascular",
      "durationOfIllness": "5 months",
      "historyOfPresentIllness": "Patient presented with complaints related to varicose veins of lower limbs for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "65",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Varicose Veins of Lower Limbs",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-16",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-16",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-16",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_147",
      "fullName": "Pratima Giri",
      "ipdId": "783987",
      "patientId": "81553047",
      "fileNo": "F-8947",
      "ipNumber": "IP-2025-847",
      "age": 35,
      "gender": "Female",
      "address": "Bhaktapur, Nepal",
      "dateOfAdmission": "2025-11-14",
      "admissionTime": "8:30 PM",
      "dateOfOperation": "2025-11-17",
      "dateOfDischarge": "",
      "stayDuration": "4 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "SINGLE BED CABIN",
      "bedNo": "1767",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Niraj Bam"
      ],
      "status": "Admitted",
      "diagnosis": "Thyroid Goiter Multinodular",
      "natureOfDisease": "Endocrine",
      "durationOfIllness": "6 months",
      "historyOfPresentIllness": "Patient presented with complaints related to thyroid goiter multinodular for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "67",
      "height": "5.8 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Thyroid Goiter Multinodular",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-14",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-14",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-14",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_148",
      "fullName": "Rajesh Hamal",
      "ipdId": "783988",
      "patientId": "81553048",
      "fileNo": "F-8948",
      "ipNumber": "IP-2025-848",
      "age": 53,
      "gender": "Male",
      "address": "Kaski, Nepal",
      "dateOfAdmission": "2025-11-15",
      "admissionTime": "2:00 AM",
      "dateOfOperation": "2025-11-16",
      "dateOfDischarge": "2025-11-23",
      "stayDuration": "3 days",
      "postOpStay": "3 days",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1768",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Susan Giri"
      ],
      "status": "Discharged",
      "diagnosis": "Breast Fibroadenoma",
      "natureOfDisease": "Benign Neoplastic",
      "durationOfIllness": "2 months",
      "historyOfPresentIllness": "Patient presented with complaints related to breast fibroadenoma for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "Hypertension",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "58",
      "height": "5.0 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Breast Fibroadenoma",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-15",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-15",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-15",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  },
  {
      "recordID": "p_gen_149",
      "fullName": "Karishma Manandhar",
      "ipdId": "783989",
      "patientId": "81553049",
      "fileNo": "F-8949",
      "ipNumber": "IP-2025-849",
      "age": 61,
      "gender": "Female",
      "address": "Chitwan, Nepal",
      "dateOfAdmission": "2025-11-15",
      "admissionTime": "3:30 PM",
      "dateOfOperation": "2025-11-19",
      "dateOfDischarge": "",
      "stayDuration": "6 days",
      "postOpStay": "N/A",
      "wardName": "A SURESH WAGLE GENERAL WARD",
      "roomType": "DOUBLE BED CABIN",
      "bedNo": "1769",
      "inchargeDoctor": "Dr. Niraj Bam",
      "additionalDoctors": [
          "Dr. Alok Pradhan"
      ],
      "status": "Admitted",
      "diagnosis": "Diabetic Foot Ulcer",
      "natureOfDisease": "Metabolic & Infectious",
      "durationOfIllness": "4 months",
      "historyOfPresentIllness": "Patient presented with complaints related to diabetic foot ulcer for the past several weeks.",
      "pastHistory": "No major surgical history.",
      "comorbidities": "None",
      "generalExam": "Afebril, systemic examinations normal.",
      "weight": "50",
      "height": "5.0 ft",
      "abdomenExam": "Soft, non-tender on palpation.",
      "otherFindings": "None.",
      "usg": "Normal study.",
      "ctScan": "Not performed.",
      "attachments": [],
      "operation": "Surgical repair for Diabetic Foot Ulcer",
      "operationFindings": "Uneventful surgical margins.",
      "surgeon": "Dr. Niraj Bam",
      "assistant1": "Dr. Susan Giri",
      "assistant2": "",
      "postOpProgress": "Satisfactory post-operative phase.",
      "hpeReport": "Pending",
      "bloodTransfusion": "No",
      "wbPrbcUnits": "0",
      "ffpUnits": "0",
      "prpUnits": "0",
      "complications": [
          "None"
      ],
      "complicationGrade": "I",
      "investigations": [
          {
              "date": "2025-11-15",
              "hb": "13.2",
              "tc": "9400",
              "neu": "70",
              "lym": "22",
              "platelets": "280000",
              "pt": "12.0",
              "inr": "1.00"
          }
      ],
      "followUps": [],
      "vitalsHistory": [
          {
              "date": "2025-11-15",
              "time": "10:00 AM",
              "hr": 80,
              "bpSystolic": 120,
              "bpDiastolic": 80,
              "temp": 36.8,
              "spo2": 98,
              "rr": 16,
              "sugar": 100
          }
      ],
      "vitals": {
          "hr": 80,
          "bp": "120/80",
          "temp": "36.8°C"
      },
      "dailyReports": [
          {
              "date": "2025-11-15",
              "time": "08:00 AM",
              "note": "Clinical Note: Patient stable, comfortable, resting in bed."
          }
      ]
  }
];

const useStore = create(
  persist(
    (set, get) => ({
      apiUrl: DEFAULT_API_URL,
      setApiUrl: (url) => set({ apiUrl: url }),
      isLoggedIn: false,
      token: null,
      userProfile: null,
      contacts: [
        { id: '1', name: 'Dr. Patel', specialty: 'Radiology' },
        { id: '2', name: 'Dr. Sarah Jenkins', specialty: 'Oncology' },
        { id: '3', name: 'Surgical Team Alpha', specialty: 'Emergency' },
      ],
      patients: [],
      chats: {},
      unreadCounts: {},
      chatRooms: [],
      practitioners: [],
      activeChatRoomId: null,
      setActiveChatRoomId: (id) => set({ activeChatRoomId: id }),
      offlineQueue: [],
      isSyncing: false,
      hospitalDetails: null,
      analytics: null,
      upcomingAppointments: [],
      
      login: async (phone, password) => {
        try {
          const res = await api.post('/auth/login', { phone, password });
          set({
            isLoggedIn: true,
            token: res.data.token,
            userProfile: res.data.user,
          });
          await get().fetchPatients();
          return { success: true };
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Login failed.' };
        }
      },

      register: async (userData) => {
        try {
          const res = await api.post('/auth/register', userData);
          set({
            isLoggedIn: true,
            token: res.data.token,
            userProfile: res.data.user,
          });
          await get().fetchPatients();
          return { success: true };
        } catch (error) {
          console.error('Register error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Registration failed.' };
        }
      },

      logout: () => {
        set({
          isLoggedIn: false,
          token: null,
          userProfile: null,
          patients: [],
        });
      },

      fetchPatients: async () => {
        try {
          const res = await api.get('/patients');
          set({ patients: res.data });
        } catch (error) {
          console.error('Fetch patients error:', error.response?.data || error.message);
        }
      },

      fetchChats: async () => {
        try {
          const res = await api.get('/chats');
          set({ chatRooms: res.data });
        } catch (error) {
          console.error('Fetch chats error:', error.response?.data || error.message);
        }
      },

      fetchMessages: async (chatRoomId) => {
        try {
          const res = await api.get(`/chats/${chatRoomId}/messages`);
          const { userProfile, patients } = get();
          set((state) => ({
            chats: {
              ...state.chats,
              [chatRoomId]: res.data.map(msg => ({
                id: msg.id,
                text: msg.text,
                sender: msg.sender.name,
                senderId: msg.senderId,
                isMine: msg.senderId === userProfile?.id,
                sharedRecord: msg.sharedPatientId ? patients.find(p => p.recordID === msg.sharedPatientId) : null,
                imageUri: msg.imageUri,
                createdAt: msg.createdAt
              }))
            }
          }));
        } catch (error) {
          console.error('Fetch messages error:', error.response?.data || error.message);
        }
      },

      createGroupChat: async (name, userIds) => {
        try {
          const res = await api.post('/chats/group', { name, userIds });
          set((state) => ({
            chatRooms: [res.data, ...(state.chatRooms || [])]
          }));
          return { success: true, room: res.data };
        } catch (error) {
          console.error('Create group chat error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to create group.' };
        }
      },

      getOrCreatePatientChat: async (patientId) => {
        try {
          const res = await api.post(`/chats/patient/${patientId}`);
          set((state) => {
            const exists = state.chatRooms.some(r => r.id === res.data.id);
            return {
              chatRooms: exists 
                ? state.chatRooms.map(r => r.id === res.data.id ? res.data : r)
                : [res.data, ...state.chatRooms]
            };
          });
          return { success: true, room: res.data };
        } catch (error) {
          console.error('Get or create patient chat error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to open discussion.' };
        }
      },

      getOrCreateDirectChat: async (userId) => {
        try {
          const res = await api.post('/chats/direct', { userId });
          set((state) => {
            const exists = state.chatRooms.some(r => r.id === res.data.id);
            return {
              chatRooms: exists 
                ? state.chatRooms.map(r => r.id === res.data.id ? res.data : r)
                : [res.data, ...state.chatRooms]
            };
          });
          return { success: true, room: res.data };
        } catch (error) {
          console.error('Get or create direct chat error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to open direct chat.' };
        }
      },

      fetchPractitioners: async () => {
        try {
          const res = await api.get('/chats/practitioners');
          set({ practitioners: res.data });
        } catch (error) {
          console.error('Fetch practitioners error:', error.response?.data || error.message);
        }
      },

      addChatRoom: (room) => set((state) => {
        const exists = (state.chatRooms || []).some(r => r.id === room.id);
        if (exists) return state;
        return {
          chatRooms: [room, ...(state.chatRooms || [])]
        };
      }),

      addRoomMessage: (chatRoomId, message) => set((state) => {
        const thread = state.chats[chatRoomId] || [];
        if (thread.some(m => m.id === message.id)) return state;
        return { 
          chats: {
            ...state.chats,
            [chatRoomId]: [...thread, message]
          }
        };
      }),

      addContact: (contact) => set((state) => ({ 
        contacts: [...state.contacts, contact] 
      })),

      addMessage: (chatId, message) => set((state) => {
        const thread = state.chats[chatId] || [];
        return { 
          chats: {
            ...state.chats,
            [chatId]: [...thread, { ...message, id: Date.now().toString() }]
          }
        };
      }),

      sharePatient: (chatId, patient) => set((state) => {
        const thread = state.chats[chatId] || [];
        const newMessage = {
          id: Date.now().toString(),
          text: '',
          sender: 'Me',
          isMine: true,
          sharedRecord: patient,
        };
        return { 
          chats: {
            ...state.chats,
            [chatId]: [...thread, newMessage]
          }
        };
      }),

      addPatient: async (newPatient) => {
        try {
          const res = await api.post('/patients', newPatient);
          set((state) => ({
            patients: [res.data, ...state.patients]
          }));
          return { success: true, patient: res.data };
        } catch (error) {
          console.error('Add patient error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to add patient.' };
        }
      },

      updatePatient: async (recordID, updatedData) => {
        try {
          const res = await api.put(`/patients/${recordID}`, updatedData);
          set((state) => ({
            patients: state.patients.map((p) => 
              p.recordID === recordID ? res.data : p
            )
          }));
          return { success: true };
        } catch (error) {
          console.error('Update patient error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to update patient.' };
        }
      },

      addVitals: async (recordID, vitalEntry) => {
        try {
          const res = await api.post(`/patients/${recordID}/vitals`, vitalEntry);
          set((state) => ({
            patients: state.patients.map((p) => {
              if (p.recordID === recordID) {
                const newHistory = [...(p.vitalsHistory || []), res.data];
                return {
                  ...p,
                  vitalsHistory: newHistory,
                  vitals: { 
                    hr: res.data.hr, 
                    bp: `${res.data.bpSystolic}/${res.data.bpDiastolic}`, 
                    temp: `${res.data.temp}°C` 
                  }
                };
              }
              return p;
            })
          }));
          get().syncOfflineQueue();
          return { success: true };
        } catch (error) {
          console.error('Add vitals error:', error.response?.data || error.message);
          
          if (!error.response && (error.request || error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
            const tempId = 'temp_v_' + Date.now() + '_' + Math.round(Math.random() * 1000);
            const localEntry = {
              id: tempId,
              patientId: recordID,
              date: vitalEntry.date,
              time: vitalEntry.time,
              hr: parseInt(vitalEntry.hr) || 0,
              bpSystolic: parseInt(vitalEntry.bpSystolic) || 0,
              bpDiastolic: parseInt(vitalEntry.bpDiastolic) || 0,
              temp: parseFloat(vitalEntry.temp) || 0.0,
              spo2: parseInt(vitalEntry.spo2) || 0,
              rr: parseInt(vitalEntry.rr) || 0,
              sugar: parseInt(vitalEntry.sugar) || 0,
              recordedBy: get().userProfile?.name || 'Offline User',
              createdAt: new Date().toISOString(),
              isOffline: true
            };
            
            set((state) => ({
              patients: state.patients.map((p) => {
                if (p.recordID === recordID) {
                  const newHistory = [...(p.vitalsHistory || []), localEntry];
                  return {
                    ...p,
                    vitalsHistory: newHistory,
                    vitals: { 
                      hr: localEntry.hr, 
                      bp: `${localEntry.bpSystolic}/${localEntry.bpDiastolic}`, 
                      temp: `${localEntry.temp}°C` 
                    }
                  };
                }
                return p;
              }),
              offlineQueue: [...(state.offlineQueue || []), {
                id: 'task_' + Date.now() + '_' + Math.round(Math.random() * 1000),
                type: 'VITALS',
                patientId: recordID,
                tempId: tempId,
                data: vitalEntry
              }]
            }));
            return { success: true, offline: true };
          }
          return { success: false, error: error.response?.data?.error || 'Failed to add vitals.' };
        }
      },

      changePatientStatus: async (recordID, newStatus) => {
        try {
          const res = await api.put(`/patients/${recordID}/status`, { status: newStatus });
          set((state) => ({
            patients: state.patients.map((p) => 
              p.recordID === recordID ? { ...p, status: res.data.status } : p
            )
          }));
        } catch (error) {
          console.error('Change status error:', error.response?.data || error.message);
        }
      },

      addMedication: async (recordID, medication) => {
        try {
          const res = await api.post(`/patients/${recordID}/medications`, medication);
          set((state) => ({
            patients: state.patients.map((p) =>
              p.recordID === recordID
                ? { ...p, medications: [...(p.medications || []), res.data] }
                : p
            )
          }));
          return { success: true, medication: res.data };
        } catch (error) {
          console.error('Add medication error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to add medication.' };
        }
      },

      removeMedication: async (recordID, medicationId) => {
        try {
          await api.delete(`/patients/${recordID}/medications/${medicationId}`);
          set((state) => ({
            patients: state.patients.map((p) =>
              p.recordID === recordID
                ? { ...p, medications: (p.medications || []).filter(m => m.id !== medicationId) }
                : p
            )
          }));
          return { success: true };
        } catch (error) {
          console.error('Remove medication error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to remove medication.' };
        }
      },

      updateMedicationStatus: async (recordID, medicationId, status) => {
        try {
          const res = await api.put(`/patients/${recordID}/medications/${medicationId}`, { status });
          set((state) => ({
            patients: state.patients.map((p) =>
              p.recordID === recordID
                ? { ...p, medications: (p.medications || []).map(m => m.id === medicationId ? res.data : m) }
                : p
            )
          }));
          return { success: true };
        } catch (error) {
          console.error('Update medication status error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to update medication.' };
        }
      },

      removeContact: (contactId) => set((state) => ({
        contacts: state.contacts.filter(c => c.id !== contactId)
      })),

      incrementUnread: (chatId) => set((state) => ({
        unreadCounts: { ...state.unreadCounts, [chatId]: (state.unreadCounts[chatId] || 0) + 1 }
      })),

      resetUnread: (chatId) => set((state) => ({
        unreadCounts: { ...state.unreadCounts, [chatId]: 0 }
      })),

      // Discharge Summary actions
      generateDischarge: async (recordID, followUpInstructions) => {
        try {
          const res = await api.post(`/patients/${recordID}/discharge`, { followUpInstructions });
          return { success: true, summary: res.data };
        } catch (error) {
          console.error('Generate discharge error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to generate discharge summary.' };
        }
      },

      fetchDischarge: async (recordID) => {
        try {
          const res = await api.get(`/patients/${recordID}/discharge`);
          return { success: true, summaries: res.data };
        } catch (error) {
          console.error('Fetch discharge error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to fetch discharge summaries.' };
        }
      },

      // Audit Log actions
      fetchAuditLogs: async (filters) => {
        try {
          const params = new URLSearchParams();
          if (filters?.patientId) params.append('patientId', filters.patientId);
          if (filters?.userId) params.append('userId', filters.userId);
          if (filters?.action) params.append('action', filters.action);
          if (filters?.limit) params.append('limit', filters.limit);
          const res = await api.get(`/audit?${params.toString()}`);
          return { success: true, logs: res.data };
        } catch (error) {
          console.error('Fetch audit logs error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to fetch audit logs.' };
        }
      },

      addProgressReport: async (recordID, report) => {
        try {
          const res = await api.post(`/patients/${recordID}/notes`, report);
          set((state) => ({
            patients: state.patients.map((p) => 
              p.recordID === recordID 
                ? { ...p, dailyReports: [...(p.dailyReports || []), res.data] } 
                : p
            )
          }));
          get().syncOfflineQueue();
          return { success: true };
        } catch (error) {
          console.error('Add progress report error:', error.response?.data || error.message);
          
          if (!error.response && (error.request || error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
            const tempId = 'temp_n_' + Date.now() + '_' + Math.round(Math.random() * 1000);
            const localNote = {
              id: tempId,
              patientId: recordID,
              date: report.date,
              time: report.time,
              note: report.note,
              author: get().userProfile?.name || 'Offline User',
              role: get().userProfile?.role || 'DOCTOR',
              createdAt: new Date().toISOString(),
              isOffline: true
            };
            
            set((state) => ({
              patients: state.patients.map((p) => 
                p.recordID === recordID 
                  ? { ...p, dailyReports: [...(p.dailyReports || []), localNote] } 
                  : p
              ),
              offlineQueue: [...(state.offlineQueue || []), {
                id: 'task_' + Date.now() + '_' + Math.round(Math.random() * 1000),
                type: 'PROGRESS_NOTE',
                patientId: recordID,
                tempId: tempId,
                data: report
              }]
            }));
            return { success: true, offline: true };
          }
          return { success: false, error: error.response?.data?.error || 'Failed to add progress report.' };
        }
      },

      addLabReport: async (recordID, labEntry) => {
        try {
          const res = await api.post(`/patients/${recordID}/labs`, labEntry);
          set((state) => ({
            patients: state.patients.map((p) => 
              p.recordID === recordID 
                ? { ...p, investigations: [...(p.investigations || []), res.data] } 
                : p
            )
          }));
        } catch (error) {
          console.error('Add lab report error:', error.response?.data || error.message);
        }
      },

      // Phase 4: Analytics
      fetchAnalytics: async () => {
        try {
          const res = await api.get('/analytics');
          set({ analytics: res.data });
          return { success: true, data: res.data };
        } catch (error) {
          console.error('Fetch analytics error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to fetch analytics.' };
        }
      },

      // Phase 4: Hospital Details
      updateHospitalDetails: async (details) => {
        try {
          const res = await api.put('/hospital', details);
          set({ hospitalDetails: res.data });
          // Force refetch analytics to update calculations based on new bed capacity
          await get().fetchAnalytics();
          return { success: true, hospital: res.data };
        } catch (error) {
          console.error('Update hospital details error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to update hospital details.' };
        }
      },

      // Phase 4: OPD Appointments
      scheduleAppointment: async (recordID, appointment) => {
        try {
          const res = await api.post(`/patients/${recordID}/appointments`, appointment);
          set((state) => ({
            patients: state.patients.map((p) =>
              p.recordID === recordID
                ? { ...p, appointments: [res.data, ...(p.appointments || [])] }
                : p
            )
          }));
          await get().fetchUpcomingAppointments();
          return { success: true, appointment: res.data };
        } catch (error) {
          console.error('Schedule appointment error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to schedule appointment.' };
        }
      },

      fetchUpcomingAppointments: async () => {
        try {
          const res = await api.get('/patients/appointments/upcoming');
          set({ upcomingAppointments: res.data });
        } catch (error) {
          console.error('Fetch upcoming appointments error:', error.response?.data || error.message);
        }
      },

      updateAppointmentStatus: async (appointmentId, status) => {
        try {
          const res = await api.put(`/patients/appointments/${appointmentId}/status`, { status });
          set((state) => ({
            upcomingAppointments: state.upcomingAppointments.map(app => 
              app.id === appointmentId ? { ...app, status: res.data.status } : app
            ),
            patients: state.patients.map(p => {
              if (p.appointments && p.appointments.some(app => app.id === appointmentId)) {
                return {
                  ...p,
                  appointments: p.appointments.map(app => 
                    app.id === appointmentId ? { ...app, status: res.data.status } : app
                  )
                };
              }
              return p;
            })
          }));
          return { success: true };
        } catch (error) {
          console.error('Update appointment status error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to update status.' };
        }
      },

      fetchPatientAppointments: async (recordID) => {
        try {
          const res = await api.get(`/patients/${recordID}/appointments`);
          set((state) => ({
            patients: state.patients.map(p => 
              p.recordID === recordID ? { ...p, appointments: res.data } : p
            )
          }));
        } catch (error) {
          console.error('Fetch patient appointments error:', error.response?.data || error.message);
        }
      },

      // Phase 4: MAR Medication Administrations
      administerMedication: async (recordID, medId, administration) => {
        try {
          const res = await api.post(`/patients/${recordID}/medications/${medId}/administer`, administration);
          set((state) => ({
            patients: state.patients.map(p => {
              if (p.recordID === recordID) {
                const updatedMeds = (p.medications || []).map(m => {
                  if (m.id === medId) {
                    return {
                      ...m,
                      administrations: [res.data, ...(m.administrations || [])]
                    };
                  }
                  return m;
                });
                return { ...p, medications: updatedMeds };
              }
              return p;
            })
          }));
          return { success: true, administration: res.data };
        } catch (error) {
          console.error('Administer medication error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to record administration.' };
        }
      },

      fetchMedicationAdministrations: async (recordID, medId) => {
        try {
          const res = await api.get(`/patients/${recordID}/medications/${medId}/administer`);
          set((state) => ({
            patients: state.patients.map(p => {
              if (p.recordID === recordID) {
                const updatedMeds = (p.medications || []).map(m => {
                  if (m.id === medId) {
                    return { ...m, administrations: res.data };
                  }
                  return m;
                });
                return { ...p, medications: updatedMeds };
              }
              return p;
            })
          }));
        } catch (error) {
          console.error('Fetch MAR logs error:', error.response?.data || error.message);
        }
      },

      // Phase 4: Shift Handovers
      addShiftHandover: async (recordID, handover) => {
        try {
          const res = await api.post(`/patients/${recordID}/handovers`, handover);
          set((state) => ({
            patients: state.patients.map(p => 
              p.recordID === recordID 
                ? { ...p, shiftHandovers: [res.data, ...(p.shiftHandovers || [])] } 
                : p
            )
          }));
          return { success: true, handover: res.data };
        } catch (error) {
          console.error('Add handover error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to record shift handover.' };
        }
      },

      fetchShiftHandovers: async (recordID) => {
        try {
          const res = await api.get(`/patients/${recordID}/handovers`);
          set((state) => ({
            patients: state.patients.map(p => 
              p.recordID === recordID ? { ...p, shiftHandovers: res.data } : p
            )
          }));
        } catch (error) {
          console.error('Fetch handovers error:', error.response?.data || error.message);
        }
      },

      // Phase 4: Nursing Care Plans
      addCarePlan: async (recordID, carePlan) => {
        try {
          const res = await api.post(`/patients/${recordID}/careplans`, carePlan);
          set((state) => ({
            patients: state.patients.map(p => 
              p.recordID === recordID 
                ? { ...p, carePlans: [res.data, ...(p.carePlans || [])] } 
                : p
            )
          }));
          return { success: true, carePlan: res.data };
        } catch (error) {
          console.error('Add care plan error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to create care plan.' };
        }
      },

      updateCarePlan: async (recordID, carePlanId, evaluation) => {
        try {
          const res = await api.put(`/patients/${recordID}/careplans/${carePlanId}`, { evaluation });
          set((state) => ({
            patients: state.patients.map(p => {
              if (p.recordID === recordID) {
                return {
                  ...p,
                  carePlans: (p.carePlans || []).map(cp => 
                    cp.id === carePlanId ? res.data : cp
                  )
                };
              }
              return p;
            })
          }));
          return { success: true, carePlan: res.data };
        } catch (error) {
          console.error('Update care plan error:', error.response?.data || error.message);
          return { success: false, error: error.response?.data?.error || 'Failed to update care plan.' };
        }
      },

      fetchCarePlans: async (recordID) => {
        try {
          const res = await api.get(`/patients/${recordID}/careplans`);
          set((state) => ({
            patients: state.patients.map(p => 
              p.recordID === recordID ? { ...p, carePlans: res.data } : p
            )
          }));
        } catch (error) {
          console.error('Fetch care plans error:', error.response?.data || error.message);
        }
      },

      syncOfflineQueue: async () => {
        const queue = get().offlineQueue || [];
        if (queue.length === 0) return;
        
        if (get().isSyncing) return;
        set({ isSyncing: true });
        
        console.log(`Starting synchronization of ${queue.length} offline EMR tasks...`);
        
        let successCount = 0;
        const remainingQueue = [...queue];
        
        for (const task of queue) {
          try {
            if (task.type === 'VITALS') {
              const res = await api.post(`/patients/${task.patientId}/vitals`, task.data);
              set((state) => ({
                patients: state.patients.map((p) => {
                  if (p.recordID === task.patientId) {
                    const updatedHistory = (p.vitalsHistory || []).map((v) => 
                      v.id === task.tempId ? { ...res.data, isOffline: false } : v
                    );
                    return {
                      ...p,
                      vitalsHistory: updatedHistory,
                      vitals: p.vitalsHistory?.find(v => v.id === task.tempId) 
                        ? { hr: res.data.hr, bp: `${res.data.bpSystolic}/${res.data.bpDiastolic}`, temp: `${res.data.temp}°C` }
                        : p.vitals
                    };
                  }
                  return p;
                })
              }));
              successCount++;
              remainingQueue.shift();
            } else if (task.type === 'PROGRESS_NOTE') {
              const res = await api.post(`/patients/${task.patientId}/notes`, task.data);
              set((state) => ({
                patients: state.patients.map((p) => {
                  if (p.recordID === task.patientId) {
                    const updatedReports = (p.dailyReports || []).map((n) => 
                      n.id === task.tempId ? { ...res.data, isOffline: false } : n
                    );
                    return {
                      ...p,
                      dailyReports: updatedReports
                    };
                  }
                  return p;
                })
              }));
              successCount++;
              remainingQueue.shift();
            }
          } catch (error) {
            console.error(`Sync failed for task ${task.id} (${task.type}):`, error.message);
            if (!error.response && (error.request || error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
              console.log('Network remains offline. Postponing sync.');
              break;
            } else {
              console.log('Discarding corrupted/rejected offline task.');
              remainingQueue.shift();
            }
          }
        }
        
        set({ 
          offlineQueue: remainingQueue,
          isSyncing: false 
        });
        
        console.log(`Offline sync finished. Successfully synced ${successCount} tasks. Remaining: ${remainingQueue.length}`);
      },
    }),
    {
      name: 'doctor-saap-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        apiUrl: state.apiUrl,
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        userProfile: state.userProfile,
        contacts: state.contacts,
        patients: state.patients,
        chats: state.chats,
        unreadCounts: state.unreadCounts,
        chatRooms: state.chatRooms,
        practitioners: state.practitioners,
        offlineQueue: state.offlineQueue,
        hospitalDetails: state.hospitalDetails,
        analytics: state.analytics,
        upcomingAppointments: state.upcomingAppointments,
      }),
      version: 1,
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        return {
          ...currentState,
          ...persistedState,
        };
      },
    }
  )
);

export default useStore;

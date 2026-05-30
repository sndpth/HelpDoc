const fs = require('fs');

const filePath = 'c:/Users/ASUS/DoctorSaap/backend/src/utils/demoData.js';
let content = fs.readFileSync(filePath, 'utf8');

// We want to find occurrences of:
// ipdId: '...',
// patientId: '...',
// fileNo: '...',
// ipNumber: '...',
// and replace them with:
// ipid: 'patientId_value',

const regex = /ipdId:\s*'([^']*)',\s*patientId:\s*'([^']*)',\s*fileNo:\s*'([^']*)',\s*ipNumber:\s*'([^']*)',/g;

let count = 0;
content = content.replace(regex, (match, ipdId, patientId, fileNo, ipNumber) => {
  count++;
  return `ipid: '${patientId}',`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully updated ${count} records in demoData.js.`);

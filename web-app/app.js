// --- Data & Storage Logic ---
const STORAGE_KEY = 'doctorSaap_patients';

function getPatients() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function savePatient(patientData) {
    const patients = getPatients();
    if (patientData.id) {
        // Update existing
        const idx = patients.findIndex(p => p.id === patientData.id);
        if (idx !== -1) {
            patients[idx] = patientData;
        } else {
            patients.push(patientData);
        }
    } else {
        // Create new
        patientData.id = 'pat_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        patients.push(patientData);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    return patientData;
}

function deletePatient(id) {
    let patients = getPatients();
    patients = patients.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

// Generate some mock data if empty
if (getPatients().length === 0) {
    savePatient({
        id: 'mock_1', fullName: 'John Doe', ipNumber: 'IP-2023-001', age: 45, gender: 'Male',
        address: '123 Main St', diagnosis: 'Acute Appendicitis', natureOfDisease: 'Benign',
        historyOfPresentIllness: 'Severe abdominal pain for 2 days.',
        operationName: 'Laparoscopic Appendectomy'
    });
    savePatient({
        id: 'mock_2', fullName: 'Jane Smith', ipNumber: 'IP-2023-002', age: 38, gender: 'Female',
        diagnosis: 'Cholelithiasis', natureOfDisease: 'Benign',
        dateOfAdmission: '10-05-2023',
        usgFindings: 'Multiple gallstones noted.'
    });
}

// --- App Logic ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    function switchView(viewId) {
        navItems.forEach(item => {
            if(item.dataset.view === viewId) item.classList.add('active');
            else item.classList.remove('active');
        });
        views.forEach(view => {
            if(view.id === viewId) view.classList.remove('hidden');
            else view.classList.add('hidden');
        });

        if (viewId === 'patients-list-view') renderPatientsList();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => switchView(item.dataset.view));
    });

    // --- Form Tabs ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // --- Patients List View ---
    const patientsGrid = document.getElementById('patients-grid');
    const searchInput = document.getElementById('patient-search');

    function renderPatientsList(filter = '') {
        const patients = getPatients();
        patientsGrid.innerHTML = '';
        
        const filtered = patients.filter(p => 
            p.fullName.toLowerCase().includes(filter.toLowerCase()) || 
            p.ipNumber.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            patientsGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No patients found.</p>';
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'patient-card';
            card.innerHTML = `
                <div class="pc-header">
                    <div>
                        <h3>${p.fullName}</h3>
                        <p>${p.age ? p.age + ' yrs, ' : ''}${p.gender || ''}</p>
                    </div>
                    <span class="pc-badge">${p.ipNumber}</span>
                </div>
                <div class="pc-details">
                    <div><i class="ri-stethoscope-line"></i> <span>${p.diagnosis || 'No diagnosis'}</span></div>
                    <div><i class="ri-calendar-line"></i> <span>Admitted: ${p.dateOfAdmission || 'N/A'}</span></div>
                </div>
            `;
            card.addEventListener('click', () => openPatientForm(p));
            patientsGrid.appendChild(card);
        });
    }

    searchInput.addEventListener('input', (e) => renderPatientsList(e.target.value));

    // --- Patient Form View ---
    const formView = document.getElementById('patient-form-view');
    const formTitle = document.getElementById('form-title');
    const patientForm = document.getElementById('patient-form');
    let currentEditingId = null;

    document.getElementById('add-patient-btn').addEventListener('click', () => {
        openPatientForm(null);
    });

    document.getElementById('back-to-patients-btn').addEventListener('click', () => {
        switchView('patients-list-view');
    });

    // All form inputs
    const inputs = ['fullName', 'ipNumber', 'age', 'gender', 'address', 'dateOfAdmission', 'dateOfOperation', 'dateOfDischarge', 'diagnosis', 'natureOfDisease', 'durationOfIllness', 'historyOfPresentIllness', 'pastHistory', 'comorbidConditions', 'generalExam', 'weightKg', 'heightM', 'abdomenExamination', 'otherRelevantFindings', 'usgFindings', 'ctScanFindings', 'operationName', 'surgeonName', 'operationFindings', 'postOpProgress', 'hpeReport', 'bloodTransfusion', 'unitsWB_PRBC', 'unitsFFP', 'unitsPRP', 'complication1', 'complication2', 'complication3', 'complicationGrade'];

    function openPatientForm(patientData) {
        views.forEach(v => v.classList.add('hidden'));
        formView.classList.remove('hidden');
        navItems.forEach(item => item.classList.remove('active'));

        patientForm.reset();
        
        const saveBtn = document.getElementById('save-patient-btn');
        const editBtn = document.getElementById('edit-patient-btn');
        const delBtn = document.getElementById('delete-patient-btn');

        if (patientData) {
            currentEditingId = patientData.id;
            formTitle.textContent = 'Patient Details';
            
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if(el && patientData[id] !== undefined) {
                    el.value = patientData[id];
                }
            });

            setFormInteractivity(false);
            saveBtn.style.display = 'none';
            editBtn.style.display = 'flex';
            delBtn.style.display = 'flex';
        } else {
            currentEditingId = null;
            formTitle.textContent = 'New Patient Record';
            setFormInteractivity(true);
            saveBtn.style.display = 'flex';
            editBtn.style.display = 'none';
            delBtn.style.display = 'none';
        }
        
        // reset to first tab
        tabBtns[0].click();
    }

    function setFormInteractivity(isEditable) {
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.disabled = !isEditable;
                if(!isEditable) {
                    el.style.backgroundColor = 'transparent';
                    el.style.borderColor = 'transparent';
                    el.style.appearance = 'none';
                    el.style.boxShadow = 'none';
                } else {
                    el.style.backgroundColor = '#ffffff';
                    el.style.borderColor = '#ced4da';
                    el.style.appearance = 'auto';
                    el.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.06)';
                }
            }
        });
    }

    document.getElementById('edit-patient-btn').addEventListener('click', () => {
        setFormInteractivity(true);
        document.getElementById('edit-patient-btn').style.display = 'none';
        document.getElementById('save-patient-btn').style.display = 'flex';
    });

    document.getElementById('save-patient-btn').addEventListener('click', () => {
        if (!document.getElementById('fullName').value || !document.getElementById('ipNumber').value) {
            alert('Full Name and IP Number are required.');
            return;
        }

        const data = {};
        if (currentEditingId) data.id = currentEditingId;

        inputs.forEach(id => {
            const el = document.getElementById(id);
            if(el) data[id] = el.value;
        });

        savePatient(data);
        switchView('patients-list-view');
    });

    document.getElementById('delete-patient-btn').addEventListener('click', () => {
        if(confirm('Are you sure you want to delete this record?')) {
            deletePatient(currentEditingId);
            switchView('patients-list-view');
        }
    });

    // --- Chat Interface ---
    const attachBtn = document.getElementById('attach-record-btn');
    const attachmentPopup = document.getElementById('attachment-popup');
    const sharePatientList = document.getElementById('share-patient-list');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMsgBtn = document.getElementById('send-msg-btn');
    const recordModal = document.getElementById('record-modal');

    attachBtn.addEventListener('click', () => {
        attachmentPopup.classList.toggle('hidden');
        if (!attachmentPopup.classList.contains('hidden')) {
            populateShareList();
        }
    });

    document.querySelector('.close-popup-btn').addEventListener('click', () => {
        attachmentPopup.classList.add('hidden');
    });

    function populateShareList() {
        const patients = getPatients();
        sharePatientList.innerHTML = '';
        if(patients.length === 0) {
            sharePatientList.innerHTML = '<p style="padding:10px; color:#888; font-size:13px;">No patients available</p>';
            return;
        }

        patients.forEach(p => {
            const item = document.createElement('div');
            item.className = 'share-item';
            item.innerHTML = `<h5>${p.fullName}</h5><p>${p.ipNumber} • ${p.diagnosis || 'No Dx'}</p>`;
            item.addEventListener('click', () => {
                sendPatientCard(p);
                attachmentPopup.classList.add('hidden');
            });
            sharePatientList.appendChild(item);
        });
    }

    function sendPatientCard(patient) {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message sent';
        
        // Store stringified JSON in a data attribute to view later
        const patientDataStr = encodeURIComponent(JSON.stringify(patient));

        msgDiv.innerHTML = `
            <div class="msg-bubble" style="background:transparent; padding:0; box-shadow:none;">
                <div class="record-card" data-patient="${patientDataStr}">
                    <div class="record-card-header">
                        <i class="ri-folder-user-fill"></i>
                        Patient Record Shared
                    </div>
                    <div class="record-card-details">
                        <p><strong>Name:</strong> ${patient.fullName}</p>
                        <p><strong>IP No:</strong> ${patient.ipNumber}</p>
                        <p><strong>Diagnosis:</strong> ${patient.diagnosis || 'N/A'}</p>
                    </div>
                    <button class="btn primary" style="padding: 8px; font-size:12px; justify-content:center;">View Details</button>
                </div>
            </div>
            <span class="msg-time">${time}</span>
        `;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add click listener to the newly created card
        msgDiv.querySelector('.record-card').addEventListener('click', function() {
            const data = JSON.parse(decodeURIComponent(this.getAttribute('data-patient')));
            viewSharedRecord(data);
        });
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;

        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message sent';
        msgDiv.innerHTML = `
            <div class="msg-bubble">${text}</div>
            <span class="msg-time">${time}</span>
        `;
        
        chatMessages.appendChild(msgDiv);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate reply
        setTimeout(() => {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'message received';
            replyDiv.innerHTML = `
                <div class="msg-bubble">I will look into it shortly.</div>
                <span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            `;
            chatMessages.appendChild(replyDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
    }

    sendMsgBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendMessage();
    });

    // --- Record Modal Viewer ---
    function viewSharedRecord(patient) {
        recordModal.classList.remove('hidden');
        const body = document.getElementById('record-modal-body');
        
        body.innerHTML = `
            <div class="record-detail-group">
                <h4>Demographics</h4>
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">Name</span><span class="value">${patient.fullName}</span></div>
                    <div class="detail-item"><span class="label">IP Number</span><span class="value">${patient.ipNumber}</span></div>
                    <div class="detail-item"><span class="label">Age/Gender</span><span class="value">${patient.age || '-'} / ${patient.gender || '-'}</span></div>
                    <div class="detail-item"><span class="label">Diagnosis</span><span class="value">${patient.diagnosis || '-'}</span></div>
                </div>
            </div>
            
            <div class="record-detail-group">
                <h4>History & Exam</h4>
                <div class="detail-grid">
                    <div class="detail-item" style="grid-column: 1/-1"><span class="label">History of Present Illness</span><span class="value">${patient.historyOfPresentIllness || '-'}</span></div>
                    <div class="detail-item"><span class="label">Nature of Disease</span><span class="value">${patient.natureOfDisease || '-'}</span></div>
                    <div class="detail-item"><span class="label">Comorbidities</span><span class="value">${patient.comorbidConditions || '-'}</span></div>
                </div>
            </div>

            <div class="record-detail-group">
                <h4>Surgery Details</h4>
                <div class="detail-grid">
                    <div class="detail-item" style="grid-column: 1/-1"><span class="label">Operation</span><span class="value">${patient.operationName || '-'}</span></div>
                    <div class="detail-item" style="grid-column: 1/-1"><span class="label">Findings</span><span class="value">${patient.operationFindings || '-'}</span></div>
                </div>
            </div>
        `;
    }

    document.querySelector('.close-modal-btn').addEventListener('click', () => {
        recordModal.classList.add('hidden');
    });

});

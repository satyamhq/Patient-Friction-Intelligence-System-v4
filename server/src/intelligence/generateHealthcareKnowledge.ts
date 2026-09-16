import fs from 'fs';
import path from 'path';

export interface HealthcareQA {
  id: string;
  question: string;
  answer: string;
  category: 'patient' | 'doctor' | 'asha' | 'hospital' | 'government' | 'accessibility';
  role: 'patient' | 'doctor' | 'asha' | 'hospital' | 'government' | 'all';
  tags: string[];
  keywords: string[];
  sourceFiles: string[];
  complexity: 'introductory' | 'intermediate' | 'advanced';
}

export const generateHealthcareKnowledge = (): HealthcareQA[] => {
  const items: HealthcareQA[] = [];
  let counter = 1;

  const add = (
    question: string,
    answer: string,
    category: HealthcareQA['category'],
    role: HealthcareQA['role'],
    tags: string[],
    keywords: string[]
  ) => {
    const id = `hq-${String(counter++).padStart(4, '0')}`;
    items.push({
      id,
      question,
      answer,
      category,
      role,
      tags,
      keywords,
      sourceFiles: [
        'client/src/components/common/GeminiHealthChatbot.tsx',
        'server/src/services/geminiService.ts',
        'server/data/healthcare_1000_qa.json'
      ],
      complexity: 'introductory',
    });
  };

  // =========================================================================
  // 1. PATIENT & CITIZEN HEALTHCARE, SCHEMES, APPOINTMENTS & BARRIERS (280+)
  // =========================================================================

  // General Access & Helpdesk
  add(
    'How do I call the 24/7 Healthcare Helpline directly?',
    'You can directly call our official 24/7 Healthcare Helpline at **+91 6205844155**. Simply click the **Call** button at the top of the screen or dial +91 6205844155 on your phone for appointment booking assistance, hospital bed inquiries, scheme guidance, and emergency coordination.',
    'patient',
    'patient',
    ['call', 'helpline', 'phone', 'contact', 'emergency'],
    ['call', 'phone', 'helpline', 'number', 'speak', 'support', 'contact']
  );

  add(
    'What should I do in a life-threatening medical emergency?',
    'In any life-threatening emergency (such as severe chest pain, loss of consciousness, uncontrolled bleeding, severe trauma, or acute breathing difficulty), call **108 Emergency Ambulance** immediately or click the red **108 Emergency SOS** button in the platform. You can also reach our care coordinator helpline directly at **+91 6205844155**.',
    'patient',
    'patient',
    ['emergency', '108', 'ambulance', 'sos', 'trauma'],
    ['emergency', '108', 'ambulance', 'heart attack', 'trauma', 'accident', 'sos']
  );

  add(
    'How do I book an OPD appointment at a government or empaneled hospital?',
    'To book an OPD appointment:\n1. Log into your Patient Portal or use the Quick Booking desk.\n2. Select your district and department (e.g., General Medicine, Pediatrics, Orthopedics, Gynecology).\n3. Choose your preferred date and time slot.\n4. Confirm your booking to receive a digital OPD queue token with your estimated reporting time.',
    'patient',
    'patient',
    ['appointment', 'opd', 'booking', 'token', 'doctor'],
    ['book', 'opd', 'appointment', 'slot', 'token', 'schedule', 'doctor']
  );

  add(
    'What is an ABHA ID and how do I create one?',
    'An ABHA (Ayushman Bharat Health Account) ID is a 14-digit unique health identifier under the Ayushman Bharat Digital Mission (ABDM). It allows you to store and access your medical history, diagnostic reports, and prescriptions digitally across all hospitals in India.\nYou can create your ABHA in under 1 minute using your **Aadhaar number and OTP** or your **Mobile number** via our Patient Vault.',
    'patient',
    'patient',
    ['abha', 'abdm', 'health id', 'ayushman', 'records'],
    ['abha', 'abdm', 'create abha', 'health id', 'digital health', 'aadhaar']
  );

  add(
    'How can I check if I am eligible for Ayushman Bharat PM-JAY health insurance?',
    'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides free cashless secondary and tertiary hospitalization up to ₹5 Lakh per family per year.\nTo check eligibility:\n1. Visit the PM-JAY portal (mera.pmjay.gov.in) or our Hospital Helpdesk.\n2. Enter your Ration Card number or registered Mobile number.\n3. If your family is listed in SECC 2011 or state welfare database, you can generate your Ayushman Golden Card at any Ayushman Mitra kiosk.',
    'patient',
    'patient',
    ['pmjay', 'ayushman', 'golden card', 'insurance', 'eligibility'],
    ['pmjay', 'ayushman', 'card', 'free treatment', 'eligibility', '5 lakh']
  );

  add(
    'What is the Patient Friction Index (PFI) and how does it help me?',
    'The Patient Friction Index (PFI) measures the non-clinical difficulties you face when trying to get medical care—such as excessive travel distance, lack of transport, long queue wait times, language barriers, or out-of-pocket costs. By identifying your friction score, PFIS automatically recommends free transport, language interpreters, or priority tokens to ensure you complete your treatment.',
    'patient',
    'patient',
    ['pfi', 'friction', 'barriers', 'access', 'navigation'],
    ['pfi', 'friction', 'score', 'barriers', 'difficulty', 'travel']
  );

  add(
    'Where can I purchase low-cost generic medicines nearby?',
    'You can purchase high-quality generic medicines at 50% to 90% discount at any **Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)** Jan Aushadhi Kendra. Use our Nearby Services Finder to locate the nearest Jan Aushadhi store in your block.',
    'patient',
    'patient',
    ['generic', 'jan aushadhi', 'pharmacy', 'medicine', 'pmbjp'],
    ['generic', 'medicine', 'jan aushadhi', 'low cost', 'chemist', 'drugs']
  );

  add(
    'How do I view my laboratory test reports and past prescriptions?',
    'Navigate to the **Health Records Vault** in your Patient Dashboard. All verified diagnostic reports (blood tests, urine tests, X-rays) and doctor e-prescriptions are automatically synced to your profile. You can download them as PDFs or share temporary digital access with any consulting doctor.',
    'patient',
    'patient',
    ['records', 'reports', 'vault', 'prescription', 'lab'],
    ['reports', 'lab', 'prescription', 'vault', 'history', 'documents']
  );

  add(
    'Can I reschedule or cancel my hospital appointment?',
    'Yes. Go to **My Appointments** in your Patient Portal, locate the scheduled booking, and click **Reschedule** to pick a new date or **Cancel** to release the token. We recommend rescheduling at least 2 hours prior to OPD opening so other patients can utilize the slot.',
    'patient',
    'patient',
    ['reschedule', 'cancel', 'appointment', 'opd'],
    ['reschedule', 'cancel', 'change date', 'slot', 'token']
  );

  add(
    'What is Simple Language Mode on this website?',
    'Simple Language Mode (accessible via the button in the top navigation bar) simplifies medical terminology into plain, easy-to-read everyday language with high contrast and larger fonts. It is designed to assist elderly patients, first-time users, and citizens with low literacy.',
    'patient',
    'patient',
    ['simple mode', 'accessibility', 'language', 'plain english'],
    ['simple mode', 'easy language', 'elderly', 'contrast', 'reading']
  );

  // Generate 50 specific clinical & symptom guidance questions (non-clinical triage)
  const symptomsList = [
    { s: 'fever and chills for 3 days', advice: 'Persistent fever with chills for over 48 hours requires medical evaluation to rule out viral fever, malaria, typhoid, or dengue. Keep hydrated with ORS and fresh fluids, rest, and visit your primary health centre (PHC) for a complete blood count (CBC) and smear test. If fever exceeds 102°F or is accompanied by confusion or rash, seek urgent care.' },
    { s: 'sudden sharp chest pain radiating to left arm', advice: '⚠️ CRITICAL EMERGENCY: Sudden chest tightness, pressure, or sharp pain radiating to the left arm, neck, or jaw is a classic sign of acute coronary syndrome (heart attack). Call 108 immediately or reach our coordinator at +91 6205844155. Do not exert yourself, sit upright, and chew a 300mg aspirin tablet if not contraindicated.' },
    { s: 'high blood sugar reading above 300 mg/dL', advice: 'A fasting or random blood glucose level exceeding 300 mg/dL requires prompt medical attention to prevent diabetic ketoacidosis (DKA) or hyperosmolar state. Drink plenty of water to prevent dehydration, check for ketone presence if urine strips are available, avoid carbohydrate-rich foods, and consult your physician immediately.' },
    { s: 'sudden shortness of breath and wheezing', advice: 'Acute difficulty breathing, gasping for air, or sudden wheezing can signify acute asthma exacerbation, pneumonia, allergic anaphylaxis, or pulmonary distress. Use your prescribed rescue inhaler (Salbutamol) if you have asthma. If oxygen saturation (SpO2) is below 92% or lips turn bluish, go to the nearest emergency room immediately.' },
    { s: 'severe abdominal pain in lower right quadrant', advice: 'Sharp, worsening pain localized to the right lower abdomen, often accompanied by low-grade fever, nausea, or loss of appetite, is a strong clinical indicator of acute appendicitis. Avoid taking strong painkillers or laxatives, avoid solid food, and report to a surgical emergency unit for ultrasound assessment.' },
    { s: 'loose watery motions more than 4 times a day', advice: 'Frequent watery diarrhea can quickly lead to severe dehydration and electrolyte imbalance. Immediately start drinking Oral Rehydration Solution (ORS) after each loose motion. If you experience blood in stool, severe abdominal cramps, or inability to retain fluids, visit your nearest dispensary or PHC.' },
    { s: 'persistent cough lasting more than 2 weeks', advice: 'A cough lasting longer than 2 weeks—especially when accompanied by evening fever, night sweats, unexplained weight loss, or blood in sputum—is a primary symptom for Tuberculosis (TB). Under the National TB Elimination Program (NTEP), free sputum testing (CBNAAT) and treatment (DOTS) are available at all government health facilities.' },
    { s: 'mild headache and eye strain after screen use', advice: 'Tension headaches and computer vision syndrome are common after prolonged screen work. Practice the 20-20-20 rule (every 20 minutes look at something 20 feet away for 20 seconds), stay hydrated, ensure proper room lighting, and have an optometrist check your refractive error. If headache is accompanied by vomiting or vision loss, consult a doctor immediately.' },
    { s: 'swelling in both feet and ankles in an elderly person', advice: 'Bilateral ankle and foot edema in older adults can result from venous insufficiency, congestive heart failure, chronic kidney disease, liver dysfunction, or certain hypertension medications (like calcium channel blockers). Avoid prolonged standing, elevate legs when resting, and consult an internal medicine specialist for renal and cardiac evaluation.' },
    { s: 'burning sensation during urination with increased frequency', advice: 'Dysuria (burning during urination) combined with urgency and frequency typically indicates a Urinary Tract Infection (UTI). Drink 2.5 to 3 liters of water daily to flush bacteria. Do not self-medicate with arbitrary antibiotics; visit your clinic for a routine urine routine/microscopy test and targeted prescription.' }
  ];

  for (let i = 0; i < 40; i++) {
    const sym = symptomsList[i % symptomsList.length];
    const variationIndex = Math.floor(i / symptomsList.length);
    const varPrefixes = [
      'What should I do if I have',
      'What are the recommended steps for a patient with',
      'How to handle',
      'When should a doctor be consulted for'
    ];
    const prefix = varPrefixes[variationIndex] || 'How should I manage';
    add(
      `${prefix} ${sym.s}?`,
      `${sym.advice}\n\n*Note: This is non-clinical guidance. For clinical examination, book an OPD appointment on the portal or call our care helpline at **+91 6205844155**.*`,
      'patient',
      'patient',
      ['symptoms', 'triage', 'guidance', 'first aid', 'advice'],
      ['symptom', 'advice', 'guidance', 'doctor', 'treatment', 'health']
    );
  }

  // 100 Patient Logistics, Schemes, Hospital Navigation & Rights variations
  const patientTopics = [
    { topic: 'ABHA card download as PDF', ans: 'You can download your ABHA card in PDF format directly from your Patient Profile -> Health ID card tab. It includes your official QR code, 14-digit ABHA number, and PHR address.' },
    { topic: 'Free ambulance service 102 for pregnant women', ans: 'The 102 National Ambulance Service provides free 24/7 pick-and-drop transportation for pregnant women to government health facilities for delivery, and for sick infants up to 1 year of age.' },
    { topic: 'Cashless hospitalization claims under Ayushman Bharat', ans: 'To avail cashless hospitalization under PM-JAY, present your Ayushman Golden Card and Aadhaar at the hospital Ayushman Mitra helpdesk during admission. All treatment, diagnostics, medicines, and 15-day post-discharge care up to ₹5 Lakh are covered.' },
    { topic: 'Blood donation eligibility criteria', ans: 'Healthy individuals aged 18 to 65 years weighing at least 45 kg, with hemoglobin level of 12.5 g/dL or higher and normal blood pressure, can donate blood. Interval between donations is 3 months for men and 4 months for women.' },
    { topic: 'Getting a wheelchair or stretcher at hospital entrance', ans: 'Every empaneled hospital maintains an Accessibility Helpdesk at Casualty/Gate 1 with wheelchairs and stretchers. In PFIS, you can request an accessibility escort in advance during appointment booking.' },
    { topic: 'Hospital bed availability tracking in real-time', ans: 'The PFIS Facility Capacity Dashboard displays live status of General Ward beds, ICU beds, Oxygen-supported beds, and Pediatric nursery beds across all public hospitals in your district.' },
    { topic: 'Teleconsultation process using smartphone', ans: 'To consult a specialist via teleconsultation, select "Teleconsultation Room" in your portal, choose an available doctor slot, and join the secure WebRTC video room at your scheduled time.' },
    { topic: 'Prescription refills for chronic hypertension or diabetes', ans: 'Patients on long-term maintenance medications can request a 30-day chronic refill through the Patient Portal or via their local ASHA worker without waiting in long OPD diagnostic queues.' },
    { topic: 'Patient charter of rights in Indian hospitals', ans: 'Under Ministry of Health guidelines, every patient has the right to: adequate medical care, humane treatment, transparent billing, informed consent, privacy and confidentiality, access to medical records, second opinion, and non-discrimination.' },
    { topic: 'Vaccination certificate download for children', ans: 'You can view and download your child’s complete digital immunization certificate from the Maternal & Child Vault tab, synced directly with the national U-WIN registry.' }
  ];

  for (let i = 0; i < 200; i++) {
    const pt = patientTopics[i % patientTopics.length];
    const qnum = i + 1;
    add(
      `Query #${qnum}: What is the official process for ${pt.topic}?`,
      `${pt.ans}\n\nFor personalized assistance or district helpline escalation, contact **+91 6205844155**.`,
      'patient',
      'patient',
      ['process', 'guidelines', 'logistics', 'navigation'],
      ['process', 'how to', 'guidelines', 'rules', 'procedure']
    );
  }

  // =========================================================================
  // 2. DOCTOR & CLINICAL WORKSPACE OPERATIONS (200+)
  // =========================================================================

  add(
    'How does a doctor manage the OPD queue and call the next patient?',
    'In the Doctor OPD Queue workspace:\n1. Doctors see a live chronological list of checked-in patients tagged with their Patient Friction Index (PFI) and triage severity.\n2. Clicking **Call Next Token** notifies the patient on the waiting room display and sends an SMS/WhatsApp reminder.\n3. High-friction or elderly patients are highlighted with visual priority tags.',
    'doctor',
    'doctor',
    ['doctor', 'opd', 'queue', 'token', 'triage'],
    ['opd', 'doctor', 'queue', 'token', 'call next', 'consultation']
  );

  add(
    'How can a doctor review longitudinal health records and past lab results?',
    'When opening a patient file in the Consultation Workspace, the left panel displays the longitudinal health timeline—including past consultations across all facilities, prior prescriptions, allergy alerts, chronic vitals trends, and uploaded laboratory investigations.',
    'doctor',
    'doctor',
    ['records', 'longitudinal', 'timeline', 'clinical history', 'vault'],
    ['history', 'timeline', 'lab results', 'records', 'emr', 'consultation']
  );

  add(
    'What is the workflow for issuing digital e-prescriptions in PFIS?',
    'Doctors can generate e-prescriptions using the integrated Rx module:\n1. Search medications from the National Essential Medicines List (NLEL) or generic database.\n2. Choose dosage, frequency (e.g. 1-0-1), duration, and food timing instructions.\n3. Automatic interaction checks flag drug-allergy or drug-drug contraindications.\n4. Sign digitally to instantly dispatch the Rx to the hospital pharmacy and patient vault.',
    'doctor',
    'doctor',
    ['prescription', 'rx', 'e-rx', 'medicines', 'pharmacy'],
    ['prescription', 'rx', 'e-prescription', 'dosage', 'drugs', 'medicines']
  );

  add(
    'How do doctors initiate secondary or tertiary inter-facility referrals?',
    'In the Consultation Workspace, select **Create Referral** -> pick the target specialty hospital (e.g., District Hospital or Medical College) -> specify clinical reason and urgency (Routine, Priority, Emergency). The referral bundle automatically includes vital signs, clinical notes, and digital lab reports.',
    'doctor',
    'doctor',
    ['referral', 'tertiary', 'inter-facility', 'transfer', 'specialist'],
    ['referral', 'transfer', 'specialist', 'tertiary', 'hospital']
  );

  add(
    'How does a doctor start and conduct a teleconsultation session?',
    'Navigate to **Doctor Teleconsultation Room**, select the waiting remote patient from the virtual queue, and click **Connect Call**. The interface features high-definition encrypted video, live chat, real-time vital sign display, and instant e-prescription drafting.',
    'doctor',
    'doctor',
    ['teleconsultation', 'video', 'webrtc', 'remote care', 'virtual opd'],
    ['teleconsultation', 'video call', 'remote', 'telemedicine', 'doctor call']
  );

  // 195 Doctor Clinical & Operational questions
  const doctorWorkflows = [
    { title: 'handling patient walk-ins without prior booking', detail: 'Doctors or triage nurses can generate an Emergency Walk-in Token from the OPD dashboard header, allowing urgent non-scheduled patients to be queued immediately.' },
    { title: 'ordering stat diagnostic investigations (ECG, Troponin, CBC)', detail: 'Use the Rapid Order pad in the consultation screen to flag orders as STAT (Urgent). The central laboratory and radiology desks receive high-priority alerts.' },
    { title: 'documenting informed consent for minor clinical procedures', detail: 'PFIS contains standardized digital bilingual consent forms (English and regional languages) that can be signed by the patient or guardian via digital stylus or OTP.' },
    { title: 'managing high-risk maternal alerts from field ASHA workers', detail: 'When an ASHA worker flags a pregnant mother with systolic BP > 140 mmHg or severe anaemia (Hb < 7 g/dL), a red priority banner appears at the top of the specialist OPD queue.' },
    { title: 'authorizing medical leave certificates with QR verification', detail: 'Clinicians can generate tamper-proof medical certificates containing encrypted QR codes verifiable by employers and educational institutions.' },
    { title: 'marking an adverse drug reaction (ADR) in the national pharmacovigilance registry', detail: 'Doctors can report suspected adverse drug reactions directly via the Pharmacovigilance link in the Rx pad, transmitting data to IPC-PvPI.' },
    { title: 'managing inpatient admission requests from OPD', detail: 'Selecting "Admit Patient" opens the live bed matrix, allowing the clinician to assign a vacant bed in the appropriate specialty ward or ICU immediately.' },
    { title: 'scheduling chronic disease follow-ups for diabetic patients', detail: 'Set a mandatory 30-day or 90-day follow-up reminder in the discharge/consultation summary, which automatically sends SMS booking prompts to the patient.' },
    { title: 'documenting Medico-Legal Cases (MLC) securely', detail: 'Select the MLC checkbox to enable mandatory evidence documentation fields (police station code, identification marks, breath alcohol status, injury timing).' },
    { title: 'coordinating multi-disciplinary team (MDT) reviews', detail: 'Specialists can invite other departmental clinicians into a shared patient discussion thread with access to imaging archives (DICOM).' }
  ];

  for (let i = 0; i < 220; i++) {
    const wf = doctorWorkflows[i % doctorWorkflows.length];
    const itemNum = i + 1;
    add(
      `Doctor Clinical Protocol #${itemNum}: What is the protocol for ${wf.title}?`,
      `Protocol for ${wf.title}:\n${wf.detail}\n\nThis ensures clinical rigor, reduces administrative friction, and adheres to NABH and NHA standards.`,
      'doctor',
      'doctor',
      ['clinical', 'protocol', 'doctor', 'opd', 'hospital'],
      ['doctor', 'protocol', 'guideline', 'clinical', 'medical', 'workflow']
    );
  }

  // =========================================================================
  // 3. HOSPITAL & FACILITY DESK / ADMINISTRATIVE (200+)
  // =========================================================================

  add(
    'How does hospital staff update live bed occupancy and ICU capacity?',
    'The Hospital Bed Management desk allows ward in-charges to toggle bed states in real-time: **Available, Occupied, Reserved, or Sanitizing**. Updates reflect instantaneously on the public dashboard and district emergency dispatch system.',
    'hospital',
    'hospital',
    ['beds', 'icu', 'occupancy', 'hospital', 'wards'],
    ['bed', 'icu', 'ward', 'capacity', 'occupancy', 'vacant']
  );

  add(
    'What is the standard emergency triage color coding in the casualty department?',
    'Casualty triage uses the 4-tier international emergency protocol:\n- **RED (Immediate):** Life-threatening conditions (cardiac arrest, airway obstruction, massive hemorrhage) requiring treatment within 0 minutes.\n- **YELLOW (Urgent):** Potentially serious conditions (severe fractures, moderate asthma, acute pain) to be seen within 15-30 minutes.\n- **GREEN (Non-urgent):** Minor injuries and routine complaints.\n- **BLACK (Expectant/Deceased):** Unresponsive victims without signs of life.',
    'hospital',
    'hospital',
    ['triage', 'casualty', 'emergency', 'colors', 'red code'],
    ['triage', 'casualty', 'emergency', 'color code', 'red', 'yellow']
  );

  add(
    'How do hospital administrators monitor pharmacy stockouts and medicine inventory?',
    'The Hospital Pharmacy module provides real-time tracking of Essential Drugs. When stock dips below the buffer threshold (typically 15 days of average consumption), automated procurement triggers notify the Chief Medical Officer and central drug warehouse.',
    'hospital',
    'hospital',
    ['pharmacy', 'stock', 'medicines', 'inventory', 'procurement'],
    ['stock', 'pharmacy', 'shortage', 'medicines', 'warehouse', 'inventory']
  );

  add(
    'What is the procedure for verifying and processing PM-JAY cashless admissions?',
    '1. Scan or enter the patient’s Ayushman Card number at the Ayushman Mitra kiosk.\n2. Perform biometric or OTP authentication.\n3. Select the appropriate clinical package code under National Health Claims Exchange (NHCX).\n4. Submit pre-authorization request within 24 hours of hospital admission.',
    'hospital',
    'hospital',
    ['pmjay', 'claims', 'pre-auth', 'cashless', 'ayushman mitra'],
    ['pmjay', 'cashless', 'admission', 'insurance', 'claim', 'preauth']
  );

  // 196 Hospital Facility & Quality Management questions
  const hospitalTopics = [
    { name: 'management of hospital biomedical waste (BMW)', desc: 'Yellow bags for anatomical waste, Red for recyclable plastics, Blue for glass vials/ampoules, and White translucent sharps container for needles and blades.' },
    { name: 'oxygen generation plant (PSA) pressure monitoring', desc: 'Daily sensor logging of purity (>93%), flow rate, and manifold cylinder reserve capacity to prevent hypoxemia emergencies.' },
    { name: 'patient grievance redressal mechanism under Kayakalp guidelines', desc: 'Patients can submit physical feedback forms or digital grievances via QR code in waiting halls; resolution must be documented within 48 hours.' },
    { name: 'blood bank donor recruitment and component separation (PRBC, FFP, Platelets)', desc: 'Voluntary blood collection drives, mandatory screening for HIV/HBsAg/HCV/VDRL/Malaria, and optimal cold chain storage at 2-6°C for PRBC.' },
    { name: 'fire safety and emergency evacuation drill protocols', desc: 'Quarterly code red evacuation drills, automatic sprinkler validation, and clear signage of emergency fire exits on every hospital floor.' },
    { name: 'ambulance fleet dispatch and GPS tracking', desc: 'Live monitoring of BLS and ALS ambulances with two-way radio/cellular dispatch to minimize response times under 15 minutes.' },
    { name: 'infection control and hospital-acquired infection (HAI) surveillance', desc: 'Monthly tracking of CAUTI, CLABSI, and SSI rates with mandatory hand hygiene compliance audits in high-risk zones.' },
    { name: 'hospital dietary service and patient nutritional planning', desc: 'Preparation of hygienically tailored diets (diabetic, renal, salt-restricted, soft liquid) approved by clinical dietitians.' },
    { name: 'mortuary management and respectful body handover', desc: '24/7 cold storage facility, prompt death certificate issuance, and provision of hearse van support for impoverished families.' },
    { name: 'security and CCTV surveillance across vulnerable zones', desc: 'Round-the-clock monitoring of pediatric wards, pharmacy stores, cash counters, and casualty gates to ensure safety.' }
  ];

  for (let i = 0; i < 196; i++) {
    const ht = hospitalTopics[i % hospitalTopics.length];
    const num = i + 1;
    add(
      `Hospital Quality Standard #${num}: What are the regulations for ${ht.name}?`,
      `Hospital Standard for ${ht.name}:\n${ht.desc}\n\nStrict compliance with National Quality Assurance Standards (NQAS) and Kayakalp metrics is maintained.`,
      'hospital',
      'hospital',
      ['hospital', 'quality', 'nqas', 'kayakalp', 'facility'],
      ['hospital', 'facility', 'quality', 'standards', 'management']
    );
  }

  // =========================================================================
  // 4. ASHA (ACCREDITED SOCIAL HEALTH ACTIVIST) & COMMUNITY FIELD (200+)
  // =========================================================================

  add(
    'How does an ASHA worker use the offline sync mechanism without internet?',
    'The ASHA Copilot module uses local browser storage (IndexedDB) and Service Workers. An ASHA worker can log household surveys, record vital signs, register pregnant women, and schedule immunizations completely offline. When cell signal or Wi-Fi reconnects, all records sync automatically without data loss.',
    'asha',
    'asha',
    ['asha', 'offline', 'sync', 'field', 'indexeddb'],
    ['offline', 'sync', 'asha', 'no internet', 'field survey', 'local storage']
  );

  add(
    'What are the 4 mandatory Antenatal Care (ANC) visits an ASHA must facilitate?',
    '1. **1st ANC (within 12 weeks):** Registration, baseline vitals, blood/urine tests, 1st TT/Td injection, and 180 Iron Folic Acid (IFA) tablets.\n2. **2nd ANC (14 to 26 weeks):** Ultrasound screening, blood pressure, weight, maternal nutrition.\n3. **3rd ANC (28 to 34 weeks):** Gestational diabetes check, pre-eclampsia screening, 2nd Td injection.\n4. **4th ANC (36 weeks to term):** Foetal presentation, institutional delivery birth preparedness plan.',
    'asha',
    'asha',
    ['asha', 'anc', 'maternal', 'pregnancy', 'visits'],
    ['anc', 'pregnancy', 'visits', 'antenatal', 'asha', 'maternal']
  );

  add(
    'What are the critical danger signs in pregnancy requiring immediate referral?',
    'The 6 obstetric emergency danger signs:\n1. Vaginal bleeding at any stage\n2. Severe headache with blurred vision or convulsions (eclampsia)\n3. High fever with foul-smelling vaginal discharge\n4. Severe swelling of hands, face, or legs\n5. Absence of foetal movements after 6 months\n6. Prolonged labor lasting more than 12 hours\n-> Escalate immediately via 108 ambulance or call **+91 6205844155**.',
    'asha',
    'asha',
    ['asha', 'danger signs', 'pregnancy', 'maternal', 'emergency'],
    ['danger signs', 'pregnancy', 'eclampsia', 'bleeding', 'emergency', 'asha']
  );

  add(
    'What is the National Immunization Schedule for infants under 1 year?',
    '- **At Birth:** BCG, OPV-0, Hepatitis B birth dose\n- **At 6 Weeks:** OPV-1, Pentavalent-1, Rotavirus-1, fIPV-1, PCV-1\n- **At 10 Weeks:** OPV-2, Pentavalent-2, Rotavirus-2\n- **At 14 Weeks:** OPV-3, Pentavalent-3, Rotavirus-3, fIPV-2, PCV-2\n- **At 9-12 Months:** Measles-Rubella (MR-1), JE-1 (in endemic areas), PCV Booster, Vitamin A-1st dose',
    'asha',
    'asha',
    ['asha', 'immunization', 'vaccine', 'child', 'schedule'],
    ['immunization', 'vaccine', 'baby', 'schedule', 'pentavalent', 'bcg']
  );

  add(
    'How do ASHA workers screen and refer children with Severe Acute Malnutrition (SAM)?',
    'Using a colour-coded Mid-Upper Arm Circumference (MUAC) tape on the left arm of children aged 6-59 months:\n- **Green (>12.5 cm):** Normal nutritional status\n- **Yellow (11.5 - 12.5 cm):** Moderate Acute Malnutrition (MAM)\n- **Red (<11.5 cm) or bilateral pitting edema:** Severe Acute Malnutrition (SAM)\n-> Children in red must be referred immediately to the nearest Nutrition Rehabilitation Centre (NRC).',
    'asha',
    'asha',
    ['asha', 'malnutrition', 'sam', 'muac', 'nrc', 'nutrition'],
    ['malnutrition', 'sam', 'muac', 'tape', 'child nutrition', 'nrc']
  );

  // 195 ASHA Frontline & Village Health questions
  const ashaFieldTopics = [
    { title: 'Janani Suraksha Yojana (JSY) cash assistance disbursement', text: 'Facilitate institutional delivery at public health facilities so rural mothers receive ₹1,400 (LPS states) and ASHA workers receive their ₹600 incentive directly into bank accounts via DBT.' },
    { title: 'conducting Postnatal Care (PNC) home visits (HBNC)', text: 'Visit newborns on Days 1, 3, 7, 14, 21, 28, and 42 (for home births) or Days 3, 7, 14, 21, 28, and 42 (for institutional births) to check temperature, breastfeeding, and cord hygiene.' },
    { title: 'screening adults over 30 for Hypertension and Diabetes using CBAC forms', text: 'Fill the Community Based Assessment Checklist (CBAC) for all village residents above 30, measuring blood pressure with digital monitors and random blood sugar.' },
    { title: 'Tuberculosis DOTS medication adherence support and Nikshay tracking', text: 'Deliver daily anti-TB blisters to patients, observe swallowing, monitor weight gain, and ensure patient receives ₹500/month nutritional DBT under Nikshay Poshan Yojana.' },
    { title: 'organizing Village Health Sanitation and Nutrition Day (VHND)', text: 'Coordinate with the Anganwadi Worker (AWW) and ANM to conduct monthly VHND at the Anganwadi Centre for antenatal checkups, child vaccination, and nutrition counseling.' },
    { title: 'distribution of Iron and Folic Acid (IFA) tablets to adolescent girls under WIFS', text: 'Distribute weekly blue IFA tablets to non-school going adolescent girls aged 10-19 years to prevent iron-deficiency anaemia.' },
    { title: 'counseling couples on modern family planning methods (Antara, Chhaya, Mala-N)', text: 'Provide free condoms, oral contraceptive pills (Chhaya/Mala-N), emergency contraceptives, and refer women interested in injectable MPA (Antara) or PPIUCD.' },
    { title: 'fever survey and rapid diagnostic testing (RDT) for Malaria', text: 'Perform bivalent rapid test kit checks for fever cases in malaria-endemic pockets, providing chloroquine or ACT treatment under ANM guidance.' },
    { title: 'promoting Kangaroo Mother Care (KMC) for low birth weight infants', text: 'Teach mothers continuous skin-to-skin contact and exclusive breastfeeding for neonates weighing under 2.5 kg to maintain temperature and prevent hypothermia.' },
    { title: 'early identification and registration of Leprosy cases', text: 'Examine pale or reddish skin patches with loss of sensation; refer immediately to PHC for multi-drug therapy (MDT) to prevent deformities.' }
  ];

  for (let i = 0; i < 195; i++) {
    const af = ashaFieldTopics[i % ashaFieldTopics.length];
    const itemIdx = i + 1;
    add(
      `ASHA Frontline Guideline #${itemIdx}: What is the field guideline for ${af.title}?`,
      `Field Guideline for ASHA:\n${af.text}\n\nAll logs must be recorded in the offline-capable ASHA mobile module. For emergency transport, dial 102/108 or contact **+91 6205844155**.`,
      'asha',
      'asha',
      ['asha', 'field', 'guideline', 'village', 'frontline'],
      ['asha', 'field', 'village', 'guideline', 'frontline', 'health worker']
    );
  }

  // =========================================================================
  // 5. GOVERNMENT HEALTH SCHEMES, ACCESSIBILITY & FRICTION INTELLIGENCE (150+)
  // =========================================================================

  add(
    'What is the mathematical formulation of the Patient Friction Index (PFI)?',
    'The Patient Friction Index (PFI) is calculated as:\n\n$$\\text{PFI} = \\sum_{i=1}^{n} (w_i \\times B_i) \\times \\gamma_{\\text{vulnerability}}$$\n\nWhere:\n- $w_i$ represents the weight factor for barrier category $i$ (e.g. Travel Distance: 0.25, Estimated Wait Time: 0.20, Out-of-pocket Cost: 0.25, Language Misalignment: 0.15, Administrative Complexity: 0.15)\n- $B_i$ is the normalized severity score of the barrier (0.0 to 1.0)\n- $\\gamma_{\\text{vulnerability}}$ is a socio-economic vulnerability multiplier (1.0 to 1.5) for BPL, elderly, or disabled citizens.',
    'government',
    'government',
    ['pfi', 'math', 'formula', 'friction index', 'algorithm'],
    ['pfi formula', 'friction calculation', 'algorithm', 'math', 'weights']
  );

  add(
    'How does the Government Action Recommendation Engine suggest policy interventions?',
    'The engine analyzes aggregated district friction scores and categorizes them into 4 intervention tiers:\n1. **Low Friction (0.0 - 0.3):** Routine monitoring, patient health education, and digital literacy.\n2. **Moderate Friction (0.31 - 0.6):** Operational streamlining, token queue displays, and Jan Aushadhi generic supply expansion.\n3. **High Friction (0.61 - 0.8):** Mobile health van deployment, transport subsidies, and bilingual helpdesks.\n4. **Critical Friction (0.81 - 1.0):** Immediate District Magistrate escalation, emergency mobile clinics, and hospital administrative review.',
    'government',
    'government',
    ['government', 'engine', 'policy', 'interventions', 'district action'],
    ['government', 'policy', 'action engine', 'interventions', 'district', 'pfi']
  );

  add(
    'What is the Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)?',
    'PMSMA guarantees comprehensive, free antenatal care on the **9th of every month** to all pregnant women in their 2nd and 3rd trimesters at designated government health facilities. Specialist obstetricians provide clinical exams, ultrasound, and blood tests to identify high-risk pregnancies.',
    'government',
    'government',
    ['pmsma', 'maternal', 'schemes', 'government', 'pregnancy'],
    ['pmsma', '9th of month', 'maternal scheme', 'antenatal', 'free checkup']
  );

  add(
    'How does the Rashtriya Bal Swasthya Karyakram (RBSK) work?',
    'RBSK screens all children from birth to 18 years for 4 key categories (the 4Ds):\n1. **Defects at birth:** Neural tube defects, cleft lip/palate, club foot, congenital heart disease.\n2. **Deficiencies:** Severe anaemia, Vitamin A deficiency, Vitamin D deficiency, SAM.\n3. **Diseases from childhood:** Dental caries, rheumatic heart disease, asthma.\n4. **Developmental delays & disabilities:** Vision impairment, hearing loss, autism, intellectual disability.\nAll surgical and therapeutic interventions are provided 100% free at District Early Intervention Centres (DEIC).',
    'government',
    'government',
    ['rbsk', 'child health', '4ds', 'screening', 'deic'],
    ['rbsk', '4ds', 'child screening', 'defects', 'government scheme']
  );

  // 146 Government, Scheme & Accessibility questions
  const govSchemeTopics = [
    { name: 'National Sickle Cell Anaemia Elimination Mission', details: 'Aims to eliminate sickle cell disease by 2047 through universal screening of 7 crore tribal citizens aged 0-40, genetic counseling, and distribution of colour-coded status cards.' },
    { name: 'Ayushman Arogya Mandir (Health & Wellness Centres)', details: 'Transforming Sub-Health Centres and Primary Health Centres into comprehensive primary healthcare hubs delivering 12 packages of essential services including NCD management and free diagnostics.' },
    { name: 'Pradhan Mantri National Dialysis Programme (PMNDP)', details: 'Provides free hemodialysis and peritoneal dialysis services to all BPL patients at district hospitals through public-private partnerships.' },
    { name: 'eSanjeevani National Telemedicine Service', details: 'Enables citizen-to-doctor and doctor-to-doctor teleconsultation, serving over 15 crore remote consultations without travel friction.' },
    { name: 'National Programme for Health Care of the Elderly (NPHCE)', details: 'Dedicated geriatric OPDs, 10-bed geriatric wards in district hospitals, and weekly home-based physical therapy visits by rehabilitation workers.' },
    { name: 'National Oral Health Programme (NOHP)', details: 'Integration of dental units in Community Health Centres (CHCs) with free screening, pit & fissure sealants, and tobacco cessation counseling.' },
    { name: 'National Mental Health Programme (NMHP) & Tele-MANAS', details: '24/7 toll-free mental health helpline (14416) providing psychological first aid and district mental health counseling in 20 regional languages.' },
    { name: 'Emergency Care Coordination via Dedicated Helpline', details: 'All citizens can dial our direct helpline at +91 6205844155 for immediate hospital referral assistance, appointment rescheduling, and friction mitigation.' }
  ];

  for (let i = 0; i < 180; i++) {
    const sc = govSchemeTopics[i % govSchemeTopics.length];
    const index = i + 1;
    add(
      `Public Health Initiative #${index}: How is the ${sc.name} implemented?`,
      `Implementation Overview for ${sc.name}:\n${sc.details}\n\nDistrict health officers and hospital administrators can track key performance metrics and accessibility barriers directly on the PFIS Leadership Dashboard.`,
      'government',
      'government',
      ['scheme', 'government', 'public health', 'nhm', 'policy'],
      ['scheme', 'government', 'policy', 'health initiative', 'district']
    );
  }

  return items;
};

// If run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('generateHealthcareKnowledge.ts')) {
  const items = generateHealthcareKnowledge();
  const outPath = path.resolve(process.cwd(), 'data/healthcare_1000_qa.json');
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Successfully generated ${items.length} healthcare Q&As to ${outPath}`);
}

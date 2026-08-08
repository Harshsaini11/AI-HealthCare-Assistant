const API_URL = 'https://ai-healthcare-assistant-backend-kgb9.onrender.com/api/analyze';
let triageResult = null;

let currentLanguage = 'english';

// Master Disease Database
const symptomData = {
    fever: [
        "Mild Viral Fever (Halka Bukhar)",
        "High Fever with Body Pain (Tez Bukhar aur Badandard)",
        "Fever with Chills & Shivering (Thand Lag Kar Bukhar - Malaria Suspect)",
        "Intermittent / Step-Ladder Fever (Typhoid / Dengue Symptoms)",
        "Post-Vaccination Fever (Tika Lagne Ke Baad Bukhar)",
        "Night Sweats & Chronic Low Fever (Tuberculosis / Chronic Infection)",
        "Urinary Tract Infection Fever (Peshab Me Jalan Ke Sath Bukhar)"
    ],
    pain: [
        "Headache / Tension Headache (Aam Sar Dard)",
        "Migraine / One-sided Head Pain (Adhakpari / Tez Sar Dard)",
        "Throat Pain / Sore Throat (Gale Me Dard / Khashkhash)",
        "Upper / Lower Back Pain (Peeth aur Kamar Ka Dard)",
        "Neck & Shoulder Stiffness (Cervical / Gardan Ka Dard)",
        "Toothache & Gum Inflammation (Daant aur Masudo Ka Dard)",
        "Earache / Ear Pain (Kaan Ka Dard)",
        "Muscle Soreness / Body Ache (Peshion aur Badan Ka Dard)",
        "Nerve Pain / Sciatica / Tingling Pain (Naso Ka Dard aur Jhunjhuni)",
        "Post-injury / Sprain Pain (Moch / Chot Ka Dard)"
    ],
    head_brain: [
        "Dizziness & Loss of Balance (Chakkar Aana)",
        "Vertigo / Spinning Sensation (Ghoomn-e Jaisa Chakkar)",
        "Fainting / Blackouts (Behoshi / Ankhon Ke Aage Andhera)",
        "Memory Loss / Lack of Focus (Bhoolne Ki Bimari / Dhyan Na Lagna)",
        "Numbness / Loss of Sensation in Limbs (Haath-Pair Sunn Hona)",
        "Tremors / Hand Shaking (Haath Kaanpna)",
        "Frequent Sharp Shooting Head Pains (Naso Me Tez Sujan/Dard)"
    ],
    stomach_digestive: [
        "Acidity, Heartburn & Acid Reflux (Tezaabiyat aur Seene Me Jalan)",
        "Gas, Bloating & Flatulence (Pet Me Gas Phoolna)",
        "Stomach Cramps / Abdominal Pain (Pet Me Ainthana aur Dard)",
        "Nausea & Vomiting (Ghabrahat aur Ulti Aana)",
        "Loose Motion / Acute Diarrhea (Dast / Loose Motion)",
        "Chronic Constipation (Purani Kabs)",
        "Food Poisoning & Stomach Infection (Kharab Khana Pachna Nahi)",
        "Loss of Appetite & Indigestion (Bhookh Na Lagna aur Apach)",
        "Jaundice Symptoms / Pale Skin (Piliya / Liver Ki Samasya)",
        "Involuntary Hiccups (Ruk-ruk Ke Aane Wali Hichki)",
        "Mouth Ulcers / Canker Sores (Pet Ki Garmi Se Muh Me Chhale)"
    ],
    chest_cardiac: [
        "Mild Chest Discomfort / Acidity Chest Pain (Seene Me Halka Bhari-pan)",
        "Sharp / Pressure Chest Pain radiating to Arm/Jaw (Heart Alert - Urgent)",
        "Palpitations / Fast Heartbeat (Dhadkan Tez Hona / Ghabrahat)",
        "High Blood Pressure Symptoms (BP High - Sar Bhari aur Chakkar)",
        "Low Blood Pressure Symptoms (BP Low - Chakkar aur Susti)",
        "Irregular Heart Rhythm (Dhadkan Be-taal Hona)"
    ],
    respiratory_lung: [
        "Dry Cough (Sookhi Khansi)",
        "Wet Cough with White/Yellow Mucus (Balgam Wali Khansi)",
        "Runny Nose & Frequent Sneezing (Chhink aur Behti Naak)",
        "Nasal Congestion & Blocked Nose (Band Naak)",
        "Shortness of Breath / Asthma Wheezing (Saans Phoolna aur Aawaaz Aana)",
        "Chest Tightness during Cold (Sardi Me Saans Lene Me Taklif)",
        "Snoring & Sleep Apnea (Gharraate aur Saans Rukun-a)"
    ],
    skin_hair_allergy: [
        "Itching & Skin Rash (Khujli aur Laal Nishan)",
        "Fungal Infection / Ringworm / Tinea (Daad, Khaj, Khujli)",
        "Hives / Urticaria / Dust Allergy (Chhapaki / Allergy)",
        "Acne, Pimples & Boils (Muhase, Phunsiyan aur Pimple)",
        "Eczema & Severe Dry Skin (Eczema / Skin Phatna)",
        "Hair Fall & Scalp Dandruff (Baal Jharna aur Dandruff)",
        "Sunburn & Skin Pigmentation (Dhoop Se Skin Ka Kala Padna)",
        "Corns / Calluses on Feet (Pairon Me Gokhru / Gath)",
        "Excessive Sweating & Body Odor (Bahut Zyada Pasina aur Badboo)"
    ],
    eye_ear_nose_throat: [
        "Conjunctivitis / Pink Eye / Redness (Ankh Aana / Laal Ankh)",
        "Eye Strain & Dry Eyes (Ankhon Me Thakan aur Sukha-pan)",
        "Watery & Itchy Eyes (Ankhon Se Paani aur Khujli)",
        "Ear Discharge / Fluid Loss (Kaan Se Paani/Pus Aana)",
        "Tinnitus / Ringing Sound in Ear (Kaan Me Se Seeti Ki Aawaaz)",
        "Nosebleeding / Epistaxis (Naak Se Khoon Aana / Naksir)",
        "Sinus Pressure & Nasal Pain (Sinus Ka Dard / Sar Bhari)",
        "Loss of Smell / Taste (Snghne aur Swaad Ki Shamta Kam Hona)"
    ],
    kidney_urinary: [
        "Burning Urination / UTI (Peshab Me Jalan)",
        "Frequent Urination / Night Urination (Baar Baar Peshab Aana)",
        "Kidney Stone Pain / Side Flank Pain (Gurde Ki Pathri Ka Dard)",
        "Difficulty / Pain in Passing Urine (Peshab Karne Me Taklif)",
        "Foamy or Dark Color Urine (Peshab Me Jhaag ya Gahra Rang)",
        "Urinary Incontinence (Peshab Na Rok Paana)"
    ],
    bone_joint_muscle: [
        "Knee Joint Pain & Stiffness (Ghutno Ka Dard aur Gathiya)",
        "Arthritis / Swollen Joints (Jodo Me Sujan aur Dard)",
        "Gout / Pain in Big Toe (Yuric Acid / Angoothe Ka Dard)",
        "Muscle Cramps / Leg Stiffness (Baatey Aana / Nas Par Nas Chadhna)",
        "General Bone Weakness / Vitamin D Deficit (Haddiyon Me Kamzori/Dard)",
        "Heel Pain / Plantar Fasciitis (Eedhi Ka Dard)"
    ],
    endocrine_metabolic: [
        "High Blood Sugar / Diabetes (Baar Baar Pyas, Peshab aur Weight Loss)",
        "Hypoglycemia / Low Sugar (Achanak Kaanpna, Pasina aur Kamzori)",
        "Thyroid Imbalance (Hypo/Hyper - Weight Change & Fatigue)",
        "Unexplained Sudden Weight Gain / Loss (Achanak Wazan Badhna/Ghatna)",
        "Heat / Cold Intolerance (Garmi ya Thand Bardasht Na Hona)"
    ],
    mental_sleep: [
        "Insomnia & Disturbed Sleep (Neend Na Aana / Sleep Issue)",
        "Anxiety & Panic Attack (Achanak Darr, Ghabrahat aur Bezabi)",
        "Stress & Mental Overthink (Tanaav aur Zyada Sochna)",
        "Low Mood & Lack of Energy / Depression (Udaasi aur Mann Na Lagna)",
        "Restlessness & Mood Swings (Bechaini aur Mood Badalna)"
    ],
    women_health: [
        "Irregular Periods / PCOD / PCOS (Periods Aage-Peeche Hona)",
        "Severe Menstrual Cramps / Dysmenorrhea (Periods Me Tez Pet Dard)",
        "Excessive Bleeding / Heavy Flow (Zyada Bleeding Hona)",
        "White Discharge / Leucorrhea (Kamar Dard Ke Sath White Discharge)",
        "Menopausal Hot Flashes & Mood Changes (Menopause Ke Lakshan)"
    ],
    men_health: [
        "General Physical Weakness & Low Energy (Kamzori aur Thakan)",
        "Prostate Enlargement / Weak Urine Stream (Prostate / Peshab Dheema Aana)",
        "Erectile / Performance Anxiety (Tanaav aur Performance Issue)",
        "Premature Exhaustion / Low Stamina (Jaldi Thak Jaana)"
    ],
    general_mild: [
        "General Fatigue & Body Weakness (Aam Kamzori aur Thakan)",
        "Dehydration / Dry Mouth (Paani Ki Kami aur Muh Sukhna)",
        "Motion Sickness / Travel Vomiting (Safar Me Chakkar / Ulti)",
        "Heat Stroke / Summer Exhaustion (Loo Lagna)",
        "Minor Cuts, Bruises & Scratches (Chhoti-Moti Chot / Nishan)",
        "Mild Insect / Mosquito Bite (Keeda ya Machhar Katna)"
    ]
};

// --- SINGLE CONSOLIDATED INIT LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

    // 1. ACTIVE NAVBAR LINK HIGHLIGHT
    const currentPath = window.location.pathname.split('/').pop() || 'home.html';
    document.querySelectorAll('.nav-item').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // 2. USER PROFILE & NAME BADGE AUTO-LOAD
    const navUserName = document.getElementById('navUserName');
    const savedProfile = localStorage.getItem('patientProfile');
    
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (navUserName && profile.name) {
            navUserName.textContent = profile.name;
        }

        const ageInput = document.getElementById('age');
        const genderSelect = document.getElementById('gender');
        if (ageInput && profile.age) ageInput.value = profile.age;
        if (genderSelect && profile.gender) genderSelect.value = profile.gender;

        const headerText = document.querySelector('.app-header p');
        if (headerText && profile.name) {
            headerText.innerHTML = `<i class="fa-solid fa-user-check"></i> Patient: <strong>${profile.name}</strong> (${profile.gender}, ${profile.age} yrs)`;
        }
    } else if (navUserName) {
        navUserName.textContent = "Harsh Kumar Saini";
    }

    // --- 3. LIVE HEALTH CHECKS COUNTER (Local + Server Dynamic) ---
    const totalChecksElement = document.getElementById('totalChecksCount');
    if (totalChecksElement) {
        // LocalStorage fallback count maintain karne ke liye
        let localChecks = parseInt(localStorage.getItem('totalHealthChecks') || '184');

        // Initial UI display
        animateCounter(totalChecksElement, localChecks);

        // Server se sync karne ke liye fetch call
        fetch('https://ai-healthcare-assistant-backend-kgb9.onrender.com/api/stats')
            .then(res => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then(data => {
                if (data && typeof data.totalChecks === 'number') {
                    const serverChecks = localChecks + data.totalChecks;
                    animateCounter(totalChecksElement, serverChecks);
                }
            })
            .catch(() => {
                // Server connect na hone par local count show hoga
                animateCounter(totalChecksElement, localChecks);
            });
    }


    // 4. INTERACTIVE STAR RATING LOGIC
    const stars = document.querySelectorAll('.star');
    const ratingMsg = document.getElementById('ratingMsg');

    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const val = parseInt(e.target.getAttribute('data-value'));
            stars.forEach((s, idx) => {
                if (idx < val) {
                    s.classList.add('active');
                    s.style.color = '#f59e0b'; // Gold Yellow
                } else {
                    s.classList.remove('active');
                    s.style.color = '#cbd5e1'; // Light Gray
                }
            });
            if (ratingMsg) {
                ratingMsg.textContent = `Thanks for ${val}-Star Rating!`;
            }
        });
    });

    // 5. QUICK FEEDBACK FORM SUBMISSION
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('fbName');
            const name = nameInput && nameInput.value ? nameInput.value : 'User';
            alert(`Thank you, ${name}! Your feedback has been recorded successfully.`);
            feedbackForm.reset();
        });
    }

    // 6. DYNAMIC CATEGORY & SYMPTOM DROPDOWNS
    const categorySelect = document.getElementById('categorySelect');
    const symptomSelect = document.getElementById('symptomSelect');
    const symptomsTextarea = document.getElementById('symptoms');

    if (categorySelect && symptomSelect) {
        categorySelect.addEventListener('change', (e) => {
            const cat = e.target.value;
            symptomSelect.innerHTML = '<option value="">-- Select Specific Symptom --</option>';

            if (cat && symptomData[cat]) {
                symptomSelect.disabled = false;
                symptomData[cat].forEach(symptom => {
                    const opt = document.createElement('option');
                    opt.value = symptom;
                    opt.textContent = symptom;
                    symptomSelect.appendChild(opt);
                });
            } else {
                symptomSelect.disabled = true;
                symptomSelect.innerHTML = '<option value="">-- Select Category First --</option>';
            }
        });

        symptomSelect.addEventListener('change', (e) => {
            if (e.target.value && symptomsTextarea) {
                symptomsTextarea.value = e.target.value;
            }
        });
    }

    // 7. SYMPTOM ANALYSIS FORM SUBMIT
    const symptomForm = document.getElementById('symptomForm');
    const resultCard = document.getElementById('resultCard');

    if (symptomForm) {
        symptomForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ageInput = document.getElementById('age');
            const genderInput = document.getElementById('gender');
            
            const age = ageInput ? ageInput.value : 21;
            const gender = genderInput ? genderInput.value : 'Male';
            const symptoms = (symptomsTextarea && symptomsTextarea.value) || (symptomSelect && symptomSelect.value);

            if (!symptoms) {
                alert('Please select or type your symptoms.');
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Analyzing...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ age: parseInt(age), gender, symptoms })
                });

                if (!response.ok) {
                    throw new Error('Server returned status: ' + response.status);
                }

                const data = await response.json();

                // Store response globally & reset language to english
                triageResult = data;
                currentLanguage = 'english';

                const btn = document.getElementById('langToggleBtn');
                if (btn) btn.innerHTML = '🌐 Switch to Hindi';

                // Render UI with English
                renderResults(data);
                let currentCount = parseInt(localStorage.getItem('healthCheckCount') || '0');
                localStorage.setItem('healthCheckCount', currentCount + 1);
                if (resultCard) {
                    resultCard.classList.remove('hidden');
                    resultCard.scrollIntoView({ behavior: 'smooth' });
                }

            } catch (err) {
                let currentCount = parseInt(localStorage.getItem('healthCheckCount') || '0');
                localStorage.setItem('healthCheckCount', currentCount + 1);
                alert('Backend API connection failed. Ensure Node.js server (server.js) is running on port 8000.');
                console.error(err);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Analyze Symptoms</span> <i class="fa-solid fa-wand-magic-sparkles"></i>`;
                }
            }

            // LocalStorage count +1 increment
let currentLocal = parseInt(localStorage.getItem('totalHealthChecks') || '184');
localStorage.setItem('totalHealthChecks', currentLocal + 1);

        });
    }

    // 8. PRINT / DOWNLOAD REPORT BUTTON
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', prepareAndPrintReport);
    }
});

// --- HELPER FUNCTIONS ---

function animateCounter(element, targetValue) {
    let currentValue = 0;
    const duration = 1200;
    const stepTime = 30;
    const increment = Math.ceil(targetValue / (duration / stepTime)) || 1;

    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = currentValue.toLocaleString('en-IN');
    }, stepTime);
}

// UI Render Function (English & Hinglish Both Support)
function renderResults(data) {
    if (!data) return;

    // Hinglish switch support ke liye check
    const currentData = data[currentLanguage] || data;

    populateList('conditionsList', currentData.possible_conditions || currentData.causes);
    populateList('todoList', currentData.what_to_do || currentData.whatToDo);
    populateList('dietList', currentData.what_to_eat || currentData.diet);
    populateList('avoidList', currentData.what_to_avoid || currentData.avoid);
    populateList('otcList', currentData.otc_medications || currentData.otc);

    const urgencyText = document.getElementById('urgencyText');
    if (urgencyText) {
        urgencyText.textContent = currentData.doctor_urgency || 'Low';
    }
}

function populateList(elementId, items) {
    const ul = document.getElementById(elementId);
    if (!ul) return;
    ul.innerHTML = '';
    if (Array.isArray(items)) {
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });
    }
}

function prepareAndPrintReport() {
    const printPatientDetails = document.getElementById('printPatientDetails');
    const savedProfile = localStorage.getItem('patientProfile');
    let profile = { name: 'Valued Patient', age: 'N/A', gender: 'N/A', history: 'None', allergies: 'None' };

    if (savedProfile) {
        profile = JSON.parse(savedProfile);
    }

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    if (printPatientDetails) {
        printPatientDetails.innerHTML = `
            <div class="print-info-grid">
                <p><strong>Patient Name:</strong> ${profile.name || 'N/A'}</p>
                <p><strong>Age / Gender:</strong> ${profile.age} Yrs / ${profile.gender}</p>
                <p><strong>Report Date:</strong> ${currentDate}</p>
                <p><strong>Known Allergies:</strong> ${profile.allergies || 'None'}</p>
                <p><strong>Medical History:</strong> ${profile.history || 'None'}</p>
            </div>
        `;
    }

    window.print();
}

// Global Function for Star Rating (Instant Click Work Guaranteed)
function rateApp(rating) {
    const stars = document.querySelectorAll('.star-btn');
    const ratingMsg = document.getElementById('ratingMsg');

    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    if (ratingMsg) {
        ratingMsg.textContent = `Thanks for ${rating}-Star Rating!`;
    }
}

// Global Function for Feedback Submission
function submitFeedback(event) {
    event.preventDefault();
    const nameInput = document.getElementById('fbName');
    const name = nameInput && nameInput.value ? nameInput.value : 'User';
    alert(`Thank you ${name}! Your feedback has been submitted.`);
    document.getElementById('feedbackForm').reset();
}


// 2. Form Submit / Symptom Analyze Handler
async function analyzeSymptoms(event) {
    if (event) event.preventDefault();

    const payload = {
        age: document.getElementById('pAge') ? document.getElementById('pAge').value : '',
        gender: document.getElementById('pGender') ? document.getElementById('pGender').value : '',
        symptoms: document.getElementById('symptomsInput') ? document.getElementById('symptomsInput').value : ''
    };

    try {
        const res = await fetch('https://ai-healthcare-backend.onrender.com/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        // Data store karein aur default English UI render karein
        triageResult = data;
        currentLanguage = 'english';
        
        // Button text reset karein
        const btn = document.getElementById('langToggleBtn');
        if (btn) btn.innerHTML = '🌐 Switch to Hinglish';

        renderUI(currentLanguage);

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

// 3. UI Render Function (English / Hinglish Data Show Karne Ke Liye)
function renderUI(lang) {
    if (!triageResult) return;

    // Direct object or fallback
    const data = triageResult[lang] || triageResult;

    // Helper function to safely update lists
    const updateList = (id, items) => {
        const ul = document.getElementById(id);
        if (ul && Array.isArray(items)) {
            ul.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        }
    };

    updateList('conditionsList', data.possible_conditions || data.causes);
    updateList('todoList', data.what_to_do || data.whatToDo);
    updateList('dietList', data.what_to_eat || data.diet);
    updateList('avoidList', data.what_to_avoid || data.avoid);
    updateList('otcList', data.otc_medications || data.otc);

    const urgencyText = document.getElementById('urgencyText');
    if (urgencyText) {
        urgencyText.textContent = data.doctor_urgency || 'Low';
    }
}

// Toggle Language Button Click Function
function toggleLanguage() {
    if (!triageResult) return;

    const btn = document.getElementById('langToggleBtn');

    if (currentLanguage === 'english') {
        currentLanguage = 'hindi';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-language"></i> <span>Switch to English</span>';
    } else {
        currentLanguage = 'english';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-language"></i> <span>Switch to Hindi</span>';
    }

    renderResults(triageResult);
}

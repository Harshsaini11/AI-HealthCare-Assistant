const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const COUNTER_FILE = path.join(__dirname, 'counter.json');

// File se count padhne ya 0 set karne ka helper function
function getCheckCount() {
    try {
        if (fs.existsSync(COUNTER_FILE)) {
            const data = fs.readFileSync(COUNTER_FILE, 'utf8');
            return JSON.parse(data).totalChecks || 0;
        }
    } catch (e) {
        console.error("Counter read error:", e);
    }
    return 0;
}

// File me count update karne ka helper function
function incrementCheckCount() {
    const currentCount = getCheckCount() + 1;
    try {
        fs.writeFileSync(COUNTER_FILE, JSON.stringify({ totalChecks: currentCount }), 'utf8');
    } catch (e) {
        console.error("Counter write error:", e);
    }
    return currentCount;
}

// 1. GET API: Home Page par count dikhane ke liye
app.get('/api/stats', (req, res) => {
    res.json({ totalChecks: getCheckCount() });
});

// 2. POST API: Symptom Analysis (Multi-Language Enabled)
app.post('/api/analyze', async (req, res) => {
    try {
        const { age, gender, symptoms } = req.body;

        const prompt = `
        You are an expert AI Healthcare Assistant. Analyze the patient symptoms in deep detail.
        Patient Details:
        - Age: ${age}
        - Gender: ${gender}
        - Symptoms: ${symptoms}

        Provide an extensive medical triage report in TWO languages: "english" and "hindi" (Written strictly in proper Hindi Devanagari script).

        STRICT REQUIREMENTS FOR BULLET POINTS:
        - MUST generate AT LEAST 5 TO 6 DETAILED BULLET POINTS for EVERY SINGLE array section.
        - Do NOT stop at 2 or 3 points under any circumstances.
        - Ensure both "english" and "hindi" responses have 5 to 6 points each.

        Return strictly this JSON structure:
        {
          "english": {
            "possible_conditions": [
              "Detailed Cause 1",
              "Detailed Cause 2",
              "Detailed Cause 3",
              "Detailed Cause 4",
              "Detailed Cause 5",
              "Detailed Cause 6"
            ],
            "what_to_do": [
              "Immediate Action 1",
              "Self-care Step 2",
              "Home Management Step 3",
              "Monitoring Step 4",
              "Warning Signs Step 5",
              "When to see doctor Step 6"
            ],
            "what_to_eat": [
              "Dietary Advice 1 (Hydration)",
              "Nutrient Recommendation 2",
              "Healing Foods 3",
              "Easily Digestible Food 4",
              "Vitamins/Minerals Support 5",
              "Recovery Food 6"
            ],
            "what_to_avoid": [
              "Avoid Activity/Food 1",
              "Avoid Item 2",
              "Avoid Trigger 3",
              "Avoid Harmful Habit 4",
              "Avoid Environment 5",
              "Avoid Medication Error 6"
            ],
            "otc_medications": [
              "First Aid / Pain Relief Option 1",
              "Symptom Support Option 2",
              "Soothing Agent / Electrolytes 3",
              "Secondary Relief OTC 4",
              "Topical or Supportive Measure 5"
            ],
            "doctor_urgency": "Low / Moderate / Emergency High"
          },
          "hindi": {
            "possible_conditions": [
              "संभावित कारण 1 (विस्तार में)",
              "संभावित कारण 2",
              "संभावित कारण 3",
              "संभावित कारण 4",
              "संभावित कारण 5",
              "संभावित कारण 6"
            ],
            "what_to_do": [
              "ज़रूरी कदम 1 (तुरंत)",
              "सुरक्षा निर्देश 2",
              "घर पर ध्यान रखने योग्य बात 3",
              "लक्षणों की निगरानी 4",
              "चेतावनी के संकेत 5",
              "डॉक्टर को कब दिखाएं 6"
            ],
            "what_to_eat": [
              "आहार संबंधी सलाह 1 (पानी/तरल पदार्थ)",
              "पौष्टिक भोजन 2",
              "हल्का और सुपाच्य आहार 3",
              "लाभदायक फल या सब्जियां 4",
              "इम्यूनिटी बढ़ाने वाली चीज़ें 5",
              "रिकवरी फ़ूड 6"
            ],
            "what_to_avoid": [
              "किस चीज़ से बचें 1 (गतिविधियां)",
              "परहेज़ योग्य खाना/पीना 2",
              "नुकसानदेह आदतें 3",
              "ट्रिगर्स से बचाव 4",
              "अप्रिय वातावरण से बचें 5",
              "बिना डॉक्टरी सलाह की हैवी मेडिसिन 6"
            ],
            "otc_medications": [
              "प्राथमिक उपचार / दर्द निवारक 1",
              "लक्षण राहत की दवा 2",
              "इलेक्ट्रोलाइट्स / ओआरएस 3",
              "अस्थाई राहत का विकल्प 4",
              "सहायक फर्स्ट एड उपाय 5"
            ],
            "doctor_urgency": "कम / मध्यम / तुरंत डॉक्टर से संपर्क करें"
          }
        }
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });

        incrementCheckCount();

        const data = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(data);
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});
const nodemailer = require('nodemailer');

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'harshsaini332211@gmail.com',       // Aapka Gmail address
        pass: 'tsebniceofihpqwq'    // Aapka Google App Password
    }
});

// Feedback Endpoint
app.post('/api/feedback', (req, res) => {
    const { name, message } = req.body;

    const mailOptions = {
        to: 'harshsaini332211@gmail.com',         // Jis email par feedback chahiye
        subject: `New Feedback from ${name} - AI HealthCare`,
        html: `
            <h2>New App Feedback Received</h2>
            <p><strong>User Name:</strong> ${name}</p>
            <p><strong>Feedback Message:</strong></p>
            <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #2563eb;">
                ${message}
            </blockquote>
            <p><em>Received on: ${new Date().toLocaleString()}</em></p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email Send Error:', error);
            return res.status(500).json({ success: false, error: 'Email send failed' });
        }
        res.json({ success: true, message: 'Feedback email sent successfully!' });
    });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Node.js Server running on port ${PORT}`));

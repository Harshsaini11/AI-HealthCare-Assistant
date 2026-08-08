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
        You are an AI Healthcare Assistant capable of analyzing ANY disease or medical symptom.
        
        Patient Details:
        - Age: ${age}
        - Gender: ${gender}
        - Symptoms/Condition: ${symptoms}

        Provide a clean triage report in TWO languages: "english" and "hindi" (Written strictly in proper Hindi Devanagari script).

        STRICT FORMATTING & LENGTH RULES:
        1. "possible_conditions", "what_to_do", "what_to_eat", and "what_to_avoid" MUST HAVE EXACTLY 5 BULLET POINTS EACH.
        2. "otc_medications" SHOULD BE DYNAMIC: Analyze the symptom and automatically decide the safe number of OTC/first-aid recommendations needed (can be 2 to 4 relevant items).
        3. EVERY SINGLE BULLET POINT MUST BE EXACTLY ONE COMPLETE SENTENCE (10 to 14 words per line).
        4. No paragraph dumps, no definitions, and no 2-word super short phrases. Exactly ONE well-formed sentence per line.

        Return strictly this JSON structure:
        {
          "english": {
            "possible_conditions": [
              "One complete sentence explaining the first potential cause clearly.",
              "One complete sentence explaining the second potential cause clearly.",
              "One complete sentence explaining the third potential cause clearly.",
              "One complete sentence explaining the fourth potential cause clearly.",
              "One complete sentence explaining the fifth potential cause clearly."
            ],
            "what_to_do": [
              "One complete sentence giving proper guidance on what step to take.",
              "One complete sentence giving proper guidance on what step to take.",
              "One complete sentence giving proper guidance on what step to take.",
              "One complete sentence giving proper guidance on what step to take.",
              "One complete sentence giving proper guidance on what step to take."
            ],
            "what_to_eat": [
              "One complete sentence suggesting helpful food or drinks for recovery.",
              "One complete sentence suggesting helpful food or drinks for recovery.",
              "One complete sentence suggesting helpful food or drinks for recovery.",
              "One complete sentence suggesting helpful food or drinks for recovery.",
              "One complete sentence suggesting helpful food or drinks for recovery."
            ],
            "what_to_avoid": [
              "One complete sentence detailing specific foods or habits to strictly avoid.",
              "One complete sentence detailing specific foods or habits to strictly avoid.",
              "One complete sentence detailing specific foods or habits to strictly avoid.",
              "One complete sentence detailing specific foods or habits to strictly avoid.",
              "One complete sentence detailing specific foods or habits to strictly avoid."
            ],
            "otc_medications": [
              "Medicine Name - Short one line description of its use."
            ],
            "doctor_urgency": "Low / Moderate / High"
          },
          "hindi": {
            "possible_conditions": [
              "पहला संभावित कारण स्पष्ट करते हुए एक पूरा वाक्य।",
              "दूसरा संभावित कारण स्पष्ट करते हुए एक पूरा वाक्य।",
              "तीसरा संभावित कारण स्पष्ट करते हुए एक पूरा वाक्य।",
              "चौथा संभावित कारण स्पष्ट करते हुए एक पूरा वाक्य।",
              "पांचवां संभावित कारण स्पष्ट करते हुए एक पूरा वाक्य।"
            ],
            "what_to_do": [
              "उचित देखभाल के लिए एक पूरा और स्पष्ट वाक्य।",
              "उचित देखभाल के लिए एक पूरा और स्पष्ट वाक्य।",
              "उचित देखभाल के लिए एक पूरा और स्पष्ट वाक्य।",
              "उचित देखभाल के लिए एक पूरा और स्पष्ट वाक्य।",
              "उचित देखभाल के लिए एक पूरा और स्पष्ट वाक्य।"
            ],
            "what_to_eat": [
              "आहार और पौष्टिक भोजन से जुड़ा एक पूरा वाक्य।",
              "आहार और पौष्टिक भोजन से जुड़ा एक पूरा वाक्य।",
              "आहार और पौष्टिक भोजन से जुड़ा एक पूरा वाक्य।",
              "आहार और पौष्टिक भोजन से जुड़ा एक पूरा वाक्य।",
              "आहार और पौष्टिक भोजन से जुड़ा एक पूरा वाक्य।"
            ],
            "what_to_avoid": [
              "परहेज़ और सावधानियों से संबंधित एक पूरा वाक्य।",
              "परहेज़ और सावधानियों से संबंधित एक पूरा वाक्य।",
              "परहेज़ और सावधानियों से संबंधित एक पूरा वाक्य।",
              "परहेज़ और सावधानियों से संबंधित एक पूरा वाक्य।",
              "परहेज़ और सावधानियों से संबंधित एक पूरा वाक्य।"
            ],
            "otc_medications": [
              "दवा का नाम - यह किस काम आती है उसकी संक्षिप्त जानकारी "
            ],
            "doctor_urgency": "कम / मध्यम / उच्च"
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

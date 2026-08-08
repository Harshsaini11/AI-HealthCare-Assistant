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
        You are an AI Healthcare Assistant. Analyze the patient and respond in valid JSON format ONLY.
        Patient Details:
        - Age: ${age}
        - Gender: ${gender}
        - Symptoms: ${symptoms}

        Provide the triage analysis in TWO languages: "english" and "hindi" (Written in proper Hindi Devanagari script).

        Return strictly this JSON structure:
        {
          "english": {
            "possible_conditions": ["Condition 1", "Condition 2"],
            "what_to_do": ["Step 1", "Step 2"],
            "what_to_eat": ["Food 1", "Food 2"],
            "what_to_avoid": ["Avoid 1", "Avoid 2"],
            "otc_medications": ["Medicine 1"],
            "doctor_urgency": "Low",
            "disclaimer": "Informational purposes only."
          },
          "hindi": {
            "possible_conditions": ["कारण 1", "कारण 2"],
            "what_to_do": ["क्या करें 1", "क्या करें 2"],
            "what_to_eat": ["क्या खाएं 1", "क्या खाएं 2"],
            "what_to_avoid": ["किस चीज़ से बचें 1", "किस चीज़ से बचें 2"],
            "otc_medications": ["दवा 1"],
            "doctor_urgency": "कम / सामान्य",
            "disclaimer": "केवल जानकारी के लिए है, डॉक्टर की सलाह जरूरी है।"
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

app.post('/api/symptoms', async (req, res) => {
    const { symptoms, patientInfo } = req.body;

    const prompt = `
    User Symptoms: ${symptoms}
    Patient Info: ${JSON.stringify(patientInfo)}

    Analyze these symptoms and provide a detailed triage report in valid JSON format ONLY.
    Return responses in TWO languages: "english" and "hinglish" (Roman Hindi / Hindi written in English letters).

    Return strictly this JSON structure without any extra text or markdown formatting:
    {
      "english": {
        "causes": ["Cause 1", "Cause 2"],
        "whatToDo": ["Action 1", "Action 2"],
        "diet": ["Diet recommendation 1"],
        "avoid": ["Thing to avoid 1"],
        "otc": ["Safe OTC medicine 1"]
      },
      "hinglish": {
        "causes": ["Bimari ya Waja 1", "Bimari ya Waja 2"],
        "whatToDo": ["Kya karna chahiye 1", "Kya karna chahiye 2"],
        "diet": ["Khane me kya lein 1"],
        "avoid": ["Kisse parhez karein 1"],
        "otc": ["Dawai ya First aid 1"]
      }
    }
    `;

    try {
        const response = await aiModel.generateContent(prompt);
        const resultText = response.response.text();
        
        // Clean JSON output
        const cleanJson = JSON.parse(resultText.replace(/```json|```/g, ''));
        res.json({ success: true, data: cleanJson });
    } catch (error) {
        res.status(500).json({ success: false, error: "Triage generation failed." });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Node.js Server running on port ${PORT}`));

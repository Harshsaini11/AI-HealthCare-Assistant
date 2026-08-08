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
        You are an AI Healthcare Assistant capable of analyzing ANY disease, symptom, or medical condition.
        
        Patient Details:
        - Age: ${age}
        - Gender: ${gender}
        - Symptoms/Condition: ${symptoms}

        Provide a clean triage report for this condition in TWO languages: "english" and "hindi" (Written strictly in proper Hindi Devanagari script).

        STRICT UNIVERSAL FORMATTING RULES:
        - Works for ANY medical symptom/disease.
        - Provide EXACTLY 4 TO 5 BULLET POINTS for EVERY section array.
        - STRICT MAX LENGTH: Maximum 3 to 6 words per bullet point ONLY.
        - NO paragraphs, NO definitions, NO long explanations. Only short, crisp titles/phrases.

        Return strictly this JSON structure:
        {
          "english": {
            "possible_conditions": [
              "Short Condition Name 1",
              "Short Condition Name 2",
              "Short Condition Name 3",
              "Short Condition Name 4"
            ],
            "what_to_do": [
              "Short Action Step 1",
              "Short Action Step 2",
              "Short Action Step 3",
              "Short Action Step 4"
            ],
            "what_to_eat": [
              "Short Diet Advice 1",
              "Short Diet Advice 2",
              "Short Diet Advice 3",
              "Short Diet Advice 4"
            ],
            "what_to_avoid": [
              "Short Avoid Item 1",
              "Short Avoid Item 2",
              "Short Avoid Item 3",
              "Short Avoid Item 4"
            ],
            "otc_medications": [
              "Short OTC Measure 1",
              "Short OTC Measure 2",
              "Short OTC Measure 3"
            ],
            "doctor_urgency": "Low / Moderate / High"
          },
          "hindi": {
            "possible_conditions": [
              "संक्षिप्त कारण/बीमारी 1",
              "संक्षिप्त कारण/बीमारी 2",
              "संक्षिप्त कारण/बीमारी 3",
              "संक्षिप्त कारण/बीमारी 4"
            ],
            "what_to_do": [
              "संक्षिप्त कदम 1",
              "संक्षिप्त कदम 2",
              "संक्षिप्त कदम 3",
              "संक्षिप्त कदम 4"
            ],
            "what_to_eat": [
              "संक्षिप्त आहार सलाह 1",
              "संक्षिप्त आहार सलाह 2",
              "संक्षिप्त आहार सलाह 3",
              "संक्षिप्त आहार सलाह 4"
            ],
            "what_to_avoid": [
              "संक्षिप्त परहेज़ 1",
              "संक्षिप्त परहेज़ 2",
              "संक्षिप्त परहेज़ 3",
              "संक्षिप्त परहेज़ 4"
            ],
            "otc_medications": [
              "संक्षिप्त दवा/राहत उपाय 1",
              "संक्षिप्त दवा/राहत उपाय 2",
              "संक्षिप्त दवा/राहत उपाय 3"
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

# 🏥 AI HealthCare Assistant — Smart Medical Guidance Portal

An interactive, AI-powered healthcare triage system that assists users with instant symptom analysis, differential diagnostic suggestions, non-prescription OTC medicine recommendations, and dietary guidance. Built with a modern SaaS-inspired responsive UI and a Node.js backend integration.

---

## 🌟 Key Features

* **AI Triage & Symptom Analysis:** Evaluates user inputs across 15+ comprehensive medical categories.
* **OTC & First-Aid Guidance:** Provides safe, non-prescription home care protocols and immediate precautions.
* **Personalized Diet & Lifestyle Plan:** Recommends beneficial foods and strictly specifies items to avoid.
* **Patient Profile Management:** Captures patient metrics, blood group, allergies, and pre-existing medical history.
* **Downloadable Medical Report:** Generates clean, printable PDF reports formatted for physical record-keeping.
* **Developer Feedback Channel:** Direct email notification pipeline powered by Nodemailer.
* **Dynamic Engagement Trackers:** Built-in interactive star rating system and health check counter.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Responsive Grid / Glassmorphism UI), Vanilla JavaScript (ES6+)
* **Backend:** Node.js, Express.js
* **Integrations:** Nodemailer, Google Generative AI / Groq SDK, CORS, Dotenv

---

## 📁 Project Structure

```text
ai-healthcare-assistant/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── home.html
│   ├── patient_info.html
│   └── index.html
└── README.md
🚀 Local Installation & Setup
Prerequisites
Node.js installed on your system.

Steps
Clone the Repository:

Bash
git clone [https://github.com/YOUR_USERNAME/ai-healthcare-assistant.git](https://github.com/YOUR_USERNAME/ai-healthcare-assistant.git)
cd ai-healthcare-assistant
Backend Setup:

Bash
cd backend
npm install
Configure Environment Variables (.env):
Create a .env file inside the backend directory:

Code snippet
PORT=8000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
Run the Server:

Bash
npm start
Launch Frontend:
Open frontend/home.html in your browser or run via VS Code Live Server.

⚠️ Medical Disclaimer
This application is designed solely for educational and preliminary guidance purposes. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek immediate assistance from a licensed medical practitioner or emergency helpline (112 / 108) during severe medical events.

👨‍💻 
Harsh Kumar Saini

Full-Stack & Software Developer

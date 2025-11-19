

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
// Serve your frontend from ../public by default (adjust if your structure is different)
app.use(express.static(path.join(__dirname, '../public')));

// Ensure uploads & data dirs
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // safer filename
    const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// ---------- Routes ----------
// Simple health
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Upload endpoint: accepts file field 'curriculumFile'. If PDF, extracts text and returns a short preview.
app.post('/api/upload', upload.single('curriculumFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const filePath = req.file.path;
    const response = { message: 'File uploaded successfully!', filename: req.file.filename, originalname: req.file.originalname };

    // If uploaded file is a PDF, try to extract text (optional; requires pdf-parse installed)
    if (req.file.mimetype === 'application/pdf' || path.extname(req.file.originalname).toLowerCase() === '.pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(dataBuffer);
        // return first 800 characters as preview
        response.extractedTextPreview = parsed.text ? parsed.text.trim().slice(0, 800) : '';
        response.pageCount = parsed.numpages || null;
      } catch (pdfErr) {
        // Non-fatal: PDF parsing failed
        console.warn('PDF parse failed:', pdfErr.message || pdfErr);
        response.pdfParseError = 'Could not extract PDF text on server.';
      }
    }

    return res.json(response);
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ message: 'Server error during upload.' });
  }
});

// Serve uploaded files by name (careful: this is simple and does not authenticate!)
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.sendFile(filePath);
});

// Feedback endpoint: stores feedback to data/feedback.json
app.post('/api/feedback', (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ message: 'name, email and message are required.' });

    const feedbackFile = path.join(DATA_DIR, 'feedback.json');
    let current = [];
    if (fs.existsSync(feedbackFile)) {
      try { current = JSON.parse(fs.readFileSync(feedbackFile)); } catch (e) { current = []; }
    }

    const record = { id: Date.now(), name, email, message, date: new Date().toISOString() };
    current.push(record);
    fs.writeFileSync(feedbackFile, JSON.stringify(current, null, 2));

    return res.json({ message: 'Feedback received successfully!' });
  } catch (err) {
    console.error('Feedback error', err);
    return res.status(500).json({ message: 'Server error saving feedback.' });
  }
});

// Mock industry trends endpoint — replace with real data source or DB later
app.get('/api/trends', (req, res) => {
  // Example payload structure that the frontend can use to render a comparison
  const trends = {
    lastUpdated: new Date().toISOString(),
    skills: [
      { skill: 'Data Structures & Algorithms', demandScore: 0.9 },
      { skill: 'Machine Learning', demandScore: 0.87 },
      { skill: 'Cloud Computing (AWS/GCP/Azure)', demandScore: 0.85 },
      { skill: 'Web Development (React/Node)', demandScore: 0.82 },
      { skill: 'Cybersecurity', demandScore: 0.7 }
    ],
    suggestedTopics: [
      'Hands-on ML projects',
      'Cloud-native architecture modules',
      'Industry-led capstone projects'
    ]
  };
  res.json(trends);
});

// Mock analytics endpoint — you can expand to compute real metrics from uploaded files
app.get('/api/analytics', (req, res) => {
  const analytics = {
    uploadedFilesCount: fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR).length : 0,
    feedbackCount: (() => {
      const f = path.join(DATA_DIR, 'feedback.json');
      if (!fs.existsSync(f)) return 0; try { return JSON.parse(fs.readFileSync(f)).length; } catch { return 0; }
    })(),
    lastUploads: (() => {
      if (!fs.existsSync(UPLOADS_DIR)) return [];
      return fs.readdirSync(UPLOADS_DIR)
        .map(fn => ({ filename: fn, uploadedAt: new Date(parseInt(fn.split('-')[0]) || 0).toISOString() }))
        .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
        .slice(0, 5);
    })()
  };

  res.json(analytics);
});

// Simple chatbot endpoint (rule-based). The frontend can POST { message: '...' }
app.post('/api/chat', (req, res) => {
  const text = (req.body.message || '').toString().trim().toLowerCase();
  if (!text) return res.status(400).json({ reply: "Please send a message in the 'message' field." });

  let reply = '';
  if (text.includes('upload')) reply = "You can upload your curriculum in the 'Upload Curriculum' section 📂. Click 'Browse File' or drag & drop the file.";
  else if (text.includes('feedback')) reply = "We'd love to hear your feedback — use the feedback form with your name and email so we can follow up. 💬";
  else if (text.includes('analytics')) reply = "Open the Analytics card and click 'View Analytics' to see recent uploads and feedback counts.";
  else if (text.includes('hello') || text.includes('hi')) reply = 'Hello there 👋! How can I assist you today?';
  else reply = "I'm a helper bot for uploads, analytics and feedback. Try asking about 'upload', 'feedback', or 'analytics'.";

  // You can enrich this by hooking to an NLP service or an LLM (careful with API keys).
  return res.json({ reply });
});

// Fallback: serve index.html for any other GET (useful for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/api/upload", upload.single("curriculumFile"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });
  res.json({ message: "File uploaded successfully!", filename: req.file.filename });
});

app.post("/api/feedback", (req, res) => {
  const feedbackFile = path.join(__dirname, "feedback.json");
  const feedback = req.body;

  let existingFeedback = [];
  if (fs.existsSync(feedbackFile)) {
    existingFeedback = JSON.parse(fs.readFileSync(feedbackFile));
  }
  existingFeedback.push({ ...feedback, date: new Date().toISOString() });

  fs.writeFileSync(feedbackFile, JSON.stringify(existingFeedback, null, 2));
  res.json({ message: "Feedback received successfully!" });
});


// Start server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

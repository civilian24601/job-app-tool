const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Helper function to parse PDF resumes
const parsePdf = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
};

// Helper function to parse DOCX resumes
const parseDocx = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer: dataBuffer });
  return result.value;
};

// Example parsing function to extract name and email from text
const parseResume = (text) => {
  const lines = text.split('\n');
  let name = '';
  let email = '';

  lines.forEach(line => {
    // Basic name extraction (assuming the name is on the first line)
    if (!name) {
      name = line.trim();
    }

    // Basic email extraction
    const emailMatch = line.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) {
      email = emailMatch[0];
    }
  });

  return { name, email };
};

// POST route for uploading and parsing a resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileExtension = path.extname(filePath).toLowerCase();
    let extractedText = '';

    if (fileExtension === '.pdf') {
      extractedText = await parsePdf(filePath);
    } else if (fileExtension === '.docx') {
      extractedText = await parseDocx(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    // Parse the resume text
    const parsedData = parseResume(extractedText);

    res.status(200).json({ message: 'File uploaded and parsed successfully', parsedData });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading and parsing file' });
  }
});

module.exports = router;

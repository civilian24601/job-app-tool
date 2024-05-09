const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const User = require('../models/User'); // Ensure the path is correct
const verify = require('../middleware/verifyToken'); // Import the verifyToken middleware
const { analyzeDocuments } = require('../utils/gptUtils'); // Utility for GPT-4 analysis

const router = express.Router();

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST route to upload and parse documents
router.post('/upload', verify, upload.array('files', 10), async (req, res) => {
  try {
    const userId = req.user._id; // Ensure the user is authenticated and req.user is populated
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const results = await Promise.all(req.files.map(async (file) => {
      let text = '';

      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        text = data.text;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else if (file.mimetype === 'text/plain') {
        text = file.buffer.toString('utf-8');
      } else {
        text = 'Unsupported file type';
      }

      user.documents.push({
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer,
        text: text,
        category: 'General', // You can modify this to handle different categories
      });

      return { filename: file.originalname, text };
    }));

    await user.save();

    // Analyze documents with GPT-4
    const analysis = await analyzeDocuments(user.documents);

    res.status(200).json({ results, analysis });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Error uploading files' });
  }
});

module.exports = router;

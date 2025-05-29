const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { exec } = require('child_process');

const app = express();
const port = 5000;
const upload = multer({ dest: __dirname + '/uploads/' }); // ✅ uploads path

app.use(cors());
app.use(express.json());

app.post('/upload', upload.single('pdf'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    fs.unlinkSync(filePath); // delete uploaded file

    const cleanedText = pdfData.text
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[^\x00-\x7F]/g, '')
      .trim();

    fs.writeFileSync(__dirname + '/input.txt', cleanedText);
    fs.writeFileSync(__dirname + '/offset.txt', '0');

    // Run textgen.py
    setTimeout(() => {
      exec(`python ${__dirname}/textgen.py`, { maxBuffer: 1024 * 1000 }, (error, stdout, stderr) => {
        console.log("🧠 PYTHON OUTPUT:", stdout);
        if (error) {
          console.error("❌ PYTHON ERROR:", error.message);
          return res.status(500).send("Python crashed");
        }
        if (stderr) console.warn("⚠️ PYTHON STDERR:", stderr);

        try {
          const cards = JSON.parse(stdout || '[]');
          res.json({ flashcards: cards });
        } catch (err) {
          console.error("🚫 JSON PARSE ERROR:", err.message);
          res.status(500).send("Invalid flashcard format");
        }
      });
    }, 500);

  } catch (err) {
    console.error("❌ FILE PROCESS ERROR:", err.message);
    res.status(500).send('Failed to process PDF');
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const path = require("path");
const Contents = require('./models/Contents.ts');

const app = express();
const port = 8088;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());

const startPublishScheduler = require('./cron/publishScheduler.ts');

startPublishScheduler();

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017')
.then(() => console.log('✅ MongoDB 연결 성공'))
.catch(err => console.error('❌ MongoDB 연결 실패:', err));

// API: 텍스트 저장
app.post('/api/save', async (req, res) => {
  const { title, content, status} = req.body;

  if (!content) {
    return res.status(400).json({ error: '내용이 비어 있습니다.' });
  }

  try {
    const newText = new Contents({ title,content, status });
    const savedText = await newText.save();
    res.status(201).json(savedText);
  } catch (err) {
    res.status(500).json({ error: '저장 중 오류 발생', details: err });
  }
});

// API: 텍스트 전체 조회
app.get('/api/list', async (req, res) => {
  try {
    const contents = await Contents.find().sort({ createdAt: -1 }); // 최신순
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: '조회 중 오류 발생', details: err });
  }
});

// API: 특정 텍스트 상세 조회
app.get('/api/detail/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const content = await Contents.findById(id);
  
      if (!content) {
        return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
      }
  
      res.json(content);
    } catch (err) {
      res.status(500).json({ error: '상세 조회 중 오류 발생', details: err });
    }
  });

const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("image"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded.");

  const imageUrl = `http://localhost:8088/uploads/${file.filename}`; // 또는 S3 URL 등
  res.json({ url: imageUrl });
});

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});

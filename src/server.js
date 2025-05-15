const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const path = require("path");
const Contents = require('./models/Contents.ts');
const authRoutes = require('./routes/auth');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = 8088;

// 미들웨어                                                                                                    
app.use(cors());
app.use(bodyParser.json());
app.use(morgan(':date[iso] ▶ :method :url :status :response-time ms'));


const startPublishScheduler = require('./cron/publishScheduler.ts');

startPublishScheduler();

// MongoDB 연결
// `${process.env.MONGODB_URL}`
//mongodb://localhost:27017
mongoose.connect(`mongodb://localhost:27017`,{maxPoolSize:500})
.then(() => console.log('✅ MongoDB 연결 성공'))
.catch(err => console.error('❌ MongoDB 연결 실패:', err));


// (async () => {
//   const username = 'admin';
//   const plainPassword = 'chancewave230719@';
//   const hashedPassword = await bcrypt.hash(plainPassword, 10);

//   const existing = await User.findOne({ username });
//   if (!existing) {
//     await User.create({ username, password: hashedPassword });
//     console.log('✅ Admin user created');
//   } else {
//     console.log('ℹ️ Admin user already exists');
//   }

//   mongoose.disconnect();
// })();

// 라우터 등록
app.use('/api', authRoutes);

// API: 텍스트 저장
app.post('/api/save', async (req, res) => {
  const { title, content, status, thumbnail} = req.body;

  if (!content) {
    return res.status(400).json({ error: '내용이 비어 있습니다.' });
  }

  try {
    const newText = new Contents({ title,content, status, thumbnail });
    const savedText = await newText.save();
    res.status(201).json(savedText);
  } catch (err) {
    res.status(500).json({ error: '저장 중 오류 발생', details: err });
  }
});

// API: 텍스트 전체 조회
app.get('/api/list', async (req, res) => {
  const page = parseInt(req.query.page) || 1;                    // current page
  const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;  // items per page
  const offset = (page - 1) * itemsPerPage;

  try {
    // 전체 데이터 개수 (프론트 totalItems 용)
    const totalItems = await Contents.countDocuments();

    // offset + limit pagination
    const contents = await Contents.find()
      .sort({ createdAt: -1 })   // 최신순
      .skip(offset)
      .limit(itemsPerPage)
      .select('-content')        // 불필요한 필드 제외
      .lean();

    res.json({
      data: contents,
      currentPage: page,
      itemsPerPage: itemsPerPage,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage)
    });
  } catch (err) {
    res.status(500).json({ error: '조회 중 오류 발생', details: err });
  }
});

// API: 특정 텍스트 상세 조회
app.get('/api/detail/:id', async (req, res) => {
    const id = Number(req.params.id);
  
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID는 숫자여야 합니다.' });
    }

    try {
      const content = await Contents.findOne({id});
  
      if (!content) {
        return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
      }
  
      res.json(content);
    } catch (err) {
      res.status(500).json({ error: '상세 조회 중 오류 발생', details: err });
    }
  });

// API: 특정 글 삭제
  app.delete('/api/detail/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID는 숫자여야 합니다.' });
    }

    try {
      const result = await Contents.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
      }
      
      res.json({ success: true, message: '삭제되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: '삭제 중 오류 발생', details: err.message });
    }
  });

const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("image"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded.");

  const imageUrl = `http://localhost:8088/uploads/${file.filename}`; // 또는 S3 URL 등
  res.json({ url: imageUrl });
});

const presignRouter = require('./routes/presign'); // 경로 정확히
app.use('/', presignRouter); // ✅ 반드시 있어야 함

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});

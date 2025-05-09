const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User.ts');
require('dotenv').config();

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 사용자 존재 여부 확인
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: '사용자 정보가 잘못되었습니다.' });

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    // JWT 토큰 발급
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
});

module.exports = router;

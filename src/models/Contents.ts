const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const contentsSchema = new mongoose.Schema({
  id: Number, // 시퀀스로 증가할 필드
  title:String, // 제목
  content: String, // html로된 데이터
  thumbnail:String, // 썸네일 이미지 경로 
  hashtags : {
    type : [String],
    default:[]
  },
  // 발행 상태값
  status: {  
    type: String,
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft',
  },
  scheduledAt: Date,
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 시퀀스 플러그인 적용
contentsSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Contents', contentsSchema);

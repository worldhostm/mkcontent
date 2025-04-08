const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const contentsSchema = new mongoose.Schema({
  id: Number, // 시퀀스로 증가할 필드
  title:String,
  content: String,
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

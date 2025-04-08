const cron = require('node-cron');
const Contents = require('../models/Contents.ts');

// 예약된 콘텐츠를 주기적으로 발행
const startPublishScheduler = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    try {
      const scheduled = await Contents.find({
        status: 'scheduled',
        scheduledAt: { $lte: now },
      });

      for (const content of scheduled) {
        await Contents.findByIdAndUpdate(content._id, {
          status: 'published',
          publishedAt: now,
          updatedAt: now,
        });

        console.log(`[CRON] 게시물 자동 발행 완료: ${content._id}`);
      }
    } catch (err) {
      console.error('[CRON] 발행 작업 중 오류:', err);
    }
  });

  console.log('[CRON] 예약 발행 스케줄러 시작됨');
};

module.exports = startPublishScheduler;

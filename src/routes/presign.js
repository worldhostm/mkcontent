const express = require('express')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const dotenv = require('dotenv')

dotenv.config()

const router = express.Router()

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

router.post('/api/presign', async (req, res) => {
  try {
    const { filename, contentType } = req.body

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' })
    }

    const key = `uploads/${Date.now()}-${filename}`

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 60 })

    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    res.json({ url, publicUrl, key })
  } catch (error) {
    console.error('❌ presign error:', error)
    res.status(500).json({ error: 'Failed to generate presigned URL' })
  }
})

module.exports = router

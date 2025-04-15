// lambda.js
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./server.js'); // 위에서 만든 express 앱

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};

const serverless = require('serverless-http');
const app = require('../../backend/server/app');

module.exports.handler = serverless(app);

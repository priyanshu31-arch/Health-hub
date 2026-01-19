const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const mongoose = require('mongoose');

const server = http.createServer(app);

// Initialize Socket.io (Only works locally or on persistent servers)
initSocket(server);

const PORT = process.env.PORT || 5000;

// The MongoDB connection is handled in app.js, but we can also ensure it here
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

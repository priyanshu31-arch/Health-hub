const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/beds', require('./routes/beds'));
app.use('/api/ambulances', require('./routes/ambulances'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/ambulance', require('./routes/ambulance-booking.js'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));

// Serve static uploads (Note: This won't work persistently on Netlify)
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Hospital Admin Server is running');
});

// We connect to MongoDB here so it's available for serverless functions
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ MongoDB connected'))
        .catch(err => console.error('❌ MongoDB Connection Failed:', err.message));
}

module.exports = app;

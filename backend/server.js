const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from your frontend origin
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Route Middleware
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err); // Add this line for logging
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

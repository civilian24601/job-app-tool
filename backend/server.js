const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI:", MONGO_URI);


if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error: ", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

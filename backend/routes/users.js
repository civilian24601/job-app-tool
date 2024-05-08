const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure the path is correct
const verify = require('../middleware/verifyToken'); // Update the path as necessary

const router = express.Router();

// POST route for user registration
router.post('/register', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    const savedUser = await newUser.save();
    res.status(201).json({ user: { name: savedUser.name, email: savedUser.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error registering new user' });
  }
});

// POST route for user login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send('User not found');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.header('auth-token', token).send({ message: 'Logged in successfully', token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in user' });
  }
});

// GET route to fetch user profile (Protected)
router.get('/profile', verify, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).send('Error fetching user profile');
  }
});

// PUT route to update user profile (Protected)
router.put('/profile', verify, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send('Error updating user profile');
  }
});

module.exports = router;

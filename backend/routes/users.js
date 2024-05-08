const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure the path is correct
const verify = require('../middleware/verifyToken'); // Update the path as necessary

const router = express.Router();

// POST route for user registration
router.post('/register', async (req, res) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    const savedUser = await newUser.save();
    const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.status(201).json({ user: { name: savedUser.name, email: savedUser.email }, token });
  } catch (error) {
    console.error('Error registering new user:', error);
    res.status(500).json({ error: 'Error registering new user' });
  }
});

// POST route for user login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.header('auth-token', token).json({ message: 'Logged in successfully', token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Error logging in user' });
  }
});

// GET route to fetch user profile (Protected)
router.get('/profile', verify, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile');
  }
});

// PUT route to update user profile (Protected)
router.put('/profile', verify, async (req, res) => {
  try {
    const { name, email, resume } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    if (resume) user.resume = resume; // Assuming resume is a URL or text

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Error updating user profile');
  }
});

module.exports = router;

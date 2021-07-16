const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validate } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.send(user);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let user = await User.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  });
  if (user)
    return res.status(400).send('User already exits with this email or phone.');

  user = new User(_.pick(req.body, ['name', 'phone', 'email', 'password']));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'name', 'email']));
});

router.put('/me/:id', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('User not found.');

  user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
    },
    { new: true }
  );

  res.send(user);
});

router.delete('/me/:id', auth, async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id).select('-password');

  if (!user)
    return res.status(404).send('User with the given ID was not found.');

  res.send(user);
});

module.exports = router;

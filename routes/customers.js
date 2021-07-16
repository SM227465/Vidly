const { Customer, validate } = require('../models/customer');
const mongoose = require('mongoose');
const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/', [auth, admin], async (req, res) => {
  const customers = await Customer.find().sort('name');

  res.send(customers);
});

router.get('/:id', [auth, admin], async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send('Customer with the given ID was not found. sorry :(');

  res.send(customer);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let customer = await Customer.findOne({ phone: req.body.phone });
  if (customer) return res.status(400).send('customer already exits.');

  customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone,
  });
  customer = await customer.save();

  res.send(customer);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone, isGold: false },
    { new: true }
  );

  if (!customer)
    return res.status(404).send('Customer with given ID was not found');

  res.send(customer);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res.status(404).send('Customer with the given ID was not found.');

  res.send(customer);
});

module.exports = router;

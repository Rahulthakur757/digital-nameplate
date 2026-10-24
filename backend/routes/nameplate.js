const express = require('express');
const router = express.Router();
const Nameplate = require('../models/Nameplate');

router.post('/bulk-add', async (req, res) => {
  try {
    const list = req.body.plates;
    const saved = await Nameplate.insertMany(list);
    res.json({ success: true, count: saved.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (req, res) => {
  const list = await Nameplate.find().sort({ updatedAt: -1 });
  res.json(list);
});

module.exports = router;
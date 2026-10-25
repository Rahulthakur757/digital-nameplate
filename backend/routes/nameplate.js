// const express = require('express');
// const router = express.Router();
// const Nameplate = require('../models/Nameplate');

// router.post('/bulk-add', async (req, res) => {
//   try {
//     const list = req.body.plates;
//     const saved = await Nameplate.insertMany(list);
//     res.json({ success: true, count: saved.length });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get('/list', async (req, res) => {
//   const list = await Nameplate.find().sort({ updatedAt: -1 });
//   res.json(list);
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const Nameplate = require('../models/Nameplate');

// 1. Bulk Upload (Excel/CSV parse hokar yahan aayega)
// BulkWrite use karne se duplicates handle hote hain aur existing MAC update ho jate hain
router.post('/bulk-add', async (req, res) => {
  try {
    const list = req.body.plates;

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ error: 'Plates array is required and cannot be empty.' });
    }

    // Agar MAC address uniquely map karna hai to upsert karein
    const bulkOps = list.map(plate => ({
      updateOne: {
        filter: { macAddress: plate.macAddress },
        update: { $set: plate },
        upsert: true
      }
    }));

    const result = await Nameplate.bulkWrite(bulkOps);
    
    res.json({ 
      success: true, 
      upsertedCount: result.upsertedCount, 
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error('Bulk add error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch All Plates (Queue load karne ke liye)
router.get('/list', async (req, res) => {
  try {
    const list = await Nameplate.find().sort({ updatedAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch nameplates' });
  }
});

// 3. Update Single Plate (e.g., Flashing complete hone ke baad status update)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Nameplate.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Clear/Delete Queue
router.delete('/clear', async (req, res) => {
  try {
    await Nameplate.deleteMany({});
    res.json({ success: true, message: 'All nameplates cleared from queue' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
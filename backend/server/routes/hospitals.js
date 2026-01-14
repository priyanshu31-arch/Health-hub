const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Bed = require('../models/Bed');
const Ambulance = require('../models/Ambulance');
const auth = require('../middleware/auth');

// @route   GET /hospitals
// @desc    Get all hospitals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /hospitals/me
// @desc    Get the hospital for the current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user.id });

    if (!hospital) {
      return res.status(404).json({ msg: 'Hospital not found' });
    }

    const beds = await Bed.find({ hospital: hospital._id });
    const ambulances = await Ambulance.find({ hospital: hospital._id });

    res.json({ hospital, beds, ambulances });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /hospitals/:id
// @desc    Get a single hospital with its beds and ambulances
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ msg: 'Hospital not found' });
    }

    const beds = await Bed.find({ hospital: req.params.id });
    const ambulances = await Ambulance.find({ hospital: req.params.id });

    res.json({
      hospital,
      beds,
      ambulances,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /hospitals
// @desc    Add a new hospital
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, photo, bio, rating } = req.body;

  try {
    let hospital = await Hospital.findOne({ user: req.user.id });

    if (hospital) {
      return res.status(400).json({ msg: 'You can only create one hospital' });
    }

    hospital = new Hospital({
      name,
      user: req.user.id,
      photo,
      bio,
      rating,
    });

    await hospital.save();

    res.json(hospital);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /hospitals/:id
// @desc    Update a hospital
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, photo, bio, rating } = req.body;

  try {
    let hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ msg: 'Hospital not found' });
    }

    if (hospital.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    hospital.name = name || hospital.name;
    hospital.photo = photo || hospital.photo;
    hospital.bio = bio || hospital.bio;
    hospital.rating = rating || hospital.rating;

    await hospital.save();

    res.json(hospital);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /hospitals/:id
// @desc    Delete a hospital
// @access  Private
router.delete('/:id', auth, async (req, ares) => {
  try {
    let hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ msg: 'Hospital not found' });
    }

    if (hospital.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await hospital.remove();

    res.json({ msg: 'Hospital removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

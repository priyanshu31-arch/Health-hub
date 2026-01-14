const express = require('express');
const router = express.Router();
const Ambulance = require('../models/Ambulance');
const Hospital = require('../models/Hospital');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// @route   POST /ambulance/book
// @desc    Book the nearest available ambulance
// @access  Private (for Users)
router.post('/book', auth, async (req, res) => {
  const { pickupLat, pickupLon, hospitalId, patientName, contactNumber } = req.body;

  if (!pickupLat || !pickupLon || !hospitalId) {
    return res.status(400).json({ msg: 'Missing location or hospital ID.' });
  }

  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ msg: 'Hospital not found.' });
    }

    // Find the nearest available ambulance to the user
    const nearestAmbulance = await Ambulance.findOne({
      hospital: hospitalId,
      status: 'available',
      // You can add a geospatial query here if you have many ambulances
    });

    if (!nearestAmbulance) {
      return res.status(404).json({ msg: 'No available ambulances for this hospital.' });
    }

    // Assign the booking to the ambulance
    nearestAmbulance.user = req.user.id;
    nearestAmbulance.status = 'booked';
    nearestAmbulance.pickupLocation = {
      type: 'Point',
      coordinates: [pickupLon, pickupLat],
    };
    nearestAmbulance.destinationAddress = hospital.name; // Or a full address if available

    // For demonstration, we'll set the ambulance's starting location.
    // In a real app, this would be the ambulance's actual current GPS location.
    nearestAmbulance.currentLocation = {
      type: 'Point',
      coordinates: [pickupLon + 0.05, pickupLat + 0.05], // Simulating a nearby start
    };

    await nearestAmbulance.save();

    // Create a booking record for history
    const booking = new Booking({
      bookingType: 'ambulance',
      bookingTypeModel: 'Ambulance',
      itemId: nearestAmbulance._id,
      hospital: hospital._id,
      user: req.user.id,
      patientName: patientName || req.user.name || 'N/A', // Fallback to user name
      contactNumber: contactNumber || 'N/A',
    });
    await booking.save();

    res.json(nearestAmbulance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /ambulance/status/:ambulanceId
// @desc    Get the status and location of a booked ambulance
// @access  Private
router.get('/status/:ambulanceId', auth, async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.ambulanceId);

    if (!ambulance || ambulance.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Ambulance booking not found.' });
    }

    res.json({
      _id: ambulance._id,
      currentLocation: ambulance.currentLocation,
      status: ambulance.status,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /ambulance/location/:ambulanceId
// @desc    Update an ambulance's current location (for the driver's app)
// @access  Private (for Admins/Drivers)
router.put('/location/:ambulanceId', auth, async (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ msg: 'Missing location data.' });
  }

  try {
    const ambulance = await Ambulance.findById(req.params.ambulanceId);

    if (!ambulance) {
      return res.status(404).json({ msg: 'Ambulance not found.' });
    }

    // In a real app, you'd verify the request is from the correct driver/admin

    ambulance.currentLocation = {
      type: 'Point',
      coordinates: [lon, lat],
    };

    // Logic to update status from 'booked' to 'in-transit' when the ride starts
    if (ambulance.status === 'booked') {
      ambulance.status = 'in-transit';
    }

    await ambulance.save();
    res.json(ambulance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

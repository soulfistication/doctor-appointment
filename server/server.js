const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows the frontend HTML widget to call this API
app.use(express.json()); // Parses incoming JSON payloads

// --- Mock Database ---
// In a real application, this would be a database like PostgreSQL or MongoDB.
// We store booked appointments to calculate which slots are still available.
const bookedAppointments = []; 

// Standard operating hours
const ALL_POSSIBLE_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", 
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
];

// ==========================================
// ENDPOINT 1: Fetch Available Times (GET)
// ==========================================
app.get('/api/slots', (req, res) => {
  const requestedDate = req.query.date;

  if (!requestedDate) {
    return res.status(400).json({ error: "Date parameter is required (YYYY-MM-DD)." });
  }

  // Find all appointments already booked for the requested date
  const bookingsForDate = bookedAppointments.filter(appt => appt.date === requestedDate);
  const bookedTimes = bookingsForDate.map(appt => appt.time);

  // Filter out the booked times from all possible slots
  const availableSlots = ALL_POSSIBLE_SLOTS.filter(time => !bookedTimes.includes(time));

  // Simulate a slight network delay (optional, matches the frontend widget's feel)
  setTimeout(() => {
    res.json(availableSlots);
  }, 500);
});

// ==========================================
// ENDPOINT 2: Book an Appointment (POST)
// ==========================================
app.post('/api/appointments', (req, res) => {
  const { date, time, childName, email } = req.body;

  // Basic validation
  if (!date || !time || !childName || !email) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Check if the slot was taken while the user was filling out the form
  const isSlotTaken = bookedAppointments.some(appt => appt.date === date && appt.time === time);
  if (isSlotTaken) {
    return res.status(409).json({ error: "Sorry, this time slot has just been booked." });
  }

  // Save the appointment to our "database"
  const newAppointment = {
    id: Date.now().toString(), // Simple unique ID
    date,
    time,
    childName,
    email,
    createdAt: new Date().toISOString()
  };
  
  bookedAppointments.push(newAppointment);

  console.log("New Appointment Booked:", newAppointment);

  // Respond with success
  res.status(201).json({ 
    message: "Appointment successfully created", 
    appointmentId: newAppointment.id 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Doctor Appointment API running on http://localhost:${PORT}`);
});
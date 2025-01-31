const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./Middleware/auth"); // Import the middleware

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
mongoose
  .connect("mongodb+srv://Shubha:Shubha@cluster0.eoyjn.mongodb.net/") 
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Mongoose Models
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  description: String,
  availableSeats: { type: Number, required: true, min: 1 },
});

const Event = mongoose.model("Event", EventSchema);

// User Schema (For authentication)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// Routes

// Register Route (Sign Up)
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, "your-secret-key", { expiresIn: "1h" }); // Replace with your actual secret key
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Event Routes (Authenticated)

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new event (Requires Authentication)
app.post("/api/events", authMiddleware, async (req, res) => {
  const { name, date, description, availableSeats } = req.body;
  try {
    const event = new Event({ name, date, description, availableSeats });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update an event (Requires Authentication)
app.put("/api/events/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, date, description, availableSeats } = req.body;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, date, description, availableSeats },
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete an event (Requires Authentication)
app.delete("/api/events/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await Event.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Starting the server
const PORT = 4000; // Replace with your desired port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

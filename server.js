const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
// configure CORS with a whitelist driven from env (comma-separated)
const allowedOrigins ='https://musicstreamingbyayush-sharma.netlify.app';
const corsOptions = {
  origin: function(origin, callback){
    // allow requests with no origin (mobile apps, curl, server-to-server)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));
// Note: registering a route with the literal path '*' (app.options('*', ...)) can
// cause path-to-regexp to attempt to parse '*' as a parameter in some router
// versions, leading to `PathError: Missing parameter name at index 1: *`.
// The global CORS middleware above already handles preflight requests, so we
// avoid registering an explicit '*' options route which prevents the PathError.
app.use(express.json());

// JioSaavn proxy routes
const jiosaavnRouter = require('./routes/jiosaavnRoutes');
app.use('/api/jiosaavn', jiosaavnRouter);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", userSchema);

// Test route for root
app.get("/", (req, res) => {
  res.send("✅ Backend is running fine!");
});

// 🔹 Auth Middleware
function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // Expect "Bearer <token>"
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded user info
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Register API
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    res.json({ message: "✅ User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Example Protected Route
app.get("/api/protected", auth, (req, res) => {
  res.json({ message: "✅ You are authorized!", user: req.user });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

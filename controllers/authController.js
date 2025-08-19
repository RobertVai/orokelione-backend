const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signTokens = (id) => ({
  access: jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" }),
  refresh: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" })
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const { access, refresh } = signTokens(user.id);

    res.status(201).json({ user: { id: user.id, name, email }, access, refresh });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const { access, refresh } = signTokens(user.id);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, access, refresh });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.refresh = (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ message: "No refresh token" });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const { access, refresh } = signTokens(payload.id);
    res.json({ access, refresh });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.userId).select("name email");
  res.json({ user });
};
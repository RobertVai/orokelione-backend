const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

const ORIGINS = (process.env.CORS_ORIGIN || "")
  .split(",").map(s => s.trim()).filter(Boolean);


const VERCEL_PREVIEW_RE = /^https:\/\/orokelione-[a-z0-9-]+-robertvais-projects\.vercel\.app$/;

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ORIGINS.includes(origin)) return cb(null, true);
    if (VERCEL_PREVIEW_RE.test(origin)) return cb(null, true); 
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);

mongoose.set("strictQuery", true);

const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("[db] connected");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
  })
  .catch((e) => {
    console.error("[db] error", e);
    process.exit(1);
  });
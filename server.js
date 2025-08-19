const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[db] connected");
    app.listen(process.env.PORT || 4000, () =>
      console.log(`[api] http://localhost:${process.env.PORT || 4000}`)
    );
  })
  .catch((e) => console.error("[db] error", e));
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());

const DB_FILE = "urls.json";

// Load database or initialize it
let urlDB = {};
if (fs.existsSync(DB_FILE)) {
  urlDB = JSON.parse(fs.readFileSync(DB_FILE));
}

// POST /shorten
app.post("/shorten", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const id = crypto.randomBytes(4).toString("hex");
  urlDB[id] = url;

  fs.writeFileSync(DB_FILE, JSON.stringify(urlDB, null, 2));
  res.json({ shortUrl: `http://localhost:${PORT}/${id}` });
});

// GET /:id → Redirect
app.get("/:id", (req, res) => {
  const originalUrl = urlDB[req.params.id];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send("URL not found");
  }
});

// GET /all → All URLs
app.get("/all", (req, res) => {
  res.json(urlDB);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

app.all("/api", async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : null,
    });

    const data = await response.text();
    res.status(200).send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(3001, () => {
  console.log("🚀 Proxy running on http://localhost:3001");
});

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieSession from "cookie-session";
import { google } from "googleapis";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SESSION_SECRET || "ai-studio-secret"],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true,
      sameSite: "none",
    })
  );

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.APP_URL + "/auth/callback"
  );

  // Auth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/photoslibrary.readonly",
        "profile",
        "email",
      ],
      prompt: "consent",
    });
    res.json({ url });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      req.session!.tokens = tokens;
      
      res.send("<html><body><script>if (window.opener) { window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*'); window.close(); } else { window.location.href = '/'; }</script><p>Authentication successful. This window should close automatically.</p></body></html>");
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: !!req.session?.tokens });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // Google Photos API Proxy
  app.get("/api/photos/list", async (req, res) => {
    if (!req.session?.tokens) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const tokens = req.session.tokens;
      const response = await axios.get("https://photoslibrary.googleapis.com/v1/mediaItems", {
        headers: {
          Authorization: "Bearer " + tokens.access_token,
        },
        params: {
          pageSize: 20,
          pageToken: req.query.pageToken,
        },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching photos:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch photos" });
    }
  });

  // Proxy to get image data as base64
  app.get("/api/photos/proxy", async (req, res) => {
    if (!req.session?.tokens) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const parsedUrl = new URL(url);
      // Security: Restrict to trusted Google Photos domains and prevent SSRF
      if (!parsedUrl.hostname.endsWith(".googleusercontent.com")) {
        return res.status(403).json({ error: "Forbidden: Untrusted domain" });
      }

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 5000, // Security: Add timeout to prevent hanging connections
      });

      const mimeType = response.headers["content-type"];
      const mimeTypeStr = String(mimeType);
      if (!mimeType || !mimeTypeStr.startsWith("image/")) {
        return res.status(400).json({ error: "Invalid content type: Only images are allowed" });
      }

      const base64 = Buffer.from(response.data, "binary").toString("base64");
      res.json({ data: "data:" + mimeType + ";base64," + base64, mimeType });
    } catch (error: any) {
      console.error("Error proxying image:", error.message);
      res.status(500).json({ error: "Failed to proxy image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();

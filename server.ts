import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import multer from "multer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const DATA_DIR = path.join(process.cwd(), "data");
  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
  const NEWS_FILE = path.join(DATA_DIR, "news.json");
  const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
  const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

  // Ensure directories exist
  async function ensureDirs() {
    for (const dir of [DATA_DIR, UPLOADS_DIR]) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  // Ensure data files exist with defaults if not present
  async function ensureData() {
    await ensureDirs();

    const defaults = {
      [NEWS_FILE]: [],
      [CATEGORIES_FILE]: [
        "জাতীয়", "আন্তর্জাতিক", "রাজনীতি", "অর্থনীতি", "খেলাধুলা", "বিনোদন", "প্রযুক্তি", "শিক্ষা", "লাইফস্টাইল"
      ],
      [SETTINGS_FILE]: { siteName: "নবদিগন্ত বার্তা", tickerEnabled: true }
    };

    for (const [file, defaultData] of Object.entries(defaults)) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, JSON.stringify(defaultData, null, 2));
      }
    }
  }

  await ensureData();

  // Configure Multer for image uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // Serve uploads statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  // API Routes
  app.post("/api/upload", upload.single("image"), (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  app.get("/api/news", async (req, res) => {
    const data = await fs.readFile(NEWS_FILE, "utf-8");
    res.json(JSON.parse(data));
  });

  app.post("/api/news", async (req, res) => {
    const data = JSON.parse(await fs.readFile(NEWS_FILE, "utf-8"));
    const newArticle = {
      ...req.body,
      id: Date.now().toString(),
      publishedAt: new Date().toISOString(),
    };
    data.push(newArticle);
    await fs.writeFile(NEWS_FILE, JSON.stringify(data, null, 2));
    res.json(newArticle);
  });

  app.put("/api/news/:id", async (req, res) => {
    const data = JSON.parse(await fs.readFile(NEWS_FILE, "utf-8"));
    const index = data.findIndex((n: any) => n.id === req.params.id);
    if (index !== -1) {
      data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
      await fs.writeFile(NEWS_FILE, JSON.stringify(data, null, 2));
      res.json(data[index]);
    } else {
      res.status(404).send("Not found");
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    let data = JSON.parse(await fs.readFile(NEWS_FILE, "utf-8"));
    data = data.filter((n: any) => n.id !== req.params.id);
    await fs.writeFile(NEWS_FILE, JSON.stringify(data, null, 2));
    res.status(204).send();
  });

  app.get("/api/categories", async (req, res) => {
    const data = await fs.readFile(CATEGORIES_FILE, "utf-8");
    res.json(JSON.parse(data));
  });

  app.get("/api/settings", async (req, res) => {
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    res.json(JSON.parse(data));
  });

  app.post("/api/settings", async (req, res) => {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json(req.body);
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

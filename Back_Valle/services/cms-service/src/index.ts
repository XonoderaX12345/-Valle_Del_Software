import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "./generated/prisma/index.js";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4103);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const jwtSecretValue: string = jwtSecret;

const createNewsSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  dateText: z.string().min(3),
  order: z.number().int().positive()
});

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

type AuthenticatedRequest = express.Request & {
  auth?: JwtPayload;
};

function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    req.auth = jwt.verify(authHeader.slice(7), jwtSecretValue) as unknown as JwtPayload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireCoordinator(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (req.auth?.role !== "coordinador") {
    return res.status(403).json({ error: "Coordinator role required" });
  }

  next();
}

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ service: "cms-service", status: "ok" });
});

app.get("/home", async (_req, res) => {
  const [hero, kpis, capabilities, focusAreas, audiences, timeline, spotlight, news] = await Promise.all([
    prisma.homeHero.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.homeKpi.findMany({ orderBy: { order: "asc" } }),
    prisma.homeCapability.findMany({ orderBy: { order: "asc" } }),
    prisma.homeFocus.findMany({ orderBy: { order: "asc" } }),
    prisma.homeAudience.findMany({ orderBy: { order: "asc" } }),
    prisma.homeTimeline.findMany({ orderBy: { order: "asc" } }),
    prisma.homeSpotlight.findMany({ orderBy: { order: "asc" } }),
    prisma.homeNews.findMany({ orderBy: { order: "asc" } })
  ]);

  res.json({
    hero,
    kpis,
    capabilities,
    focusAreas,
    audiences,
    timeline,
    spotlight,
    news
  });
});

app.get("/news", async (_req, res) => {
  const news = await prisma.homeNews.findMany({ orderBy: { order: "asc" } });
  res.json(news);
});

app.post("/news", requireAuth, requireCoordinator, async (req, res) => {
  const parsed = createNewsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const news = await prisma.homeNews.create({ data: parsed.data });
  return res.status(201).json(news);
});

app.listen(port, () => {
  console.log(`cms-service listening on ${port}`);
});

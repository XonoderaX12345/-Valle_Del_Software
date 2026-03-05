import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "./generated/prisma/index.js";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4103);

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

app.listen(port, () => {
  console.log(`cms-service listening on ${port}`);
});

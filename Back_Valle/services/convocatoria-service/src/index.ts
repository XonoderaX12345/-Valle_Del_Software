import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "./generated/prisma/index.js";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4104);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const jwtSecretValue: string = jwtSecret;

type JwtPayload = { sub: string; email: string; role: string };
type AuthenticatedRequest = express.Request & { auth?: JwtPayload };

const convocatoriaSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  opensAt: z.string().datetime(),
  closesAt: z.string().datetime(),
  status: z.enum(["draft", "published", "closed"]).optional()
});

const postulacionSchema = z.object({
  convocatoriaId: z.string().uuid(),
  fullName: z.string().min(3),
  email: z.string().email(),
  evidenceLinks: z.array(z.string().url()).optional()
});

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().min(3).optional()
});

function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });

  try {
    req.auth = jwt.verify(authHeader.slice(7), jwtSecretValue) as unknown as JwtPayload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireCoordinator(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (req.auth?.role !== "coordinador") return res.status(403).json({ error: "Coordinator role required" });
  next();
}

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ service: "convocatoria-service", status: "ok" });
});

app.get("/convocatorias", async (_req, res) => {
  const convocatorias = await prisma.convocatoria.findMany({ orderBy: { createdAt: "desc" } });
  res.json(convocatorias);
});

app.post("/convocatorias", requireAuth, requireCoordinator, async (req, res) => {
  const parsed = convocatoriaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const convocatoria = await prisma.convocatoria.create({
    data: {
      ...parsed.data,
      opensAt: new Date(parsed.data.opensAt),
      closesAt: new Date(parsed.data.closesAt),
      status: parsed.data.status ?? "draft"
    }
  });

  return res.status(201).json(convocatoria);
});

app.post("/postulaciones", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.auth?.role !== "estudiante") return res.status(403).json({ error: "Student role required" });

  const parsed = postulacionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const postulacion = await prisma.postulacion.create({
    data: {
      convocatoriaId: parsed.data.convocatoriaId,
      applicantUserId: req.auth.sub,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      evidenceLinks: parsed.data.evidenceLinks ?? []
    }
  });

  return res.status(201).json(postulacion);
});

app.get("/postulaciones", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.auth?.role === "coordinador") {
    const all = await prisma.postulacion.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(all);
  }

  const mine = await prisma.postulacion.findMany({ where: { applicantUserId: req.auth!.sub }, orderBy: { createdAt: "desc" } });
  return res.json(mine);
});

app.patch("/postulaciones/:id/review", requireAuth, requireCoordinator, async (req, res) => {
  const postulacionId = String(req.params.id);
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const updated = await prisma.postulacion.update({ where: { id: postulacionId }, data: parsed.data });
  return res.json(updated);
});

app.listen(port, () => {
  console.log(`convocatoria-service listening on ${port}`);
});

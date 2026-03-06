import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "./generated/prisma/index.js";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4109);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) throw new Error("JWT_SECRET is required");

const jwtSecretValue: string = jwtSecret;

const itemSchema = z.object({ name: z.string().min(2), status: z.string().min(2).optional() });

type JwtPayload = { sub: string; email: string; role: string };
type AuthenticatedRequest = express.Request & { auth?: JwtPayload };

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

function requireRoles(roles: string[]) {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ service: "seedbed-service", status: "ok" });
});

app.get("/seedbeds", requireAuth, requireRoles(["coordinador","mentor","estudiante","cliente"]), async (_req, res) => {
  const rows = await prisma.seedbed.findMany({ orderBy: { createdAt: "desc" } });
  res.json(rows);
});

app.post("/seedbeds", requireAuth, requireRoles(["coordinador","mentor"]), async (req, res) => {
  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const row = await prisma.seedbed.create({
    data: { name: parsed.data.name, status: parsed.data.status ?? "active" }
  });

  return res.status(201).json(row);
});

app.listen(port, () => {
  console.log(`seedbed-service listening on ${port}`);
});

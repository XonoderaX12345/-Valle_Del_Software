import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "./generated/prisma/index.js";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4102);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const jwtSecretValue: string = jwtSecret;

const createProfileSchema = z.object({
  authUserId: z.string().uuid(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  documentId: z.string().min(4).optional(),
  phone: z.string().min(7).optional(),
  faculty: z.string().min(2).optional(),
  program: z.string().min(2).optional()
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
  res.json({ service: "users-service", status: "ok" });
});

app.get("/profiles", requireAuth, requireRoles(["coordinador", "mentor"]), async (_req, res) => {
  const profiles = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.json(profiles);
});

app.post("/profiles", requireAuth, requireRoles(["coordinador"]), async (req, res) => {
  const parsed = createProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const profile = await prisma.userProfile.create({ data: parsed.data });
  return res.status(201).json(profile);
});

app.get("/profiles/me", requireAuth, requireRoles(["estudiante", "mentor", "cliente", "coordinador"]), async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: req.auth!.sub }
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  return res.json(profile);
});

app.listen(port, () => {
  console.log(`users-service listening on ${port}`);
});

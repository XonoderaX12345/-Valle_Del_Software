import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "./generated/prisma/index.js";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4101);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["coordinador", "mentor", "estudiante", "cliente"]),
  isActive: z.boolean().optional()
});

const updateUserSchema = z.object({
  role: z.enum(["coordinador", "mentor", "estudiante", "cliente"]).optional(),
  isActive: z.boolean().optional()
});

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const jwtSecretValue: string = jwtSecret;

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

type AuthenticatedRequest = express.Request & {
  auth?: JwtPayload;
};

app.use(cors());
app.use(express.json());

function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, jwtSecretValue) as unknown as JwtPayload;
    req.auth = decoded;
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

async function ensureSingleCoordinator(userIdToExclude?: string) {
  const existingCoordinator = await prisma.userAuth.findFirst({
    where: {
      role: { key: "coordinador" },
      ...(userIdToExclude ? { id: { not: userIdToExclude } } : {})
    }
  });

  if (existingCoordinator) {
    throw new Error("Coordinator user already exists");
  }
}

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ service: "auth-service", status: "ok" });
});

app.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const user = await prisma.userAuth.findUnique({
    where: { email: parsed.data.email },
    include: { role: true }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role.key },
    jwtSecretValue,
    { expiresIn: "8h" }
  );

  return res.json({
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role.key
    }
  });
});

app.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.userAuth.findUnique({
    where: { id: req.auth?.sub },
    include: { role: true }
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    id: user.id,
    email: user.email,
    role: user.role.key,
    isActive: user.isActive
  });
});

app.get("/users", requireAuth, requireCoordinator, async (_req, res) => {
  const users = await prisma.userAuth.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" }
  });

  return res.json(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role.key,
      isActive: user.isActive,
      createdAt: user.createdAt
    }))
  );
});

app.post("/users", requireAuth, requireCoordinator, async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const targetRole = await prisma.role.findUnique({
    where: { key: parsed.data.role }
  });

  if (!targetRole) {
    return res.status(400).json({ error: "Role not found" });
  }

  if (parsed.data.role === "coordinador") {
    try {
      await ensureSingleCoordinator();
    } catch {
      return res.status(409).json({ error: "Only one coordinator is allowed" });
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const created = await prisma.userAuth.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        roleId: targetRole.id,
        isActive: parsed.data.isActive ?? true
      },
      include: { role: true }
    });

    return res.status(201).json({
      id: created.id,
      email: created.email,
      role: created.role.key,
      isActive: created.isActive
    });
  } catch {
    return res.status(409).json({ error: "Email already exists" });
  }
});

app.patch("/users/:id", requireAuth, requireCoordinator, async (req, res) => {
  const userId = String(req.params.id);
  const parsed = updateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const existing = await prisma.userAuth.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!existing) {
    return res.status(404).json({ error: "User not found" });
  }

  let roleId = existing.roleId;

  if (parsed.data.role && parsed.data.role !== existing.role.key) {
    const role = await prisma.role.findUnique({ where: { key: parsed.data.role } });

    if (!role) {
      return res.status(400).json({ error: "Role not found" });
    }

    if (parsed.data.role === "coordinador") {
      try {
        await ensureSingleCoordinator(existing.id);
      } catch {
        return res.status(409).json({ error: "Only one coordinator is allowed" });
      }
    }

    roleId = role.id;
  }

  const updated = await prisma.userAuth.update({
    where: { id: existing.id },
    data: {
      roleId,
      isActive: parsed.data.isActive ?? existing.isActive
    },
    include: { role: true }
  });

  return res.json({
    id: updated.id,
    email: updated.email,
    role: updated.role.key,
    isActive: updated.isActive
  });
});

app.listen(port, () => {
  console.log(`auth-service listening on ${port}`);
});

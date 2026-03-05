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

const jwtSecret = process.env.JWT_SECRET ?? "change_me";

app.use(cors());
app.use(express.json());

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
    jwtSecret,
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

app.listen(port, () => {
  console.log(`auth-service listening on ${port}`);
});

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "./generated/prisma/index.js";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4102);

const createProfileSchema = z.object({
  authUserId: z.string().uuid(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  documentId: z.string().min(4).optional(),
  phone: z.string().min(7).optional(),
  faculty: z.string().min(2).optional(),
  program: z.string().min(2).optional()
});

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ service: "users-service", status: "ok" });
});

app.get("/profiles", async (_req, res) => {
  const profiles = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.json(profiles);
});

app.post("/profiles", async (req, res) => {
  const parsed = createProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const profile = await prisma.userProfile.create({ data: parsed.data });
  return res.status(201).json(profile);
});

app.listen(port, () => {
  console.log(`users-service listening on ${port}`);
});

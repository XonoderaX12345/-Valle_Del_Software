import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const roleKeys = [
    ["coordinador", "Coordinador"],
    ["mentor", "Mentor"],
    ["estudiante", "Estudiante"],
    ["cliente", "Cliente"]
  ] as const;

  for (const [key, name] of roleKeys) {
    await prisma.role.upsert({
      where: { key },
      update: { name },
      create: { key, name }
    });
  }

  const coordinatorRole = await prisma.role.findUniqueOrThrow({
    where: { key: "coordinador" }
  });

  const coordinatorEmail = process.env.COORDINATOR_EMAIL ?? "sebastianriascos892@gmail.com";
  const coordinatorPassword = process.env.COORDINATOR_PASSWORD ?? "ValleCoordinador2026*";
  const passwordHash = await bcrypt.hash(coordinatorPassword, 10);

  await prisma.userAuth.deleteMany({
    where: {
      role: { key: "coordinador" },
      email: { not: coordinatorEmail }
    }
  });

  await prisma.userAuth.upsert({
    where: { email: coordinatorEmail },
    update: { passwordHash, roleId: coordinatorRole.id, isActive: true },
    create: {
      email: coordinatorEmail,
      passwordHash,
      roleId: coordinatorRole.id,
      isActive: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const roleKeys = [
    ["admin", "Administrador"],
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

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { key: "admin" }
  });

  const passwordHash = await bcrypt.hash("ValleAdmin2026*", 10);

  await prisma.userAuth.upsert({
    where: { email: "admin@valle.local" },
    update: { passwordHash, roleId: adminRole.id, isActive: true },
    create: {
      email: "admin@valle.local",
      passwordHash,
      roleId: adminRole.id,
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

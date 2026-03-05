import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    "cms.read",
    "cms.write",
    "convocatoria.read",
    "convocatoria.write",
    "cohorte.read",
    "cohorte.write",
    "pmo.read",
    "pmo.write",
    "report.read"
  ];

  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key }
    });
  }
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

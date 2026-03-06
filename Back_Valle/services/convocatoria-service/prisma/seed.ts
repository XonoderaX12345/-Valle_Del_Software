import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.convocatoria.count();

  if (count === 0) {
    await prisma.convocatoria.create({
      data: {
        title: "Convocatoria IA Aplicada 2026",
        description: "Proceso de ingreso para ruta acelerada de IA aplicada.",
        status: "published",
        opensAt: new Date("2026-03-01T00:00:00.000Z"),
        closesAt: new Date("2026-04-30T23:59:59.000Z")
      }
    });
  }
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

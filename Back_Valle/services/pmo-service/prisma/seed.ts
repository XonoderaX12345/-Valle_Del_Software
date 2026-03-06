import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.project.count();
  if (count === 0) {
    await prisma.project.create({ data: { name: "Base Project", status: "active" } });
  }
}

main().then(async () => prisma.$disconnect()).catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

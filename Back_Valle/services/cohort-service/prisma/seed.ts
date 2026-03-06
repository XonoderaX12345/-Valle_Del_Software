import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.cohort.count();
  if (count === 0) {
    await prisma.cohort.create({ data: { name: "Base Cohort", status: "active" } });
  }
}

main().then(async () => prisma.$disconnect()).catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

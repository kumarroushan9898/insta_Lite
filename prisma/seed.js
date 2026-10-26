const prisma = require("../src/database/db");
const { users, posts } = require("./seed-data");

async function main(){
    await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
  await prisma.post.createMany({
    data: posts,
    skipDuplicates: true,
  });
}



main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const prisma = require("../src/database/db");
const { users, posts } = require("./seed-data");

async function main(){
    await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
  const postData = posts.map((post, index) => ({
  ...post,
  authorId: Math.floor(index / 2) + 1,
}));

await prisma.post.createMany({
  data: postData,
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
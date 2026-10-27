const prisma = require("../src/database/db");
const { users, posts, likes } = require("./seed-data");

async function main() {

  await prisma.user.createMany({
    data: users,
  });

  const postData = posts.map(({ author, ...post }) => ({
    ...post,
    authorId: author,
  }));

  await prisma.post.createMany({
    data: postData,
  });

  const createdPosts = await prisma.post.findMany({
    select: {
      id: true,
      imageUrl: true,
    },
  });

  const postIdByKey = new Map(
    createdPosts.map((post) => [
      post.imageUrl.match(/insta\d+/)[0],
      post.id,
    ])
  );
  const likeData = likes.map(({ user, post }) => ({
    userId: user,
    postId: postIdByKey.get(post),
  }));

  await prisma.like.createMany({
    data: likeData,
  });

  console.log(`Seeded ${users.length} users`);
  console.log(`Seeded ${posts.length} posts`);
  console.log(`Seeded ${likes.length} likes`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

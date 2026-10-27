const prisma = require("../src/database/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  // 1. Delete all rows from all three tables: children first
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create all users in one query, get created rows back
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      bio: user.bio,
      isPrivate: user.isPrivate,
      createdAt: new Date(user.createdAt),
    })),
  });

  // 3. Build lookup: username -> id
  const userIdByUsername = {};
  for (const user of createdUsers) {
    userIdByUsername[user.username] = user.id;
  }

  // 4. Create all posts in one query with real authorId, get created rows back
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((post) => ({
      imageUrl: post.imageUrl,
      caption: post.caption,
      location: post.location,
      createdAt: new Date(post.createdAt),
      authorId: userIdByUsername[post.author],
    })),
  });

  // 5. Build lookup: insta## -> post id
  const postIdByKey = {};
  for (const post of createdPosts) {
    const key = post.imageUrl.split("/")[4];
    postIdByKey[key] = post.id;
  }

  // 6. Create all likes in one query (real userId and postId)
  const createdLikes = await prisma.like.createManyAndReturn({
    data: likes.map((like) => ({
      userId: userIdByUsername[like.user],
      postId: postIdByKey[like.post],
    })),
  });

  // 7. Print summary using query returned lengths
  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`
  );
}

// 8. Disconnect when done, print error and exit 1 on failure
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

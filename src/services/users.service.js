
const prisma = require("../database/db.js");

async function createUser(userData) {
  return await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      fullname: userData.fullname,
      bio: userData.bio,
    },
  });
}

async function getAllUsers(
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  filters = {}
) {
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.isPrivate !== undefined) {
    where.isPrivate = filters.isPrivate;
  }

  if (filters.search) {
    where.OR = [
      {
        username: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        fullname: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
  });
}

async function updateUser(id, userData) {
  return await prisma.user.update({
    where: { id: Number(id) },
    data: {
      fullname: userData.fullname,
      bio: userData.bio,
      isPrivate: userData.isPrivate,
    },
  });
}

async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};

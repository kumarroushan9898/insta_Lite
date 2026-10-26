
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

async function getAllUsers() {
  return await prisma.user.findMany();
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

const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");

router.post("/", usersController.createUser);
router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.get("/:id/posts", usersController.getUserPosts);
router.get("/:id/liked-posts", usersController.getLikedPosts);
router.patch("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;

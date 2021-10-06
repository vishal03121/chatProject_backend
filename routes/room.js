const express = require("express");
const roomController = require("../controllers/room");
const {joinRoomMiddleware, createRoomMiddleware} = require("../middlewares/room");

const router = express.Router();

//add proper middleware
router.put("/createRoom", createRoomMiddleware, roomController.createRoom);
router.put("/joinRoom", joinRoomMiddleware, roomController.joinRoom);



module.exports = router;
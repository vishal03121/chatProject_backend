const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Room = require("../models/room");


exports.createRoom = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    try{
      const { username, password, room } = req.body;
      let hashpassword = await bcrypt.hash(password, 12);
      const newRoom = new Room({
        roomName: room,
        password: hashpassword,
      });


      let result = await newRoom.save();
      const token = jwt.sign(
        {
          roomId: result._id.toString(),
          random: hashpassword
        },
        "Arat3cgfaRnWEfyj95PREzBDgUbmPm"
      );
      
      res.status(201).json({
        message: "Success",
        url: "/room.html?username=" + username + "&room=" + room + "&token=" + token
      });

    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
exports.joinRoom = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error();
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }

    try {
      const { username, password, room } = req.body;
      let findedRoom = await Room.findOne({ roomName: room });
      if (!findedRoom) {
        const error = new Error("Room Not Found!!!");
        error.statusCode = 401;
        throw error;
      }
      const isEqual = await bcrypt.compare(password, findedRoom.password);
      if (!isEqual) {
        const error = new Error("Wrong Password");
        error.statusCode = 401;
        throw error;
      }
      // findedRoom.users.push({ username: username });
      let result = await findedRoom.save();
      const token = jwt.sign(
        {
          roomId: result._id.toString(),
          random: findedRoom.password
        },
        "Arat3cgfaRnWEfyj95PREzBDgUbmPm"
      );
      res.status(201).json({
        message: "Success",
        url:"/room.html?username=" + username + "&room=" + room + "&token=" + token
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const { body } = require("express-validator");
const Room = require("../models/room");

exports.joinRoomMiddleware = [
  body("room")
    .trim()
    .custom((value, { req }) => {
      if (value.length === 0)
        return Promise.reject("Room field must not be blank.");
      else {
        return Room.findOne({ roomName: value.toLowerCase() }).then((findRoom) => {
          if (!findRoom) {
            return Promise.reject("Room Not Found!!!");
          }
        });
      }
    }),
  body("username")
    .trim()
    .custom((value, { req }) => {
      if (value.length == 0)
        return Promise.reject("Display Name must not be blank.");
      return true;
    }),
  body("password")
    .trim()
    .custom((value, { req }) => {
      if (value.length < 8)
        return Promise.reject("Password must be minimum 8 characters long.");
      return true;
    }),
];

exports.createRoomMiddleware = [
    body("room")
    .trim()
    .custom((value, { req }) => {
      if (value.length == 0)
        return Promise.reject("Room field must not be blank.");
      else {
        return Room.findOne({ roomName: value.toLowerCase() }).then((findRoom) => {
          if (findRoom) {
            return Promise.reject("Room Already Exists!!!");
          }
        });
      }
    }),
  body("username")
    .trim()
    .custom((value, { req }) => {
      if (value.length == 0)
        return Promise.reject("Display Name must not be blank.");
      return true;
    }),
  body("password")
    .trim()
    .custom((value, { req }) => {
      if (value.length < 8)
        return Promise.reject("Password must be minimum 8 characters long.");
      return true;
    }),
];

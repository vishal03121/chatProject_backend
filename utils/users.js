const Room = require("../models/room");
const jwt = require("jsonwebtoken");
// const users = [];

const updateDB = async () => {
  let rooms = await Room.find();
  for(let i=0;i<rooms.length;i++){
    if(rooms[i].users.length===0) await Room.findByIdAndDelete(rooms[i]._id).exec().catch(err=>console.log(err));
  }
}
setInterval(async ()=>{
  await updateDB();
}, 1.8e+6);
// Join user to chat
const userJoin = async (id, username, room) => {
  let getRoom = await Room.findOne({roomName:room});
  if(!getRoom) return {user: {}, room: ""}
  const user = { id, username };
  getRoom.users.push(user);
  getRoom = await getRoom.save();

  // users.push(user);
  return {user, room};
}

// Get current user
const getCurrentUser = async (id, room, token) => {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "Arat3cgfaRnWEfyj95PREzBDgUbmPm");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  let getRoom = await Room.findOne({roomName:room});
  if(!getRoom) return {user: {}, room: ""}
  return {user:getRoom.users.find(user => user.id === id), room:getRoom.roomName};
}

// User leaves chat
const userLeave = async (id, room) => {
  let getRoom = await Room.findOne({roomName:room});
  if(!getRoom) return {users: [], room: ""}
  const index = getRoom.users.findIndex(user => user.id === id);
  let ret = {users: [], room: ""};
  if (index !== -1) {
    ret = getRoom.users[index];
    getRoom.users.splice(index, 1);
    getRoom.markModified("users");
    getRoom = await getRoom.save().catch(err=>console.log(err));
    if(!ret) rest = {users: [], room: ""};
  }
  return ret;
}

//find user with socket id:
const findUser = async (id) => {
  let rooms = await Room.find();
  for(let i=0;i<rooms.length;i++){
    for(let j=0;j<rooms[i].users.length;j++){
      if(rooms[i].users[j].id===id) return rooms[i].roomName;
    }
  }
  return "";
}

// Get room users
const getRoomUsers = async (room) => {
  let getRoom = await Room.findOne({roomName:room});
  if(!getRoom) return [];
  return getRoom.users;
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  findUser
};

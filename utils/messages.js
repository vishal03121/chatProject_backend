const { v4: uuidv4 } = require('uuid');
const formatMessage= (type, username, text, socketId) => {
  return {
    socketId,
    type,
    username,
    text,
    time: new Date().toLocaleTimeString("en-IN", {timeZone: 'Asia/Kolkata',hour: '2-digit', minute:'2-digit'}),
    messageId: uuidv4(),
  };
}

module.exports = formatMessage;

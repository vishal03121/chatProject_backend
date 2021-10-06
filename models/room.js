const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const room = new Schema(
    {
        roomName: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        users: {
            type: Array,
            required: true,
            default:[]
        }
    },
    { versionKey: false} 
);

module.exports = mongoose.model('room', room);
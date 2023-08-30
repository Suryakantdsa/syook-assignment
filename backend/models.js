const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    name: String,
    origin: String,
    destination: String,
    secret_key: String,
    timestamp: { type: Date, default: Date.now },
  });

  
const Message = mongoose.model('messages', messageSchema);

module.exports = Message;
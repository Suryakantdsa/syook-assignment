const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Message = require("./models"); 
const uri = "mongodb+srv://Suryakant:Suryadas@cluster0.mydbwj6.mongodb.net/EncryptApp?retryWrites=true&w=majority";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Load data from data.json
const dataFilePath = path.join(__dirname, "data.json");
const rawData = fs.readFileSync(dataFilePath);
const { names, cities } = JSON.parse(rawData);

// Encryption key (replace with your own)
const encryptionKey = crypto.randomBytes(32).toString("hex"); // 32 bytes for AES-256

// Generate random number within a range
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a hash of given fields
function generateSecretKey(name, origin, destination) {
  const hash = crypto.createHash("sha256");
  hash.update(name + origin + destination);
  return hash.digest("hex");
}

// Encrypt data using AES-256-CTR
function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-ctr", encryptionKey, iv);
  const encryptedData = Buffer.concat([iv, cipher.update(data), cipher.final()]);
  return encryptedData.toString("hex");
}

io.on("connection", (socket) => {
  setInterval(async () => {
    const encryptedMessages = [];
    const numMessages = getRandomInt(49, 499);

    for (let i = 0; i < numMessages; i++) {
      const name = names[getRandomInt(0, names.length - 1)];
      const origin = cities[getRandomInt(0, cities.length - 1)];
      const destination = cities[getRandomInt(0, cities.length - 1)];
      const secretKey = generateSecretKey(name, origin, destination);
      const message = {
        name,
        origin,
        destination,
        secret_key: secretKey,
      };
      encryptedMessages.push(encryptData(JSON.stringify(message)));
    }

    const encryptedStream = encryptedMessages.join("|");
    console.log(encryptedStream)

    try {
      const savedMessages = await Message.insertMany(encryptedMessages);
      socket.emit("savedMessages", savedMessages);
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  }, 10000); // 10 seconds
});

server.listen(3002, () => {
  console.log("Emitter service is running on port 3001");
});

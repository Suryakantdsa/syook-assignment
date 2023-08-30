const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Message = require("./models"); // Assuming your Message model is defined in a separate file
const uri=`mongodb+srv://Suryakant:Suryadas@cluster0.mydbwj6.mongodb.net/EncryptApp?retryWrites=true&w=majority`

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


// Generate a hash of given fields
function generateSecretKey(name, origin, destination) {
  const hash = crypto.createHash("sha256");
  hash.update(name + origin + destination);
  return hash.digest("hex");
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("encryptedDataStream", async (encryptedDataStream) => {
    const encryptedMessages = encryptedDataStream.split("|");

    for (const encryptedMessage of encryptedMessages) {
      try {
        const decipher = crypto.createDecipher("aes-256-ctr", SECRET_KEY);
        let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
        decrypted += decipher.final("utf8");

        const decryptedMessage = JSON.parse(decrypted);
        const { name, origin, destination, secret_key } = decryptedMessage;

        const calculatedSecretKey = generateSecretKey(name, origin, destination);

        if (secret_key === calculatedSecretKey) {
          const newMessage = new Message({
            name,
            origin,
            destination,
            timestamp: new Date()
          });

          await newMessage.save();
          console.log("Data saved to MongoDB:", decryptedMessage);

          // Emit decoded data event
          socket.emit("decodedData");
        } else {
          console.log("Data integrity compromised for:", decryptedMessage);
        }
      } catch (error) {
        console.error("Error decrypting or saving data:", error);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


server.listen(3001, () => {
  console.log("Emitter service is running on port 3001");
});

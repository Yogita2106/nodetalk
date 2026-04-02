const Message = require("../models/Message");

let users = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      users[userId] = socket.id;
    });

    socket.on("sendMessage", async ({ sender, receiver, message }) => {
      const newMessage = await Message.create({
        sender,
        receiver,
        message,
      });

      if (users[receiver]) {
        io.to(users[receiver]).emit("receiveMessage", newMessage);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
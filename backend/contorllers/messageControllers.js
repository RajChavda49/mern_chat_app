const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!chatId || !content) {
    return res
      .send({ status: "error", message: "send id & content" })
      .status(400);
  }

  var newMessage = {
    sender: req.user?._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res
      .send({ status: "success", message: "new message", data: message })
      .status(200);
  } catch (error) {
    res.status(400).send({ status: "error", message: "Message not sent" });
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.status(200).send({ status: "success", data: messages });
  } catch (err) {
    res.status(400).send({ status: "error", message: "not found messages" });
    throw new Error(err?.message);
  }
});

module.exports = { sendMessage, allMessages };

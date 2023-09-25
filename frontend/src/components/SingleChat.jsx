import React, { useEffect, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { BsArrowLeft, BsThreeDotsVertical } from "react-icons/bs";
import { ChatState, token } from "../context/ChatProvider";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { getUrl, postUrl } from "../baseurl";
import toast from "react-hot-toast";
import { AiOutlineUser } from "react-icons/ai";
import io from "socket.io-client";
import Lottie from "react-lottie";
import * as typing from "../assets/animations/typing.json";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setfetchAgain }) => {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessages, setNewMessages] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const {
    selectedChat,
    setSelectedChat,
    user,
    notifications,
    setNotifications,
  } = ChatState();

  function getSender(users) {
    const findSender = users?.find((sender) => sender?.email !== user?.email);
    return findSender.name;
  }

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: typing,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const getAllMessage = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      await getUrl(`/message/${selectedChat?._id}`, {
        headers: {
          Authorization: token,
        },
      }).then((res) => {
        setMessages(res?.data?.data);
        setLoading(false);
        socket.emit("join chat", selectedChat?._id);
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const SendMessage = async (event) => {
    event?.preventDefault();
    if (!newMessages) return;
    socket.emit("stop typing", selectedChat?._id);
    setNewMessages("");
    try {
      await postUrl("/message", {
        data: { chatId: selectedChat?._id, content: newMessages },
        headers: {
          Authorization: token,
        },
      }).then((res) => {
        socket.emit("new message", res?.data?.data);
        setMessages([...messages, res?.data?.data]);
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const typeMessage = (e) => {
    setNewMessages(e.target.value);

    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat?._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat?._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const isSameSender = (m, i) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== user?._id
    );
  };

  const isLastMessage = (i) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== user?._id &&
      messages[messages.length - 1].sender._id
    );
  };

  useEffect(() => {
    getAllMessage();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (selectedChatCompare._id !== newMessageRecieved.chat._id) {
        if (!notifications.includes(newMessageRecieved)) {
          setNotifications([newMessageRecieved, ...notifications]);
          setfetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  console.log(notifications);

  return (
    <>
      <UpdateGroupChatModal
        setShowRenameModal={setShowRenameModal}
        showRenameModal={showRenameModal}
      />
      <div className="lg:w-2/3 w-full bg-gray-100 rounded-lg min-h-[90vh] max-h-[90vh] sticky top-0 overflow-auto hide_scrollbar">
        {loading ? (
          <div className="w-full text-center text-3xl font-semibold flex items-center justify-center h-screen">
            Get all messages...
          </div>
        ) : selectedChat !== null ? (
          <>
            <div className="bg-black blur-md w-full p-2 sticky top-0 z-10"></div>
            {/* chat name */}
            <div className="flex w-[97%] items-center mx-auto justify-between mt-1 bg-white p-2 sticky top-1 z-10 rounded-lg">
              <h2
                onClick={() => setSelectedChat(null)}
                className="font-meduim text-2xl cursor-pointer capitalize gap-2 flex items-center"
              >
                <BsArrowLeft size={20} className="inline-block" />{" "}
                {!selectedChat?.isGroupChat
                  ? getSender(selectedChat?.users)
                  : selectedChat?.chatName}
              </h2>
              <BsThreeDotsVertical
                size={20}
                onClick={() => {
                  setShowRenameModal(true);
                }}
                className="cursor-pointer"
              />
            </div>
            {/* messages */}
            <div className="space-y-3 overflow-y-scroll min-h-[90vh] max-h-[90vh] hide_scrollbar p-3">
              {/*  receiver */}
              {messages.map((message, i) => (
                <div key={i} className="flex items-center gap-x-2">
                  {(isSameSender(message, i) || isLastMessage(i)) && (
                    <AiOutlineUser
                      size={30}
                      className="bg-gray-200 rounded-full p-1"
                    />
                  )}
                  <span
                    className={`${
                      message.sender._id === user._id
                        ? "bg-white text-black ml-auto"
                        : `bg-gray-400 text-white mr-auto ${
                            isLastMessage(i) && "ml-4"
                          } `
                    } text-left w-fit p-2 rounded-3xl  max-w-[70%]`}
                  >
                    {message?.content}
                  </span>
                </div>
              ))}
            </div>
            {isTyping ? (
              <div className="pb-20 font-semibold text-xl">Typing...</div>
            ) : (
              <></>
            )}
            {/* input */}
            <form
              onSubmit={SendMessage}
              className="w-[97%] bg-white left-2 rounded-lg p-2 sticky bottom-1 flex gap-x-2 items-center justify-between"
            >
              <input
                type="text"
                className="w-full pr-10 outline-none placeholder:font-medium placeholder:text-lg"
                placeholder="Type your message here..."
                value={newMessages}
                onChange={typeMessage}
              />
              {/* <ImAttachment
                size={30}
                className="cursor-pointer text-gray-300"
              /> */}
              <button type="submit">
                <FaTelegramPlane
                  size={40}
                  className="bg-green-500 cursor-pointer text-white p-2 rounded-lg"
                />
              </button>
            </form>
          </>
        ) : (
          <div className="flex w-full h-screen items-center justify-center">
            Select your chat.
          </div>
        )}
      </div>
    </>
  );
};

export default SingleChat;

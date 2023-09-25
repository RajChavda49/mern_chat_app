import { createContext, useContext, useEffect, useState } from "react";

const ChatContenxt = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userInfo = JSON.parse(window.localStorage.getItem("user"));
    setUser(userInfo);
  }, []);

  return (
    <ChatContenxt.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        notification,
        setNotification,
        chats,
        setChats,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContenxt.Provider>
  );
};
export const token =
  window.localStorage.getItem("user") !== null &&
  window.localStorage.getItem("user") !== undefined &&
  JSON.parse(window.localStorage.getItem("user")).token;

export const ChatState = () => {
  return useContext(ChatContenxt);
};

export default ChatProvider;

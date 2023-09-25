import React, { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  AiOutlineBell,
  AiOutlineNotification,
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineUser,
} from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { getUrl, postUrl } from "../baseurl";
import { ChatState, token } from "../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import SkeletonLoading from "./SkeletonLoading";
import CreateGroupChatModal from "./CreateGroupChatModal";

const Chats = ({ fetchAgain, setfetchAgain }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchChats, setSearchChats] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateGroupChatModal, setShowCreateGroupChatModal] =
    useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);

  const {
    user,
    setChats,
    chats,
    setSelectedChat,
    selectedChat,
    notifications,
  } = ChatState();

  const navigate = useNavigate();

  const dropDownref = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setShowProfileDropdown(false);

    toast.loading("Logout...");
    setTimeout(() => {
      toast.remove();
      window.localStorage.clear();
      setLogoutLoading(false);
      navigate("/auth");
    }, 2000);
  };

  const handleSearchChat = async (e) => {
    toast.remove();
    if (searchTerm === "") {
      searchRef.current.focus();
      return toast.error("enter word");
    }
    e.preventDefault();

    try {
      setSearchLoading(true);
      getUrl(`/user?search=${searchTerm}`, {
        headers: {
          Authorization: token,
        },
      })
        .then((res) => {
          if (res.data.length > 0) {
            setSearchTerm("");
            setSearchLoading(false);
            return setSearchChats(res.data);
          } else {
            toast.error("Not found");
            setSearchLoading(false);
          }
        })
        .catch((err) => {
          setSearchLoading(false);
        });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const getChats = () => {
    setLoading(true);
    getUrl("/chat", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        setChats(res.data?.chats);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        setLoading(false);
      });
  };

  const accessChat = async (userId) => {
    const userAlreadyExist = chats?.users?.find((user) => user?._id === userId);
    if (userAlreadyExist) {
      setSearchChats([]);
      setSearchTerm("");
      toast.error("Chat is already created.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await postUrl("/chat", {
        data: { userId },
        headers: {
          Authorization: token,
        },
      });
      if (!chats.find((chat) => chat?._id === data?._id)) {
        setChats([data?.chat, ...chats]);
      }
      setSelectedChat(data?.chat);
      setSearchChats([]);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setLoading(false);
    }
  };

  function getSender(users) {
    const findSender = users?.find((sender) => sender?.email !== user?.email);
    return findSender.name;
  }

  // for profile
  function handleClickOutside() {
    setShowProfileDropdown(false);
  }

  // for notification
  function handleClickOutside() {
    setShowNotificationDropdown(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropDownref.current &&
        !dropDownref.current.contains(event?.target) &&
        showProfileDropdown
      ) {
        setShowProfileDropdown(false);
      }
      if (
        dropDownref.current &&
        !dropDownref.current.contains(event?.target) &&
        showNotificationDropdown
      ) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [handleClickOutside, showProfileDropdown, showNotificationDropdown]);

  useEffect(() => {
    getChats();
  }, [fetchAgain]);

  return (
    <>
      <ProfileModal
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
      />

      <CreateGroupChatModal
        showCreateGroupChatModal={showCreateGroupChatModal}
        setShowCreateGroupChatModal={setShowCreateGroupChatModal}
      />
      <div className="lg:w-1/3 lg:block hidden min-h-[90vh] max-h-[90vh] space-y-4">
        <div className="sticky top-0 space-y-4 bg-white pb-1">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-3xl sticky top-0">Chats</h2>
            {/* profile */}
            <div className="relative flex items-center gap-2">
              <AiOutlineBell
                size={40}
                className="rounded-full p-1 cursor-pointer"
                onClick={() =>
                  setShowNotificationDropdown(!showNotificationDropdown)
                }
              />
              {/* notificaion dropdown */}
              <div
                ref={dropDownref}
                className={`absolute -bottom-24 z-10 right-12 select-none space-y-3 p-2 w-40  rounded-xl bg-gray-300 shadow-2xl text-white font-semibold transition duration-300 ease-out origin-top-right ${
                  showNotificationDropdown ? "scale-100" : "scale-0"
                }`}
              >
                {notifications.length > 0 ? (
                  <div></div>
                ) : (
                  <div>No messages here.</div>
                )}
              </div>
              <AiOutlineUser
                size={40}
                className="bg-gray-300 rounded-full p-1 cursor-pointer"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              />
              {/* profile dropdown */}
              <div
                ref={dropDownref}
                className={`absolute -bottom-24 z-10 right-0 select-none space-y-3 p-2 w-40  rounded-xl bg-gray-300 shadow-2xl text-white font-semibold transition duration-300 ease-out origin-top-right ${
                  showProfileDropdown ? "scale-100" : "scale-0"
                }`}
              >
                <p
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="hover:bg-gray-100 hover:text-black rounded-lg p-1 transition cursor-pointer"
                >
                  Profile
                </p>
                <p
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-gray-100 p-1 rounded-lg transition cursor-pointer"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
          <hr />
          {/* search */}
          <form
            onSubmit={(e) => handleSearchChat(e)}
            className="w-full relative"
          >
            <input
              type="text"
              placeholder="search"
              className="w-full placeholder:text-gray-400 placeholder:font-medium p-2 pr-12 outline-none focus:ring-2 rounded-lg bg-gray-100"
              onChange={(e) => setSearchTerm(e.target.value.trim())}
              value={searchTerm}
              ref={searchRef}
            />
            <AiOutlineSearch
              size={25}
              color="gray"
              className="absolute top-2 right-3 cursor-pointer"
              onClick={() => handleSearchChat()}
            />
          </form>
          <div className="flex w-full items-center justify-between">
            <span className="text-gray-400 font-semibold">Last Chats</span>
            <p
              className="bg-green-100 rounded-lg p-1 h-10 w-10 relative"
              title="create a group chat"
            >
              <AiOutlinePlus
                size={30}
                className="text-green-300"
                role="button"
                onClick={() => setShowCreateGroupChatModal(true)}
              />
            </p>
          </div>
          {/* <p className="w-full absolute -bottom-20 h-20 bg-gradient-to-b from-green-50 " /> */}
        </div>
        {/* chats */}
        <div className="overflow-y-scroll md:space-y-1 space-y-2 hide_scrollbar">
          {loading || searchLoading ? (
            <div className="space-y-2">
              <SkeletonLoading />
              <SkeletonLoading />
              <SkeletonLoading />
              <SkeletonLoading />
            </div>
          ) : searchChats.length > 0 ? (
            searchChats.map((user) => (
              <div
                key={user?._id}
                className={`w-full hover:bg-gray-100 transition-all duration-100 ease-in-out cursor-pointer flex items-center justify-between p-3 rounded-lg ${
                  user?._id === selectedChat?._id && "bg-gray-100"
                } `}
                onClick={() => {
                  accessChat(user?._id);
                }}
              >
                <div className="flex w-[90%] gap-x-3 items-center">
                  <FaUserCircle
                    size={30}
                    className="bg-gray-100 text-gray-300 rounded-full w-12 h-12 p-2"
                  />
                  {/* <p className="bg-green-300 w-10 h-10 rounded-full"></p> */}
                  <div>
                    <p className="font-semibold text-lg">{user?.name}</p>
                    <p className="font-light text-sm">last msg</p>
                  </div>
                </div>
                <span className="w-[10%] text-sm font-semibold text-gray-400">
                  10:35
                </span>
              </div>
            ))
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat?._id}
                className={`w-full hover:bg-gray-100 cursor-pointer flex items-center justify-between p-3 rounded-lg ${
                  chat?._id === selectedChat?._id && "bg-green-200"
                } `}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex w-[90%] gap-x-3 items-center">
                  <p className="bg-green-300 w-10 h-10 rounded-full"></p>
                  <div>
                    <p className="font-semibold text-lg">
                      {!chat?.isGroupChat
                        ? getSender(chat?.users)
                        : chat?.chatName}
                    </p>
                    <p className="font-light text-sm">last msg</p>
                  </div>
                </div>
                <span className="w-[10%] text-sm font-semibold text-gray-400">
                  10:35
                </span>
              </div>
            ))
          ) : (
            <div className="font-medium text-lg text-center text-gray-400">
              Create your chat.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(Chats);

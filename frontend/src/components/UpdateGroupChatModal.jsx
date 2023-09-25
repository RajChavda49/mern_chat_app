import React, { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { ChatState, token } from "../context/ChatProvider";
import { getUrl, putUrl } from "../baseurl";
import toast from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";

const UpdateGroupChatModal = ({ showRenameModal, setShowRenameModal }) => {
  const {
    selectedChat,
    setSelectedChat,
    user: loggedUser,
    setChats,
    chats,
  } = ChatState();

  const [searchChats, setSearchChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [searchUserTerm, setSearchUserTerm] = useState("");
  const [removeLoading, setRemoveLoading] = useState(false);
  const [addToGroupLoading, setAddToGroupLoading] = useState(false);
  const [leaveGroupLoading, setLeaveGroupLoading] = useState(false);

  const modalRef = useRef(null);

  function handleClickOutside() {
    setShowRenameModal(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event?.target)) {
        setShowRenameModal(false);
        setSearchUserTerm("");
        setSearchChats([]);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [handleClickOutside, showRenameModal]);

  const handleSearchChat = async (value) => {
    if (!value) return;
    setLoading(true);
    try {
      getUrl(`/user?search=${value}`, {
        headers: {
          Authorization: token,
        },
      })
        .then((res) => {
          if (res.data.length > 0) {
            setLoading(false);
            return setSearchChats(res.data);
          } else {
            toast.error("Not found");
            setLoading(false);
          }
        })
        .catch((err) => {});
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleAddtoGroup = async (userToAdd) => {
    toast.remove();
    if (addToGroupLoading) return;
    const userAlreadyExist = await selectedChat?.users?.find(
      (user) => user?._id === userToAdd?._id
    );
    if (userAlreadyExist) {
      return toast.error("User already selected");
    }
    setAddToGroupLoading(true);
    toast.loading("Adding...");
    try {
      putUrl("/chat/groupadd", {
        data: {
          chatId: selectedChat?._id,
          userId: userToAdd?._id,
        },
        headers: {
          Authorization: token,
        },
      }).then((res) => {
        if (res.data?.status === "success") {
          setSelectedChat(res?.data?.chat);
          const updatedChats = chats.map((chat) =>
            chat?._id === selectedChat?._id ? res?.data?.chat : chat
          );
          setChats(updatedChats);
          setSearchUserTerm("");
          setSearchChats([]);
        }
        toast.remove();
        setAddToGroupLoading(false);
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setAddToGroupLoading(false);
      toast.remove();
    }
  };

  const handleRemoveFromGroup = async (userId) => {
    toast.remove();
    if (!userId || removeLoading || leaveGroupLoading) return;
    if (selectedChat?.users?.length === 3) {
      toast.error("Atleast 3 member needed.");
      return;
    }
    if (
      userId !== selectedChat?.groupAdmin?._id &&
      userId !== loggedUser?._id
    ) {
      toast.error("only admin can remove from chat.s");
      return;
    }
    if (userId === loggedUser?._id) {
      setLeaveGroupLoading(true);
    } else {
      setRemoveLoading(true);
    }
    toast.loading("Removing...");
    try {
      await putUrl("/chat/groupremove", {
        data: {
          chatId: selectedChat?._id,
          userId,
        },
        headers: {
          Authorization: token,
        },
      }).then((res) => {
        if (res.data?.status === "success") {
          const updatedChats = chats.map((chat) =>
            chat?._id === selectedChat?._id ? res?.data?.chat : chat
          );
          setChats(updatedChats);
          setSelectedChat(res.data?.chat);
          toast.remove();
        }
        setRemoveLoading(false);
        setLeaveGroupLoading(false);
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
      toast.remove();
      setLeaveGroupLoading(false);
      setRemoveLoading(false);
    }
  };

  const handleRenameGroup = async (e) => {
    e.preventDefault();
    toast.remove();
    if (!newGroupName) {
      toast.error("Enter a word");
      return;
    }
    if (newGroupName === selectedChat?.chatName) {
      toast.error("Can't be same as current name");
      return;
    }
    try {
      setRenameLoading(true);
      const res = await putUrl("/chat/rename", {
        data: {
          chatId: selectedChat?._id,
          chatName: newGroupName,
        },
        headers: {
          Authorization: token,
        },
      });
      if (res?.data?.status === "success") {
        const newNameChat = { ...selectedChat, chatName: newGroupName };
        setSelectedChat(newNameChat);
        setNewGroupName("");
        const updatedChats = chats.map((chat) =>
          chat?._id === selectedChat?._id ? newNameChat : chat
        );
        setChats(updatedChats);
      }
      setRenameLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setRenameLoading(false);
    }
  };

  const debounce = (func) => {
    let timer;
    return function (...args) {
      const context = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 500);
    };
  };

  const optimizedFn = useCallback(debounce(handleSearchChat), []);

  return (
    <>
      <div
        className={`bg-black bg-opacity-30 fixed inset-0 z-10 origin-center ${
          showRenameModal ? "scale-100" : "scale-0"
        } transition-all duration-300 `}
      ></div>
      <div
        ref={modalRef}
        className={`bg-white ${
          showRenameModal ? "scale-100" : "scale-0"
        }  transition-all duration-100 origin-center fixed w-1/3 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 p-5 rounded-lg h-auto space-y-5`}
      >
        <div className="flex items-center justify-between">
          <div />
          <p className="font-meduim text-center text-3xl">
            {selectedChat?.chatName}
          </p>
          <AiOutlineClose
            size={30}
            role="button"
            onClick={() => setShowRenameModal(false)}
          />
        </div>
        {/* users */}
        <div className="flex gap-2 items-center justify-start">
          {selectedChat !== null &&
            selectedChat?.users
              ?.filter((user) => user?._id !== loggedUser?._id)
              ?.map((user) => (
                <span
                  key={user?.name}
                  className="bg-green-300 font-medium p-1 rounded-lg flex items-center gap-x-2"
                >
                  {user?.name}{" "}
                  <AiOutlineClose
                    role="button"
                    color="white"
                    onClick={() => handleRemoveFromGroup(user?._id)}
                  />
                </span>
              ))}
        </div>
        {/* update name field */}
        <form
          onSubmit={(e) => handleRenameGroup(e)}
          className="w-full flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Group Name"
            className="w-9/12 border rounded-lg outline-none p-3 focus:border-green-400"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button
            disabled={renameLoading}
            className="float-right active:scale-95 transition-all w-3/12 p-2 rounded-lg bg-green-400 text-white text-center"
          >
            {renameLoading ? "Upadting..." : "Update"}
          </button>
        </form>

        <input
          type="text"
          placeholder="Add user"
          className="w-full border rounded-lg outline-none p-3 focus:border-green-400"
          onChange={(e) => {
            optimizedFn(e.target.value.trim());
            setSearchUserTerm(e.target.value.trim());
          }}
          value={searchUserTerm}
        />

        {loading ? (
          <div>Loading...</div>
        ) : (
          searchChats.map((user) => (
            <div
              key={user?._id}
              className={`w-full hover:bg-gray-200 bg-gray-100 transition-all duration-100 ease-in-out cursor-pointer flex items-center justify-between p-3 rounded-lg  `}
              onClick={() => {
                handleAddtoGroup(user);
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
                  <p className="font-light text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <button
          type="button"
          className="float-right active:scale-95 transition-all w-1/2 p-2 rounded-lg bg-red-400 text-white text-center"
          onClick={() => handleRemoveFromGroup(loggedUser?._id)}
          disabled={
            removeLoading || leaveGroupLoading || loading || renameLoading
          }
        >
          {leaveGroupLoading ? "Leaving..." : "Leave group"}
        </button>
      </div>
    </>
  );
};

export default UpdateGroupChatModal;

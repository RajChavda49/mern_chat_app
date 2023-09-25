import React, { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { ChatState, token } from "../context/ChatProvider";
import { BaseUrl, getUrl, postUrl } from "../baseurl";
import toast, { useToaster } from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";

const CreateGroupChatModal = ({
  setShowCreateGroupChatModal,
  showCreateGroupChatModal,
}) => {
  const [searchChats, setSearchChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [createGrpLoading, setCreateGrpLoading] = useState(false);

  const modalRef = useRef(null);

  const { setChats, chats } = ChatState();

  function handleClickOutside() {
    setShowCreateGroupChatModal(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event?.target)) {
        setShowCreateGroupChatModal(false);
        setSearchChats([]);
        setSelectedUsers([]);
        setGroupName("");
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [handleClickOutside, showCreateGroupChatModal]);

  const handleSearchChat = async (value) => {
    if (!value) return;
    setLoading(true);
    try {
      getUrl(`/user?search=${value}`, {
        headers: {
          Authorization: token,
        },
      }).then((res) => {
        if (res.data.length > 0) {
          setLoading(false);
          return setSearchChats(res.data);
        } else {
          toast.error("Not found");
          setLoading(false);
        }
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleAddtoGroup = (userToAdd) => {
    toast.remove();
    if (selectedUsers.includes(userToAdd))
      return toast.error("User already selected");
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const removeFromGroup = (userToRemove) => {
    const removeUser = selectedUsers.filter(
      (user) => user?._id !== userToRemove?._id
    );
    setSelectedUsers(removeUser);
  };

  const hanldeSubmit = () => {
    if (groupName === "" || selectedUsers.length === 0) {
      toast.remove();
      return toast.error("Enter gruop name and select the users");
    } else if (selectedUsers.length <= 1) {
      toast.remove();
      return toast.error("Please select more than 1 user for group chat");
    }
    const ids = selectedUsers.map((user) => user?._id);
    setCreateGrpLoading(true);
    postUrl("/chat/group", {
      data: {
        users: ids,
        name: groupName,
      },
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        if (res.data.status === "success") {
          toast.success("group created");
        }
        setChats([res.data?.chat, ...chats]);
        setSearchChats([]);
        setSelectedUsers([]);
        setGroupName("");
        setShowCreateGroupChatModal(false);
        setCreateGrpLoading(false);
      })
      .catch((err) => {
        setCreateGrpLoading(false);
        console.log(err);
      });
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

  useEffect(() => {
    return () => {
      setSearchChats([]);
      setSelectedUsers([]);
      setGroupName("");
    };
  }, []);

  return (
    <>
      <div
        className={`bg-black bg-opacity-30 fixed inset-0 z-10 origin-center ${
          showCreateGroupChatModal ? "scale-100" : "scale-0"
        } transition-all duration-300 `}
      ></div>
      <form
        ref={modalRef}
        className={`bg-white ${
          showCreateGroupChatModal ? "scale-100" : "scale-0"
        }  transition-all duration-100 origin-center fixed w-1/2 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 p-5 rounded-lg h-auto space-y-5`}
      >
        <div className="flex items-center justify-between">
          <div />
          <p className="font-meduim text-center text-3xl">
            create a group chat
          </p>
          <AiOutlineClose
            size={30}
            role="button"
            onClick={() => setShowCreateGroupChatModal(false)}
          />
        </div>
        <input
          type="text"
          placeholder="Group Name"
          className="w-full border rounded-lg outline-none p-3 focus:border-green-400"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Add user"
          className="w-full border rounded-lg outline-none p-3 focus:border-green-400"
          onChange={(e) => {
            optimizedFn(e.target.value.trim());
          }}
          defaultValue=""
        />
        <div className="flex gap-2 items-center justify-start">
          {selectedUsers.length > 0 &&
            selectedUsers.map((user) => (
              <span
                key={user?.name}
                className="bg-green-300 font-medium p-1 rounded-lg flex items-center gap-x-2"
              >
                {user.name}{" "}
                <AiOutlineClose
                  role="button"
                  color="white"
                  onClick={() => removeFromGroup(user)}
                />
              </span>
            ))}
        </div>
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
          className="float-right active:scale-95 transition-all w-1/2 p-2 rounded-lg bg-green-400 text-white text-center"
          onClick={() => hanldeSubmit()}
          disabled={createGrpLoading}
        >
          {createGrpLoading ? "Creating..." : "Create Chat"}
        </button>
      </form>
    </>
  );
};

export default CreateGroupChatModal;

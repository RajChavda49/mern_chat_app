import React, { memo, useEffect, useRef } from "react";
import { ChatState } from "../context/ChatProvider";
import { AiOutlineClose } from "react-icons/ai";
import { BaseUrl } from "../baseurl";

const ProfileModal = ({ setShowProfileModal, showProfileModal }) => {
  const { user } = ChatState();

  const modalRef = useRef(null);

  function handleClickOutside() {
    setShowProfileModal(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event?.target)) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [handleClickOutside, showProfileModal]);

  return (
    <>
      <div
        className={`bg-black bg-opacity-30 fixed inset-0 z-10 origin-center ${
          showProfileModal ? "scale-100" : "scale-0"
        } transition-all duration-300 `}
      ></div>
      <div
        ref={modalRef}
        className={`bg-white ${
          showProfileModal ? "scale-100" : "scale-0"
        }  transition-all duration-100 origin-center fixed w-1/2 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 p-5 rounded-lg h-auto space-y-5`}
      >
        <AiOutlineClose
          size={30}
          role="button"
          className="ml-auto"
          onClick={() => setShowProfileModal(false)}
        />

        <img
          src={BaseUrl.concat(user?.pic)}
          alt="user"
          className="border rounded-full h-20 w-20 object-contain object-center mx-auto"
        />

        <p className="text-2xl font-semibold text-center">{user?.name}</p>
        <p className="font-semibold text-lg text-center">{user?.email}</p>
      </div>
    </>
  );
};

export default memo(ProfileModal);

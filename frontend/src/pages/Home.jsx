import React, { useEffect, useState } from "react";
import Chats from "../components/Chats";
import SingleChat from "../components/SingleChat";
import { getUrl, postUrl, putUrl } from "../baseurl";
import { ChatState, token } from "../context/ChatProvider";
import toast from "react-hot-toast";

const Home = () => {
  const [fetchAgain, setfetchAgain] = useState(false);
  const { user } = ChatState();

  const sendMessage = async () => {
    try {
      await postUrl("/message", {
        data: { chatId: "651032cd666f6f8d7a9b864f", content: "Hi how  are" },
        headers: {
          Authorization: token,
        },
      }).then((res) => {
        console.log(res.data?.data);
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // useEffect(() => {
  //   sendMessage();
  // }, []);

  return (
    <div className="container rounded-2xl min-h-screen max-h-screen mx-auto font-Kanit w-full h-auto p-4 bg-gray-400/20 bg-opacity-20">
      <div className="bg-white h-auto hide_scrollbar overflow-auto p-5 border border-gray-500 rounded-2xl w-full flex justify-start items-start gap-4">
        <Chats fetchAgain={fetchAgain} />

        <SingleChat fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />
      </div>
    </div>
  );
};

export default Home;

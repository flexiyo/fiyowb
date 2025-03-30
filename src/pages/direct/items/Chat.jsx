import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Snowflake from "snowflake-id";
import UserContext from "../../../context/items/UserContext.jsx";
import SocketContext from "../../../context/items/SocketContext.jsx";
import {
  initializeMessageStock,
  updateMessageStocks,
  getLastLog,
} from "../../../hooks/useChatUtils.js";
import CustomTopNav from "../../../layout/items/CustomTopNav.jsx";
import ChatMessenger from "../../../components/direct/chat/ChatMessenger.jsx";

const Chat = () => {
  const snowflake = new Snowflake();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { socket, inboxItems, setInboxItems } = useContext(SocketContext);
  const { userInfo } = useContext(UserContext);

  const [roomDetails, setRoomDetails] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [skipCount, setSkipCount] = useState(0);

  const chatViewRef = useRef(null);

  useEffect(() => {
    if (!roomId || inboxItems.length === 0) return;

    const room = inboxItems.find((item) => item.roomDetails.id === roomId);
    if (!room) return;

    const { recipientUser, roomDetails } = room;
    const { messages: roomMessages } = initializeMessageStock(roomId);

    setRecipientInfo(recipientUser);
    setRoomDetails(roomDetails);
    setMessages(roomMessages);
  }, [roomId, inboxItems]);

  useEffect(() => {
    if (!messages.length) return;
    chatViewRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, inboxItems]);

  const handleScrollToTop = () => {
    socket?.emit("get_messages", {
      roomId,
      socketId: socket.id,
      skipCount,
    });
    setSkipCount((prev) => prev + 1);
  };

  useEffect(() => {
    const handleReceivedMessages = (response) => {
      setMessages((prevMessages) => {
        const newMessages = response.messageStock.messages.filter(
          (newMessage) =>
            !prevMessages.some((message) => message.id === newMessage.id)
        );
        return [...newMessages, ...prevMessages];
      });
    };

    socket?.on("messages_got", handleReceivedMessages);

    return () => socket?.off("messages_got", handleReceivedMessages);
  }, [socket]);

  const markMessagesAsSeen = async (lastUnseenMessage) => {
    if (!lastUnseenMessage) return;

    const messageStock = initializeMessageStock(roomId);
    const userIndex = messageStock.seenBy.findIndex(
      (user) => user.userId === userInfo.id
    );

    if (
      (userIndex !== -1 &&
        messageStock.seenBy[userIndex].lastSeenMessageId ===
          lastUnseenMessage?.id) ||
      lastUnseenMessage?.senderId === userInfo.id
    ) {
      return;
    }

    const newDate = new Date();

    socket?.emit("see_message", {
      roomId,
      senderId: userInfo.id,
      id: lastUnseenMessage?.id,
      seenAt: newDate,
    });

    if (userIndex !== -1) {
      messageStock.seenBy[userIndex].lastSeenMessageId = lastUnseenMessage?.id;
      messageStock.seenBy[userIndex].seenAt = newDate;
    } else {
      messageStock.seenBy.push({
        userId: userInfo.id,
        lastSeenMessageId: lastUnseenMessage?.id,
        seenAt: newDate,
      });
    }

    const updatedStock = updateMessageStocks(roomId, messageStock);

    const lastLog = await getLastLog(updatedStock, userInfo.id);
    setInboxItems((prev) =>
      prev.map((item) =>
        item?.roomDetails?.id === roomId ? { ...item, lastLog } : item
      )
    );
  };

  useEffect(() => {
    const handleLiveMessageSeen = (response) => {
      markMessagesAsSeen(response);
    };

    socket?.on("message_received", handleLiveMessageSeen);

    return () => socket?.off("message_received", handleLiveMessageSeen);
  }, [socket]);

  useEffect(() => {
    let isMounted = true;

    const handleOpenChatMessagesSeen = () => {
      if (!roomId || !isMounted) return;

      const messageStock = initializeMessageStock(roomId);
      markMessagesAsSeen(messageStock.messages.at(-1));
    };

    handleOpenChatMessagesSeen();

    return () => {
      isMounted = false;
    };
  }, [roomId, userInfo]);

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    const id = snowflake.generate();
    const newMessage = {
      id: id,
      senderId: userInfo.id,
      content: inputText,
      type: "text",
      sentAt: new Date(),
    };

    setMessages((prevMessages) => {
      const isMessageExists = prevMessages.some(
        (msg) => msg.id === newMessage.id
      );
      if (isMessageExists) return prevMessages;
      return [...prevMessages, newMessage];
    });

    const messageStock = initializeMessageStock(roomId);
    messageStock.messages.push(newMessage);

    const updatedStock = updateMessageStocks(roomId, messageStock);

    const lastLog = await getLastLog(updatedStock, userInfo.id);
    setInboxItems((prev) =>
      prev.map((item) =>
        item?.roomDetails?.id === roomId ? { ...item, lastLog } : item
      )
    );

    socket?.emit("send_message", {
      roomId,
      senderId: userInfo.id,
      ...newMessage,
    });

    setInputText("");
  };

  const lastLog = inboxItems?.find(
    (item) => item.roomDetails.id === roomId
  )?.lastLog;

  const renderItem = ({ item, index }) => {
    const isLastMessage = index === messages.length - 1;
    const isSelfMessage = item?.senderId === userInfo.id;
    const isSameSenderPrev =
      index > 0 && messages[index - 1]?.senderId === item?.senderId;
    const isSameSenderNext =
      index < messages.length - 1 &&
      messages[index + 1]?.senderId === item?.senderId;

    const isFirstInBlock = !isSameSenderPrev;
    const isLastInBlock = !isSameSenderNext;
    const isSingleMessage = !isSameSenderPrev && !isSameSenderNext;

    const bgColor = isSelfMessage
      ? "bg-blue-600"
      : "bg-gray-200 dark:bg-gray-800";
    const baseClasses = `text-gray-900 dark:text-gray-100 text-md px-4 py-3 break-words rounded-3xl`;
    const borderRadius = isSingleMessage
      ? "rounded-full"
      : isSelfMessage
      ? isFirstInBlock
        ? "rounded-br-md"
        : isLastInBlock
        ? "rounded-tr-md"
        : "rounded-tr-md rounded-br-md"
      : isFirstInBlock
      ? "rounded-bl-md"
      : isLastInBlock
      ? "rounded-tl-md ml-11"
      : "rounded-tl-md rounded-bl-md ml-11";

    return (
      <div
        key={item?.id}
        className={`flex flex-row w-full px-3 pt-1 ${
          isSelfMessage ? "justify-end" : "justify-start"
        }`}
      >
        {!isSelfMessage && isFirstInBlock && (
          <img
            src={recipientInfo?.avatar}
            className="w-9 h-9 rounded-full object-cover mr-2"
            alt="Recipient Avatar"
          />
        )}
        <div className="flex flex-col max-w-[70%]">
          {item?.type === "text" && (
            <p className={`${baseClasses} ${bgColor} ${borderRadius}`}>
              {item?.content}
            </p>
          )}
          {isLastMessage && lastLog?.content === "Seen" && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              Seen {lastLog?.timing}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderEmpty = () => (
    <div className="flex flex-col justify-center items-center h-full">
      <img
        src={recipientInfo?.avatar}
        className="mt-3 w-24 h-24 rounded-full object-cover"
        alt="Recipient Avatar"
      />
      {recipientInfo?.full_name && (
        <p className="text-gray-900 dark:text-gray-100 text-lg font-bold mt-2">
          {recipientInfo?.full_name}
        </p>
      )}
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        @{recipientInfo?.username || "unknown"}
      </p>
      <button
        onClick={() => navigate(`/u/${recipientInfo?.username}`)}
        className="bg-secondary-bg dark:bg-secondary-bg-dark mt-3 py-2 px-3 rounded-md cursor-pointer"
      >
        View Profile
      </button>
      <p className="mt-5 text-gray-500 dark:text-gray-400">
        Send a message to get started.
      </p>
    </div>
  );

  const onEndReached = () => {
    console.log("onEndReached");
    markMessagesAsSeen(messages.at(-1));
  };

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <CustomTopNav
        prevPage="/direct/inbox"
        prevPageIconStyle="block lg:hidden"
        logoImage={recipientInfo?.avatar}
        logoStyle="rounded-full"
        title={
          roomDetails?.name ||
          recipientInfo?.full_name ||
          recipientInfo?.username ||
          "Flexiyo Chat"
        }
        rightIcons={[
          {
            resource: <i className="fa fa-phone text-2xl" />,
          },
          {
            resource: <i className="fa fa-video text-2xl" />,
            onClick: () => {},
          },
        ]}
      />
      <div className="flex-1 flex flex-col w-full h-full mx-auto">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            renderEmpty()
          ) : (
            <div ref={chatViewRef}>
              {messages.map((item, index) => renderItem({ item, index }))}
            </div>
          )}
        </div>
        <ChatMessenger
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;

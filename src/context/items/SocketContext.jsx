import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import UserContext from "./UserContext";
import { getUsers } from "../../hooks/useUserUtils.js";
import { refreshAccessToken } from "../../hooks/useTokenUtils.js";
import {
  initializeMessageStock,
  updateMessageStocks,
  getLastLog,
} from "../../hooks/useChatUtils.js";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { userInfo, isUserAuthenticated } = useContext(UserContext);

  const [socketUser, setSocketUser] = useState({
    id: null,
  });

  const [sessionMessageStocks, setSessionMessageStocks] = useState({});
  const [inboxItems, setInboxItems] = useState([]);

  const socketRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (isUserAuthenticated && !socketRef.current) {
      console.log("Creating new socket connection");
      socketRef.current = io("", {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
          access_token: userInfo?.headers?.access_token,
          device_id: userInfo?.headers?.device_id,
        },
      });

      if (!initialized.current) {
        socketRef.current?.on("connect", () => {
          console.log("Socket Connected:", socketRef.current?.id);
          setSocketUser((prevState) => ({
            ...prevState,
            id: socketRef.current?.id,
          }));
        });

        socketRef.current?.on("roomsListResponse", async (response) => {
          const inboxItems = await Promise.all(
            response.map(async (room) => {
              if (room.roomDetails.type !== "private") {
                return room;
              }

              const lastLog = await getLastLog(
                room.messageStock,
                userInfo.user.id
              );

              const existingMessageStocks = sessionMessageStocks || {};

              const updatedMessageStocks = {
                ...existingMessageStocks,
                [room.roomDetails.id]: room.messageStock,
              };

              setSessionMessageStocks(updatedMessageStocks);

              room.lastLog = lastLog;
              delete room.messageStock;

              return room;
            })
          );

          const recipientUserIds = response.flatMap((room) =>
            room.roomDetails.members
              .filter((member) => member !== userInfo.user.id)
              .map((member) => member)
          );

          const recipientUsers = await getUsers(recipientUserIds);

          inboxItems.forEach((item) => {
            item.recipientUser = recipientUsers.find(
              (user) =>
                item.roomDetails.members.includes(user.id) &&
                user.id !== userInfo.user.id
            );
          });

          setInboxItems(inboxItems);
        });

        socketRef.current?.on("message_received", async (response) => {
          const { id, senderId, content, type, roomId, sentAt } = response;

          const messageStock = initializeMessageStock(roomId);
          const newMessage = {
            senderId,
            content,
            id,
            type,
            sentAt,
          };
          messageStock.messages.push(newMessage);

          const updatedStock = updateMessageStocks(roomId, messageStock);

          const lastLog = await getLastLog(updatedStock, userInfo.user.id);
          setInboxItems((prev) =>
            prev.map((item) =>
              item?.roomDetails?.id === roomId ? { ...item, lastLog } : item
            )
          );
        });

        socketRef.current?.on("message_seen", async (response) => {
          const { id, senderId, roomId, seenAt } = response;

          const messageStock = initializeMessageStock(roomId);

          const senderIndex = messageStock.seenBy.findIndex(
            (user) => user.userId === senderId
          );

          if (senderIndex !== -1) {
            messageStock.seenBy[senderIndex].lastSeenMessageId = id;
            messageStock.seenBy[senderIndex].seenAt = seenAt;
          } else {
            messageStock.seenBy.push({
              userId: senderId,
              lastSeenMessageId: id,
              seenAt,
            });
          }

          const updatedStock = updateMessageStocks(roomId, messageStock);

          const lastLog = await getLastLog(updatedStock, userInfo.user.id);
          setInboxItems((prev) =>
            prev.map((item) =>
              item?.roomDetails?.id === roomId ? { ...item, lastLog } : item
            )
          );
        });

        socketRef.current?.on("error", async (response) => {
          if (response.message === "ATInvalidError") {
            refreshAccessToken();
          }
        });

        socketRef.current?.on("disconnect", () => {
          console.log("Socket Disconnected:", socketRef.current?.id);
        });

        initialized.current = true;
      }
    }

    localStorage.setItem(
      "sessionMessageStocks",
      JSON.stringify(sessionMessageStocks)
    );

    return () => {
      localStorage.removeItem("sessionMessageStocks");
    };
  }, [isUserAuthenticated, userInfo, sessionMessageStocks]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        socketUser,
        inboxItems,
        setInboxItems,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

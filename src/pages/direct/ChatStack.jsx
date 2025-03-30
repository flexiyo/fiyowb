import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Inbox from "./items/Inbox";
import Chat from "./items/Chat";

const ChatStack = () => {
  const { roomId } = useParams();
  const location = useLocation();

  const isInboxRoute = location.pathname === "/direct/inbox";

  return (
    <div className="flex w-full h-full">
      {isInboxRoute ? (
        <>
          <div className="w-full lg:min-w-1/2 lg:border-r border-gray-300 dark:border-gray-800">
            <Inbox />
          </div>
          <div className="w-full hidden lg:min-w-1/2 lg:block">
            <div className="flex flex-col justify-center items-center h-screen w-full">
              <svg
                className="chat-icon w-28 h-28 p-6 border-4 border-white rounded-full"
                fill="#fff"
                role="img"
                viewBox="0 0 24 24"
              >
                <g fill="none" stroke="#ffffff" strokeWidth="1.5">
                  <path d="M20 12c0-3.771 0-5.657-1.172-6.828C17.657 4 15.771 4 12 4C8.229 4 6.343 4 5.172 5.172C4 6.343 4 8.229 4 12v6c0 .943 0 1.414.293 1.707C4.586 20 5.057 20 6 20h6c3.771 0 5.657 0 6.828-1.172C20 17.657 20 15.771 20 12z"></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 10h6m-6 4h3"
                  ></path>
                </g>
              </svg>
              <br />
              <p className="text-gray-500">
                Click &nbsp;
                <kbd className="fal fa-pen-to-square p-2 rounded-full text-white"></kbd>
                &nbsp; to create a room and start chatting.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-full hidden lg:min-w-1/2 lg:block lg:border-r border-gray-300 dark:border-gray-800">
            <Inbox />
          </div>
          <div className="w-full lg:w-1/2">
            <Chat roomId={roomId} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatStack;

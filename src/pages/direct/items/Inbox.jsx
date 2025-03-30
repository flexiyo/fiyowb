import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../../hooks/useUserUtils.js";
import SocketContext from "../../../context/items/SocketContext";
import UserContext from "../../../context/items/UserContext";
import CustomTopNav from "../../../layout/items/CustomTopNav";
import LongPressable from "../../../components/app/events/LongPressable";
import DialogBox from "../../../components/app/DialogBox";
import CreateRoomModal from "../../../components/direct/inbox/CreateRoomModal";

const Inbox = () => {
  const navigate = useNavigate();
  const { inboxItems } = useContext(SocketContext);
  const { userInfo } = useContext(UserContext);

  const inboxItemDialogRef = useRef(null);

  const [usersList, setUsersList] = useState([]);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);

  const createChatRoom = async (memberIds) => {
    try {
      // const { data } = await fiyoAxios.post(
      //   `${fiyochatSrvBaseUri}/api/v1/rooms/create`,
      //   { roomType: "private", memberIds }
      // );
      setIsCreateRoomModalOpen(false);
      window.location.replace(`/direct/t/${data.data.roomId}`);
    } catch (error) {
      console.error(`Error in createChatRoom: ${error}`);
    }
  };

  const deleteChatRoom = async () => {
    try {
      // await fiyoAxios.delete(`${fiyochatSrvBaseUri}/api/v1/rooms/delete`);
      navigate("/direct/inbox");
      setIsCreateRoomModalOpen(false);
    } catch (error) {
      console.error(`Error in deleteChatRoom: ${error}`);
    }
  };

  const renderInboxItem = ({ item }) => {
    const lastLog = item?.lastLog;
    return (
      <button
        onClick={() => navigate(`/direct/t/${item?.roomDetails?.id}`)}
        className="flex flex-row w-full mb-4 items-center"
      >
        <img
          src={item?.avatar || item?.recipientUser?.avatar}
          className="w-14 h-14 rounded-full mr-3 bg-gray-200 dark:bg-gray-800 object-cover"
          alt="User Avatar"
        />
        <div className="flex-1">
          <p className="text-gray-900 dark:text-gray-100 text-lg font-bold">
            {item?.name ||
              item?.recipientUser?.full_name ||
              item?.recipientUser?.username}
          </p>
          <p className="text-slate-400 mt-1">
            {lastLog ? (
              <>
                <span className={`${lastLog.color}`}>{lastLog.content}</span>
                <span className="text-gray-500"> {lastLog.timing}</span>
              </>
            ) : (
              "Start chatting"
            )}
          </p>
        </div>
      </button>
    );
  };

  const handleShowInboxItemDialog = (e) => {
    if (inboxItemDialogRef.current) {
      inboxItemDialogRef.current.showDialog(e);
    }
  };

  const openCreateRoomModal = () => {
    setIsCreateRoomModalOpen(true);
    getUsers().then((users) => {
      setUsersList(users);
    });
  };

  const closeCreateRoomModal = () => {
    setIsCreateRoomModalOpen(false);
    setUsersList([]);
  };

  return (
    <div className="flex-1">
      <CustomTopNav
        prevPage="/"
        prevPageIconStyle="block md:hidden"
        keepBorder={false}
        title={userInfo?.username}
        rightIcons={[
          {
            resource: <i className="fal fa-pen-to-square text-2xl" />,
            onClick: openCreateRoomModal,
          },
          {
            resource: <i className="fa fa-gear text-2xl" />,
            onClick: () => showDialog(),
          },
        ]}
      />
      {inboxItems.length > 0 ? (
        <>
          <p className="text-xl font-bold m-4">Messages</p>
          <div className="mx-4">
            {inboxItems.map((item) => (
              <LongPressable
                key={item.id}
                onLongPress={handleShowInboxItemDialog}
              >
                {renderInboxItem({ item })}
              </LongPressable>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex justify-center items-center">
          <p className="text-gray-400 text-xl m-4">No messages yet.</p>
        </div>
      )}
      <DialogBox
        ref={inboxItemDialogRef}
        items={[
          {
            component: (
              <div className="flex items-center">
                <i className="fal fa-trash text-xl text-red-500" />
                <span className="ml-4">Delete Chat</span>
              </div>
            ),
            onClick: deleteChatRoom,
          },
        ]}
      />
      {isCreateRoomModalOpen && (
        <CreateRoomModal
          isOpen={isCreateRoomModalOpen}
          onClose={closeCreateRoomModal}
          usersList={usersList}
          onSubmit={createChatRoom}
          userInfo={userInfo}
        />
      )}
    </div>
  );
};

export default Inbox;

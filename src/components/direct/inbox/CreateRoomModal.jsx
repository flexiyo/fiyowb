import React, { useState, useEffect } from "react";
import debounce from "lodash/debounce";

const CreateRoomModal = ({
  isOpen,
  onClose,
  usersList,
  onSubmit,
  userInfo,
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");

  const handleUserToggle = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0) return;
    onSubmit([userInfo.id, ...selectedUsers.map((u) => u.id)]);
    onClose();
    setSelectedUsers([]);
    setSearch("");
  };

  const debouncedSetSearch = debounce((value) => setSearch(value), 300);

  const filteredUsers = usersList?.filter(
    (user) =>
      user.id !== userInfo.id &&
      (user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl bg-white dark:bg-gray-800 w-full max-w-lg flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 h-auto max-h-3/4">
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-800">
          <button
            className="text-gray-400 cursor-pointer transition-colors"
            onClick={onClose}
          >
            <i className="fa fa-x" style={{ fontSize: 20 }} />
          </button>
          <h2 className="text-xl font-semibold">New Chat</h2>
          <button
            className={`text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center cursor-pointer gap-1 ${
              selectedUsers.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0}
          >
            Next <i className="fa fa-arrow-right" style={{ fontSize: 16 }} />
          </button>
        </div>
        <div className="flex flex-col p-4 gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-2">
            <i className="fa fa-magnifying-glass text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => debouncedSetSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-transparent placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-blue-500 text-white rounded-full px-3 py-1 text-sm"
                >
                  <span>{user.username}</span>
                  <button
                    className="ml-2 cursor-pointer"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    <i className="fa fa-x" style={{ fontSize: 12 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {filteredUsers?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No users found.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredUsers?.map((user) => {
                const isSelected = selectedUsers.some((u) => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleUserToggle(user)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        className="w-12 h-12 rounded-full object-cover"
                        alt={`${user.username}'s avatar`}
                      />
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "border-2 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <i className="fa fa-check" style={{ fontSize: 12 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;

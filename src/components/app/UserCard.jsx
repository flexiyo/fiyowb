import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user, variant }) => {
  return (
    <Link
      to={`/u/${user?.username}`}
      className="flex items-center rounded-lg cursor-pointer"
    >
      <img
        src={user?.avatar}
        alt={user?.username}
        className={`${
          variant === "sm" ? "w-12 h-12" : "w-14 h-14"
        } rounded-full mr-4`}
      />
      <div className="flex-1">
        {user?.full_name && (
          <p
            className={`${
              variant === "sm" ? "text-sm" : "text-base"
            } font-semibold`}
          >
            {user?.full_name}
          </p>
        )}
        <p className="text-gray-500">@{user?.username}</p>
      </div>
    </Link>
  );
};

export default UserCard;

import React, { useState } from "react";
import { Link } from "react-router-dom";

const Post = ({
  profilePic,
  username,
  songInfo,
  postImage,
  likesCount,
  commentsCount,
  sharesCount,
  caption,
  uploadDate,
}) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between mx-2">
        <div className="flex gap-4">
          <img
            src={profilePic}
            className="w-10 h-10 rounded-full bg-secondary-bg dark:bg-secondary-bg-dark border border-gray-300 dark:border-gray-800 cursor-pointer"
            alt="Profile Picture"
          />
          <div className="flex flex-col">
            <p className="text-gray-900 dark:text-gray-100 font-bold text-base">
              {username}
            </p>
            <Link
              to={`/music?q=${songInfo.name}`}
              className="text-gray-400 text-xs hover:underline cursor-pointer"
            >
              {`${songInfo.name} • ${songInfo.artist}`}
            </Link>
          </div>
        </div>
        <button className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            className="dark:stroke-white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
      <img
        src={postImage}
        className="aspect-video bg-gray-200 dark:bg-gray-800 object-cover"
        alt="Post Image"
      />
      <div className="flex flex-col mx-4 gap-2">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLiked(!liked)}
          >
            {liked ? (
              <svg height={26} role="img" viewBox="0 0 48 48" width={26}>
                <path
                  fill="#FF0000"
                  d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"
                />
              </svg>
            ) : (
              <svg height={26} role="img" viewBox="0 0 24 24" width={26}>
                <path
                  fill="#000000"
                  className="dark:fill-white"
                  d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"
                />
              </svg>
            )}
            <p className="text-gray-900 dark:text-gray-100 font-bold">
              {likesCount}
            </p>
          </button>
          <button className="flex items-center gap-2 cursor-pointer">
            <svg
              fill="#000000"
              className="dark:fill-white"
              height={26}
              role="img"
              viewBox="0 0 24 24"
              width={26}
            >
              <path
                d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                fill="none"
                stroke="#000000"
                className="dark:stroke-white"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <p className="text-gray-900 dark:text-gray-100 font-bold">
              {commentsCount}
            </p>
          </button>
          <button className="flex items-center gap-2 cursor-pointer">
            <svg
              fill="#000000"
              className="dark:fill-white"
              role="img"
              viewBox="0 0 24 24"
              height={26}
              width={26}
            >
              <line
                fill="#000000"
                stroke="#000000"
                className="dark:stroke-white dark:fill-white"
                strokeLinejoin="round"
                strokeWidth={2}
                x1="22"
                x2="9.218"
                y1="3"
                y2="10.083"
              />
              <polygon
                fill="none"
                points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                stroke="#000000"
                className="dark:stroke-white"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <p className="text-gray-900 dark:text-gray-100 font-bold">
              {sharesCount}
            </p>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-gray-900 dark:text-gray-100 text-md w-11/12 truncate">
            <span className="font-bold">{username}</span> {caption}
          </p>
          <p className="text-gray-400 text-sm">{uploadDate}</p>
        </div>
      </div>
    </div>
  );
};

export default Post;

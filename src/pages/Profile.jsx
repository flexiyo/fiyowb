import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/items/UserContext";
import { getUser } from "../hooks/useUserUtils.js";
import CustomTopNav from "../layout/items/CustomTopNav";
import { NotFound404 } from "./index.js";
import {
  getUserFollowers,
  getUserFollowing,
  getUserMates,
  sendFollowRequest,
  unsendFollowRequest,
  sendMateRequest,
  unsendMateRequest,
} from "../hooks/useConnectionUtils.js";

const Profile = () => {
  const { userInfo } = useContext(UserContext);
  const { username } = useParams();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [followBtnText, setFollowBtnText] = useState("");
  const [mateBtnText, setMateBtnText] = useState("");

  useEffect(() => {
    setLoading(true);
    getUser(username)
      .then((response) => {
        if (!response?.status.success) {
          setUser(null);
          return;
        }

        const userData = response.user;
        setUser(userData);

        if (!userData.relation) {
          setFollowBtnText("Follow");
          setMateBtnText("Commate");
          return;
        }

        setFollowBtnText(
          userData?.relation?.follow?.is_following
            ? "Following"
            : userData?.relation?.follow?.is_followed
            ? "Follow Back"
            : userData?.relation?.follow?.is_following === false
            ? "Requested"
            : "Follow"
        );
        setMateBtnText(
          userData?.relation?.mate?.are_mates
            ? "Already Mates"
            : userData?.relation?.mate?.are_mates === false
            ? "Requested"
            : "Commate"
        );
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      setUser(null);
    };
  }, [username]);

  const handleFollowBtnClick = () => {
    ["Follow", "Follow Back"].includes(followBtnText)
      ? sendFollowRequest(user?.id).then(() => setFollowBtnText("Requested"))
      : unsendFollowRequest(user?.id).then(() => setFollowBtnText("Follow"));
  };

  const handleMateBtnClick = () => {
    mateBtnText === "Commate"
      ? sendMateRequest(user?.id).then(() => setMateBtnText("Requested"))
      : unsendMateRequest(user?.id).then(() => setMateBtnText("Commate"));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center mx-auto w-full min-h-screen">
        <div className="flex flex-col lg:flex-row max-w-7xl w-full px-4 md:px-6 gap-6">
          <div className="flex-1 lg:min-w-2/3 w-full">
            <div className="flex flex-col w-full max-w-3xl mx-auto py-6">
              <NotFound404 />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mx-auto w-full min-h-screen">
      <div className="flex flex-col lg:flex-row max-w-7xl w-full gap-6">
        <div className="flex-1 lg:w-2/3 w-full">
          <div className="flex flex-col w-full max-w-3xl mx-auto">
            <CustomTopNav
              prevPage={
                userInfo?.user.username === user?.username ? null : "GoBack"
              }
              title={user?.username}
              rightIcons={[
                {
                  resource: <i className="fa fa-ellipsis-vertical text-2xl" />,
                  onClick: () => {},
                },
              ]}
            />
            <img
              src={user?.banner}
              className="w-full h-40 object-cover bg-primary-bg dark:bg-primary-bg-dark"
              alt="Profile Banner"
            />
            <div className="w-full max-w-2xl mx-auto px-6">
              <div className="flex flex-row items-center justify-between bg-gray-100 dark:bg-secondary-bg-dark rounded-3xl px-6 py-4 gap-4 -mt-20 w-full h-40">
                <div className="flex-shrink-0">
                  <img
                    src={user?.avatar}
                    className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full object-cover bg-tertiary-bg dark:bg-tertiary-bg-dark"
                    alt="Profile Avatar"
                  />
                </div>
                <div className="flex-1 h-full">
                  <div className="flex flex-row items-center justify-around h-1/2 w-full">
                    <div className="flex flex-col items-center justify-center gap-1 cursor-pointer">
                      <span className="text-md text-center font-bold">
                        {user?.posts_count || 0}
                      </span>
                      <span className="text-xs text-center text-gray-400">
                        Posts
                      </span>
                    </div>
                    <button
                      className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                      onClick={() =>
                        getUserFollowers(user?.id).then((res) =>
                          console.log(res)
                        )
                      }
                    >
                      <span className="text-md text-center font-bold">
                        {user?.followers_count || 0}
                      </span>
                      <span className="text-xs text-center text-gray-400">
                        Followers
                      </span>
                    </button>
                    <button
                      className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                      onClick={() =>
                        getUserFollowing(user?.id).then((res) =>
                          console.log(res)
                        )
                      }
                    >
                      <span className="text-md text-center font-bold">
                        {user?.following_count || 0}
                      </span>
                      <span className="text-xs text-center text-gray-400">
                        Following
                      </span>
                    </button>
                  </div>
                  <div className="flex flex-row items-center justify-between h-1/2 w-full gap-2 sm:gap-4 mt-2">
                    {userInfo?.user.username === user?.username ? (
                      <button className="flex-1 bg-tertiary-bg dark:bg-tertiary-bg-dark rounded-full py-2 text-sm text-center hover:bg-quaternary-bg dark:hover:bg-quaternary-bg-dark cursor-pointer transition">
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        className={`flex-1 rounded-full py-2 text-sm text-center text-white ${
                          ["Follow", "Follow Back"].includes(followBtnText)
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-tertiary-bg dark:bg-tertiary-bg-dark hover:bg-quaternary-bg dark:hover:bg-quaternary-bg-dark"
                        } cursor-pointer transition`}
                        onClick={handleFollowBtnClick}
                      >
                        {followBtnText}
                      </button>
                    )}
                    {userInfo?.user.username === user?.username ? (
                      <button
                        className="flex-1 bg-tertiary-bg dark:bg-tertiary-bg-dark rounded-full py-2 text-sm text-center hover:bg-quaternary-bg dark:hover:bg-quaternary-bg-dark cursor-pointer transition"
                        onClick={() =>
                          getUserMates().then((res) => console.log(res))
                        }
                      >
                        Your Mates
                      </button>
                    ) : (
                      <button
                        className={`flex-1 rounded-full py-2 text-sm text-center text-white ${
                          mateBtnText === "Commate"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-tertiary-bg dark:bg-tertiary-bg-dark hover:bg-quaternary-bg dark:hover:bg-quaternary-bg-dark"
                        } cursor-pointer transition`}
                        onClick={handleMateBtnClick}
                      >
                        {mateBtnText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

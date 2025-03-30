import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import UserContext from "../../context/items/UserContext";
import MusicContext from "../../context/items/MusicContext";
import {
  HomeIcon,
  SearchIcon,
  MusicIcon,
  ClipsIcon,
  CreateIcon,
  NotificationsIcon,
  ChatIcon,
  ProfileIcon,
} from "../../icons";

const SideNav = () => {
  const { isAudioPlaying } = useContext(MusicContext);
  const { userInfo } = useContext(UserContext);
  return (
    <div className="flex flex-col items-center xl:items-start left-0 top-0 sticky w-20 xl:w-80 xl:pl-6 gap-8 py-4 shadow-xl shadow-gray-700 h-screen bg-body-bg dark:bg-body-bg-dark overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-center xl:justify-start">
        <img
          src="https://cdnfiyo.github.io/img/logos/flexiyo.png"
          className="p-2 max-w-16"
          alt="Flexiyo"
        />
        <span className="p-2 text-2xl font-bold hidden xl:block">Flexiyo</span>
      </div>
      {[
        { to: "/", icon: HomeIcon, label: "Home" },
        { to: "/search", icon: SearchIcon, label: "Search" },
        {
          to: "/music",
          icon: MusicIcon,
          label: "Music",
          extraProps: { isAudioPlaying },
        },
        { to: "/clips", icon: ClipsIcon, label: "Clips" },
        { to: "/create", icon: CreateIcon, label: "Create" },
        {
          to: "/notifications",
          icon: NotificationsIcon,
          label: "Notifications",
        },
        { to: "/direct/inbox", icon: ChatIcon, label: "Messages" },
        {
          to: `/u/${userInfo?.user.username}`,
          icon: ProfileIcon,
          label: "Profile",
          extraProps: {
            avatar: userInfo?.user.avatar,
          },
        },
      ].map(({ to, icon: Icon, label, extraProps }) => (
        <NavLink key={to} to={to} className="flex items-center gap-4">
          {({ isActive }) => (
            <>
              <Icon focused={isActive} {...extraProps} />
              <span className={`hidden xl:block ${isActive && "font-bold"}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default SideNav;

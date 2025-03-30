import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import UserContext from "../../context/items/UserContext";
import MusicContext from "../../context/items/MusicContext";
import {
  HomeIcon,
  SearchIcon,
  MusicIcon,
  ClipsIcon,
  ProfileIcon,
} from "../../icons";

const BottomNav = () => {
  const { userInfo } = useContext(UserContext);
  const { isAudioPlaying } = useContext(MusicContext);
  return (
    <div className="fixed flex justify-around items-center w-full bottom-0 bg-body-bg dark:bg-body-bg-dark h-12 border-t border-gray-300 dark:border-gray-800 z-50">
      {[
        { to: "/", icon: HomeIcon },
        { to: "/search", icon: SearchIcon },
        {
          to: "/music",
          icon: MusicIcon,
          extraProps: { isAudioPlaying },
        },
        { to: "/clips", icon: ClipsIcon, label: "Clips" },
        {
          to: `/u/${userInfo?.user.username}`,
          icon: ProfileIcon,
          extraProps: {
            avatar: userInfo?.user.avatar,
          },
        },
      ].map(({ to, icon: Icon, extraProps }) => (
        <NavLink key={to} to={to} className="flex items-center gap-4">
          {({ isActive }) => <Icon focused={isActive} {...extraProps} />}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;

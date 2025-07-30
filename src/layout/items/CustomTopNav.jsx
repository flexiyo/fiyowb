import React from "react";
import { useNavigate } from "react-router-dom";

const CustomTopNav = ({
  prevPage,
  prevPageIconStyle = "",
  keepBorder = true,
  logoImage,
  logoStyle = "",
  title,
  midComponent,
  rightIcons = [],
  className = "",
  header,
  headerHeight = 0,
}) => {
  const navigate = useNavigate();
  const customTabsHeight = headerHeight + 70;

  return (
    <div
      className={`flex flex-col ${
        keepBorder ? "border-b" : ""
      } border-gray-300 dark:border-gray-800 bg-body-bg dark:bg-body-bg-dark w-full sticky top-0 z-10 ${className}`}
      style={{ height: customTabsHeight }}
    >
      <div className="flex items-center h-[70px] w-full px-4 gap-4 overflow-hidden">
        {/* Left Section (Back Button, Logo, Title) */}
        <div className="flex items-center flex-shrink gap-2 min-w-0">
          {prevPage && (
            <button
              className={prevPageIconStyle}
              onClick={() =>
                prevPage === "GoBack" ? navigate(-1) : navigate(prevPage)
              }
            >
              <i className="fa fa-arrow-left text-black dark:text-white" />
            </button>
          )}

          {logoImage && (
            <img
              src={logoImage}
              alt="Logo"
              className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ${logoStyle}`}
            />
          )}

          {title && (
            <h1 className="text-xl font-bold hidden sm:block truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Middle Component (SearchBox or anything else) */}
        <div className="flex-grow min-w-0 overflow-hidden mx-2">
          {midComponent}
        </div>

        {/* Right Icons */}
        <div className="flex-shrink-0 flex items-center gap-8">
          {rightIcons.map((icon, index) => (
            <button
              key={index}
              className="cursor-pointer"
              onClick={icon.onClick}
            >
              {icon.resource}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Header Below Nav */}
      {header && header}
    </div>
  );
};

export default CustomTopNav;

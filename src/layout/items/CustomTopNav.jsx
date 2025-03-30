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
        keepBorder && "border-b"
      } border-gray-300 dark:border-gray-800 bg-body-bg dark:bg-body-bg-dark w-full sticky top-0 z-1 ${className}`}
      style={{ height: customTabsHeight }}
    >
      <div className="flex flex-row items-center h-[70px] w-full px-4 gap-4 cursor-pointer">
        {prevPage && (
          <button
            className={prevPageIconStyle}
            onClick={() =>
              prevPage === "GoBack" ? navigate(-1) : navigate(prevPage)
            }
          >
            <i
              size={25}
              className="fa fa-arrow-left text-black dark:text-white cursor-pointer"
            />
          </button>
        )}

        {logoImage && (
          <img
            src={logoImage}
            alt="Logo"
            className={`w-10 h-10 ml-2 ${logoStyle}`}
          />
        )}

        {title && <h1 className="text-xl font-bold">{title}</h1>}

        <div className="flex-1 flex items-center justify-center">
          {midComponent}
        </div>

        {rightIcons.length > 0 && (
          <div className="flex flex-row items-center gap-8">
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
        )}
      </div>
      {header && header}
    </div>
  );
};

export default CustomTopNav;

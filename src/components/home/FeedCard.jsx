import React from "react";

const FeedCard = ({ heading, text }) => {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
        {heading}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {text}
      </p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200 cursor-pointer"
        onClick={() => {}}
      >
        Check Now
      </button>
    </div>
  );
};

export default FeedCard;

import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound404 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* 404 Display */}
        <div className="relative inline-block">
          <h1 className="text-7xl md:text-9xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg">
            404
          </h1>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 rotate-6">
            Oops!
          </span>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-sm mx-auto">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md 
            hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all 
            duration-200 text-base md:text-lg"
          >
            Back to Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg shadow-md 
            hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 
            transition-all duration-200 text-base md:text-lg"
          >
            Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound404;

import React, { useState, useRef, useEffect } from "react";
import { YTMUSIC_BASE_URI } from "../../constants.js";
import axios from "axios";

const SearchBox = ({
  searchQuery,
  setSearchQuery,
  searchBoxRef,
  closeSearchBox,
  onSearch,
}) => {
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchAction, setIsSearchAction] = useState(false);
  const searchRef = useRef(null);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  useEffect(() => {
    if (isSearchAction) {
      setIsSearchAction(false);
      return;
    }
    const timerId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchSuggestions(searchQuery);
      }
    }, 200);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  useEffect(() => {
    const updateWidth = () => {
      if (searchRef.current) {
        setDropdownWidth(searchRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const fetchSearchSuggestions = async (value) => {
    if (!value.trim()) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const { data } = await axios.get(
        `${YTMUSIC_BASE_URI}/suggestions?term=${encodeURIComponent(
          value
        )}`
      );

      const suggestions = data?.data?.results || [];

      setSearchSuggestions(suggestions);
    } catch (error) {
      console.error("Search error:", error);
      setSearchSuggestions([]);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchSuggestions([]);
    }
  };

  const handleSearch = (query) => {
    if (query?.trim()) {
      setIsSearchAction(true);
      onSearch?.(query);
      setSearchQuery(query);
      setSearchSuggestions([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      closeSearchBox();
    }
  };

  return (
    <div className="h-full w-full">
      <form
        ref={searchRef}
        className={`flex flex-row items-center w-full bg-secondary-bg dark:bg-secondary-bg-dark p-2 rounded-t-2xl ${
          !searchSuggestions.length > 0 ? "rounded-b-2xl" : ""
        } transition-shadow`}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(searchQuery);
        }}
      >
        <input
          type="text"
          ref={searchBoxRef}
          className="flex-1 bg-transparent outline-none px-2 placeholder-gray-400 dark:placeholder-gray-500 text-md w-full max-w-full"
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyPress}
          value={searchQuery}
          placeholder="Search your fav songs"
          aria-label="Search music"
          autoFocus
          name="search"
        />
        <div className="flex items-center w-fit flex-wrap gap-2">
          <button
            onClick={() => setSearchQuery("")}
            className="flex justify-center px-2 py-1 text-gray-400 hover:text-gray-300 rounded-full cursor-pointer"
            aria-label="Clear search"
            title="Clear"
            type="button"
          >
            Clear
          </button>
          <button
            onClick={closeSearchBox}
            className="flex justify-center px-2 py-1 bg-red-500 text-white rounded-full cursor-pointer"
            aria-label="Close search"
            title="Close"
            type="button"
          >
            <i className="fa fa-times text-xl" aria-hidden="true" />
          </button>
        </div>
      </form>
      {searchQuery && searchSuggestions.length > 0 && (
        <div
          className="fixed flex-1 bg-secondary-bg dark:bg-secondary-bg-dark border-t-1 border-gray-700 rounded-b-lg shadow-md shadow-gray-200 dark:shadow-gray-800 z-50 max-h-96 overflow-y-auto"
          style={{ width: `${dropdownWidth}px` }}
          role="listbox"
        >
          <div className="flex flex-col">
            {searchSuggestions.map((item, index) => (
              <button
                key={`search-suggestion-${index}`}
                type="button"
                onClick={() => handleSearch(item?.suggestionQuery)}
                className="flex flex-row items-center p-3 w-full rounded-md text-left cursor-pointer"
                role="option"
              >
                <div className="flex flex-row items-center gap-4 w-full">
                  <i
                    className="fa fa-search text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="text-gray-800 dark:text-gray-200 truncate">
                    <span className="font-bold">
                      {item?.suggestionText || ""}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {item?.suggestionQuery?.replace(
                        item?.suggestionText,
                        ""
                      ) || ""}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;

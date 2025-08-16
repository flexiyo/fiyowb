import { useState, useRef, useEffect } from "react";
import { YTMUSIC_BASE_URI } from "../../constants.js";
import axios from "axios";
import SpeechDialog from "./SpeechDialog.jsx";

const SearchBox = ({
  searchQuery,
  setSearchQuery,
  searchBoxRef,
  closeSearchBox,
  onSearch,
}) => {
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery) {
        fetchSearchSuggestions(searchQuery);
      } else {
        setSearchSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeSearchBox();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchSearchSuggestions = async (value) => {
    try {
      const { data } = await axios.get(
        `${YTMUSIC_BASE_URI}/suggestions?term=${encodeURIComponent(value)}`
      );
      setSearchSuggestions(data?.data?.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchSuggestions([]);
    }
  };

  const handleSearch = (query) => {
    if (!query) return;

    setSearchSuggestions([]);
    onSearch(query);
    setSearchQuery(query)
    closeSearchBox();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(searchQuery);
    } else if (e.key === "Escape") {
      closeSearchBox();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div
        className="bg-white dark:bg-primary-bg-dark w-full h-full md:h-[90vh] md:max-w-[600px] md:rounded-2xl overflow-hidden flex flex-col"
        ref={containerRef}
      >
        {/* Top Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex items-center gap-2 p-2 shadow bg-secondary-bg dark:bg-secondary-bg-dark"
        >
          <button
            type="button"
            onClick={closeSearchBox}
            className="text-secondary-bg-dark dark:text-gray-100 flex-shrink-0"
          >
            <i className="fa fa-arrow-left text-2xl p-4" />
          </button>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={searchQuery}
              ref={searchBoxRef}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-md py-2 outline-none dark:text-white truncate"
              placeholder="Search your fav songs"
              autoFocus
            />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-300 px-4"
            >
              Clear
            </button>
          )}
        </form>

        {/* Suggestions List */}
        {searchQuery && searchSuggestions.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-2">
            {searchSuggestions.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSearch(item?.suggestionQuery)}
                className="flex items-center gap-4 w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-secondary-bg-dark rounded-md transition-colors"
              >
                <i className="fa fa-search text-gray-400 flex-shrink-0" />
                <div className="flex min-w-0">
                  <span className=" truncate font-medium text-lg text-black dark:text-white text-bold">
                    {item?.suggestionText || ""}
                  </span>
                  <span className="truncate text-gray-400 text-lg">
                    {item?.suggestionQuery?.replace(item?.suggestionText, "") ||
                      ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <SpeechDialog
              handleSearch={(val) => {
                setSearchQuery(val)
                handleSearch(val);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;

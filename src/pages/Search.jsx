import React, { useState, useEffect } from "react";
import UserCard from "../components/app/UserCard";
import { searchUsers } from "../hooks/useUserUtils";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch search results
    if (searchQuery.trim()) {
      const fetchSearchResults = async () => {
        setLoading(true);
        try {
          const response = await searchUsers(searchQuery);
          setSearchResults(response?.users || []);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      };
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }

    const fetchTrends = async () => {
      try {
        const mockTrends = [
          { name: "#AIRevolution", volume: "1.2M" },
          { name: "#SpaceTravel", volume: "850K" },
          { name: "#TechTrends", volume: "620K" },
          { name: "#Web3", volume: "450K" },
          { name: "#ClimateAction", volume: "300K" },
        ];
        setTrends(mockTrends);
      } catch (error) {
        console.error("Trends fetch error:", error);
        setTrends([]);
      }
    };
    fetchTrends();
  }, [searchQuery]);

  return (
    <div className="flex justify-center mx-auto w-full min-h-screen">
      <div className="flex flex-col lg:flex-row max-w-7xl w-full px-6 md:px-0 gap-6">
        {/* Main Content */}
        <div className="flex-1 lg:min-w-2/3 w-full">
          <div className="flex flex-col w-full max-w-3xl mx-auto py-6">
            {/* Search Input */}
            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, topics, or hashtags..."
                className="w-full bg-secondary-bg dark:bg-secondary-bg-dark rounded-full p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <i className="fa fa-search text-lg absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {/* Search Results */}
            {!loading && searchQuery && searchResults.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-semibold">Search Results</h2>
                {searchResults.map((result, index) => (
                  <UserCard key={index} user={result} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-400">
                  No results found for "{searchQuery}"
                </p>
              </div>
            )}

            {/* Trends Section */}
            {!loading && !searchQuery && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Trending Now</h2>
                <div className="flex flex-col gap-4">
                  {trends.map((trend, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-secondary-bg dark:bg-secondary-bg-dark rounded-lg cursor-pointer hover:bg-tertiary-bg dark:hover:bg-tertiary-bg-dark transition"
                      onClick={() => setSearchQuery(trend.name)} // Click to search trend
                    >
                      <div>
                        <p className="text-sm font-medium">{trend.name}</p>
                        <p className="text-xs text-gray-400">
                          {trend.volume} posts
                        </p>
                      </div>
                      <span className="text-xs text-indigo-500">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;

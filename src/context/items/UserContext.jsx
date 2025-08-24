import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const savedUserInfo = localStorage.getItem("userInfo");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo));
          setIsUserAuthenticated(true);
        } else {
          setUserInfo(null);
          setIsUserAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to load user data from localStorage", error);
      }
      setLoading(false);
    };

    loadUserData();
  }, [savedUserInfo]);

  const saveUserInfo = (userData) => {
    try {
      localStorage.setItem("userInfo", JSON.stringify(userData));
      setUserInfo(userData);
      setIsUserAuthenticated(true);
    } catch (error) {
      console.error("Failed to save user data to localStorage", error);
    }
  };

  const clearUserInfo = () => {
    try {
      localStorage.removeItem("userInfo");
      setUserInfo(null);
      setIsUserAuthenticated(false);
    } catch (error) {
      console.error("Failed to clear user data from localStorage", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userInfo,
        loading,
        setLoading,
        isUserAuthenticated,
        saveUserInfo,
        clearUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

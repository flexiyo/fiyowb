import { createContext, useEffect, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [contentQuality, setContentQuality] = useState(() => {
    return localStorage.getItem("contentQuality") || "normal";
  });
  
  useEffect(() => {
    const initializeApp = async () => {
      const startTime = Date.now();
      try {
        await new Promise((resolve) => {
          if (document.readyState === "complete") {
            resolve();
          } else {
            window.addEventListener("load", resolve, { once: true });
          }
        });

        const images = document.getElementsByTagName("img");
        const imagePromises = Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });

        const videos = document.getElementsByTagName("video");
        const videoPromises = Array.from(videos).map((video) => {
          if (video.readyState >= 4) return Promise.resolve();
          return new Promise((resolve) => {
            video.onloadeddata = resolve;
            video.onerror = resolve;
          });
        });

        await Promise.all([...imagePromises, ...videoPromises]);

        const timeoutPromise = new Promise((resolve) => {
          setTimeout(resolve, 10000);
        });

        await Promise.race([
          Promise.all([...imagePromises, ...videoPromises]),
          timeoutPromise,
        ]);

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 500) {
          await new Promise((resolve) =>
            setTimeout(resolve, 700 - elapsedTime)
          );
        }
      } catch (error) {
        console.error("Error during app initialization:", error);
      } finally {
        setIsAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("contentQuality") !== contentQuality) {
      localStorage.setItem("contentQuality", contentQuality);
    }
  }, [contentQuality]);

  return (
    <AppContext.Provider
      value={{
        isAppLoading,
        setIsAppLoading,
        contentQuality,
        setContentQuality,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AppContext from "./context/items/AppContext";
import UserContext from "./context/items/UserContext";
import LoadingScreen from "./components/app/LoadingScreen";
import NavStack from "./layout/NavStack";
import PlayerStack from "./components/music/PlayerStack";
import {
  Home,
  Search,
  Music,
  ChatStack,
  Clips,
  Profile,
  AuthLogin,
  AuthSignup,
  NotFound404,
  Create,
} from "./pages";

function App() {
  const location = useLocation();
  const { isAppLoading } = useContext(AppContext);
  const { isUserAuthenticated, loading } = useContext(UserContext);

  if (isAppLoading || loading) {
    return <LoadingScreen />;
  }

  const authenticatedRoutes = (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/clips" element={<Clips />} />
      <Route path="/u/:username" element={<Profile />} />
      <Route path="/music" element={<Music />} />
      <Route path="/create" element={<Create />} />
      <Route path="/direct/t/:roomId" element={<ChatStack />} />
      <Route path="/direct/inbox" element={<ChatStack />} />
    </>
  );

  const unauthenticatedRoutes = (
    <>
      <Route path="*" element={<AuthLogin />} />
      <Route path="/auth/login" element={<AuthLogin />} />
      <Route path="/auth/signup" element={<AuthSignup />} />
      <Route path="/music" element={<Music />} />
      <Route path="/clips" element={<Clips />} />
      <Route path="/u/:username" element={<Profile />} />
    </>
  );

  const noPbRoutes = [
    "/clips",
    "/direct/inbox",
    "/direct/t/:id",
    "/notifications",
  ];

  return (
    <div className="flex min-h-screen bg-body-bg dark:bg-body-bg-dark text-black dark:text-white">
      {isUserAuthenticated && <NavStack />}
      <main
        className={`w-full max-w-7xl mx-auto md:px-6 ${
          noPbRoutes.includes(location.pathname) ? "pb-0" : "pb-12 md:pb-0"
        }`}
      >
        <PlayerStack />
        <Routes>
          {isUserAuthenticated ? authenticatedRoutes : unauthenticatedRoutes}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

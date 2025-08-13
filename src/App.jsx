import { useContext, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

/**
 * Central routes config with auth guards.
 * auth: true = requires auth,
 * auth: false = no auth,
 * auth: "both" = accessible to all.
 */
const routesConfig = [
  { path: "/", element: <Home />, auth: true },
  { path: "/search", element: <Search />, auth: true },
  { path: "/clips", element: <Clips />, auth: "both" },
  { path: "/u/:username", element: <Profile />, auth: "both" },
  { path: "/music", element: <Music />, auth: "both" },
  { path: "/music/:slug", element: <Music />, auth: "both" },
  { path: "/direct/t/:roomId", element: <ChatStack />, auth: true },
  { path: "/direct/inbox", element: <ChatStack />, auth: true },
  { path: "/create", element: <Create />, auth: true },
  { path: "/auth/login", element: <AuthLogin />, auth: false },
  { path: "/auth/signup", element: <AuthSignup />, auth: false },
  { path: "*", element: <NotFound404 />, auth: "both" },
];

// Precompile regex for no-padding patterns
const noPaddingPatterns = [
  "/music"
  "/clips",
  "/direct",
  "/direct",
  "/notifications",
].map((pattern) =>
  new RegExp(
    "^" +
      pattern
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/:\\w+/g, "[^/]+") +
      "$"
  )
);

function App() {
  const location = useLocation();
  const { isAppLoading } = useContext(AppContext);
  const { isUserAuthenticated, loading } = useContext(UserContext);

  // Loading screen for both app init + auth check
  if (isAppLoading || loading) {
    return <LoadingScreen />;
  }

  // Filter routes based on auth
  const filteredRoutes = useMemo(() => {
    return routesConfig.filter(({ auth }) => {
      if (auth === "both") return true;
      if (auth === true) return isUserAuthenticated;
      if (auth === false) return !isUserAuthenticated;
      return false;
    });
  }, [isUserAuthenticated]);

  // Match no-padding patterns for current path
  const isNoPadding = useMemo(
    () => noPaddingPatterns.some((regex) => regex.test(location.pathname)),
    [location.pathname]
  );

  return (
    <div className="flex min-h-screen bg-body-bg dark:bg-body-bg-dark text-black dark:text-white">
      {isUserAuthenticated && <NavStack />}
      <main
        className={`w-full max-w-7xl mx-auto md:px-6 ${
          isNoPadding ? "pb-0" : "pb-12 md:pb-0"
        }`}
      >
        <PlayerStack />
        <Routes location={location}>
          {filteredRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Redirect unauthenticated "/" to /music */}
          {!isUserAuthenticated && (
            <Route path="/" element={<Navigate to="/music" replace />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
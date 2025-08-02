import { useContext } from "react";
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
  { path: "/clips", element: <Clips />, auth: true },
  { path: "/u/:username", element: <Profile />, auth: true },
  { path: "/music", element: <Music />, auth: true },
  { path: "/music/:slug", element: <Music />, auth: true },
  { path: "/direct/t/:roomId", element: <ChatStack />, auth: true },
  { path: "/direct/inbox", element: <ChatStack />, auth: true },
  { path: "/create", element: <Create />, auth: true },

  { path: "/auth/login", element: <AuthLogin />, auth: false },
  { path: "/auth/signup", element: <AuthSignup />, auth: false },

  { path: "/music", element: <Music />, auth: "both" },
  { path: "/music/:slug", element: <Music />, auth: "both" },
  { path: "/clips", element: <Clips />, auth: "both" },
  { path: "/u/:username", element: <Profile />, auth: "both" },

  { path: "*", element: <NotFound404 />, auth: "both" },
];

function getRoutesForAuth(isUserAuthenticated) {
  return ({ auth }) => {
    if (auth === "both") return true;
    if (auth === true) return isUserAuthenticated;
    if (auth === false) return !isUserAuthenticated;
    return false;
  };
}

const noPaddingRoutePatterns = [
  "/clips",
  "/direct/inbox",
  "/direct/t/:roomId",
  "/notifications",
];

function matchesPattern(pattern, path) {
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/:\\w+/g, "[^/]+") +
      "$"
  );
  return regex.test(path);
}

function App() {
  const location = useLocation();
  const { isAppLoading } = useContext(AppContext);
  const { isUserAuthenticated, loading } = useContext(UserContext);

  if (isAppLoading || loading) {
    return <LoadingScreen />;
  }

  const filteredRoutes = routesConfig.filter(
    getRoutesForAuth(isUserAuthenticated)
  );

  const isNoPadding = noPaddingRoutePatterns.some((pattern) =>
    matchesPattern(pattern, location.pathname)
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

          {!isUserAuthenticated && (
            <Route path="/" element={<Navigate to="/music" />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;

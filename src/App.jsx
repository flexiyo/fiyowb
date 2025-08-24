import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppContext from "./context/items/AppContext";
import UserContext from "./context/items/UserContext";
import LoadingScreen from "./components/app/LoadingScreen";
import NavStack from "./layout/NavStack";
import PlayerStack from "./components/music/PlayerStack";
import routes from "./routes";

function renderRoutes(routeArray, isUserAuthenticated) {
  return routeArray.map(({ path, element: Element, auth, children }) => {
    if (auth === true && !isUserAuthenticated) return null;
    if (auth === false && isUserAuthenticated) return null;

    if (children) {
      return (
        <Route key={path} path={path}>
          {renderRoutes(children, isUserAuthenticated)}
        </Route>
      );
    }

    return <Route key={path} path={path} element={<Element />} />;
  });
}

export default function App() {
  const { isAppLoading } = useContext(AppContext);
  const { isUserAuthenticated, loading } = useContext(UserContext);

  if (isAppLoading || loading) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-body-bg dark:bg-body-bg-dark text-black dark:text-white">
      {isUserAuthenticated && <NavStack />}
      <main className="w-full max-w-7xl mx-auto md:px-6 pb-12 md:pb-0">
        <PlayerStack />

        <Routes>
          {/* Redirect root if not authenticated */}
          {!isUserAuthenticated && (
            <Route path="/" element={<Navigate to="/music" replace />} />
          )}

          {/* Render all routes */}
          {renderRoutes(routes, isUserAuthenticated)}

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to={isUserAuthenticated ? "/" : "/music"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

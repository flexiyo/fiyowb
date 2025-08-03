import { AppProvider } from "./items/AppContext";
import { UserProvider } from "./items/UserContext";
import { SocketProvider } from "./items/SocketContext";
import { MusicProvider } from "./items/MusicContext";

const ContextProviders = ({ children }) => {
  return (
    <AppProvider>
      <UserProvider>
        <MusicProvider>
          <SocketProvider>{children}</SocketProvider>
        </MusicProvider>
      </UserProvider>
    </AppProvider>
  );
};

export default ContextProviders;

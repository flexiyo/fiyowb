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

const routes = [
  {
    path: "/",
    element: Home,
    auth: "both",
  },
  {
    path: "/search",
    element: Search,
    auth: true,
  },
  {
    path: "/clips",
    element: Clips,
    auth: true,
  },
  {
    path: "/clips/:id",
    element: Clips,
    auth: "both",
  },
  {
    path: "/u/:username",
    element: Profile,
    auth: "both",
  },
  {
    path: "/music",
    element: Music,
    auth: "both",
  },
  {
    path: "/music/:slug",
    element: Music,
    auth: "both",
  },
  {
    path: "/direct",
    children: [
      {
        path: "t/:roomId",
        element: ChatStack,
        auth: true,
      },
      {
        path: "inbox",
        element: ChatStack,
        auth: true,
      },
    ],
  },
  {
    path: "/create",
    element: Create,
    auth: true,
  },
  {
    path: "/auth/login",
    element: AuthLogin,
    auth: false,
  },
  {
    path: "/auth/signup",
    element: AuthSignup,
    auth: false,
  },
  {
    path: "*",
    element: NotFound404,
    auth: "both",
  },
];

export default routes;

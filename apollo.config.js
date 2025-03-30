import { FIYOGQL_BASE_URI } from "./src/constants.js";

export default {
  client: {
    service: {
      name: "fiyogql",
      url: FIYOGQL_BASE_URI,
    },
    includes: ["./src/**/*.{js,jsx}"],
  },
};

import { executeQuery } from "../utils/executeQuery.js";
import * as ops from "../graphql/fiyouser/user.ops.js";

/** Query Functions */
export const getUsers = (user_ids = []) =>
  executeQuery("query", ops.GET_USERS, { user_ids });

export const searchUsers = (query) =>
  executeQuery("query", ops.SEARCH_USERS, { query });

export const getBasicUser = (username) =>
  executeQuery("query", ops.GET_BASIC_USER, { username });

export const getUser = (username) =>
  executeQuery("query", ops.GET_USER, { username });

/** Mutation Functions */
export const updateUser = (updated_fields) =>
  executeQuery("mutate", ops.UPDATE_USER, { updated_fields });

export const deleteUser = () => executeQuery("mutate", ops.DELETE_USER);

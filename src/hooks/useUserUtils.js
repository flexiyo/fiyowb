import client from "../utils/apolloClient.js";
import * as ops from "../graphql/fiyouser/user.ops.js";

/** Generic Query Handler */
const executeQuery = async (type, queryDoc, variables = {}) => {
  try {
    const { data } = await client[type]({
      [type === "query" ? "query" : "mutation"]: queryDoc,
      variables,
      fetchPolicy: type === "query" ? "network-only" : undefined,
    });

    return data?.[Object.keys(data)[0]];
  } catch (error) {
    console.error(
      `GraphQL ${type.toUpperCase()} Error in ${
        queryDoc.definitions[0].name.value
      }:`,
      error
    );
    return null;
  }
};

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

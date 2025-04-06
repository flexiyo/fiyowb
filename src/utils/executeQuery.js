import client from "./apolloClient";

export const executeQuery = async (type, queryDoc, variables = {}) => {
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

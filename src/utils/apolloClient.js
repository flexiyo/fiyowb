import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from "@apollo/client";
import { Observable } from "@apollo/client";
import { FIYOGQL_BASE_URI } from "../constants.js";
import { refreshAccessToken } from "../hooks/useTokenUtils.js";

const httpLink = new HttpLink({ uri: FIYOGQL_BASE_URI });

let isRefreshing = false,
  refreshPromise = null,
  failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

const authLink = new ApolloLink((operation, forward) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  operation.setContext(({ headers = {} }) => ({
    headers: userInfo.headers && {
      ...headers,
      access_token: userInfo.headers.access_token,
      device_id: userInfo.headers.device_id,
    },
  }));
  return forward(operation);
});

const errorLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    forward(operation).subscribe({
      next: async (response) => {
        try {
          const responseData = response?.data || {};
          const firstKey = Object.keys(responseData)[0];
          const status = responseData[firstKey]?.status;

          if (status?.success === false) {
            if (status.message === "MissingHeadersError") {
              window.location.href = "/";
              return;
            }

            if (status.message === "ATInvalidError") {
              if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshAccessToken()
                  .then(() => {
                    const newToken = JSON.parse(
                      localStorage.getItem("userInfo") || "{}"
                    )?.headers?.access_token;
                    processQueue(null, newToken);
                    isRefreshing = false;
                    return newToken;
                  })
                  .catch((err) => {
                    processQueue(err);
                    isRefreshing = false;
                    throw err;
                  });
              }

              const newToken = await refreshPromise;
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  access_token: newToken,
                  device_id: JSON.parse(
                    localStorage.getItem("userInfo") || "{}"
                  )?.headers?.device_id,
                },
              }));
              return forward(operation).subscribe(observer);
            }
          }

          observer.next(response);
        } catch (error) {
          observer.error(error);
        }
      },
      error: observer.error.bind(observer),
      complete: observer.complete.bind(observer),
    });
  });
});

const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
});

export const executeQuery = async (query, variables = {}) => {
  const { data } = await client.query({ query, variables });
  const responseData = data || {};
  const firstKey = Object.keys(responseData)[0];
  const status = responseData[firstKey]?.status;

  if (status?.success === false) throw new Error(status.message);
  return data;
};

export default client;

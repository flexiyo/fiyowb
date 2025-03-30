import { gql } from "@apollo/client";

/** Queries */
export const REFRESH_ACCESS_TOKEN = gql`
  query RefreshAccessToken {
    refreshAccessToken {
      status {
        success
        message
      }
      headers {
        access_token
        refresh_token
        device_id
      }
    }
  }
`;

/** Mutations */
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterRequest!) {
    registerUser(input: $input) {
      status {
        success
        message
      }
      user {
        id
        username
        avatar
      }
      headers {
        access_token
        refresh_token
        device_id
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginRequest!) {
    loginUser(input: $input) {
      status {
        success
        message
      }
      user {
        id
        username
        avatar
      }
      headers {
        access_token
        refresh_token
        device_id
      }
    }
  }
`;
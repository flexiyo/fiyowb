import { gql } from "@apollo/client";

/** Queries */
export const GET_USER_FOLLOWERS = gql`
  query GetUserFollowers($user_id: String!) {
    getUserFollowers(user_id: $user_id) {
      status {
        success
        message
      }
      users {
        id
        full_name
        username
        avatar
        relation {
          follow {
            is_following
            is_followed
          }
        }
      }
    }
  }
`;

export const GET_USER_FOLLOWING = gql`
  query GetUserFollowing($user_id: String!) {
    getUserFollowing(user_id: $user_id) {
      status {
        success
        message
      }
      users {
        id
        full_name
        username
        avatar
        relation {
          follow {
            is_following
            is_followed
          }
        }
      }
    }
  }
`;

export const GET_PENDING_FOLLOW_REQUESTS = gql`
  query GetPendingFollowRequests {
    getPendingFollowRequests {
      status {
        success
        message
      }
      users {
        id
        full_name
        username
        avatar
      }
    }
  }
`;

export const GET_USER_MATES = gql`
  query GetUserMates {
    getUserMates {
      status {
        success
        message
      }
      users {
        id
        full_name
        username
        avatar
        relation {
          mate {
            are_mates
          }
        }
      }
    }
  }
`;

export const GET_PENDING_MATE_REQUESTS = gql`
  query GetPendingMateRequests {
    getPendingMateRequests {
      status {
        success
        message
      }
      users {
        id
        full_name
        username
        avatar
      }
    }
  }
`;

/** Mutations */
export const SEND_FOLLOW_REQUEST = gql`
  mutation SendFollowRequest($user_id: String!) {
    sendFollowRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

export const UNSEND_FOLLOW_REQUEST = gql`
  mutation UnsendFollowRequest($user_id: String!) {
    unsendFollowRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

export const ACCEPT_FOLLOW_REQUEST = gql`
  mutation AcceptFollowRequest($user_id: String!) {
    acceptFollowRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

export const REJECT_FOLLOW_REQUEST = gql`
  mutation RejectFollowRequest($user_id: String!) {
    rejectFollowRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

export const SEND_MATE_REQUEST = gql`
  mutation SendMateRequest($user_id: String!) {
    sendMateRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

export const UNSEND_MATE_REQUEST = gql`
  mutation UnsendMateRequest($user_id: String!) {
    unsendMateRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

export const ACCEPT_MATE_REQUEST = gql`
  mutation AcceptMateRequest($user_id: String!) {
    acceptMateRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

export const REJECT_MATE_REQUEST = gql`
  mutation RejectMateRequest($user_id: String!) {
    rejectMateRequest(user_id: $user_id) {
      status {
        success
        message
      }
    }
  }
`;

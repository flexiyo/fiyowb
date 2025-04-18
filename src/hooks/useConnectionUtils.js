import { executeQuery } from "../utils/executeQuery";
import * as ops from "../graphql/fiyouser/connection.ops.js";

/** Query Functions */
export const getUserFollowers = (user_id, offset = 0) =>
  executeQuery("query", ops.GET_USER_FOLLOWERS, { user_id, offset });

export const getUserFollowing = (user_id, offset = 0) =>
  executeQuery("query", ops.GET_USER_FOLLOWING, { user_id, offset });

export const getPendingFollowRequests = () =>
  executeQuery("query", ops.GET_PENDING_FOLLOW_REQUESTS);

export const getUserMates = () => executeQuery("query", ops.GET_USER_MATES);

export const getPendingMateRequests = () =>
  executeQuery("query", ops.GET_PENDING_MATE_REQUESTS);

/** Mutation Functions */
export const sendFollowRequest = (user_id) =>
  executeQuery("mutate", ops.SEND_FOLLOW_REQUEST, { user_id });

export const unsendFollowRequest = (user_id) =>
  executeQuery("mutate", ops.UNSEND_FOLLOW_REQUEST, { user_id });

export const acceptFollowRequest = (user_id) =>
  executeQuery("mutate", ops.ACCEPT_FOLLOW_REQUEST, { user_id });

export const rejectFollowRequest = (user_id) =>
  executeQuery("mutate", ops.REJECT_FOLLOW_REQUEST, { user_id });

export const sendMateRequest = (user_id) =>
  executeQuery("mutate", ops.SEND_MATE_REQUEST, { user_id });

export const unsendMateRequest = (user_id) =>
  executeQuery("mutate", ops.UNSEND_MATE_REQUEST, { user_id });

export const acceptMateRequest = (user_id) =>
  executeQuery("mutate", ops.ACCEPT_MATE_REQUEST, { user_id });

export const rejectMateRequest = (user_id) =>
  executeQuery("mutate", ops.REJECT_MATE_REQUEST, { user_id });

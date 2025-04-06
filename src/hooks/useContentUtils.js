import { executeQuery } from "../utils/executeQuery";
import * as ops from "../graphql/fiyofeed/content.ops.js";

/** Query Functions */
export const getContent = (user_id, offset = 0) =>
  executeQuery("query", ops.GET_CONTENT, { user_id, offset });

export const getContents = (user_ids = []) =>
  executeQuery("query", ops.GET_CONTENTS, { user_ids });

/** Mutation Functions */
export const createContent = (
  media_key,
  table_name,
  caption = "",
  hashtags = [],
  track,
  collabs = []
) =>
  executeQuery("mutate", ops.CREATE_CONTENT, {
    media_key,
    table_name,
    caption,
    hashtags,
    track,
    collabs,
  });

export const updateContent = (content_id, caption) =>
  executeQuery("mutate", ops.UPDATE_CONTENT, { content_id, caption });

export const deleteContent = (content_id) =>
  executeQuery("mutate", ops.DELETE_CONTENT, { content_id });

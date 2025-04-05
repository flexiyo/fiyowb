import { gql } from "@apollo/client";

/** Queries */
export const GET_USER_FEED = gql`
  query GetUserFeed($table_name: TableName!) {
    getUserFeed(table_name: $table_name) {
      status {
        success
        message
      }
      contents {
        id
        creators {
          id
          full_name
          username
          avatar
        }
        media_key
        created_at
        caption
        hashtags
        track {
          id
          title
          artists
          link
        }
        likes_count
        comments_count
        shares_count
      }
    }
  }
`;

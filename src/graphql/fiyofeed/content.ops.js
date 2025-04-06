import { gql } from "@apollo/client";

/** Queries */
export const GET_CONTENT = gql`
  query GetContent($content_id: String!, $table_name: TableName!) {
    getContent(content_id: $content_id, table_name: $table_name) {
      status {
        success
        message
      }
      content {
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

export const GET_CONTENTS = gql`
  query GetContents($content_ids: [String!]!, $table_name: TableName!) {
    getContents(content_ids: $content_ids, table_name: $table_name) {
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

/** Mutations */
export const CREATE_CONTENT = gql`
  mutation CreateContent($input: CreateContentRequest!) {
    createContent(input: $input) {
      status {
        success
        message
      }
      content_id
    }
  }
`;

export const UPDATE_CONTENT = gql`
  mutation UpdateContent(
    $content_id: String!
    $table_name: TableName!
    $updated_fields: UpdatedFieldsInput!
  ) {
    updateContent(
      content_id: $content_id
      table_name: $table_name
      updated_fields: $updated_fields
    ) {
      status {
        success
        message
      }
      updated_fields {
        collabs
        caption
        hashtags
      }
    }
  }
`;

export const DELETE_CONTENT = gql`
  mutation DeleteContent($content_id: String!, $table_name: TableName!) {
    deleteContent(content_id: $content_id, table_name: $table_name) {
      status {
        success
        message
      }
    }
  }
`;

import { gql } from 'graphql-request';
import type { Spot } from '@/types/spot';

// スポット作成ミューテーション
export const CREATE_SPOT = gql`
  mutation CreateSpot($input: CreateSpotInput!) {
    createSpot(input: $input) {
      id
      name
      description
      category
      location
      address
      latitude
      longitude
      imageUrl
      images
      secretLevel
      bestSeason
      bestTime
      tips
      createdAt
    }
  }
`;

// スポット更新ミューテーション
export const UPDATE_SPOT = gql`
  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {
    updateSpot(id: $id, input: $input) {
      id
      name
      description
      category
      location
      address
      latitude
      longitude
      imageUrl
      images
      secretLevel
      bestSeason
      bestTime
      tips
      updatedAt
    }
  }
`;

// コメント追加ミューテーション
export const ADD_COMMENT = gql`
  mutation AddComment($spotId: ID!, $content: String!) {
    addComment(spotId: $spotId, content: $content) {
      id
      content
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;

// スポット保存ミューテーション
export const SAVE_SPOT = gql`
  mutation SaveSpot($spotId: ID!) {
    saveSpot(spotId: $spotId) {
      id
      savedAt
    }
  }
`;

// スポット保存解除ミューテーション
export const UNSAVE_SPOT = gql`
  mutation UnsaveSpot($spotId: ID!) {
    unsaveSpot(spotId: $spotId) {
      success
      message
    }
  }
`;

// 型定義
export interface CreateSpotData {
  createSpot: Spot;
}

export interface UpdateSpotData {
  updateSpot: Spot;
}

export interface AddCommentData {
  addComment: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

export interface SaveSpotData {
  saveSpot: {
    id: string;
    savedAt: string;
  };
}

export interface UnsaveSpotData {
  unsaveSpot: {
    success: boolean;
    message: string;
  };
}

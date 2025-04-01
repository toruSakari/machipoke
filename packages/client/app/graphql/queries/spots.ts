import { gql } from 'graphql-request';
import type { Spot } from '@/types/spot';

// スポット一覧を取得するクエリ
export const GET_SPOTS = gql`
  query GetSpots($limit: Int, $offset: Int, $category: String) {
    spots(limit: $limit, offset: $offset, category: $category) {
      id
      name
      description
      category
      location
      address
      latitude
      longitude
      imageUrl
      secretLevel
      rating
      createdAt
    }
  }
`;

// スポット詳細を取得するクエリ
export const GET_SPOT_BY_ID = gql`
  query GetSpotById($id: ID!) {
    spot(id: $id) {
      id
      name
      description
      longDescription
      category
      location
      address
      latitude
      longitude
      imageUrl
      images
      secretLevel
      rating
      bestSeason
      bestTime
      tips
      createdAt
      createdBy {
        id
        name
        avatar
      }
      comments {
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
  }
`;

// 付近のスポットを取得するクエリ
export const GET_NEARBY_SPOTS = gql`
  query GetNearbySpots($latitude: Float!, $longitude: Float!, $distance: Float, $limit: Int) {
    nearbySpots(
      latitude: $latitude,
      longitude: $longitude,
      distance: $distance,
      limit: $limit
    ) {
      id
      name
      description
      category
      latitude
      longitude
      imageUrl
      distance
      rating
    }
  }
`;

// 型定義
export interface SpotsData {
  spots: Spot[];
}

export interface SpotData {
  spot: Spot;
}

export interface NearbySpotData {
  nearbySpots: (Spot & { distance: number })[];
}

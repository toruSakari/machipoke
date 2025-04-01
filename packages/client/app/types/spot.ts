export interface Spot {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  images?: string[];
  secretLevel: number; // 1-5の穴場度評価
  rating: number; // 評価 (1-5)
  bestSeason?: string;
  bestTime?: string;
  tips?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateSpotInput {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  images?: string[];
  secretLevel: number;
  bestSeason?: string;
  bestTime?: string;
  tips?: string;
}

export interface UpdateSpotInput {
  name?: string;
  description?: string;
  longDescription?: string;
  category?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  images?: string[];
  secretLevel?: number;
  bestSeason?: string;
  bestTime?: string;
  tips?: string;
}

// GeoJSONのための型定義
export interface SpotGeoJSON {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    properties: {
      id: string;
      name: string;
      category: string;
      secretLevel: number;
      rating: number;
    };
  }[];
}

// スポットのフィルター条件
export interface SpotFilter {
  category?: string;
  searchTerm?: string;
  minRating?: number;
  minSecretLevel?: number;
  nearLocation?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
}

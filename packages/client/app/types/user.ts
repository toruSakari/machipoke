export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  hometown?: string;
  interests?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  savedSpots?: SavedSpot[];
  postedSpots?: PostedSpot[];
  visitedSpots?: VisitedSpot[];
}

export interface SavedSpot {
  id: string;
  spot: {
    id: string;
    name: string;
    description: string;
    category: string;
    location: string;
    imageUrl: string;
  };
  savedAt: string;
}

export interface PostedSpot {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
  createdAt: string;
  likes: number;
}

export interface VisitedSpot {
  id: string;
  spot: {
    id: string;
    name: string;
    description: string;
    category: string;
    location: string;
    imageUrl: string;
  };
  visitedAt: string;
  rating: number;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  location?: string;
  hometown?: string;
  interests?: string[];
  avatar?: string;
}

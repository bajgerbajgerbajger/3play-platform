export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: 'ADMIN' | 'USER' | 'GUEST';
  createdAt: Date;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  synopsis: string | null;
  releaseYear: number;
  duration: number;
  rating: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  videoUrl: string | null;
  isPremium: boolean;
  isPublished: boolean;
  viewCount: number;
  averageRating: number;
  genres: Genre[];
  cast: CastMember[];
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  synopsis: string | null;
  startYear: number;
  endYear: number | null;
  rating: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  isPremium: boolean;
  totalSeasons: number;
  totalEpisodes: number;
  viewCount: number;
  averageRating: number;
  genres: Genre[];
  cast: CastMember[];
  seasons: Season[];
}

export interface Episode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  duration: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  viewCount: number;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string | null;
  description: string | null;
  posterUrl: string | null;
  episodeCount: number;
  episodes: Episode[];
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface CastMember {
  id: string;
  name: string;
  role: string | null;
  avatar: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
  plan: 'FREE' | 'PREMIUM' | 'FAMILY';
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
}

export interface WatchHistory {
  id: string;
  userId: string;
  movieId?: string;
  episodeId?: string;
  progress: number;
  duration: number;
  completed: boolean;
  watchedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  movieId?: string;
  seriesId?: string;
  rating: number;
  content: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

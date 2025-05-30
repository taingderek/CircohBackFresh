export interface Rating {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  overallRating: number;
  thoughtfulnessRating: number;
  responsivenessRating: number;
  empathyRating: number;
  comment?: string;
  createdAt: string;
  isAnonymous: boolean;
}

export interface CategoryAverages {
  thoughtfulness: number;
  responsiveness: number;
  empathy: number;
} 
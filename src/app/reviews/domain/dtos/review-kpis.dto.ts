import { Review } from '../entities/review.entity';
import { ReviewStatus, ReviewSortBy } from '../enums/review-status.enum';

export interface ReviewFilters {
  status?: ReviewStatus;
  rating?: number | null;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  parkingId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: ReviewSortBy;
}

export interface ReviewKpis {
  averageRating: number;
  averageRatingDelta: number;
  totalReviews: number;
  totalReviewsDelta: number;
  responseRate: number;
  responseRateDelta: number;
  avgResponseTimeHours: number;
  avgResponseTimeDelta: number;
}

export interface ReviewsListResponse {
  data: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

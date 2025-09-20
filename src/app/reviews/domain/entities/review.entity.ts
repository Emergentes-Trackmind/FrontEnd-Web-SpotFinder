import { ReviewId } from '../value-objects/review-id.vo';

export interface Review {
  id: ReviewId;
  driver_name: string;
  driver_avatar?: string;
  parking_name: string;
  rating: number;
  comment: string;
  created_at: string;
  responded: boolean;
  response_text?: string;
  response_at?: string;
  read_at?: string;
}

export interface Parking {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  totalSpaces?: number;
  availableSpaces?: number;
  pricePerHour?: number;
  description?: string;
  features?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


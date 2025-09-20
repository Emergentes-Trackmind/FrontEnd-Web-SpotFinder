export interface TotalsKpiDTO {
  totalRevenue: {
    value: number;
    currency: string;
    deltaPercentage: number;
    deltaText: string;
  };
  occupiedSpaces: {
    occupied: number;
    total: number;
    percentage: number;
    text: string;
  };
  activeUsers: {
    count: number;
    deltaPercentage: number;
    deltaText: string;
  };
  registeredParkings: {
    total: number;
    newThisMonth: number;
    deltaText: string;
  };
}

export interface RevenueByMonthDTO {
  month: string;
  revenue: number;
  currency: string;
}

export interface OccupancyByHourDTO {
  hour: number;
  percentage: number;
  occupied: number;
  total: number;
}

export interface ActivityItemDTO {
  id: string;
  type: 'reservation_confirmed' | 'payment_processed' | 'reservation_cancelled' | 'parking_created' | 'review_added';
  title: string;
  description: string;
  userName: string;
  userAvatar?: string;
  status: 'confirmed' | 'paid' | 'cancelled' | 'created' | 'pending';
  createdAt: string;
  relatedEntity?: {
    id: string;
    name: string;
    type: 'parking' | 'reservation' | 'payment';
  };
}

export interface TopParkingDTO {
  id: string;
  name: string;
  occupancyPercentage: number;
  rating: number;
  monthlyRevenue: number;
  currency: string;
  address: string;
  status: 'active' | 'maintenance' | 'inactive';
}

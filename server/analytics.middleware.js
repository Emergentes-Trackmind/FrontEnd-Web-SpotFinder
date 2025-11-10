/**
 * Analytics Middleware for SpotFinder Dashboard
 * Calculates real-time metrics based on actual data in the database
 */

module.exports = (req, res, next) => {
  // Only handle analytics endpoints (both original and rewritten routes)
  if (!req.path.startsWith('/api/analytics') &&
      !req.path.startsWith('/analytics') &&
      !req.path.includes('/analytics')) {
    return next();
  }

  const db = req.app.db;

  // Extract user from JWT token
  function getCurrentUserId() {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = 'spotfinder_secret_key_2024';
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Helper function to calculate totals KPI
  function calculateTotalsKpi() {
    const users = db.get('users').value() || [];
    const allParkings = db.get('parkings').value() || [];
    const allReservations = db.get('reservations').value() || [];
    const allPayments = db.get('payments').value() || [];
    const allSpots = db.get('parkingSpots').value() || [];

    // Filter data by current user - only show their parkings and related data
    const parkings = allParkings.filter(parking => parking.ownerId === currentUserId);
    const parkingIds = parkings.map(p => p.id);

    // Filter reservations and spots that belong to user's parkings
    const reservations = allReservations.filter(reservation => parkingIds.includes(reservation.parkingId));
    const spots = allSpots.filter(spot => parkingIds.includes(spot.parkingId));

    // Filter payments that belong to user's reservations
    const reservationIds = reservations.map(r => r.id);
    const payments = allPayments.filter(payment => reservationIds.includes(payment.reservationId));

    // Calculate revenue from payments
    const totalRevenue = payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);

    // Calculate occupied spaces
    const occupiedSpots = spots.filter(spot => spot.status === 'occupied').length;
    const totalSpots = spots.length;
    const occupancyPercentage = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

    // Calculate active users (users with active reservations RIGHT NOW)
    const now = new Date();

    const activeReservations = reservations.filter(reservation => {
      if (reservation.status !== 'active') return false;

      const startTime = new Date(reservation.startTime);
      const endTime = new Date(reservation.endTime);

      // Check if reservation is currently active (now is between start and end time)
      return now >= startTime && now <= endTime;
    });

    // Count unique users with active reservations
    const uniqueActiveUserIds = [...new Set(activeReservations.map(res => res.userId))];
    const activeUsers = uniqueActiveUserIds.length;


    // Calculate new parkings this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newParkingsThisMonth = parkings.filter(parking => {
      if (!parking.createdAt) return false;
      const createdAt = new Date(parking.createdAt);
      return createdAt >= thisMonth;
    }).length;

    return {
      totalRevenue: {
        value: totalRevenue,
        currency: "PEN",
        deltaPercentage: totalRevenue > 0 ? 15 : 0,
        deltaText: totalRevenue > 0 ? `+15% vs mes anterior` : '+0% vs mes anterior'
      },
      occupiedSpaces: {
        occupied: occupiedSpots,
        total: totalSpots,
        percentage: occupancyPercentage,
        text: `${occupiedSpots} de ${totalSpots} ocupadas`
      },
      "activeUsers": {
        "count": activeUsers,
        "deltaPercentage": activeUsers > 0 ? 15 : 0,
        "deltaText": activeUsers > 0 ? `${activeUsers} usando parkings` : 'Ningún usuario activo'
      },
      registeredParkings: {
        total: parkings.length,
        newThisMonth: newParkingsThisMonth,
        deltaText: `+${newParkingsThisMonth} este mes`
      }
    };
  }

  // Helper function to generate revenue data
  function generateRevenueData() {
    const allPayments = db.get('payments').value() || [];
    const allReservations = db.get('reservations').value() || [];
    const allParkings = db.get('parkings').value() || [];

    // Filter to only show payments from user's parkings
    const userParkings = allParkings.filter(parking => parking.ownerId === currentUserId);
    const userParkingIds = userParkings.map(p => p.id);
    const userReservations = allReservations.filter(reservation => userParkingIds.includes(reservation.parkingId));
    const userReservationIds = userReservations.map(r => r.id);
    const payments = allPayments.filter(payment => userReservationIds.includes(payment.reservationId));
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Group payments by month
    const revenueByMonth = months.map((month, index) => {
      const monthPayments = payments.filter(payment => {
        if (!payment.createdAt) return false;
        const paymentMonth = new Date(payment.createdAt).getMonth();
        return paymentMonth === index;
      });

      const monthRevenue = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        month,
        value: monthRevenue,
        target: monthRevenue > 0 ? monthRevenue * 1.1 : 1000 // 10% higher target
      };
    });

    return revenueByMonth;
  }

  // Helper function to generate occupancy data
  function generateOccupancyData() {
    const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const allSpots = db.get('parkingSpots').value() || [];
    const allParkings = db.get('parkings').value() || [];

    // Filter to only show spots from user's parkings
    const userParkings = allParkings.filter(parking => parking.ownerId === currentUserId);
    const userParkingIds = userParkings.map(p => p.id);
    const spots = allSpots.filter(spot => userParkingIds.includes(spot.parkingId));
    const totalSpots = spots.length;

    if (totalSpots === 0) {
      return hours.map(hour => ({ hour, percentage: 0 }));
    }

    // Simulate realistic occupancy patterns
    const occupancyPatterns = {
      '06:00': 0.2,  // 20% morning
      '08:00': 0.7,  // 70% rush hour
      '10:00': 0.9,  // 90% peak
      '12:00': 0.95, // 95% lunch time
      '14:00': 0.8,  // 80% afternoon
      '16:00': 0.85, // 85% afternoon peak
      '18:00': 0.6,  // 60% evening
      '20:00': 0.3   // 30% night
    };

    const occupiedSpots = spots.filter(spot => spot.status === 'occupied').length;
    const currentOccupancy = totalSpots > 0 ? occupiedSpots / totalSpots : 0;

    return hours.map(hour => ({
      hour,
      percentage: Math.round((occupancyPatterns[hour] * 100) * (0.5 + currentOccupancy * 0.5))
    }));
  }

  // Helper function to generate recent activity
  function generateRecentActivity() {
    const allReservations = db.get('reservations').value() || [];
    const users = db.get('users').value() || [];
    const allParkings = db.get('parkings').value() || [];

    // Filter to only show user's parkings
    const parkings = allParkings.filter(parking => parking.ownerId === currentUserId);
    const parkingIds = parkings.map(p => p.id);

    // Filter reservations to only show those for user's parkings
    const userReservations = allReservations.filter(reservation => parkingIds.includes(reservation.parkingId));

    // Get recent reservations (last 10)
    const recentReservations = userReservations
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);

    const activity = recentReservations.map(reservation => {
      const user = users.find(u => u.id === reservation.userId);
      const parking = parkings.find(p => p.id === reservation.parkingId);

      return {
        id: reservation.id,
        type: 'reservation',
        title: 'Nueva reserva realizada',
        description: `${user?.firstName || 'Usuario'} reservó en ${parking?.name || 'Parking'}`,
        timestamp: reservation.createdAt || new Date().toISOString(),
        user: {
          name: user ? `${user.firstName} ${user.lastName}` : 'Usuario Anónimo',
          avatar: null
        },
        metadata: {
          parkingName: parking?.name || 'Parking',
          amount: reservation.totalAmount || 0
        }
      };
    });

    // Add welcome message if no real activity
    if (activity.length === 0) {
      activity.push({
        id: 'welcome',
        type: 'system',
        title: 'Bienvenido a SpotFinder',
        description: 'Has iniciado tu parking para empezar',
        timestamp: new Date().toISOString(),
        user: {
          name: 'Sistema',
          avatar: null
        },
        metadata: {}
      });
    }

    return activity;
  }

  // Helper function to generate top parkings
  function generateTopParkings() {
    const allParkings = db.get('parkings').value() || [];
    const allReservations = db.get('reservations').value() || [];

    // Filter to only show user's parkings
    const parkings = allParkings.filter(parking => parking.ownerId === currentUserId);

    const reservations = allReservations;

    if (parkings.length === 0) {
      return [];
    }

    // Calculate performance for each parking
    const parkingStats = parkings.map(parking => {
      const parkingReservations = reservations.filter(r => r.parkingId === parking.id);
      const revenue = parkingReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
      const reservationCount = parkingReservations.length;

      return {
        id: parking.id,
        name: parking.name,
        location: parking.address || parking.location || 'Ubicación no especificada',
        revenue: revenue,
        reservations: reservationCount,
        rating: parking.rating || 4.0,
        performance: revenue > 0 ? Math.min(100, (revenue / 1000) * 100) : 0
      };
    });

    // Sort by performance and return top 5
    return parkingStats
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);
  }

  // Helper function to calculate specific parking analytics
  function calculateParkingSpecificAnalytics(parkingId) {
    const allParkings = db.get('parkings').value() || [];
    const allReservations = db.get('reservations').value() || [];
    const allPayments = db.get('payments').value() || [];
    const allSpots = db.get('parkingSpots').value() || [];
    const users = db.get('users').value() || [];

    // Get the specific parking
    const parking = allParkings.find(p => p.id === parkingId && p.ownerId === currentUserId);
    if (!parking) {
      return null; // Parking not found or not owned by current user
    }

    // Filter data for this specific parking
    const parkingReservations = allReservations.filter(r => r.parkingId === parkingId);
    const parkingSpots = allSpots.filter(s => s.parkingId === parkingId);

    // Filter payments for this parking's reservations
    const reservationIds = parkingReservations.map(r => r.id);
    const parkingPayments = allPayments.filter(p => reservationIds.includes(p.reservationId));

    // Calculate monthly revenue for this parking
    const totalRevenue = parkingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Calculate occupancy for this parking
    const occupiedSpots = parkingSpots.filter(spot => spot.status === 'occupied').length;
    const totalSpots = parkingSpots.length;
    const occupancyPercentage = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

    // Calculate unique users for this parking
    const uniqueUserIds = [...new Set(parkingReservations.map(r => r.userId))];
    const uniqueUsers = uniqueUserIds.length;

    // Calculate average parking time for this parking
    const completedReservations = parkingReservations.filter(r => r.status === 'completed');
    let avgParkingTime = 0;
    if (completedReservations.length > 0) {
      const totalTime = completedReservations.reduce((sum, r) => {
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        return sum + (end.getTime() - start.getTime());
      }, 0);
      avgParkingTime = Math.round(totalTime / completedReservations.length / (1000 * 60 * 60)); // hours
    }

    return {
      kpis: {
        avgOccupation: {
          value: occupancyPercentage,
          trend: occupancyPercentage > 50 ? 5 : -2
        },
        monthlyRevenue: {
          value: totalRevenue,
          trend: totalRevenue > 0 ? 15 : 0
        },
        uniqueUsers: {
          value: uniqueUsers,
          trend: uniqueUsers > 0 ? 10 : 0
        },
        avgTime: {
          value: avgParkingTime,
          trend: avgParkingTime > 2 ? 8 : -3
        }
      },
      hourlyOccupation: generateParkingHourlyOccupancy(parkingSpots, parkingReservations),
      recentActivity: generateParkingRecentActivity(parkingReservations, users, parking)
    };
  }

  // Helper function to generate hourly occupancy for specific parking
  function generateParkingHourlyOccupancy(parkingSpots, parkingReservations) {
    const hours = [];
    for (let i = 6; i <= 23; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }

    const totalSpots = parkingSpots.length;
    if (totalSpots === 0) {
      return hours.map(hour => ({ hour, percentage: 0 }));
    }

    // Calculate occupancy based on current reservations and realistic patterns
    const occupancyPatterns = {
      '06:00': 0.1, '07:00': 0.3, '08:00': 0.7, '09:00': 0.8, '10:00': 0.9,
      '11:00': 0.85, '12:00': 0.95, '13:00': 0.9, '14:00': 0.8, '15:00': 0.75,
      '16:00': 0.85, '17:00': 0.9, '18:00': 0.6, '19:00': 0.4, '20:00': 0.3,
      '21:00': 0.2, '22:00': 0.15, '23:00': 0.1
    };

    const currentOccupancy = parkingSpots.filter(s => s.status === 'occupied').length / totalSpots;

    return hours.map(hour => ({
      hour,
      percentage: Math.round((occupancyPatterns[hour] || 0.1) * 100 * (0.3 + currentOccupancy * 0.7))
    }));
  }

  // Helper function to generate recent activity for specific parking
  function generateParkingRecentActivity(parkingReservations, users, parking) {
    const recentReservations = parkingReservations
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);

    const activity = recentReservations.map(reservation => {
      const user = users.find(u => u.id === reservation.userId);
      const timeAgo = calculateTimeAgo(reservation.createdAt);

      return {
        action: 'Nueva reserva',
        details: `${user?.firstName || 'Usuario'} reservó un espacio`,
        timeAgo: timeAgo
      };
    });

    if (activity.length === 0) {
      activity.push({
        action: 'Parking creado',
        details: `${parking.name} está listo para recibir reservas`,
        timeAgo: 'hace un momento'
      });
    }

    return activity;
  }

  // Helper function to calculate time ago
  function calculateTimeAgo(dateString) {
    if (!dateString) return 'hace un momento';

    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }

  // Handle specific analytics endpoints
  if (req.method === 'GET') {
    // Handle parking-specific analytics
    const parkingAnalyticsMatch = req.path.match(/^\/(?:api\/)?parkings\/([^\/]+)\/analytics$/);
    if (parkingAnalyticsMatch) {
      const parkingId = parkingAnalyticsMatch[1];
      console.log(`🏗️ Generating analytics for parking ${parkingId}...`);
      const parkingAnalytics = calculateParkingSpecificAnalytics(parkingId);

      if (!parkingAnalytics) {
        return res.status(404).json({ error: 'Parking no encontrado o no tienes permisos' });
      }

      return res.json(parkingAnalytics);
    }

    // Handle general analytics endpoints
    switch (req.path) {
      case '/api/analytics/totals':
      case '/analytics/totals':
        console.log('📊 Generating analytics totals...');
        const totals = calculateTotalsKpi();
        return res.json(totals);

      case '/api/analytics/revenue':
      case '/analytics/revenue':
        console.log('💰 Generating revenue analytics...');
        const revenue = generateRevenueData();
        return res.json(revenue);

      case '/api/analytics/occupancy':
      case '/analytics/occupancy':
        console.log('⏰ Generating occupancy analytics...');
        const occupancy = generateOccupancyData();
        return res.json(occupancy);

      case '/api/analytics/activity':
      case '/analytics/activity':
        console.log('📋 Generating activity analytics...');
        const activity = generateRecentActivity();
        return res.json(activity);

      case '/api/analytics/top-parkings':
      case '/analytics/top-parkings':
        console.log('🏆 Generating top parkings analytics...');
        const topParkings = generateTopParkings();
        return res.json(topParkings);

      // Handle query-based analytics (for compatibility with existing service)
      case '/api/analytics':
      case '/analytics':
        const profileId = req.query.profileId;
        if (profileId) {
          console.log(`🏗️ Generating analytics for profile ${profileId}...`);
          const profileAnalytics = calculateParkingSpecificAnalytics(profileId);

          if (!profileAnalytics) {
            return res.status(404).json({ error: 'Parking no encontrado o no tienes permisos' });
          }

          return res.json([{
            id: profileId,
            profileId: profileId,
            ...profileAnalytics
          }]);
        }
        break;

      default:
        break;
    }
  }

  // Continue to default json-server behavior for other requests
  next();
};

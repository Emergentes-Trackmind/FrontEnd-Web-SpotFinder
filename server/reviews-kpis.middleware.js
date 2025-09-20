module.exports = (req, res, next) => {
  if (req.path === '/api/reviews/kpis' && req.method === 'GET') {
    // Calculate KPIs from reviews data
    const db = req.app.db;
    const reviews = db.get('reviews').value();

    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Current month reviews
    const currentMonthReviews = reviews.filter(r =>
      new Date(r.created_at) >= currentMonth
    );

    // Last month reviews
    const lastMonthReviews = reviews.filter(r => {
      const reviewDate = new Date(r.created_at);
      return reviewDate >= lastMonth && reviewDate < currentMonth;
    });

    // Calculate metrics
    const totalReviews = reviews.length;
    const totalReviewsLastMonth = lastMonthReviews.length;
    const totalReviewsDelta = totalReviews - totalReviewsLastMonth;

    // Average rating
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
    const avgRatingLastMonth = lastMonthReviews.length > 0
      ? lastMonthReviews.reduce((sum, r) => sum + r.rating, 0) / lastMonthReviews.length
      : 0;
    const avgRatingDelta = avgRating - avgRatingLastMonth;

    // Response rate
    const respondedReviews = reviews.filter(r => r.responded).length;
    const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;
    const respondedLastMonth = lastMonthReviews.filter(r => r.responded).length;
    const responseRateLastMonth = lastMonthReviews.length > 0
      ? (respondedLastMonth / lastMonthReviews.length) * 100
      : 0;
    const responseRateDelta = responseRate - responseRateLastMonth;

    // Average response time in hours
    const respondedWithTime = reviews.filter(r => r.responded && r.response_at && r.created_at);
    const avgResponseTime = respondedWithTime.length > 0
      ? respondedWithTime.reduce((sum, r) => {
          const created = new Date(r.created_at);
          const responded = new Date(r.response_at);
          return sum + (responded - created) / (1000 * 60 * 60); // Convert to hours
        }, 0) / respondedWithTime.length
      : 0;

    const respondedLastMonthWithTime = lastMonthReviews.filter(r => r.responded && r.response_at && r.created_at);
    const avgResponseTimeLastMonth = respondedLastMonthWithTime.length > 0
      ? respondedLastMonthWithTime.reduce((sum, r) => {
          const created = new Date(r.created_at);
          const responded = new Date(r.response_at);
          return sum + (responded - created) / (1000 * 60 * 60);
        }, 0) / respondedLastMonthWithTime.length
      : 0;
    const avgResponseTimeDelta = avgResponseTime - avgResponseTimeLastMonth;

    const kpis = {
      averageRating: Number(avgRating.toFixed(1)),
      averageRatingDelta: Number(avgRatingDelta.toFixed(1)),
      totalReviews: totalReviews,
      totalReviewsDelta: totalReviewsDelta,
      responseRate: Number(responseRate.toFixed(1)),
      responseRateDelta: Number(responseRateDelta.toFixed(1)),
      avgResponseTimeHours: Number(avgResponseTime.toFixed(1)),
      avgResponseTimeDelta: Number(avgResponseTimeDelta.toFixed(1))
    };

    res.json(kpis);
    return;
  }

  next();
};


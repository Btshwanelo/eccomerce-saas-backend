const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic counts
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      ordersInRange,
      customersInRange,
      productsInRange
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ 
        role: "user", 
        createdAt: { $gte: startDate } 
      }),
      Product.countDocuments({ 
        createdAt: { $gte: startDate } 
      })
    ]);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "shipped", "processing"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Calculate revenue in range
    const revenueInRangeResult = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ["delivered", "shipped", "processing"] },
          createdAt: { $gte: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const revenueInRange = revenueInRangeResult.length > 0 ? revenueInRangeResult[0].total : 0;

    // Calculate growth percentages
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const [
      previousOrders,
      previousCustomers,
      previousProducts,
      previousRevenueResult
    ] = await Promise.all([
      Order.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      User.countDocuments({ 
        role: "user",
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      Product.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      Order.aggregate([
        { 
          $match: { 
            status: { $in: ["delivered", "shipped", "processing"] },
            createdAt: { $gte: previousStartDate, $lt: startDate }
          } 
        },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ])
    ]);

    const previousRevenue = previousRevenueResult.length > 0 ? previousRevenueResult[0].total : 0;

    // Calculate growth percentages
    const ordersGrowth = previousOrders > 0 ? 
      ((ordersInRange - previousOrders) / previousOrders) * 100 : 0;
    const customersGrowth = previousCustomers > 0 ? 
      ((customersInRange - previousCustomers) / previousCustomers) * 100 : 0;
    const productsGrowth = previousProducts > 0 ? 
      ((productsInRange - previousProducts) / previousProducts) * 100 : 0;
    const revenueGrowth = previousRevenue > 0 ? 
      ((revenueInRange - previousRevenue) / previousRevenue) * 100 : 0;

    // Get revenue by month for the last 6 months
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "shipped", "processing"] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$total" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format revenue by month
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const formattedRevenueByMonth = revenueByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue
    }));

    // Get top products by sales
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          sales: 1,
          revenue: 1
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const analyticsData = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
      customersGrowth: Math.round(customersGrowth * 10) / 10,
      productsGrowth: Math.round(productsGrowth * 10) / 10,
      revenueByMonth: formattedRevenueByMonth,
      topProducts,
      ordersByStatus
    };

    res.json({
      success: true,
      analytics: analyticsData
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics data"
    });
  }
};

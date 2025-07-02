const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Formation = require('../models/formation');
const Payment = require('../models/Payment');
const PaymentAlert = require('../models/PaymentAlert');
const QCM = require('../models/QCM');
const TeacherSpace = require('../models/TeacherSpace');
const Schedule = require('../models/Schedule');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Get dashboard overview statistics
router.get('/dashboard', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Formation statistics
    const totalFormations = await Formation.countDocuments();
    
    // Payment statistics
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const overduePayments = await Payment.countDocuments({ status: 'failed' });
    
    // Calculate total payment values
    const paymentValues = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$total' }
        }
      }
    ]);

    let totalRevenue = 0;
    let pendingRevenue = 0;
    
    paymentValues.forEach(pv => {
      if (pv._id === 'completed') {
        totalRevenue = pv.total;
      } else if (pv._id === 'pending') {
        pendingRevenue = pv.total;
      }
    });

    // QCM statistics
    const totalQCMs = await QCM.countDocuments();
    const activeQCMs = await QCM.countDocuments({ isActive: true });

    // Teacher Space statistics
    const totalSpaces = await TeacherSpace.countDocuments();
    const activeSpaces = await TeacherSpace.countDocuments({ isActive: true });

    // Alert statistics
    const totalAlerts = await PaymentAlert.countDocuments();
    const unreadAlerts = await PaymentAlert.countDocuments({ isRead: false });

    res.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        active: activeUsers
      },
      formations: {
        total: totalFormations
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        overdue: overduePayments,
        totalRevenue,
        pendingRevenue
      },
      qcms: {
        total: totalQCMs,
        active: activeQCMs
      },
      teacherSpaces: {
        total: totalSpaces,
        active: activeSpaces
      },
      alerts: {
        total: totalAlerts,
        unread: unreadAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inscription statistics per day (for charts)
router.get('/inscriptions-per-day', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const inscriptions = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          role: 'student'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Transform data for chart
    const chartData = inscriptions.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      inscriptions: item.count
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment statistics per day
router.get('/payments-per-day', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const payments = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Transform data for chart
    const chartData = {};
    
    payments.forEach(item => {
      const date = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
      
      if (!chartData[date]) {
        chartData[date] = {
          date,
          completed: 0,
          pending: 0,
          failed: 0,
          totalValue: 0,
          completedValue: 0
        };
      }
      
      chartData[date][item._id.status] = item.count;
      chartData[date].totalValue += item.total;
      
      if (item._id.status === 'completed') {
        chartData[date].completedValue = item.total;
      }
    });

    res.json(Object.values(chartData));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get formation enrollment statistics
router.get('/formation-enrollments', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const enrollments = await User.aggregate([
      {
        $match: { role: 'student' }
      },
      {
        $unwind: '$formations'
      },
      {
        $group: {
          _id: '$formations',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'formations',
          localField: '_id',
          foreignField: '_id',
          as: 'formation'
        }
      },
      {
        $unwind: '$formation'
      },
      {
        $project: {
          formationTitle: '$formation.title',
          enrollments: '$count'
        }
      },
      {
        $sort: { enrollments: -1 }
      }
    ]);

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activities
router.get('/recent-activities', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent user registrations
    const recentUsers = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .select('name lastname createdAt');

    // Get recent payments
    const recentPayments = await Payment.find()
      .populate('userId', 'name lastname')
      .populate('formationId', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2);

    // Combine and sort activities
    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registration',
        description: `Nouvel étudiant inscrit: ${user.name} ${user.lastname}`,
        date: user.createdAt,
        user: user
      });
    });

    recentPayments.forEach(payment => {
      activities.push({
        type: 'payment',
        description: `Paiement ${payment.status}: ${payment.userId?.name} ${payment.userId?.lastname} - ${payment.formationId?.title}`,
        date: payment.createdAt,
        payment: payment
      });
    });

    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get platform performance metrics
router.get('/platform-metrics', protect, authorize(['admin']), async (req, res) => {
  try {
    // Calculate growth rates
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    // User growth
    const currentMonthUsers = await User.countDocuments({ 
      createdAt: { $gte: lastMonth },
      role: 'student'
    });
    const previousMonthUsers = await User.countDocuments({ 
      createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
      role: 'student'
    });

    const userGrowthRate = previousMonthUsers > 0 
      ? Math.round(((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100)
      : 100;

    // Revenue growth
    const currentMonthRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const previousMonthRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const previousRevenue = previousMonthRevenue[0]?.total || 0;
    
    const revenueGrowthRate = previousRevenue > 0 
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 100;

    // Engagement metrics
    const activeSpaces = await TeacherSpace.countDocuments({ 
      isActive: true,
      updatedAt: { $gte: lastMonth }
    });

    const completedQCMs = await QCM.aggregate([
      {
        $match: {
          'results.completedAt': { $gte: lastMonth }
        }
      },
      {
        $project: {
          resultsCount: { $size: '$results' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$resultsCount' }
        }
      }
    ]);

    res.json({
      userGrowth: {
        current: currentMonthUsers,
        previous: previousMonthUsers,
        growthRate: userGrowthRate
      },
      revenueGrowth: {
        current: currentRevenue,
        previous: previousRevenue,
        growthRate: revenueGrowthRate
      },
      engagement: {
        activeSpaces,
        completedQCMs: completedQCMs[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


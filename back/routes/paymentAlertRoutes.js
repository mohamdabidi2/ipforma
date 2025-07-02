const express = require('express');
const router = express.Router();
const PaymentAlert = require('../models/PaymentAlert');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Create payment alert
router.post('/', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const { userId, formationId, paymentId, message, type } = req.body;
    
    const alert = new PaymentAlert({
      userId,
      formationId,
      paymentId,
      message,
      type,
      sentBy: req.user._id,
      isRead: false
    });

    await alert.save();
    await alert.populate('userId', 'name lastname');
    await alert.populate('formationId', 'title');
    await alert.populate('paymentId');
    await alert.populate('sentBy', 'name lastname');
    
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all payment alerts (admin/reception)
router.get('/', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const { status, type, userId } = req.query;
    const filter = {};
    
    if (status) filter.isRead = status === 'read';
    if (type) filter.type = type;
    if (userId) filter.userId = userId;

    const alerts = await PaymentAlert.find(filter)
      .populate('userId', 'name lastname')
      .populate('formationId', 'title')
      .populate('paymentId')
      .populate('sentBy', 'name lastname')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's payment alerts
router.get('/my-alerts', protect, authorize(['student']), async (req, res) => {
  try {
    const alerts = await PaymentAlert.find({ userId: req.user._id })
      .populate('formationId', 'title')
      .populate('paymentId')
      .populate('sentBy', 'name lastname')
      .sort({ createdAt: -1 });
    
    // Transform alerts to match frontend expectations
    const transformedAlerts = alerts.map(alert => ({
      _id: alert._id,
      title: `Alerte de paiement - ${alert.formationId?.title || 'Formation'}`,
      message: alert.message,
      type: getAlertType(alert.type),
      status: alert.isRead ? 'read' : 'unread',
      createdAt: alert.createdAt,
      dueDate: alert.paymentId?.dueDate,
      formation: alert.formationId,
      payment: alert.paymentId
    }));
    
    res.json(transformedAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark alert as read
router.put('/:id', protect, authorize(['student']), async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await PaymentAlert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Check if the alert belongs to the student
    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (status === 'read') {
      alert.isRead = true;
    }
    
    await alert.save();
    res.json({ message: 'Alert updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send bulk payment alerts
router.post('/bulk-send', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const { userIds, message, type, formationId } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    const alerts = [];
    
    for (const userId of userIds) {
      const alert = new PaymentAlert({
        userId,
        formationId,
        message,
        type: type || 'general',
        sentBy: req.user._id,
        isRead: false
      });
      
      await alert.save();
      alerts.push(alert);
    }

    res.json({ 
      message: `${alerts.length} alerts sent successfully`,
      alerts: alerts.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alert statistics
router.get('/statistics', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const totalAlerts = await PaymentAlert.countDocuments();
    const unreadAlerts = await PaymentAlert.countDocuments({ isRead: false });
    const readAlerts = await PaymentAlert.countDocuments({ isRead: true });
    
    const alertsByType = await PaymentAlert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentAlerts = await PaymentAlert.find()
      .populate('userId', 'name lastname')
      .populate('formationId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalAlerts,
      unreadAlerts,
      readAlerts,
      alertsByType,
      recentAlerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete payment alert
router.delete('/:id', protect, authorize(['admin', 'reception']), async (req, res) => {
  try {
    const alert = await PaymentAlert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await PaymentAlert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to transform alert types
function getAlertType(type) {
  const typeMap = {
    'reminder': 'payment_reminder',
    'overdue': 'payment_overdue',
    'payment_received': 'payment_due_soon',
    'general': 'general'
  };
  
  return typeMap[type] || 'general';
}

module.exports = router;


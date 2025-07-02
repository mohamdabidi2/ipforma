const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Admin and reception routes
router.post("/create", protect, authorize(['admin', 'reception']), paymentController.createPayment);
router.get("/", protect, authorize(['admin', 'reception']), paymentController.getAllPayments);
router.get("/statistics", protect, authorize(['admin', 'reception']), paymentController.getPaymentStatistics);
router.get("/overdue", protect, authorize(['admin', 'reception']), paymentController.getOverduePayments);
router.get("/user/:userId", protect, authorize(['admin', 'reception']), paymentController.getPaymentsByUser);

// Installment management routes
router.put("/:id/installment/pay", protect, authorize(['admin', 'reception']), paymentController.markInstallmentAsPaid);
router.put("/:id/installment/due-date", protect, authorize(['admin', 'reception']), paymentController.updateInstallmentDueDate);
router.put("/:id/complete/pay", protect, authorize(['admin', 'reception']), paymentController.markCompletePaymentAsPaid);

// Legacy route for backward compatibility
router.put("/:id/tranche", protect, authorize(['admin', 'reception']), paymentController.updateTranchePayment);

// Alert management
router.post("/send-alert", protect, authorize(['admin', 'reception']), paymentController.sendPaymentAlert);

// Admin only routes
router.delete("/:id", protect, authorize(['admin', 'reception']), paymentController.deletePayment);

// Student routes
router.get("/my-payments", protect, authorize(['student']), paymentController.getMyPayments);
router.get("/my-alerts", protect, authorize(['student']), paymentController.getPaymentAlerts);
router.put("/alerts/:alertId/read", protect, authorize(['student']), paymentController.markAlertAsRead);

// General routes
router.get("/:id", protect, paymentController.getPaymentById);

module.exports = router;


// Document generation routes
router.get("/:id/receipt", protect,  paymentController.generateReceipt);
router.get("/:id/invoice", protect, paymentController.generateInvoice);


const Payment = require("../models/Payment");
const PaymentAlert = require("../models/PaymentAlert");
const User = require("../models/User");
const Formation = require("../models/formation");

// Create a new payment with installments support
exports.createPayment = async (req, res) => {
  try {
    const { 
      userId, 
      formationId, 
      totalAmount, 
      paymentType, 
      dueDate, 
      description,
      installments 
    } = req.body;

    // Validate required fields
    if (!userId || !formationId || !totalAmount || !paymentType) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: userId, formationId, totalAmount, paymentType" 
      });
    }

    const paymentData = {
      userId,
      formationId,
      totalAmount: parseFloat(totalAmount),
      paymentType,
      description,
      status: "pending"
    };

    if (paymentType === 'complete') {
      paymentData.dueDate = dueDate ? new Date(dueDate) : new Date();
    } else if (paymentType === 'installment') {
      if (!installments || !Array.isArray(installments) || installments.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Installments are required for installment payment type" 
        });
      }

      // Validate installments
      let totalInstallmentAmount = 0;
      const processedInstallments = installments.map((installment, index) => {
        const amount = parseFloat(installment.amount);
        totalInstallmentAmount += amount;
        
        return {
          installmentNumber: index + 1,
          amount,
          dueDate: new Date(installment.dueDate),
          status: 'pending'
        };
      });

      // Check if installment amounts match total amount
      if (Math.abs(totalInstallmentAmount - paymentData.totalAmount) > 0.01) {
        return res.status(400).json({ 
          success: false, 
          message: "Sum of installment amounts must equal total amount" 
        });
      }

      paymentData.installments = processedInstallments;
    }

    const newPayment = new Payment(paymentData);
    await newPayment.save();

    // Populate the response
    await newPayment.populate([
      { path: "userId", select: "name lastname phone" },
      { path: "formationId", select: "title price" }
    ]);

    res.status(201).json({ success: true, payment: newPayment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all payments with enhanced filtering
exports.getAllPayments = async (req, res) => {
  try {
    const { status, paymentType, overdue } = req.query;
    
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentType) {
      filter.paymentType = paymentType;
    }
    
    if (overdue === 'true') {
      filter.status = 'overdue';
    }

    const payments = await Payment.find(filter)
      .populate("userId", "name lastname phone")
      .populate("formationId", "title price")
      .sort({ createdAt: -1 });

    // Update overdue statuses before returning
    await Payment.updateOverduePayments();

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payments by user
exports.getPaymentsByUser = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId })
      .populate("formationId", "title price")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's own payments
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("formationId", "title price")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching my payments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment by ID with summary
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("userId", "name lastname phone")
      .populate("formationId", "title price");
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const summary = payment.getPaymentSummary();
    
    res.status(200).json({ 
      success: true, 
      payment,
      summary 
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a specific installment as paid
exports.markInstallmentAsPaid = async (req, res) => {
  try {
    const { installmentIndex } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.paymentType !== 'installment') {
      return res.status(400).json({ 
        success: false, 
        message: "This endpoint is only for installment payments" 
      });
    }

    if (installmentIndex < 0 || installmentIndex >= payment.installments.length) {
      return res.status(400).json({ success: false, message: "Invalid installment index" });
    }

    if (payment.installments[installmentIndex].paidAt) {
      return res.status(400).json({ 
        success: false, 
        message: "This installment is already paid" 
      });
    }

    // Mark installment as paid
    const success = payment.markInstallmentAsPaid(installmentIndex);
    
    if (!success) {
      return res.status(400).json({ 
        success: false, 
        message: "Failed to mark installment as paid" 
      });
    }

    await payment.save();

    // Create payment received alert
    const alert = new PaymentAlert({
      userId: payment.userId,
      formationId: payment.formationId,
      paymentId: payment._id,
      message: `Payment received for installment ${installmentIndex + 1} of ${payment.installments.length}`,
      type: 'payment_received',
      sentBy: req.user._id
    });
    await alert.save();

    // Populate the response
    await payment.populate([
      { path: "userId", select: "name lastname phone" },
      { path: "formationId", select: "title price" }
    ]);

    const summary = payment.getPaymentSummary();

    res.status(200).json({ 
      success: true, 
      payment, 
      summary,
      message: `Installment ${installmentIndex + 1} marked as paid successfully`
    });
  } catch (error) {
    console.error('Error marking installment as paid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark complete payment as paid
exports.markCompletePaymentAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.paymentType !== 'complete') {
      return res.status(400).json({ 
        success: false, 
        message: "This endpoint is only for complete payments" 
      });
    }

    if (payment.paidAt) {
      return res.status(400).json({ 
        success: false, 
        message: "This payment is already completed" 
      });
    }

    payment.paidAt = new Date();
    payment.status = 'completed';
    payment.updatedAt = new Date();

    await payment.save();

    // Create payment received alert
    const alert = new PaymentAlert({
      userId: payment.userId,
      formationId: payment.formationId,
      paymentId: payment._id,
      message: `Complete payment received`,
      type: 'payment_received',
      sentBy: req.user._id
    });
    await alert.save();

    // Populate the response
    await payment.populate([
      { path: "userId", select: "name lastname phone" },
      { path: "formationId", select: "title price" }
    ]);

    const summary = payment.getPaymentSummary();

    res.status(200).json({ 
      success: true, 
      payment, 
      summary,
      message: "Payment marked as completed successfully"
    });
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update installment due date (admin only)
exports.updateInstallmentDueDate = async (req, res) => {
  try {
    const { installmentIndex, newDueDate } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.paymentType !== 'installment') {
      return res.status(400).json({ 
        success: false, 
        message: "This endpoint is only for installment payments" 
      });
    }

    if (installmentIndex < 0 || installmentIndex >= payment.installments.length) {
      return res.status(400).json({ success: false, message: "Invalid installment index" });
    }

    if (payment.installments[installmentIndex].paidAt) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot update due date for a paid installment" 
      });
    }

    payment.installments[installmentIndex].dueDate = new Date(newDueDate);
    payment.updatedAt = new Date();

    await payment.save();

    // Populate the response
    await payment.populate([
      { path: "userId", select: "name lastname phone" },
      { path: "formationId", select: "title price" }
    ]);

    res.status(200).json({ 
      success: true, 
      payment,
      message: `Installment ${installmentIndex + 1} due date updated successfully`
    });
  } catch (error) {
    console.error('Error updating installment due date:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Legacy endpoint for backward compatibility
exports.updateTranchePayment = async (req, res) => {
  // Redirect to the new installment endpoint
  req.body.installmentIndex = req.body.trancheIndex;
  return exports.markInstallmentAsPaid(req, res);
};

// Send payment alert
exports.sendPaymentAlert = async (req, res) => {
  try {
    const { userId, formationId, message, type } = req.body;

    // Find pending payment for this user and formation
    const payment = await Payment.findOne({ 
      userId, 
      formationId, 
      status: { $in: ['pending', 'partial', 'overdue'] }
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "No pending payment found for this user and formation" 
      });
    }

    const alert = new PaymentAlert({
      userId,
      formationId,
      paymentId: payment._id,
      message,
      type,
      sentBy: req.user._id
    });

    await alert.save();
    res.status(201).json({ success: true, alert });
  } catch (error) {
    console.error('Error sending payment alert:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment alerts for user
exports.getPaymentAlerts = async (req, res) => {
  try {
    const alerts = await PaymentAlert.find({ userId: req.user._id })
      .populate("formationId", "title")
      .populate("sentBy", "name lastname")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error('Error fetching payment alerts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark alert as read
exports.markAlertAsRead = async (req, res) => {
  try {
    const alert = await PaymentAlert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({ success: true, message: "Alert marked as read" });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Also delete related alerts
    await PaymentAlert.deleteMany({ paymentId: req.params.id });

    res.status(200).json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get overdue payments
exports.getOverduePayments = async (req, res) => {
  try {
    // Update overdue statuses first
    await Payment.updateOverduePayments();
    
    const payments = await Payment.find({
      status: 'overdue'
    })
    .populate("userId", "name lastname phone")
    .populate("formationId", "title price")
    .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching overdue payments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment statistics
exports.getPaymentStatistics = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const overdueCount = await Payment.countDocuments({ status: 'overdue' });
    const partialCount = await Payment.countDocuments({ status: 'partial' });

    res.status(200).json({
      success: true,
      statistics: {
        total: totalPayments,
        byStatus: stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        overdue: overdueCount,
        partial: partialCount
      }
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Generate receipt for pending payment
exports.generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("userId", "name lastname phone email")
      .populate("formationId", "title price durationWeeks");
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Receipt should be generated for pending payments
    if (payment.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: "Use invoice generation for completed payments" 
      });
    }

    const receiptData = {
      receiptNumber: `REC-${payment._id.toString().slice(-8).toUpperCase()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      student: {
        name: `${payment.userId.name} ${payment.userId.lastname}`,
        phone: payment.userId.phone,
        email: payment.userId.email
      },
      formation: {
        title: payment.formationId.title,
        duration: payment.formationId.durationWeeks+"semaine"
      },
      payment: {
        totalAmount: payment.totalAmount,
        paymentType: payment.paymentType,
        status: payment.status,
        dueDate: payment.dueDate ? payment.dueDate.toLocaleDateString('fr-FR') : null,
        installments: payment.installments || []
      },
      signatureRequired: true,
      type: 'receipt'
    };

    // Generate HTML content for the receipt
    const htmlContent = generateReceiptHTML(receiptData);
    
    res.status(200).json({ 
      success: true, 
      receiptData,
      htmlContent,
      message: "Receipt generated successfully" 
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate invoice for completed payment
exports.generateInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("userId", "name lastname phone email")
      .populate("formationId", "title price durationWeeks");
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Invoice should be generated for completed payments
    if (payment.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: "Invoice can only be generated for completed payments" 
      });
    }

    const invoiceData = {
      invoiceNumber: `INV-${payment._id.toString().slice(-8).toUpperCase()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      paymentDate: payment.paidAt ? payment.paidAt.toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      student: {
        name: `${payment.userId.name} ${payment.userId.lastname}`,
        phone: payment.userId.phone,
        email: payment.userId.email
      },
      formation: {
        title: payment.formationId.title,
        price: payment.formationId.price,
        duration: payment.formationId.durationWeeks+ " semaine"
      },
      payment: {
        totalAmount: payment.totalAmount,
        paymentType: payment.paymentType,
        status: payment.status,
        installments: payment.installments || []
      },
      type: 'invoice'
    };

    // Generate HTML content for the invoice
    const htmlContent = generateInvoiceHTML(invoiceData);
    
    res.status(200).json({ 
      success: true, 
      invoiceData,
      htmlContent,
      message: "Invoice generated successfully" 
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate receipt HTML
function generateReceiptHTML(data) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu de Paiement IPforma - ${data.receiptNumber}</title>
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --light: #f8fafc;
            --dark: #1e293b;
            --gray: #64748b;
        }
        
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            color: var(--dark);
            line-height: 1.4;
            box-sizing: border-box;
        }
        
        .header {
            text-align: center;
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .logo {
            height: 60px;
            margin-bottom: 0.75rem;
            content: url('https://i.imgur.com/qabC73U.png');
        }
        
        .receipt-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            margin: 0.25rem 0;
            text-transform: uppercase;
        }
        
        .institution {
            font-size: 1rem;
            font-weight: 600;
            color: var(--primary-dark);
            margin-bottom: 0.25rem;
        }
        
        .receipt-meta {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: var(--gray);
        }
        
        .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .info-section {
            background: var(--light);
            padding: 1rem;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            font-size: 0.9rem;
        }
        
        .info-section h3 {
            color: var(--primary);
            border-bottom: 1px solid var(--primary);
            padding-bottom: 0.375rem;
            margin-bottom: 0.75rem;
            font-size: 0.9rem;
            text-transform: uppercase;
        }
        
        .info-row {
            margin-bottom: 0.5rem;
            display: flex;
        }
        
        .info-row strong {
            min-width: 100px;
            display: inline-block;
        }
        
        .payment-details {
            background: rgba(37, 99, 235, 0.05);
            border-left: 3px solid var(--primary);
            padding: 1rem;
            border-radius: 0.375rem;
            margin: 1.5rem 0;
            font-size: 0.9rem;
        }
        
        .payment-details h3 {
            color: var(--primary);
            margin-top: 0;
            font-size: 0.9rem;
        }
        
        .amount-highlight {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary-dark);
        }
        
        .status {
            font-weight: 600;
            padding: 0.2rem 0.4rem;
            border-radius: 0.2rem;
            font-size: 0.8rem;
        }
        
        .status-pending {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }
        
        .status-paid {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }
        
        .status-overdue {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }
        
        .installments-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0.75rem;
            font-size: 0.8rem;
        }
        
        .installments-table th {
            background: var(--primary);
            color: white;
            padding: 0.5rem;
            text-align: left;
        }
        
        .installments-table td {
            padding: 0.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .installments-table tr:nth-child(even) {
            background: rgba(241, 245, 249, 0.5);
        }
        
        .signature-section {
            margin-top: 2rem;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        
        .signature-box {
            width: 45%;
            text-align: center;
            font-size: 0.85rem;
        }
        
        .signature-line {
            border-top: 1px solid var(--dark);
            margin-top: 2.5rem;
            padding-top: 0.5rem;
        }
        
        .signature-note {
            font-size: 0.7rem;
            margin-top: 0.5rem;
            color: var(--gray);
        }
        
        .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.75rem;
            color: var(--gray);
            border-top: 1px solid #e2e8f0;
            padding-top: 0.75rem;
        }
        
        @media print {
            body {
                padding: 15mm;
            }
            
            .installments-table th {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://i.imgur.com/qabC73U.png" alt="IPforma" class="logo">
        <h1 class="receipt-title">REÇU DE PAIEMENT</h1>
        <div class="institution">IPforma - Centre de Formation Professionnelle</div>
        <div class="receipt-meta">
            <span>N°: ${data.receiptNumber}</span>
            <span>Date: ${data.date}</span>
        </div>
    </div>

    <div class="receipt-info">
        <div class="info-section">
            <h3>Informations Étudiant</h3>
            <div class="info-row"><strong>Nom:</strong> ${data.student.name}</div>
            <div class="info-row"><strong>Téléphone:</strong> ${data.student.phone || 'Non renseigné'}</div>
            <div class="info-row"><strong>Email:</strong> ${data.student.email || 'Non renseigné'}</div>
        </div>
        
        <div class="info-section">
            <h3>Formation</h3>
            <div class="info-row"><strong>Titre:</strong> ${data.formation.title}</div>
            <div class="info-row"><strong>Durée:</strong> ${data.formation.duration || 'Non spécifiée'}</div>
        </div>
    </div>

    <div class="payment-details">
        <h3>Détails du Paiement</h3>
        <div class="info-row">
            <strong>Montant Total:</strong> 
            <span class="amount-highlight">${data.payment.totalAmount.toLocaleString('fr-TN')} TND</span>
        </div>
        <div class="info-row"><strong>Type de Paiement:</strong> ${data.payment.paymentType === 'complete' ? 'Paiement Complet' : 'Paiement en Tranches'}</div>
        <div class="info-row"><strong>Statut:</strong> <span class="status status-pending">EN ATTENTE</span></div>
        ${data.payment.dueDate ? `<div class="info-row"><strong>Date d'Échéance:</strong> ${data.payment.dueDate}</div>` : ''}

        ${data.payment.paymentType === 'installment' && data.payment.installments.length > 0 ? `
        <h4>Détail des Tranches</h4>
        <table class="installments-table">
            <thead>
                <tr>
                    <th>Tranche</th>
                    <th>Montant</th>
                    <th>Date d'Échéance</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                ${data.payment.installments.map((installment, index) => `
                <tr>
                    <td>Tranche ${index + 1}</td>
                    <td>${installment.amount.toLocaleString('fr-TN')} TND</td>
                    <td>${new Date(installment.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td><span class="status status-${installment.status === 'paid' ? 'paid' : installment.status === 'overdue' ? 'overdue' : 'pending'}">
                        ${installment.status === 'paid' ? 'PAYÉ' : installment.status === 'overdue' ? 'EN RETARD' : 'EN ATTENTE'}
                    </span></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">Signature de l'Étudiant</div>
            <p class="signature-note">
                Je certifie avoir reçu ce reçu et m'engage à effectuer le paiement à la date convenue.
            </p>
        </div>
        
        <div class="signature-box">
            <div class="signature-line">Signature de l'Administration</div>
            <p class="signature-note">
                Date: ${data.date}<br>
                IPforma - Centre de Formation
            </p>
        </div>
    </div>

    <div class="footer">
        <p>Ce reçu confirme l'engagement de paiement. Veuillez conserver ce document.</p>
        <p>Pour toute question, contactez-nous à ipforma.sfax@gmail.com ou +216 95 606 361</p>
        <p>© ${new Date().getFullYear()} IPforma - Tous droits réservés</p>
    </div>
</body>
</html>`;
}

// Helper function to generate invoice HTML
function generateInvoiceHTML(data) {
  const paidInstallments = data.payment.installments.filter(inst => inst.paidAt);
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture IPforma - ${data.invoiceNumber}</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #1e40af;
            --accent-color: #10b981;
            --dark-color: #1f2937;
            --light-color: #f9fafb;
            --text-color: #374151;
            --border-color: #e5e7eb;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            line-height: 1.5;
            color: var(--text-color);
            background-color: white;
            box-sizing: border-box;
        }
        
        .header {
            margin-bottom: 20px;
            position: relative;
        }
        
        .logo-container {
            margin-bottom: 15px;
            text-align: center;
        }
        
        .logo {
            height: 60px;
            width: auto;
            content: url('https://i.imgur.com/qabC73U.png');
        }
        
        .invoice-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
            margin: 10px 0 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
        }
        
        .company-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--secondary-color);
            margin-bottom: 5px;
            text-align: center;
        }
        
        .invoice-meta {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .paid-stamp {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 8px 15px;
            border: 3px solid var(--accent-color);
            color: var(--accent-color);
            font-weight: bold;
            font-size: 14px;
            transform: rotate(15deg);
            border-radius: 4px;
            background-color: rgba(16, 185, 129, 0.1);
        }
        
        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .info-section {
            background-color: var(--light-color);
            padding: 15px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            font-size: 14px;
        }
        
        .info-section h3 {
            color: var(--primary-color);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
            margin-bottom: 12px;
            font-size: 14px;
            text-transform: uppercase;
        }
        
        .info-row {
            margin-bottom: 8px;
            display: flex;
        }
        
        .info-row strong {
            min-width: 90px;
            display: inline-block;
            color: var(--dark-color);
        }
        
        .payment-details {
            background-color: rgba(37, 99, 235, 0.05);
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 3px solid var(--primary-color);
            font-size: 14px;
        }
        
        .payment-details h3 {
            color: var(--primary-color);
            margin-top: 0;
            font-size: 14px;
        }
        
        .installments-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 13px;
        }
        
        .installments-table th {
            background-color: var(--primary-color);
            color: white;
            padding: 8px 10px;
            text-align: left;
        }
        
        .installments-table td {
            padding: 6px 10px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .installments-table tr:nth-child(even) {
            background-color: var(--light-color);
        }
        
        .status-paid {
            color: var(--accent-color);
            font-weight: bold;
        }
        
        .total-section {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin: 25px 0;
            text-align: center;
        }
        
        .total-section h3 {
            margin: 0 0 8px;
            font-size: 16px;
        }
        
        .total-amount {
            font-size: 22px;
            font-weight: bold;
            margin: 8px 0;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: var(--text-color);
            border-top: 1px solid var(--border-color);
            padding-top: 15px;
        }
        
        .footer p {
            margin: 4px 0;
        }
        
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-top: 10px;
        }
        
        @media print {
            body {
                padding: 15mm;
                width: 210mm;
                height: 297mm;
            }
            
            .total-section {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            <img src="https://i.imgur.com/qabC73U.png" alt="IPforma Logo" class="logo">
        </div>
        <h1 class="invoice-title">Facture</h1>
        <div class="company-name">IPforma - Centre de Formation Professionnelle</div>
        <div class="invoice-meta">
            <span>N° ${data.invoiceNumber}</span>
            <span>Date: ${data.date}</span>
        </div>
        <div class="paid-stamp">PAYÉ</div>
    </div>

    <div class="invoice-info">
        <div class="info-section">
            <h3>Facturé à</h3>
            <div class="info-row"><strong>Nom:</strong> ${data.student.name}</div>
            <div class="info-row"><strong>Téléphone:</strong> ${data.student.phone || 'Non renseigné'}</div>
            <div class="info-row"><strong>Email:</strong> ${data.student.email || 'Non renseigné'}</div>
        </div>
        
        <div class="info-section">
            <h3>Détails de la Formation</h3>
            <div class="info-row"><strong>Formation:</strong> ${data.formation.title}</div>
            <div class="info-row"><strong>Prix:</strong> ${data.formation.price ? data.formation.price.toLocaleString('fr-TN') + ' TND' : 'Non spécifié'}</div>
            <div class="info-row"><strong>Durée:</strong> ${data.formation.duration || 'Non spécifiée'}</div>
        </div>
    </div>

    <div class="payment-details">
        <h3>Informations de Paiement</h3>
        <div class="info-row"><strong>Date de Paiement:</strong> ${data.paymentDate}</div>
        <div class="info-row"><strong>Type de Paiement:</strong> ${data.payment.paymentType === 'complete' ? 'Paiement Complet' : 'Paiement en Tranches'}</div>
        <div class="info-row"><strong>Statut:</strong> <span class="status-paid">PAYÉ INTÉGRALEMENT</span></div>

        ${data.payment.paymentType === 'installment' && data.payment.installments.length > 0 ? `
        <h4>Historique des Paiements</h4>
        <table class="installments-table">
            <thead>
                <tr>
                    <th>Tranche</th>
                    <th>Montant</th>
                    <th>Date de Paiement</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                ${data.payment.installments.map((installment, index) => `
                <tr>
                    <td>Tranche ${index + 1}</td>
                    <td>${installment.amount.toLocaleString('fr-TN')} TND</td>
                    <td>${installment.paidAt ? new Date(installment.paidAt).toLocaleDateString('fr-FR') : 'Non payé'}</td>
                    <td class="status-paid">PAYÉ</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
    </div>

    <div class="total-section">
        <h3>MONTANT TOTAL PAYÉ</h3>
        <div class="total-amount">${data.payment.totalAmount.toLocaleString('fr-TN')} TND</div>
        <p>Paiement reçu intégralement</p>
    </div>

    <div class="footer">
        <p><strong>IPforma - Centre de Formation Professionnelle</strong></p>
        <p>Merci pour votre confiance et votre engagement dans votre formation professionnelle.</p>
        <div class="contact-info">
            <span>Email: ipforma.sfax@gmail.com</span>
            <span>Tél: +216 95 606 361</span>
            <span>Adresse: IPFORMA avenue Carthage beb jebli immeuble Ribat el médina Sfax - en 5 éme étage bureau n°509 - Bloc A ou D , Sfax, Tunisia</span>
        </div>
        <p>Cette facture certifie le paiement intégral de la formation.</p>
        <p>© ${new Date().getFullYear()} IPforma - Tous droits réservés</p>
    </div>
</body>
</html>`;
}


const mongoose = require("mongoose");

const PaymentAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: false },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: false },

  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["payment_reminder", "payment_overdue", "payment_due_soon", "general","payment_received"], 
    required: true 
  },
  status: { type: String, enum: ["unread", "read"], default: "unread" }, // Changed from isRead
  isRead: { type: Boolean, default: false }, // Keep for backward compatibility
  dueDate: { type: Date }, // When the payment is due (for context)
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware to sync status and isRead
PaymentAlertSchema.pre('save', function(next) {

  
  // Auto-generate title if not provided
  if (!this.title) {
    switch (this.type) {
      case 'payment_reminder':
        this.title = 'Rappel de paiement';
        break;
      case 'payment_overdue':
        this.title = 'Paiement en retard';
        break;
      case 'payment_due_soon':
        this.title = 'Échéance de paiement proche';
        break;
      default:
        this.title = 'Alerte de paiement';
    }
  }
  
  next();
});

module.exports = mongoose.model("PaymentAlert", PaymentAlertSchema);


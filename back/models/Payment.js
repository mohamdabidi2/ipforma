const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: true },
  totalAmount: { type: Number, required: true }, // Total amount for the payment
  paymentType: { type: String, enum: ["complete", "installment"], required: true },
  description: { type: String },
  
  // For complete payments
  dueDate: { type: Date }, // When complete payment is due
  paidAt: { type: Date }, // When complete payment was made
  
  // For installment payments
  installments: [
    {
      installmentNumber: { type: Number, required: true },
      amount: { type: Number, required: true },
      dueDate: { type: Date, required: true },
      paidAt: { type: Date, default: null },
      status: { 
        type: String, 
        enum: ["pending", "paid", "overdue"], 
        default: "pending" 
      }
    }
  ],
  
  status: { 
    type: String, 
    enum: ["pending", "completed", "partial", "overdue"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Method to update installment status based on due dates
PaymentSchema.methods.updateInstallmentStatuses = function() {
  const currentDate = new Date();
  let hasOverdue = false;
  let hasPending = false;
  let allPaid = true;
  
  this.installments.forEach(installment => {
    if (!installment.paidAt) {
      allPaid = false;
      if (installment.dueDate < currentDate && installment.status !== 'overdue') {
        installment.status = 'overdue';
        hasOverdue = true;
      } else if (installment.status === 'pending') {
        hasPending = true;
      }
    } else if (installment.status !== 'paid') {
      installment.status = 'paid';
    }
  });
  
  // Update overall payment status
  if (this.paymentType === 'complete') {
    if (this.paidAt) {
      this.status = 'completed';
    } else if (this.dueDate && this.dueDate < currentDate) {
      this.status = 'overdue';
    } else {
      this.status = 'pending';
    }
  } else {
    if (allPaid) {
      this.status = 'completed';
    } else if (hasOverdue) {
      this.status = 'overdue';
    } else if (this.installments.some(inst => inst.paidAt)) {
      this.status = 'partial';
    } else {
      this.status = 'pending';
    }
  }
};

// Method to mark an installment as paid
PaymentSchema.methods.markInstallmentAsPaid = function(installmentIndex) {
  if (installmentIndex >= 0 && installmentIndex < this.installments.length) {
    this.installments[installmentIndex].paidAt = new Date();
    this.installments[installmentIndex].status = 'paid';
    this.updateInstallmentStatuses();
    this.updatedAt = new Date();
    return true;
  }
  return false;
};

// Method to get payment summary
PaymentSchema.methods.getPaymentSummary = function() {
  if (this.paymentType === 'complete') {
    return {
      totalAmount: this.totalAmount,
      paidAmount: this.paidAt ? this.totalAmount : 0,
      remainingAmount: this.paidAt ? 0 : this.totalAmount,
      nextDueDate: this.paidAt ? null : this.dueDate
    };
  } else {
    const paidAmount = this.installments
      .filter(inst => inst.paidAt)
      .reduce((sum, inst) => sum + inst.amount, 0);
    
    const remainingAmount = this.totalAmount - paidAmount;
    
    const nextUnpaidInstallment = this.installments
      .filter(inst => !inst.paidAt)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
    
    return {
      totalAmount: this.totalAmount,
      paidAmount,
      remainingAmount,
      nextDueDate: nextUnpaidInstallment ? nextUnpaidInstallment.dueDate : null,
      totalInstallments: this.installments.length,
      paidInstallments: this.installments.filter(inst => inst.paidAt).length
    };
  }
};

// Pre-save middleware to update statuses and timestamps
PaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update installment statuses if this is an installment payment
  if (this.paymentType === 'installment' && this.installments.length > 0) {
    this.updateInstallmentStatuses();
  }
  
  next();
});

// Static method to update all overdue payments
PaymentSchema.statics.updateOverduePayments = async function() {
  const payments = await this.find({
    status: { $in: ['pending', 'partial'] }
  });
  
  const bulkOps = [];
  
  payments.forEach(payment => {
    payment.updateInstallmentStatuses();
    bulkOps.push({
      updateOne: {
        filter: { _id: payment._id },
        update: {
          $set: {
            status: payment.status,
            installments: payment.installments,
            updatedAt: new Date()
          }
        }
      }
    });
  });
  
  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
  
  return bulkOps.length;
};

module.exports = mongoose.model("Payment", PaymentSchema);


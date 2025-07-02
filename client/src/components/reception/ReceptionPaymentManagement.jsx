import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Plus,
  Search,
  Edit,
  Eye,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Send,
  FileText,
  Trash2,
  CalendarDays,
  Euro,
  Receipt,
  FileDown,
  Printer
} from 'lucide-react';
import api from '../../services/api';

const ReceptionPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [statistics, setStatistics] = useState(null);
  
  const [paymentForm, setPaymentForm] = useState({
    userId: '',
    formationId: '',
    totalAmount: '',
    paymentType: 'complete',
    dueDate: '',
    description: '',
    installments: []
  });

  const [alertForm, setAlertForm] = useState({
    userId: '',
    formationId: '',
    message: '',
    type: 'payment_reminder'
  });

  const [installmentForm, setInstallmentForm] = useState({
    numberOfInstallments: 2,
    installments: []
  });

  useEffect(() => {
    fetchPaymentData();
    fetchStatistics();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments
      const paymentsResponse = await api.get('/payments');
      setPayments(paymentsResponse.data.payments || []);

      // Fetch users (students)
      const usersResponse = await api.get('/users?role=student');
      setUsers(usersResponse.data || []);

      // Fetch formations
      const formationsResponse = await api.get('/formations');
      setFormations(formationsResponse.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/payments/statistics');
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...paymentForm,
        totalAmount: parseFloat(paymentForm.totalAmount)
      };
      
      const response = await api.post('/payments/create', paymentData);
      setPayments([...payments, response.data.payment]);
      setShowCreateModal(false);
      resetPaymentForm();
      fetchStatistics();
      alert('Paiement créé avec succès');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Erreur lors de la création du paiement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments/send-alert', alertForm);
      setShowAlertModal(false);
      resetAlertForm();
      alert('Alerte envoyée avec succès');
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Erreur lors de l\'envoi de l\'alerte');
    }
  };

  const handleMarkInstallmentAsPaid = async (paymentId, installmentIndex) => {
    try {
      await api.put(`/payments/${paymentId}/installment/pay`, { installmentIndex });
      fetchPaymentData();
      fetchStatistics();
      alert('Tranche marquée comme payée avec succès');
    } catch (error) {
      console.error('Error marking installment as paid:', error);
      alert('Erreur lors de la mise à jour de la tranche: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleMarkCompletePaymentAsPaid = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}/complete/pay`);
      fetchPaymentData();
      fetchStatistics();
      alert('Paiement marqué comme payé avec succès');
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('Erreur lors de la mise à jour du paiement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateInstallmentDueDate = async (paymentId, installmentIndex, newDueDate) => {
    try {
      await api.put(`/payments/${paymentId}/installment/due-date`, { 
        installmentIndex, 
        newDueDate 
      });
      fetchPaymentData();
      alert('Date d\'échéance mise à jour avec succès');
    } catch (error) {
      console.error('Error updating due date:', error);
      alert('Erreur lors de la mise à jour de la date d\'échéance');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        await api.delete(`/payments/${paymentId}`);
        setPayments(payments.filter(payment => payment._id !== paymentId));
        fetchStatistics();
        alert('Paiement supprimé avec succès');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Erreur lors de la suppression du paiement');
      }
    }
  };

  const generateInstallments = () => {
    const { numberOfInstallments } = installmentForm;
    const totalAmount = parseFloat(paymentForm.totalAmount);
    
    if (!totalAmount || numberOfInstallments < 1) {
      alert('Veuillez entrer un montant total valide et un nombre de tranches');
      return;
    }
    
    const installmentAmount = totalAmount / numberOfInstallments;
    const installments = [];
    
    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      installments.push({
        amount: Math.round(installmentAmount * 100) / 100, // Round to 2 decimal places
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }
    
    setInstallmentForm({ ...installmentForm, installments });
    setPaymentForm({ 
      ...paymentForm, 
      installments
    });
  };

  const updateInstallmentAmount = (index, amount) => {
    const newInstallments = [...paymentForm.installments];
    newInstallments[index].amount = parseFloat(amount) || 0;
    setPaymentForm({ ...paymentForm, installments: newInstallments });
  };

  const updateInstallmentDueDate = (index, dueDate) => {
    const newInstallments = [...paymentForm.installments];
    newInstallments[index].dueDate = dueDate;
    setPaymentForm({ ...paymentForm, installments: newInstallments });
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetailsModal(true);
  };

  // Document generation functions
  const handleGenerateReceipt = async (payment) => {
    try {
      const response = await api.get(`/payments/${payment._id}/receipt`);
      setDocumentContent(response.data.htmlContent);
      setDocumentType('receipt');
      setSelectedPayment(payment);
      setShowDocumentModal(true);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Erreur lors de la génération du reçu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleGenerateInvoice = async (payment) => {
    try {
      const response = await api.get(`/payments/${payment._id}/invoice`);
      setDocumentContent(response.data.htmlContent);
      setDocumentType('invoice');
      setSelectedPayment(payment);
      setShowDocumentModal(true);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Erreur lors de la génération de la facture: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePrintDocument = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(documentContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadDocument = () => {
    const blob = new Blob([documentContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}-${selectedPayment?._id || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      userId: '',
      formationId: '',
      totalAmount: '',
      paymentType: 'complete',
      dueDate: '',
      description: '',
      installments: []
    });
    setInstallmentForm({
      numberOfInstallments: 2,
      installments: []
    });
  };

  const resetAlertForm = () => {
    setAlertForm({
      userId: '',
      formationId: '',
      message: '',
      type: 'payment_reminder'
    });
  };

  const filteredPayments = payments.filter(payment =>
    payment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.userId?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.formationId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'partial': return <CreditCard className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getInstallmentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestion des paiements</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Envoyer alerte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Envoyer une alerte de paiement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendAlert} className="space-y-4">
                <div>
                  <Label htmlFor="alertUser">Utilisateur</Label>
                  <Select value={alertForm.userId} onValueChange={(value) => setAlertForm({ ...alertForm, userId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} {user.lastname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="alertFormation">Formation</Label>
                  <Select value={alertForm.formationId} onValueChange={(value) => setAlertForm({ ...alertForm, formationId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une formation" />
                    </SelectTrigger>
                    <SelectContent>
                      {formations.map(formation => (
                        <SelectItem key={formation._id} value={formation._id}>
                          {formation.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="alertType">Type d'alerte</Label>
                  <Select value={alertForm.type} onValueChange={(value) => setAlertForm({ ...alertForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_reminder">Rappel de paiement</SelectItem>
                      <SelectItem value="payment_overdue">Paiement en retard</SelectItem>
                      <SelectItem value="payment_due_soon">Échéance proche</SelectItem>
                      <SelectItem value="general">Général</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="alertMessage">Message</Label>
                  <textarea
                    id="alertMessage"
                    placeholder="Message de l'alerte"
                    value={alertForm.message}
                    onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAlertModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Envoyer l'alerte
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau paiement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau paiement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user">Utilisateur</Label>
                    <Select value={paymentForm.userId} onValueChange={(value) => setPaymentForm({ ...paymentForm, userId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} {user.lastname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="formation">Formation</Label>
                    <Select value={paymentForm.formationId} onValueChange={(value) => setPaymentForm({ ...paymentForm, formationId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une formation" />
                      </SelectTrigger>
                      <SelectContent>
                        {formations.map(formation => (
                          <SelectItem key={formation._id} value={formation._id}>
                            {formation.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant total</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="Montant en TND"
                      value={paymentForm.totalAmount}
                      onChange={(e) => setPaymentForm({ 
                        ...paymentForm, 
                        totalAmount: parseFloat(e.target.value) || 0
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type de paiement</Label>
                    <Select 
                      value={paymentForm.paymentType} 
                      onValueChange={(value) => setPaymentForm({ 
                        ...paymentForm, 
                        paymentType: value,
                        installments: value === 'complete' ? [] : paymentForm.installments
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complete">Paiement complet</SelectItem>
                        <SelectItem value="installment">Paiement en tranches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentForm.paymentType === 'complete' && (
                  <div>
                    <Label htmlFor="dueDate">Date d'échéance</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={paymentForm.dueDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                    />
                  </div>
                )}

                {paymentForm.paymentType === 'installment' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <Label htmlFor="numberOfInstallments">Nombre de tranches</Label>
                        <Input
                          id="numberOfInstallments"
                          type="number"
                          min="2"
                          max="12"
                          value={installmentForm.numberOfInstallments}
                          onChange={(e) => setInstallmentForm({ 
                            ...installmentForm, 
                            numberOfInstallments: parseInt(e.target.value) || 2 
                          })}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={generateInstallments}
                        className="mt-6"
                      >
                        Générer les tranches
                      </Button>
                    </div>

                    {paymentForm.installments.length > 0 && (
                      <div className="space-y-3">
                        <Label>Configuration des tranches</Label>
                        {paymentForm.installments.map((installment, index) => (
                          <div key={index} className="grid grid-cols-3 gap-3 p-3 border rounded-lg">
                            <div>
                              <Label>Tranche {index + 1}</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Montant"
                                value={installment.amount}
                                onChange={(e) => updateInstallmentAmount(index, e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Date d'échéance</Label>
                              <Input
                                type="date"
                                value={installment.dueDate}
                                onChange={(e) => updateInstallmentDueDate(index, e.target.value)}
                              />
                            </div>
                            <div className="flex items-end">
                              <span className="text-sm text-gray-600">
                                {formatCurrency(installment.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="text-right">
                          <strong>
                            Total: {formatCurrency(paymentForm.installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0))}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <textarea
                    id="description"
                    placeholder="Description du paiement"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer le paiement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paiements</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Euro className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(statistics.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En Retard</p>
                  <p className="text-2xl font-bold">{statistics.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Partiels</p>
                  <p className="text-2xl font-bold">{statistics.partial}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom d'utilisateur ou formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Utilisateur</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Formation</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Montant</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Date création</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <React.Fragment key={payment._id}>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {payment.userId?.name} {payment.userId?.lastname}
                      </p>
                      <p className="text-xs text-gray-600">
                        {payment.userId?.email}
                      </p>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <p className="text-sm">{payment.formationId?.title}</p>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <p className="font-semibold text-sm">{formatCurrency(payment.totalAmount)}</p>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <p className="text-sm">
                      {payment.paymentType === 'complete' ? 'Paiement complet' : `${payment.installments?.length || 0} tranches`}
                    </p>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <Badge className={getPaymentStatusColor(payment.status)}>
                      <div className="flex items-center space-x-1">
                        {getPaymentStatusIcon(payment.status)}
                        <span className="text-xs">{payment.status}</span>
                      </div>
                    </Badge>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <p className="text-sm">{formatDate(payment.createdAt)}</p>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {/* Document Generation Buttons */}
                      {payment.status === 'completed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateInvoice(payment)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Receipt className="h-4 w-4 mr-1" />
                          Facture
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReceipt(payment)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Reçu
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPaymentDetails(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                     
                    </div>
                  </td>
                </tr>
                
                {/* Installments Row */}
                {payment.paymentType === 'installment' && payment.installments && (
                  <tr>
                    <td colSpan="7" className="border border-gray-300 px-4 py-2 bg-gray-25">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Tranches de paiement:</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Tranche</th>
                                <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Montant</th>
                                <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Échéance</th>
                                <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Statut</th>
                                <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Date paiement</th>
                                <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payment.installments.map((installment, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-200 px-2 py-1">
                                    <span className="text-xs font-medium">Tranche {index + 1}</span>
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    <span className="text-xs">{formatCurrency(installment.amount)}</span>
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    <span className="text-xs">{formatDate(installment.dueDate)}</span>
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    <Badge className={getInstallmentStatusColor(installment.status)} variant="outline">
                                      <span className="text-xs">{installment.status}</span>
                                    </Badge>
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {installment.paidAt && (
                                      <span className="text-xs text-green-600">
                                        {formatDate(installment.paidAt)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    <div className="flex items-center space-x-1">
                                      {installment.status !== 'paid' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleMarkInstallmentAsPaid(payment._id, index)}
                                          className="text-xs px-2 py-1 h-6"
                                        >
                                          Marquer payé
                                        </Button>
                                      )}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newDate = prompt('Nouvelle date d\'échéance (YYYY-MM-DD):', installment.dueDate);
                                          if (newDate) {
                                            handleUpdateInstallmentDueDate(payment._id, index, newDate);
                                          }
                                        }}
                                        className="text-xs px-2 py-1 h-6"
                                      >
                                        <CalendarDays className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Complete Payment Actions Row */}
                {payment.paymentType === 'complete' && payment.status !== 'completed' && (
                  <tr>
                    <td colSpan="7" className="border border-gray-300 px-4 py-2 bg-blue-25">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Échéance: {payment.dueDate ? formatDate(payment.dueDate) : 'Non définie'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkCompletePaymentAsPaid(payment._id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marquer comme payé
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentDetailsModal} onOpenChange={setShowPaymentDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Utilisateur</Label>
                  <p>{selectedPayment.userId?.name} {selectedPayment.userId?.lastname}</p>
                </div>
                <div>
                  <Label>Formation</Label>
                  <p>{selectedPayment.formationId?.title}</p>
                </div>
                <div>
                  <Label>Montant total</Label>
                  <p>{formatCurrency(selectedPayment.totalAmount)}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p>{selectedPayment.paymentType === 'complete' ? 'Paiement complet' : 'Paiement en tranches'}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={getPaymentStatusColor(selectedPayment.status)}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <Label>Créé le</Label>
                  <p>{formatDate(selectedPayment.createdAt)}</p>
                </div>
              </div>
              
              {selectedPayment.description && (
                <div>
                  <Label>Description</Label>
                  <p>{selectedPayment.description}</p>
                </div>
              )}

              {selectedPayment.paymentType === 'installment' && selectedPayment.installments && (
                <div>
                  <Label>Détails des tranches</Label>
                  <div className="space-y-2 mt-2">
                    {selectedPayment.installments.map((installment, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Tranche {index + 1}</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(installment.amount)} - Échéance: {formatDate(installment.dueDate)}
                            </p>
                            {installment.paidAt && (
                              <p className="text-sm text-green-600">
                                Payé le: {formatDate(installment.paidAt)}
                              </p>
                            )}
                          </div>
                          <Badge className={getInstallmentStatusColor(installment.status)}>
                            {installment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Modal */}
      <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {documentType === 'receipt' ? 'Reçu de Paiement' : 'Facture'} 
                {selectedPayment && ` - ${selectedPayment.userId?.name} ${selectedPayment.userId?.lastname}`}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintDocument}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Imprimer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDocument}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] border rounded-lg">
            <div 
              dangerouslySetInnerHTML={{ __html: documentContent }}
              className="p-4"
            />
          </div>
        </DialogContent>
      </Dialog>

      {filteredPayments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun paiement trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ReceptionPaymentManagement;


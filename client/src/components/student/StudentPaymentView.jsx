import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Bell,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  Wallet,
  Euro,
  Receipt,
  CalendarDays,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StudentPaymentView = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [paymentAlerts, setPaymentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch student payments
      const paymentsResponse = await api.get('/payments/my-payments');
      const paymentsData = paymentsResponse.data;
      
      // Handle different response structures
      if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
      } else if (paymentsData.payments && Array.isArray(paymentsData.payments)) {
        setPayments(paymentsData.payments);
      } else {
        setPayments([]);
      }

      // Fetch payment alerts for the student
      try {
        const alertsResponse = await api.get('/payment-alerts/my-alerts');
        const alertsData = alertsResponse.data;
        
        if (Array.isArray(alertsData)) {
          setPaymentAlerts(alertsData);
        } else if (alertsData.alerts && Array.isArray(alertsData.alerts)) {
          setPaymentAlerts(alertsData.alerts);
        } else {
          setPaymentAlerts([]);
        }
      } catch (alertError) {
        console.warn('Could not fetch alerts:', alertError);
        setPaymentAlerts([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Erreur lors du chargement des données de paiement');
      setLoading(false);
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleViewAlert = async (alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
    
    // Mark alert as read
    if (alert.status !== 'read') {
      try {
        await api.put(`/payment-alerts/${alert._id}`, { status: 'read' });
        setPaymentAlerts(paymentAlerts.map(a => 
          a._id === alert._id ? { ...a, status: 'read' } : a
        ));
      } catch (error) {
        console.error('Error marking alert as read:', error);
      }
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu_paiement_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Erreur lors du téléchargement du reçu');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0,00 TND';
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
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

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Payé';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      case 'partial': return 'Partiel';
      default: return status || 'Inconnu';
    }
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'payment_reminder': return 'bg-blue-100 text-blue-800';
      case 'payment_overdue': return 'bg-red-100 text-red-800';
      case 'payment_due_soon': return 'bg-yellow-100 text-yellow-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeText = (type) => {
    switch (type) {
      case 'payment_reminder': return 'Rappel de paiement';
      case 'payment_overdue': return 'Paiement en retard';
      case 'payment_due_soon': return 'Échéance proche';
      case 'general': return 'Alerte générale';
      default: return type || 'Alerte';
    }
  };

  const calculatePaymentStats = () => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;
    
    // Calculate total paid amount
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => {
        if (p.paymentType === 'installment' && p.installments) {
          return sum + p.installments
            .filter(inst => inst.status === 'paid')
            .reduce((instSum, inst) => instSum + (inst.amount || 0), 0);
        }
        return sum + (p.totalAmount || p.amount || 0);
      }, 0);
    
    // Calculate total due amount
    const totalDue = payments
      .filter(p => p.status !== 'completed')
      .reduce((sum, p) => {
        if (p.paymentType === 'installment' && p.installments) {
          return sum + p.installments
            .filter(inst => inst.status !== 'paid')
            .reduce((instSum, inst) => instSum + (inst.amount || 0), 0);
        }
        return sum + (p.totalAmount || p.amount || 0);
      }, 0);

    return { total, completed, pending, overdue, totalPaid, totalDue };
  };

  const getUnreadAlertsCount = () => {
    return paymentAlerts.filter(alert => alert.status !== 'read').length;
  };

  const stats = calculatePaymentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPaymentData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mes paiements</h2>
        <Button variant="outline" onClick={fetchPaymentData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total paiements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Montant payé</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Alerts */}
      {paymentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Alertes de paiement
              </div>
              {getUnreadAlertsCount() > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {getUnreadAlertsCount()} non lues
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentAlerts.slice(0, 5).map(alert => (
                <div 
                  key={alert._id} 
                  className={`p-4 rounded border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    alert.status === 'read' ? 'border-gray-300 bg-gray-25' : 'border-blue-400 bg-blue-50'
                  }`}
                  onClick={() => handleViewAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getAlertTypeColor(alert.type)}>
                          {getAlertTypeText(alert.type)}
                        </Badge>
                        {alert.status !== 'read' && (
                          <Badge className="bg-red-100 text-red-800">Nouveau</Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{alert.title || 'Alerte de paiement'}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {paymentAlerts.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{paymentAlerts.length - 5} autres alertes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun paiement enregistré</p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Formation</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Montant</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Date création</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Échéance</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <React.Fragment key={payment._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div>
                            <p className="font-medium text-sm">
                              {payment.formationId?.title || payment.formation?.title || 'Formation'}
                            </p>
                            {payment.description && (
                              <p className="text-xs text-gray-600 mt-1">{payment.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <p className="font-semibold text-sm">
                            {formatCurrency(payment.totalAmount || payment.amount)}
                          </p>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm">
                              {payment.paymentType === 'complete' ? 'Paiement complet' : 'Paiement en tranches'}
                            </span>
                            {payment.paymentType === 'installment' && (
                              <Badge variant="outline" className="text-xs w-fit">
                                {payment.installments?.length || 0} tranches
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            <div className="flex items-center space-x-1">
                              {getPaymentStatusIcon(payment.status)}
                              <span className="text-xs">{getPaymentStatusText(payment.status)}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <p className="text-sm">{formatDate(payment.createdAt)}</p>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="text-sm">
                            {payment.dueDate ? (
                              <p className={payment.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                                {formatDate(payment.dueDate)}
                              </p>
                            ) : (
                              <span className="text-gray-400">Non définie</span>
                            )}
                            {payment.paidAt && (
                              <p className="text-xs text-green-600 mt-1">
                                Payé le: {formatDate(payment.paidAt)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadReceipt(payment._id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Installments Row */}
                      {payment.paymentType === 'installment' && payment.installments && payment.installments.length > 0 && (
                        <tr>
                          <td colSpan="7" className="border border-gray-300 px-4 py-2 bg-gray-25">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Détail des tranches:</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Tranche</th>
                                      <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Montant</th>
                                      <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Échéance</th>
                                      <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Statut</th>
                                      <th className="border border-gray-200 px-2 py-1 text-left text-xs font-medium">Date paiement</th>
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
                                          <Badge className={getPaymentStatusColor(installment.status)} variant="outline">
                                            <span className="text-xs">{getPaymentStatusText(installment.status)}</span>
                                          </Badge>
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1">
                                          {installment.paidAt ? (
                                            <span className="text-xs text-green-600">
                                              {formatDate(installment.paidAt)}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-400">Non payé</span>
                                          )}
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
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Résumé financier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total payé</span>
                <span className="font-medium text-green-600">{formatCurrency(stats.totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Montant dû</span>
                <span className="font-medium text-red-600">{formatCurrency(stats.totalDue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paiements en attente</span>
                <span className="font-medium text-yellow-600">{stats.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Informations utiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Receipt className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-gray-600">
                  Vous pouvez télécharger vos reçus de paiement une fois les paiements effectués.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Bell className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-gray-600">
                  Consultez régulièrement vos alertes pour ne manquer aucune échéance.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CalendarDays className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-gray-600">
                  Les paiements en tranches vous permettent d'étaler vos frais de formation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Formation</p>
                  <p className="text-sm">
                    {selectedPayment.formationId?.title || selectedPayment.formation?.title || 'Non spécifiée'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Statut</p>
                  <div className="flex items-center space-x-2">
                    {getPaymentStatusIcon(selectedPayment.status)}
                    <Badge className={getPaymentStatusColor(selectedPayment.status)}>
                      {getPaymentStatusText(selectedPayment.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Montant</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(selectedPayment.totalAmount || selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="text-sm">
                    {selectedPayment.paymentType === 'complete' ? 'Paiement complet' : 'Paiement en tranches'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date de création</p>
                  <p className="text-sm">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                {selectedPayment.dueDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date d'échéance</p>
                    <p className="text-sm">{formatDate(selectedPayment.dueDate)}</p>
                  </div>
                )}
                {selectedPayment.paidAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date de paiement</p>
                    <p className="text-sm">{formatDate(selectedPayment.paidAt)}</p>
                  </div>
                )}
              </div>

              {selectedPayment.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-sm">{selectedPayment.description}</p>
                </div>
              )}

              {selectedPayment.paymentType === 'installment' && selectedPayment.installments && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Détail des tranches</p>
                  <div className="space-y-2">
                    {selectedPayment.installments.map((installment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Tranche {index + 1}</p>
                          <p className="text-sm text-gray-600">
                            Échéance: {formatDate(installment.dueDate)}
                          </p>
                          {installment.paidAt && (
                            <p className="text-sm text-green-600">
                              Payé le: {formatDate(installment.paidAt)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(installment.amount)}</p>
                          <Badge className={getPaymentStatusColor(installment.status)}>
                            {getPaymentStatusText(installment.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                {selectedPayment.status === 'completed' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadReceipt(selectedPayment._id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le reçu
                  </Button>
                )}
                <Button onClick={() => setShowPaymentModal(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Details Modal */}
      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'alerte</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <Badge className={getAlertTypeColor(selectedAlert.type)}>
                  {getAlertTypeText(selectedAlert.type)}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium">{selectedAlert.title || 'Alerte de paiement'}</h3>
                <p className="text-gray-600 mt-2">{selectedAlert.message}</p>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Envoyé le: {formatDate(selectedAlert.createdAt)}</p>
                {selectedAlert.dueDate && (
                  <p>Échéance: {formatDate(selectedAlert.dueDate)}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowAlertModal(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPaymentView;


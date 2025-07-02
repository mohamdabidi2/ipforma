import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from '../../components/ui/table';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  Calendar,
  User,
  Award,
  Timer,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StudentQCMList = () => {
  const { user } = useAuth();
  const [qcms, setQcms] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQCMModal, setShowQCMModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedQCM, setSelectedQCM] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [qcmStarted, setQcmStarted] = useState(false);
  const [qcmCompleted, setQcmCompleted] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchQCMData();
  }, []);

  useEffect(() => {
    let timer;
    if (qcmStarted && timeLeft > 0 && !qcmCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQCM();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [qcmStarted, timeLeft, qcmCompleted]);

  const fetchQCMData = async () => {
    try {
      setLoading(true);
      
      // Fetch available QCMs for the student
      const qcmsResponse = await api.get('/qcms/available');
      setQcms(Array.isArray(qcmsResponse.data) ? qcmsResponse.data : []);

      // Fetch student's QCM results
      const resultsResponse = await api.get('/qcms/my-results');
      setMyResults(Array.isArray(resultsResponse.data) ? resultsResponse.data : []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching QCM data:', error);
      setLoading(false);
    }
  };

  const handleStartQCM = async (qcm) => {
    try {
      // Fetch the full QCM details including questions
      const response = await api.get(`/qcms/${qcm._id}`);
      setSelectedQCM(response.data);
      setCurrentQuestion(0);
      setAnswers({});
      setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
      setQcmStarted(false);
      setQcmCompleted(false);
      setShowQCMModal(true);
    } catch (error) {
      console.error('Error fetching QCM details:', error);
      alert('Erreur lors du chargement du QCM');
    }
  };

  const handleBeginQCM = () => {
    setQcmStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQCM.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQCM = async () => {
    try {
      const timeSpent = startTime ? Math.floor((new Date() - startTime) / (1000 * 60)) : selectedQCM.timeLimit;
      
      // Convert answers to the format expected by the backend
      const formattedAnswers = selectedQCM.questions.map((question, index) => ({
        answer: answers[index] !== undefined ? answers[index] : null
      }));

      const submissionData = {
        answers: formattedAnswers,
        timeSpent: timeSpent
      };

      const response = await api.post(`/qcms/${selectedQCM._id}/submit`, submissionData);
      
      setQcmCompleted(true);
      
      alert(`QCM soumis avec succès ! Score: ${response.data.score}%`);
      
      // Close modal after a delay
      setTimeout(() => {
        setShowQCMModal(false);
        fetchQCMData(); // Refresh data
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting QCM:', error);
      alert('Erreur lors de la soumission du QCM');
    }
  };

  const handleViewResult = async (qcm) => {
    try {
      const response = await api.get(`/qcms/${qcm._id}/my-result`);
      setSelectedResult(response.data);
      setShowResultModal(true);
    } catch (error) {
      console.error('Error fetching result:', error);
      alert('Erreur lors du chargement du résultat');
    }
  };

  const getQCMStatus = (qcm) => {
    // First check if student has already submitted this QCM by looking in the QCM's results array
    const studentResult = qcm.results?.find(result => result.studentId === user._id);
    if (studentResult) {
      return { status: 'completed', result: studentResult };
    }
    
    // Also check in myResults array as a fallback
    const result = myResults.find(r => r.qcm._id === qcm._id || r.qcm === qcm._id);
    if (result) {
      return { status: 'completed', result };
    }
    
    const now = new Date();
    const startDate = qcm.startDate ? new Date(qcm.startDate) : null;
    const endDate = qcm.endDate ? new Date(qcm.endDate) : null;
    
    if (startDate && now < startDate) {
      return { status: 'scheduled', startDate };
    }
    
    if (endDate && now > endDate) {
      return { status: 'expired', endDate };
    }
    
    return { status: 'available' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'available': return <Play className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'available': return 'Disponible';
      case 'scheduled': return 'Programmé';
      case 'expired': return 'Expiré';
      default: return 'Inconnu';
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = selectedQCM?.questions.length || 1;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
        <h2 className="text-xl font-semibold">Mes tests et QCM</h2>
        <Button variant="outline" onClick={fetchQCMData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg shadow-sm flex items-center">
          <FileText className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">QCM disponibles</p>
            <p className="text-2xl font-bold text-gray-900">{qcms.length}</p>
          </div>
        </div>

        <div className="p-6 border rounded-lg shadow-sm flex items-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">QCM terminés</p>
            <p className="text-2xl font-bold text-gray-900">{myResults.length}</p>
          </div>
        </div>

        <div className="p-6 border rounded-lg shadow-sm flex items-center">
          <Award className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Score moyen</p>
            <p className="text-2xl font-bold text-gray-900">
              {myResults.length > 0 
                ? Math.round(myResults.reduce((sum, r) => sum + (r.score || 0), 0) / myResults.length)
                : 0}%
            </p>
          </div>
        </div>

        <div className="p-6 border rounded-lg shadow-sm flex items-center">
          <Play className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">À faire</p>
            <p className="text-2xl font-bold text-gray-900">
              {qcms.filter(qcm => getQCMStatus(qcm).status === 'available').length}
            </p>
          </div>
        </div>
      </div>

      {/* Available QCMs Table */}
      <div>
        <h3 className="text-lg font-medium mb-4">QCM disponibles</h3>
        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Mon Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qcms.length > 0 ? (
                qcms.map(qcm => {
                  const qcmStatus = getQCMStatus(qcm);
                  return (
                    <TableRow key={qcm._id}>
                      <TableCell className="font-medium">{qcm.title}</TableCell>
                      <TableCell>{qcm.teacherId?.name} {qcm.teacherId?.lastname}</TableCell>
                      <TableCell>{qcm.questions?.length || 0}</TableCell>
                      <TableCell>{qcm.timeLimit} min</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(qcmStatus.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(qcmStatus.status)}
                            <span>{getStatusText(qcmStatus.status)}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {qcmStatus.status === 'completed' && qcmStatus.result ? (
                          <span className={`font-medium ${getScoreColor(qcmStatus.result.score)}`}>
                            {qcmStatus.result.score}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {qcmStatus.status === 'available' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStartQCM(qcm)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Commencer
                            </Button>
                          )}
                          
                          {qcmStatus.status === 'completed' && qcm.showResults && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewResult(qcm)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir Résultat
                            </Button>
                          )}
                          
                          {qcmStatus.status === 'completed' && qcm.allowRetake && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartQCM(qcm)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refaire
                            </Button>
                          )}
                          
                          {qcmStatus.status === 'scheduled' && (
                            <Button variant="outline" size="sm" disabled>
                              <Clock className="h-4 w-4 mr-2" />
                              Programmé
                            </Button>
                          )}
                          
                          {qcmStatus.status === 'expired' && (
                            <Button variant="outline" size="sm" disabled>
                              <XCircle className="h-4 w-4 mr-2" />
                              Expiré
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8 text-gray-500">
                    Aucun QCM disponible pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* QCM Taking Modal */}
      <Dialog open={showQCMModal} onOpenChange={setShowQCMModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedQCM?.title}</span>
              {qcmStarted && !qcmCompleted && (
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4 text-red-600" />
                  <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedQCM && (
            <div className="space-y-6">
              {!qcmStarted ? (
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 p-6 rounded">
                    <h3 className="text-lg font-medium mb-4">Instructions</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Vous avez {selectedQCM.timeLimit} minutes pour compléter ce test</p>
                      <p>• Le test contient {selectedQCM.questions.length} questions</p>
                      <p>• Vous pouvez naviguer entre les questions</p>
                      <p>• Le test sera automatiquement soumis à la fin du temps imparti</p>
                      {!selectedQCM.allowRetake && <p>• Vous ne pourrez pas refaire ce test</p>}
                    </div>
                  </div>
                  <Button onClick={handleBeginQCM} size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Commencer le QCM
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Progress value={calculateProgress()} className="w-full" />
                  <div className="text-sm text-gray-600 text-right">
                    Question {currentQuestion + 1} sur {selectedQCM.questions.length}
                  </div>

                  <div className="border p-4 rounded-lg">
                    <p className="font-medium text-lg mb-4">
                      {selectedQCM.questions[currentQuestion].question}
                    </p>

                    {selectedQCM.questions[currentQuestion].type === 'multiple_choice' && (
                      <RadioGroup
                        value={answers[currentQuestion] !== undefined ? answers[currentQuestion].toString() : ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion, parseInt(value))}
                        className="space-y-2"
                      >
                        {selectedQCM.questions[currentQuestion].options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={oIndex.toString()} id={`option-${oIndex}`} />
                            <Label htmlFor={`option-${oIndex}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {selectedQCM.questions[currentQuestion].type === 'true_false' && (
                      <RadioGroup
                        value={answers[currentQuestion] !== undefined ? answers[currentQuestion].toString() : ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion, parseInt(value))}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id="true" />
                          <Label htmlFor="true">Vrai</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="false" />
                          <Label htmlFor="false">Faux</Label>
                        </div>
                      </RadioGroup>
                    )}

                    {selectedQCM.questions[currentQuestion].type === 'short_answer' && (
                      <Textarea
                        value={answers[currentQuestion] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                        placeholder="Votre réponse..."
                        rows={3}
                      />
                    )}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousQuestion} 
                      disabled={currentQuestion === 0}
                    >
                      Précédent
                    </Button>
                    {currentQuestion === selectedQCM.questions.length - 1 ? (
                      <Button onClick={handleSubmitQCM} disabled={qcmCompleted}>
                        {qcmCompleted ? 'Soumis' : 'Soumettre QCM'}
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion}>
                        Suivant
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultat du QCM: {selectedResult?.qcm?.title}</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium">Votre score:</p>
                <p className={`text-5xl font-bold ${getScoreColor(selectedResult.score)}`}>
                  {selectedResult.score}%
                </p>
                <p className="text-sm text-gray-600">
                  {selectedResult.correctAnswers} bonnes réponses sur {selectedResult.totalQuestions}
                </p>
                <p className="text-sm text-gray-600">
                  Temps passé: {selectedResult.timeSpent} minutes
                </p>
                <p className="text-sm text-gray-600">
                  Soumis le: {new Date(selectedResult.submittedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentQCMList;


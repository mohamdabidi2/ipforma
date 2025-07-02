import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Play,
  Pause,
  Copy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TeacherQCMManagement = () => {
  const { user } = useAuth();
  const [qcms, setQcms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedQcm, setSelectedQcm] = useState(null);
  
  const [qcmForm, setQcmForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    questions: [
      {
        question: '',
        type: 'multiple_choice', // multiple_choice, true_false, short_answer
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1
      }
    ],
    assignedStudents: [],
    startDate: '',
    endDate: '',
    isActive: true,
    allowRetake: false,
    showResults: true
  });

  const [qcmResults, setQcmResults] = useState([]);

  useEffect(() => {
    fetchQCMData();
  }, []);

  const fetchQCMData = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher QCMs
      const qcmsResponse = await api.get('/qcms/my-qcms');
      setQcms(Array.isArray(qcmsResponse.data) ? qcmsResponse.data : []);

      // Fetch students
      const studentsResponse = await api.get('/users/students/my');
      setStudents(Array.isArray(studentsResponse.data) ? studentsResponse.data : []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching QCM data:', error);
      setLoading(false);
    }
  };

  const handleCreateQCM = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/qcms", {
        ...qcmForm,
        students: qcmForm.assignedStudents,
        teacherId: user._id,
      });
      setQcms([...qcms, response.data]);
      setShowCreateModal(false);
      resetQCMForm();
      alert('QCM créé avec succès');
    } catch (error) {
      console.error('Error creating QCM:', error);
      alert('Erreur lors de la création du QCM');
    }
  };

  const handleEditQCM = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/qcms/${selectedQcm._id}`, {
        ...qcmForm,
        students: qcmForm.assignedStudents,
      });
      setQcms(qcms.map(qcm => 
        qcm._id === selectedQcm._id ? response.data : qcm
      ));
      setShowEditModal(false);
      resetQCMForm();
      alert('QCM modifié avec succès');
    } catch (error) {
      console.error('Error updating QCM:', error);
      alert('Erreur lors de la modification du QCM');
    }
  };

  const handleDeleteQCM = async (qcmId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce QCM ?')) {
      try {
        await api.delete(`/qcms/${qcmId}`);
        setQcms(qcms.filter(qcm => qcm._id !== qcmId));
        alert('QCM supprimé avec succès');
      } catch (error) {
        console.error('Error deleting QCM:', error);
        alert('Erreur lors de la suppression du QCM');
      }
    }
  };

  const handleToggleQCMStatus = async (qcmId, isActive) => {
    try {
      await api.put(`/qcms/${qcmId}`, { isActive });
      setQcms(qcms.map(qcm => 
        qcm._id === qcmId ? { ...qcm, isActive } : qcm
      ));
    } catch (error) {
      console.error('Error toggling QCM status:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  const handleDuplicateQCM = async (qcm) => {
    try {
      const duplicatedQCM = {
        ...qcm,
        title: `${qcm.title} (Copie)`,
        isActive: false,
        assignedStudents: [],
        startDate: '',
        endDate: ''
      };
      delete duplicatedQCM._id;
      delete duplicatedQCM.createdAt;
      delete duplicatedQCM.updatedAt;
      
      const response = await api.post('/qcms', duplicatedQCM);
      setQcms([...qcms, response.data]);
      alert('QCM dupliqué avec succès');
    } catch (error) {
      console.error('Error duplicating QCM:', error);
      alert('Erreur lors de la duplication du QCM');
    }
  };

  const openEditModal = (qcm) => {
    setSelectedQcm(qcm);
    setQcmForm({
      title: qcm.title,
      description: qcm.description,
      timeLimit: qcm.timeLimit,
      questions: qcm.questions || [],
      assignedStudents: qcm.students?.map(s => s._id || s) || [],
      startDate: qcm.startDate ? qcm.startDate.split('T')[0] : '',
      endDate: qcm.endDate ? qcm.endDate.split('T')[0] : '',
      isActive: qcm.isActive,
      allowRetake: qcm.allowRetake,
      showResults: qcm.showResults
    });
    setShowEditModal(true);
  };

  const openResultsModal = async (qcm) => {
    setSelectedQcm(qcm);
    try {
      const response = await api.get(`/qcms/${qcm._id}/results`);
      setQcmResults(response.data || []);
    } catch (error) {
      console.error('Error fetching QCM results:', error);
      setQcmResults([]);
    }
    setShowResultsModal(true);
  };

  const resetQCMForm = () => {
    setQcmForm({
      title: '',
      description: '',
      timeLimit: 30,
      questions: [
        {
          question: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 1
        }
      ],
      assignedStudents: [],
      startDate: '',
      endDate: '',
      isActive: true,
      allowRetake: false,
      showResults: true
    });
    setSelectedQcm(null);
  };

  const addQuestion = () => {
    setQcmForm({
      ...qcmForm,
      questions: [...qcmForm.questions, {
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1
      }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...qcmForm.questions];
    if (field === 'options') {
      updatedQuestions[index].options = value;
    } else {
      updatedQuestions[index][field] = value;
    }
    setQcmForm({ ...qcmForm, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = qcmForm.questions.filter((_, i) => i !== index);
    setQcmForm({ ...qcmForm, questions: updatedQuestions });
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...qcmForm.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQcmForm({ ...qcmForm, questions: updatedQuestions });
  };

  const filteredQCMs = qcms.filter(qcm =>
    qcm.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qcm.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQCMStatusColor = (qcm) => {
    if (!qcm.isActive) return 'bg-gray-100 text-gray-800';
    
    const now = new Date();
    const startDate = qcm.startDate ? new Date(qcm.startDate) : null;
    const endDate = qcm.endDate ? new Date(qcm.endDate) : null;
    
    if (startDate && now < startDate) return 'bg-yellow-100 text-yellow-800';
    if (endDate && now > endDate) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getQCMStatusText = (qcm) => {
    if (!qcm.isActive) return 'Inactif';
    
    const now = new Date();
    const startDate = qcm.startDate ? new Date(qcm.startDate) : null;
    const endDate = qcm.endDate ? new Date(qcm.endDate) : null;
    
    if (startDate && now < startDate) return 'Programmé';
    if (endDate && now > endDate) return 'Terminé';
    return 'Actif';
  };

  const calculateQCMStats = (qcm) => {
    const totalStudents = qcm.assignedStudents?.length || 0;
    const completedCount = qcm.submissions?.length || 0;
    const averageScore = qcm.submissions?.length > 0 
      ? qcm.submissions.reduce((sum, s) => sum + (s.score || 0), 0) / qcm.submissions.length 
      : 0;
    
    return { totalStudents, completedCount, averageScore };
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
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des QCM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau QCM
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau QCM</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateQCM} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre du QCM</Label>
                    <Input
                      id="title"
                      value={qcmForm.title}
                      onChange={(e) => setQcmForm({ ...qcmForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeLimit">Durée (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={qcmForm.timeLimit}
                      onChange={(e) => setQcmForm({ ...qcmForm, timeLimit: parseInt(e.target.value) })}
                      min="1"
                      max="180"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={qcmForm.description}
                    onChange={(e) => setQcmForm({ ...qcmForm, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Date de début (optionnel)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={qcmForm.startDate}
                      onChange={(e) => setQcmForm({ ...qcmForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Date de fin (optionnel)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={qcmForm.endDate}
                      onChange={(e) => setQcmForm({ ...qcmForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Étudiants assignés</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                    {students.map(student => (
                      <div key={student._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`student-${student._id}`}
                          checked={qcmForm.assignedStudents.includes(student._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setQcmForm({
                                ...qcmForm,
                                assignedStudents: [...qcmForm.assignedStudents, student._id]
                              });
                            } else {
                              setQcmForm({
                                ...qcmForm,
                                assignedStudents: qcmForm.assignedStudents.filter(id => id !== student._id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`student-${student._id}`} className="text-sm">
                          {student.name} {student.lastname}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowRetake"
                      checked={qcmForm.allowRetake}
                      onCheckedChange={(checked) => setQcmForm({ ...qcmForm, allowRetake: checked })}
                    />
                    <Label htmlFor="allowRetake">Autoriser les reprises</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showResults"
                      checked={qcmForm.showResults}
                      onCheckedChange={(checked) => setQcmForm({ ...qcmForm, showResults: checked })}
                    />
                    <Label htmlFor="showResults">Afficher les résultats</Label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Questions</Label>
                    <Button type="button" onClick={addQuestion} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une question
                    </Button>
                  </div>
                  
                  {qcmForm.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border rounded-lg p-4 mb-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Question {qIndex + 1}</span>
                          <div className="flex space-x-2">
                            <Select 
                              value={question.type} 
                              onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple_choice">QCM</SelectItem>
                                <SelectItem value="true_false">Vrai/Faux</SelectItem>
                                <SelectItem value="short_answer">Réponse courte</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeQuestion(qIndex)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-3">
                            <Label>Question</Label>
                            <Textarea
                              value={question.question}
                              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              placeholder="Tapez votre question ici..."
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Points</Label>
                            <Input
                              type="number"
                              value={question.points}
                              onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                              min="1"
                              max="10"
                            />
                          </div>
                        </div>
                        
                        {question.type === 'multiple_choice' && (
                          <div>
                            <Label>Options de réponse</Label>
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={question.correctAnswer === oIndex}
                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type === 'true_false' && (
                          <div>
                            <Label>Réponse correcte</Label>
                            <RadioGroup
                              value={question.correctAnswer === 0 ? 'true' : 'false'}
                              onValueChange={(value) => updateQuestion(qIndex, 'correctAnswer', value === 'true' ? 0 : 1)}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id={`true-${qIndex}`} />
                                <Label htmlFor={`true-${qIndex}`}>Vrai</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id={`false-${qIndex}`} />
                                <Label htmlFor={`false-${qIndex}`}>Faux</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        {question.type === 'short_answer' && (
                          <div>
                            <Label>Réponse attendue</Label>
                            <Input
                              value={question.correctAnswer}
                              onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                              placeholder="Réponse courte attendue"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer le QCM
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* QCMs Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQCMs.length > 0 ? (
                filteredQCMs.map(qcm => {
                  const stats = calculateQCMStats(qcm);
                  return (
                    <tr key={qcm._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{qcm.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{qcm.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getQCMStatusColor(qcm)}>
                          {getQCMStatusText(qcm)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qcm.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qcm.timeLimit} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qcm.students?.length || 0} étudiants
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qcm.startDate && <p>Début: {new Date(qcm.startDate).toLocaleDateString('fr-FR')}</p>}
                        {qcm.endDate && <p>Fin: {new Date(qcm.endDate).toLocaleDateString('fr-FR')}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openResultsModal(qcm)}
                            title="Voir les résultats"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditModal(qcm)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDuplicateQCM(qcm)}
                            title="Dupliquer"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleQCMStatus(qcm._id, !qcm.isActive)}
                            title={qcm.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {qcm.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteQCM(qcm._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {searchTerm ? 'Aucun QCM trouvé' : 'Aucun QCM créé'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit QCM Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le QCM</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditQCM} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Titre du QCM</Label>
                <Input
                  id="edit-title"
                  value={qcmForm.title}
                  onChange={(e) => setQcmForm({ ...qcmForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-timeLimit">Durée (minutes)</Label>
                <Input
                  id="edit-timeLimit"
                  type="number"
                  value={qcmForm.timeLimit}
                  onChange={(e) => setQcmForm({ ...qcmForm, timeLimit: parseInt(e.target.value) })}
                  min="1"
                  max="180"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={qcmForm.description}
                onChange={(e) => setQcmForm({ ...qcmForm, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Date de début (optionnel)</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={qcmForm.startDate}
                  onChange={(e) => setQcmForm({ ...qcmForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">Date de fin (optionnel)</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={qcmForm.endDate}
                  onChange={(e) => setQcmForm({ ...qcmForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Étudiants assignés</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                {students.map(student => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-student-${student._id}`}
                      checked={qcmForm.assignedStudents.includes(student._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQcmForm({
                            ...qcmForm,
                            assignedStudents: [...qcmForm.assignedStudents, student._id]
                          });
                        } else {
                          setQcmForm({
                            ...qcmForm,
                            assignedStudents: qcmForm.assignedStudents.filter(id => id !== student._id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`edit-student-${student._id}`} className="text-sm">
                      {student.name} {student.lastname}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-allowRetake"
                  checked={qcmForm.allowRetake}
                  onCheckedChange={(checked) => setQcmForm({ ...qcmForm, allowRetake: checked })}
                />
                <Label htmlFor="edit-allowRetake">Autoriser les reprises</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-showResults"
                  checked={qcmForm.showResults}
                  onCheckedChange={(checked) => setQcmForm({ ...qcmForm, showResults: checked })}
                />
                <Label htmlFor="edit-showResults">Afficher les résultats</Label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Questions</Label>
                <Button type="button" onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une question
                </Button>
              </div>
              
              {qcmForm.questions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4 mb-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Question {qIndex + 1}</span>
                      <div className="flex space-x-2">
                        <Select 
                          value={question.type} 
                          onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">QCM</SelectItem>
                            <SelectItem value="true_false">Vrai/Faux</SelectItem>
                            <SelectItem value="short_answer">Réponse courte</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <Label>Question</Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Tapez votre question ici..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                    
                    {question.type === 'multiple_choice' && (
                      <div>
                        <Label>Options de réponse</Label>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`edit-correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                              />
                              <Input
                                value={option}
                                onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'true_false' && (
                      <div>
                        <Label>Réponse correcte</Label>
                        <RadioGroup
                          value={question.correctAnswer === 0 ? 'true' : 'false'}
                          onValueChange={(value) => updateQuestion(qIndex, 'correctAnswer', value === 'true' ? 0 : 1)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id={`edit-true-${qIndex}`} />
                            <Label htmlFor={`edit-true-${qIndex}`}>Vrai</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id={`edit-false-${qIndex}`} />
                            <Label htmlFor={`edit-false-${qIndex}`}>Faux</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {question.type === 'short_answer' && (
                      <div>
                        <Label>Réponse attendue</Label>
                        <Input
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                          placeholder="Réponse courte attendue"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Sauvegarder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultats du QCM: {selectedQcm?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {qcmResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de soumission
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {qcmResults.map(result => (
                      <tr key={result._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.student?.name} {result.student?.lastname}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.score !== undefined ? `${result.score}/${selectedQcm?.questions.reduce((sum, q) => sum + (q.points || 1), 0)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.submittedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={result.score !== undefined ? 'default' : 'secondary'}>
                            {result.score !== undefined ? 'Terminé' : 'En cours'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun résultat pour ce QCM pour le moment.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherQCMManagement;


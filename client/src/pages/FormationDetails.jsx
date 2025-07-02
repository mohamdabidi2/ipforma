import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  CheckCircle,
  Play,
  User,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const FormationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [existingPreinscription, setExistingPreinscription] = useState(null);
  const [checkingPreinscription, setCheckingPreinscription] = useState(false);

  useEffect(() => {
    fetchFormationDetails();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkExistingPreinscription();
    }
  }, [user, id]);

  const fetchFormationDetails = async () => {
    try {
      const response = await api.get(`/formations/${id}`);
      setFormation(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching formation details:', error);
      setLoading(false);
    }
  };

  const checkExistingPreinscription = async () => {
    if (!user || !id) return;
    
    setCheckingPreinscription(true);
    try {
      const response = await api.get(`/preinscriptions/check/${id}`);
      if (response.data.hasExistingPreinscription) {
        setExistingPreinscription(response.data.preinscription);
      }
    } catch (error) {
      console.error('Error checking existing pre-inscription:', error);
    } finally {
      setCheckingPreinscription(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user already has a pre-inscription
    if (existingPreinscription) {
      alert('Vous avez déjà une demande de pré-inscription pour cette formation. Veuillez attendre la confirmation du centre.');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/preinscriptions', {
        nom: `${user.name} ${user.lastname}`,
        userId: user._id,
        formation: {
          titre: formation.title,
          id: formation._id
        }
      });
      
      alert('Demande d\'inscription envoyée avec succès!');
      // Refresh the pre-inscription status
      checkExistingPreinscription();
    } catch (error) {
      console.error('Error enrolling:', error);
      if (error.response && error.response.status === 409) {
        // Duplicate pre-inscription error
        alert('Vous avez déjà une demande de pré-inscription pour cette formation. Veuillez attendre la confirmation du centre.');
        checkExistingPreinscription(); // Refresh status
      } else {
        alert('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnue</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formation non trouvée</h1>
          <Button onClick={() => navigate('/formations')}>
            Retour aux formations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/formations')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux formations
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Badge className={`mb-4 ${
                  formation.type === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : formation.type === 'presentielle'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {formation.type}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {formation.title}
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {formation.description}
                </p>

                {/* Formation stats */}
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{formation.durationWeeks} Semaines • {formation.estimatedHours} Heures</span>
                  </div>
                 
                  
                  {formation.level && (
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="h-5 w-5 mr-2" />
                      <span className="capitalize">{formation.level}</span>
                    </div>
                  )}
                </div>

                {/* Formation image */}
                {formation.thumbnail && (
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
                    <img 
                      src={formation.thumbnail.startsWith('http') ? formation.thumbnail : `http://localhost:5000/${formation.thumbnail}`}
                      alt={formation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
         
                </TabsList>

                <TabsContent value="content" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Programme de la formation</h3>
                      {formation.content && formation.content.length > 0 ? (
                        <div className="space-y-4">
                          {formation.content.map((chapter, index) => (
                            <div key={chapter.id || index} className="border-l-4 border-blue-600 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Chapitre {chapter.order || index + 1}: {chapter.title}
                              </h4>
                              {chapter.description && (
                                <p className="text-gray-600 mb-2">{chapter.description}</p>
                              )}
                              {chapter.lessons && chapter.lessons.length > 0 && (
                                <div className="ml-4 mt-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Leçons:</h5>
                                  <ul className="space-y-1">
                                    {chapter.lessons.map((lesson, lessonIndex) => (
                                      <li key={lesson.id || lessonIndex} className="flex items-center text-sm text-gray-600">
                                        <Play className="h-3 w-3 mr-2 text-blue-500" />
                                        <span>{lesson.title}</span>
                                        {lesson.duration && (
                                          <span className="ml-auto text-xs text-gray-500">
                                            {lesson.duration}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Le programme détaillé sera bientôt disponible.</p>
                        </div>
                      )}

                      {/* Prerequisites and Objectives */}
                      {(formation.prerequisites || formation.objectives) && (
                        <div className="mt-8 pt-6 border-t">
                          {formation.prerequisites && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-2">Prérequis</h4>
                              <p className="text-gray-600">{formation.prerequisites}</p>
                            </div>
                          )}
                          {formation.objectives && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Objectifs</h4>
                              <p className="text-gray-600">{formation.objectives}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

               

              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formation.price} DT
                    </div>
                    <p className="text-gray-600">Prix de la formation</p>
                  </div>

                  {/* Existing Pre-inscription Status */}
                  {checkingPreinscription ? (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm text-gray-600">Vérification...</span>
                      </div>
                    </div>
                  ) : existingPreinscription ? (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Demande déjà envoyée
                          </h4>
                          <p className="text-sm text-blue-700 mb-2">
                            Vous avez déjà une demande de pré-inscription pour cette formation.
                          </p>
                          <div className="flex items-center justify-between">
                          
                          </div>
                          {existingPreinscription.status === 'pending' && (
                            <p className="text-xs text-blue-600 mt-2">
                              Veuillez attendre la confirmation du centre.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <Button 
                    className="w-full mb-4" 
                    size="lg"
                    onClick={handleEnrollment}
                    disabled={enrolling || existingPreinscription || checkingPreinscription}
                  >
                    {enrolling ? (
                      'Inscription en cours...'
                    ) : existingPreinscription ? (
                      'Demande déjà envoyée'
                    ) : (
                      'S\'inscrire maintenant'
                    )}
                  </Button>

                  {existingPreinscription && (
                    <p className="text-xs text-center text-gray-500 mb-4">
                      Vous ne pouvez envoyer qu'une seule demande par formation.
                    </p>
                  )}

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-semibold">{formation.durationWeeks} Semaines</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Temps estimé:</span>
                      <span className="font-semibold">{formation.estimatedHours} Heures</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold capitalize">{formation.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Niveau:</span>
                      <span className="font-semibold capitalize">{formation.level || 'Tous niveaux'}</span>
                    </div>
                    {formation.startDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Début:</span>
                        <span className="font-semibold">
                          {new Date(formation.startDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Accès à vie</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Certificat de completion</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Support technique</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormationDetails;


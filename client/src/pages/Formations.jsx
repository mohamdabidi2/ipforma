import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

const Formations = () => {
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFormations();
  }, []);

  useEffect(() => {
    filterAndSortFormations();
  }, [formations, searchTerm, typeFilter, levelFilter, sortBy]);

  const fetchFormations = async () => {
    try {
      const response = await api.get('/formations');
      setFormations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching formations:', error);
      setLoading(false);
    }
  };

  const filterAndSortFormations = () => {
    let filtered = [...formations];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(formation =>
        formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(formation => formation.type === typeFilter);
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(formation => formation.level === levelFilter);
    }

    // Only show active formations
    filtered = filtered.filter(formation => formation.isActive !== false);

    // Sort formations
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        filtered.sort((a, b) => a.durationWeeks - b.durationWeeks);
        break;
      case 'rating':
        filtered.sort((a, b) => getAverageRating(b.reviews) - getAverageRating(a.reviews));
        break;
      default:
        break;
    }

    setFilteredFormations(filtered);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Nos <span className="text-yellow-400">Formations</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez notre catalogue complet de formations professionnelles 
              conçues pour développer vos compétences et booster votre carrière.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Filtres:</span>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="online">En ligne</SelectItem>
                  <SelectItem value="presentielle">Présentielle</SelectItem>
                  <SelectItem value="hybrid">Hybride</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="duration">Durée</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4">
            <p className="text-gray-600">
              {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Formations Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFormations.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune formation trouvée
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche ou de filtrage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.map((formation) => (
                <Card key={formation._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {formation.thumbnail ? (
                      <img 
                        src={formation.thumbnail.startsWith('http') ? formation.thumbnail : `http://localhost:5000/${formation.thumbnail}`}
                        alt={formation.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className={`${
                        formation.type === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : formation.type === 'presentielle'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {formation.type === 'online' ? 'En ligne' : 
                         formation.type === 'presentielle' ? 'Présentielle' : 
                         formation.type === 'hybrid' ? 'Hybride' : formation.type}
                      </Badge>
                    </div>
                    {formation.level && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="text-xs">
                          {formation.level === 'beginner' ? 'Débutant' :
                           formation.level === 'intermediate' ? 'Intermédiaire' :
                           formation.level === 'advanced' ? 'Avancé' : formation.level}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                        {formation.title}
                      </h3>
                      {formation.difficulty && (
                        <div className="flex items-center ml-2">
                          {renderStars(formation.difficulty).slice(0, formation.difficulty)}
                        </div>
                      )}
                    </div>
                    
                    {formation.category && (
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {formation.category}
                      </p>
                    )}
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {formation.description}
                    </p>

                    {/* Formation details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formation.durationWeeks} semaines • {formation.estimatedHours}</span>
                      </div>
                      {formation.professors && formation.professors.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{formation.professors[0].name}</span>
                          {formation.professors.length > 1 && (
                            <span className="ml-1">+{formation.professors.length - 1} autre{formation.professors.length > 2 ? 's' : ''}</span>
                          )}
                        </div>
                      )}
                      {formation.maxStudents && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Max {formation.maxStudents} étudiants</span>
                        </div>
                      )}
                    </div>

                    {/* Rating and price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center text-yellow-500 mr-2">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {getAverageRating(formation.reviews)} ({formation.reviews?.length || 0})
                          </span>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formation.price} DT
                      </span>
                    </div>

                    {/* Tags */}
                    {formation.tags && formation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {formation.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {formation.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{formation.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action button */}
                    <Link to={`/formations/${formation._id}`}>
                      <Button className="w-full">
                        Voir les détails
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Contactez-nous pour discuter de vos besoins spécifiques en formation. 
            Nous pouvons créer des programmes sur mesure pour votre entreprise.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              Nous contacter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Formations;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Award,
  Star,
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    teachers: 20,
    courses: 32,
    experience: 10,
    users: 1200
  });
  const [latestFormations, setLatestFormations] = useState([]);
  const [testimonials] = useState([
    {
      id: 1,
      name: "Ahmed Ben Ali",
      role: "Développeur Web",
      content: "Excellente formation en développement web. Les instructeurs sont très compétents et le contenu est à jour.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      id: 2,
      name: "Fatma Trabelsi",
      role: "Designer UX/UI",
      content: "J'ai beaucoup appris grâce aux formations d'IPforma. L'approche pratique m'a permis de décrocher un emploi rapidement.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      id: 3,
      name: "Mohamed Sassi",
      role: "Data Analyst",
      content: "Formation complète et bien structurée. Je recommande vivement IPforma pour tous ceux qui veulent se former.",
      rating: 5,
      image: "/api/placeholder/60/60"
    }
  ]);

  useEffect(() => {
    fetchStats();
    fetchLatestFormations();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistics/platform');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLatestFormations = async () => {
    try {
      const response = await api.get('/formations');
      setLatestFormations(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching formations:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Développez vos <span className="text-yellow-400">compétences</span> avec IPforma
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8">
                Centre de formation professionnel offrant des formations de qualité 
                pour booster votre carrière et atteindre vos objectifs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/formations">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                    Découvrir nos formations
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg transform rotate-6"></div>
                <div className="relative bg-white rounded-lg p-8 shadow-2xl">
                  <div className="text-center">
                    <img src="../logo.png" alt="" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Formation de qualité</h3>
                    <p className="text-gray-600">Apprenez avec les meilleurs instructeurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stats.teachers}+</div>
              <div className="text-gray-600">Formateurs experts</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stats.courses}+</div>
              <div className="text-gray-600">Formations disponibles</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stats.experience}+</div>
              <div className="text-gray-600">Années d'expérience</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stats.users}+</div>
              <div className="text-gray-600">Étudiants formés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Formations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Dernières formations ajoutées
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos formations les plus récentes et restez à jour avec les dernières technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestFormations.map((formation) => (
              <Card key={formation._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {formation.thumbnail && formation.thumbnail ? (
                    <img 
                      src={`http://localhost:5000/${formation.thumbnail}`}
                      alt={formation.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {formation.type}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{formation.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{formation.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">{formation.price} DT</span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
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

          <div className="text-center mt-12">
            <Link to="/formations">
              <Button size="lg" variant="outline">
                Voir toutes les formations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Student Feedback Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos étudiants
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les témoignages de nos étudiants qui ont transformé leur carrière grâce à nos formations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Rejoignez la plus grande plateforme d'apprentissage aujourd'hui
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Commencez votre parcours d'apprentissage dès maintenant et transformez votre carrière 
            avec nos formations professionnelles de haute qualité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/formations">
              <Button variant="outline" size="lg" className="border-white text-blue-600  hover:bg-white hover:text-blue-600">
                Explorer les formations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


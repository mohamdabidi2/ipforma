import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Award, 
  BookOpen,
  CheckCircle,
  Star
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "Nous nous engageons à fournir une formation de la plus haute qualité avec des standards d'excellence."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Notre passion pour l'éducation et le développement professionnel guide tout ce que nous faisons."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Nous croyons en l'apprentissage collaboratif et en la création d'une communauté d'apprenants."
    },
    {
      icon: Award,
      title: "Innovation",
      description: "Nous adoptons les dernières technologies et méthodes pédagogiques pour un apprentissage optimal."
    }
  ];

  const team = [
    {
      name: "Dr. Ahmed Mansouri",
      role: "Directeur Général",
      description: "Expert en formation professionnelle avec plus de 15 ans d'expérience dans le domaine éducatif.",
      image: "/api/placeholder/300/300"
    },
    {
      name: "Fatma Ben Salem",
      role: "Directrice Pédagogique",
      description: "Spécialiste en ingénierie pédagogique et développement de programmes de formation innovants.",
      image: "/api/placeholder/300/300"
    },
    {
      name: "Mohamed Trabelsi",
      role: "Responsable Technique",
      description: "Expert en technologies éducatives et plateformes d'apprentissage en ligne.",
      image: "/api/placeholder/300/300"
    }
  ];

  const achievements = [
    { number: "500+", label: "Étudiants diplômés" },
    { number: "95%", label: "Taux de satisfaction" },
    { number: "20+", label: "Formateurs experts" },
    { number: "10", label: "Années d'expérience" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              À propos d'<span className="text-yellow-400">IPforma</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto">
              Centre de formation professionnel dédié à l'excellence éducative et au développement 
              des compétences pour un avenir professionnel réussi.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8 border-l-4 border-l-blue-600">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <Target className="h-12 w-12 text-blue-600 mr-4" />
                  <h2 className="text-3xl font-bold text-gray-900">Notre Mission</h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Fournir une formation professionnelle de haute qualité qui permet à nos étudiants 
                  d'acquérir les compétences nécessaires pour exceller dans leur domaine et contribuer 
                  au développement économique et social de la Tunisie.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 border-l-4 border-l-green-600">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <Eye className="h-12 w-12 text-green-600 mr-4" />
                  <h2 className="text-3xl font-bold text-gray-900">Notre Vision</h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Devenir le centre de formation de référence en Tunisie, reconnu pour l'excellence 
                  de ses programmes, l'innovation pédagogique et l'impact positif sur la carrière 
                  de nos diplômés.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Notre Histoire
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Fondé en 2015, IPforma est né de la vision de créer un centre de formation 
                  qui répond aux besoins réels du marché du travail tunisien. Nos fondateurs, 
                  experts dans leurs domaines respectifs, ont identifié un gap entre les 
                  compétences enseignées et celles demandées par les entreprises.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Depuis notre création, nous avons formé plus de 500 professionnels dans 
                  divers domaines, avec un taux de placement de 85% dans les 6 mois suivant 
                  la formation. Notre approche pratique et notre réseau de partenaires 
                  entreprises nous permettent d'offrir une formation alignée sur les réalités 
                  du marché.
                </p>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Formations certifiantes reconnues</span>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Formateurs experts du secteur</span>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Suivi personnalisé des étudiants</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="../lbg.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les principes qui guident notre approche pédagogique et notre engagement 
              envers l'excellence éducative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Nos Réalisations
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Des chiffres qui témoignent de notre engagement et de notre impact 
              dans le domaine de la formation professionnelle.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">
                  {achievement.number}
                </div>
                <div className="text-blue-100">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Contactez-nous pour découvrir comment nos formations peuvent transformer votre carrière.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="inline-block">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Nous contacter
              </button>
            </a>
            <a href="/formations" className="inline-block">
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                Voir nos formations
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;


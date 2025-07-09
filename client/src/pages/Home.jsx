import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Award,
  Star,
  ArrowRight,
  CheckCircle,
  Play,
  Building,
  User,
  Shield,
  Scissors
} from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    teachers: 20,
    courses: 75,
    experience: 8
  });
  const [latestFormations, setLatestFormations] = useState([]);
  const [testimonials] = useState([
    {
      id: 1,
      name: "محمد الحارثي",
      role: "أخصائي أمن سيبراني",
      content: "تدريب ممتاز في الأمن السيبراني. المدربون أكفاء للغاية والمحتوى محدث ومواكب لأحدث التهديدات والحلول الأمنية.",
      rating: 5,
      letter: "م",
      type: "passagers"
    },
    {
      id: 2,
      name: "شركة الحماية : Ultra",
      role: "مدير الأمن",
      content: "تدريب متميز لفريق الأمن. النهج المخصص للشركات ساعدنا في تطوير مهارات موظفينا في مجال الأمن والحماية بشكل فعال.",
      rating: 5,
      letter: "ش",
      type: "sociétés"
    },
    {
      id: 3,
      name: "سارة بن يوسف",
      role: "مصففة شعر محترفة",
      content: "لقد تعلمت الكثير بفضل تدريبات التجميل والتصفيف في IPforma. النهج العملي والتطبيقي سمح لي بفتح صالوني الخاص بنجاح.",
      rating: 5,
      letter: "س",
      type: "passagers"
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
      const formations = response.data.slice(0, 6);
      setLatestFormations(formations);
    } catch (error) {
      console.error('Error fetching formations:', error);
    }
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case 'sociétés':
        return {
          label: 'للشركات',
          icon: <Building className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'passagers':
        return {
          label: 'للأفراد',
          icon: <User className="h-4 w-4" />,
          color: 'bg-green-100 text-green-800'
        };
      default:
        return {
          label: type,
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  return (
    <div className="min-h-screen" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white animate-fade-in">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                طور <span className="text-yellow-400">مهاراتك</span> مع IPforma
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8">
                مركز تدريب مهني يقدم تدريبات عالية الجودة للشركات والأفراد لتعزيز المسيرة المهنية وتحقيق الأهداف بتميز ونجاح.
              </p>
              
              {/* Training Types Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover-scale transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <Building className="h-6 w-6 text-yellow-400 ml-2" />
                    <span className="font-semibold text-lg">تدريب الشركات</span>
                  </div>
                  <p className="text-blue-100 text-sm">برامج مخصصة للمؤسسات والشركات</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover-scale transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <User className="h-6 w-6 text-yellow-400 ml-2" />
                    <span className="font-semibold text-lg">تدريب الأفراد</span>
                  </div>
                  <p className="text-blue-100 text-sm">برامج شخصية للمتخصصين والأفراد</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-200">
                <Link to="/formations">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold hover-lift transition-all duration-300">
                    اكتشف تدريباتنا
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" style={{color:'black'}} className="border-white text-white hover:bg-white hover:text-blue-600 hover-lift transition-all duration-300">
                    طلب تدريب مخصص
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block animate-scale-in animation-delay-400">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg transform rotate-6 animate-pulse-custom"></div>
                <div className="relative bg-white rounded-lg p-8 shadow-2xl hover-lift">
                  <div className="text-center">
                    <img src="../logo.png" alt="IPforma" className="mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">تدريب عالي الجودة</h3>
                    <p className="text-gray-600">تعلم مع أفضل المدربين والخبراء</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 hover-scale transition-transform duration-300">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 animate-pulse-custom">{stats.teachers}+</div>
              <div className="text-gray-600">مدربون خبراء</div>
            </div>
            <div className="text-center animate-slide-up animation-delay-100">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 hover-scale transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 animate-pulse-custom">75+</div>
              <div className="text-gray-600">تدريبات متاحة</div>
            </div>
            <div className="text-center animate-slide-up animation-delay-200">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 hover-scale transition-transform duration-300">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 animate-pulse-custom">{stats.experience}+</div>
              <div className="text-gray-600">سنوات الخبرة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              نوعان من التدريب لتلبية احتياجاتك
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نقدم حلول تدريبية متخصصة للشركات والأفراد مع برامج مصممة خصيصاً لكل فئة
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Corporate Training */}
            <Card className="p-8 hover-lift transition-all duration-300 animate-slide-up border-2 border-blue-200 hover:border-blue-400">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mr-4">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">تدريب الشركات</h3>
                    <p className="text-blue-600 font-semibold">حلول مؤسسية متكاملة</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  برامج تدريبية مخصصة للشركات والمؤسسات لتطوير مهارات الفرق وتحسين الأداء المؤسسي العام.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">تدريب مخصص حسب احتياجات الشركة</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">إمكانية التدريب في مقر الشركة</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">شهادات معتمدة لجميع المشاركين</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">متابعة ما بعد التدريب</span>
                  </div>
                </div>
                
                <Link to="/formations?type=sociétés">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 hover-lift transition-all duration-300">
                    <Building className="ml-2 h-5 w-5" />
                    استكشف تدريبات الشركات
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Individual Training */}
            <Card className="p-8 hover-lift transition-all duration-300 animate-slide-up animation-delay-200 border-2 border-green-200 hover:border-green-400">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mr-4">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">تدريب الأفراد</h3>
                    <p className="text-green-600 font-semibold">تطوير مهني شخصي</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  برامج فردية للأشخاص الراغبين في تطوير مهاراتهم الشخصية والمهنية وتحقيق أهدافهم المهنية.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">تدريب شخصي مكثف</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">مرونة في المواعيد</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">متابعة فردية مع المدرب</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    <span className="text-gray-700">شهادة معتمدة شخصية</span>
                  </div>
                </div>
                
                <Link to="/formations?type=passagers">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 hover-lift transition-all duration-300">
                    <User className="ml-2 h-5 w-5" />
                    استكشف التدريبات الفردية
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Formations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              أحدث التدريبات المضافة
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اكتشف أحدث تدريباتنا المضافة للشركات والأفراد وابقَ على اطلاع بأحدث التقنيات والمهارات المطلوبة في السوق
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestFormations.map((formation, index) => {
              const typeInfo = getTypeInfo(formation.type);
              return (
                <Card key={formation._id} className="overflow-hidden hover-lift transition-all duration-300 animate-slide-up border-2 hover:border-blue-300" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {formation.thumbnail && formation.thumbnail ? (
                      <img 
                        src={`https://api.formation-ipforma.com/${formation.thumbnail}`}
                        alt={formation.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${typeInfo.color} shadow-lg flex items-center gap-1`}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{formation.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{formation.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {formation.price === 0 ? 'مجاني' : `${formation.price} د.ت`}
                        {formation.type === 'sociétés' && formation.price > 0 && (
                          <span className="text-sm text-gray-500 block">قابل للتفاوض</span>
                        )}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <Link to={`/formations/${formation._id}`}>
                      <Button className="w-full hover-lift transition-all duration-300">
                        {formation.type === 'sociétés' ? 'طلب عرض سعر' : 'عرض التفاصيل'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12 animate-slide-up animation-delay-400">
            <Link to="/formations">
              <Button size="lg" variant="outline" className="hover-lift transition-all duration-300">
                عرض جميع التدريبات
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Student Feedback Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              شهادات عملائنا
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اكتشف شهادات الشركات والأفراد الذين غيروا مسيرتهم المهنية وحققوا أحلامهم بفضل تدريباتنا المتميزة في مختلف المجالات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const typeInfo = getTypeInfo(testimonial.type);
              return (
                <Card key={testimonial.id} className="p-6 hover-lift transition-all duration-300 animate-slide-up border-2 hover:border-blue-300" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <Badge className={`${typeInfo.color} flex items-center gap-1`}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ml-4 text-white font-bold text-lg hover-scale transition-transform duration-300">
                        {testimonial.letter}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              انضم إلى أكبر منصة تعليمية اليوم
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              ابدأ رحلة التعلم الآن وحوّل مسيرتك المهنية مع تدريباتنا المهنية عالية الجودة والمعتمدة دوليًا للشركات والأفراد.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200">
              <Link to="/contact">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold hover-lift transition-all duration-300">
                  <Building className="ml-2 h-5 w-5" />
                  طلب تدريب للشركة
                </Button>
              </Link>
              <Link to="/formations">
                <Button style={{color:'black'}} variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 hover-lift transition-all duration-300">
                  <User className="ml-2 h-5 w-5"style={{color:'black'}} />
                  تدريب فردي
                </Button>
              </Link>
              <Link to="/formations">
                <Button style={{color:'black'}} variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 hover-lift transition-all duration-300">
                  استكشف جميع التدريبات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


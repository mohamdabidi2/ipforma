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
  ArrowRight,
  Building,
  User
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

  const getTypeInfo = (type) => {
    switch (type) {
      case 'sociétés':
        return {
          label: 'للشركات',
          icon: <Building className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800',
          description: 'تدريب مخصص للشركات والمؤسسات'
        };
      case 'passagers':
        return {
          label: 'للأفراد',
          icon: <User className="h-4 w-4" />,
          color: 'bg-green-100 text-green-800',
          description: 'تدريب مخصص للأفراد والمتخصصين'
        };
      default:
        return {
          label: type,
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800',
          description: 'تدريب عام'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600">جاري تحميل التدريبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
              <span className="text-yellow-400">تدريباتنا</span> المتميزة
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-up animation-delay-200">
              اكتشف  قائمة مختلف  التدريبات التكوينية بمعهدنا لتطوير الذات و اكتساب العديد من المهارات في مختلف المجالات حرصا على ضمان مسيرة مهنية ممتازة و الاندماج في السوق الشغل
            </p>
          </div>
        </div>
      </section>

      {/* Training Categories Info */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 animate-slide-up">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              فئات التدريب المتاحة
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              نقدم تدريبات متنوعة تشمل فئتين رئيسيتين لتلبية احتياجات مختلف الجمهور
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 hover-lift transition-all duration-300 animate-slide-up border-2 border-blue-200 hover:border-blue-400">
              <CardContent className="p-0 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">تدريبات للشركات</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  برامج تدريبية مخصصة للشركات والمؤسسات لتطوير مهارات الموظفين وتحسين الأداء المؤسسي
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">المميزات:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• تدريب مخصص حسب احتياجات الشركة</li>
                    <li>• إمكانية التدريب في مقر الشركة</li>
                    <li>• شهادات معتمدة لجميع المشاركين</li>
                    <li>• متابعة ما بعد التدريب</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover-lift transition-all duration-300 animate-slide-up animation-delay-200 border-2 border-green-200 hover:border-green-400">
              <CardContent className="p-0 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">تدريبات للأفراد</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  برامج فردية للأشخاص الراغبين في تطوير مهاراتهم الشخصية والمهنية وتحقيق أهدافهم
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">المميزات:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• تدريب شخصي مكثف</li>
                    <li>• مرونة في المواعيد</li>
                    <li>• متابعة فردية مع المدرب</li>
                    <li>• شهادة معتمدة شخصية</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover-lift transition-all duration-300 animate-slide-up animation-delay-400">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-purple-800 mb-3">Formation Accélérée</h3>
                <p className="text-purple-700 leading-relaxed">
                  برامج تدريبية مكثفة ومسرعة مدتها 6 أشهر للحصول على مهارات متقدمة في وقت قصير
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between animate-slide-up">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن تدريب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">المرشحات:</span>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 transition-all duration-300 hover:border-blue-400">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="sociétés">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      للشركات
                    </div>
                  </SelectItem>
                  <SelectItem value="passagers">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      للأفراد
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40 transition-all duration-300 hover:border-blue-400">
                  <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدم</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 transition-all duration-300 hover:border-blue-400">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-low">السعر تصاعدي</SelectItem>
                  <SelectItem value="price-high">السعر تنازلي</SelectItem>
                  <SelectItem value="duration">المدة</SelectItem>
                  <SelectItem value="rating">التقييم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count and type breakdown */}
          <div className="mt-4 animate-slide-up animation-delay-200">
            <div className="flex flex-wrap gap-4 items-center">
              <p className="text-gray-600">
                تم العثور على {filteredFormations.length} تدريب
              </p>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  <Building className="h-3 w-3 mr-1" />
                  {filteredFormations.filter(f => f.type === 'sociétés').length} للشركات
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  <User className="h-3 w-3 mr-1" />
                  {filteredFormations.filter(f => f.type === 'passagers').length} للأفراد
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formations Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFormations.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لم يتم العثور على تدريبات
              </h3>
              <p className="text-gray-600">
                حاول تعديل معايير البحث أو المرشحات للعثور على التدريب المناسب.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.reverse.map((formation, index) => {
                const typeInfo = getTypeInfo(formation.type);
                return (
                  <Card key={formation._id} className="overflow-hidden hover-lift transition-all duration-300 animate-slide-up border-2 hover:border-blue-300" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                      {formation.thumbnail ? (
                        <img 
                          src={formation.thumbnail.startsWith('http') ? formation.thumbnail : `https://api.formation-ipforma.com/${formation.thumbnail}`}
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
                      {formation.level && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="text-xs shadow-lg">
                            {formation.level === 'beginner' ? 'مبتدئ' :
                             formation.level === 'intermediate' ? 'متوسط' :
                             formation.level === 'advanced' ? 'متقدم' : formation.level}
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
                      
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {formation.description}
                      </p>

                      {/* Type-specific info */}
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                          {typeInfo.description}
                        </p>
                      </div>

                      {/* Formation details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{formation.durationWeeks} أسابيع • {formation.estimatedHours} ساعة</span>
                        </div>
                        {formation.professors && formation.professors.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 ml-2" />
                            <span>{formation.professors[0].name}</span>
                            {formation.professors.length > 1 && (
                              <span className="mr-1">+{formation.professors.length - 1} آخرين</span>
                            )}
                          </div>
                        )}
                        {formation.maxStudents && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 ml-2" />
                            <span>حد أقصى {formation.maxStudents} {formation.type === 'sociétés' ? 'مشارك' : 'طالب'}</span>
                          </div>
                        )}
                      </div>

                      {/* Rating and price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex items-center text-yellow-500 ml-2">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm text-gray-600 mr-1">
                              {getAverageRating(formation.reviews)} ({formation.reviews?.length || 0})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">
                            {formation.price === 0 ? 'مجاني' : `${formation.price} د.ت`}
                          </span>
                          {formation.type === 'sociétés' && formation.price > 0 && (
                            <div className="text-xs text-gray-500">قابل للتفاوض</div>
                          )}
                        </div>
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              لا تجد ما تبحث عنه؟
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              اتصل بنا لمناقشة احتياجاتك المحددة في التدريب. يمكننا إنشاء برامج مخصصة لشركتك أو مؤسستك أو تقديم تدريب فردي مخصص.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold hover-lift transition-all duration-300 animate-slide-up animation-delay-200">
                  <Building className="ml-2 h-5 w-5" />
                  تدريب للشركات
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold hover-lift transition-all duration-300 animate-slide-up animation-delay-300">
                  <User className="ml-2 h-5 w-5" />
                  تدريب فردي
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Formations;


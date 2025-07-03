import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Calendar,
  MapPin,
  Award,
  CheckCircle,
  Play,
  Download,
  ArrowRight,
  Target,
  TrendingUp,
  Zap,
  Globe,
  GraduationCap,
  Trophy,
  Sparkles,
  MessageCircle,
  Phone,
  Mail,
  Code,
  FileText,
  Building,
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
  const [activeTab, setActiveTab] = useState('overview');

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
      
      if (formation.type === 'sociétés') {
        alert('Demande de devis envoyée avec succès! Notre équipe vous contactera bientôt pour discuter des détails.');
      } else {
        alert('Demande d\'inscription envoyée avec succès!');
      }
      
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
        className={`h-5 w-5 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case 'sociétés':
        return {
          label: 'Formation pour Sociétés',
          icon: <Building className="h-5 w-5" />,
          color: 'bg-blue-100 text-blue-800',
          description: 'Formation destinée aux entreprises et organisations'
        };
      case 'passagers':
        return {
          label: 'Formation pour Passagers',
          icon: <User className="h-5 w-5" />,
          color: 'bg-green-100 text-green-800',
          description: 'Formation destinée aux particuliers et individus'
        };
      default:
        return {
          label: type,
          icon: <BookOpen className="h-5 w-5" />,
          color: 'bg-gray-100 text-gray-800',
          description: 'Formation générale'
        };
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600">جاري تحميل تفاصيل التدريب...</p>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
        <div className="text-center animate-fade-in">
          <BookOpen className="h-24 w-24 text-gray-400 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">التدريب غير موجود</h2>
          <p className="text-xl text-gray-600 mb-8">عذراً، لم نتمكن من العثور على التدريب المطلوب.</p>
          <Button 
            onClick={() => navigate('/formations')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg hover-lift"
          >
            العودة إلى التدريبات
          </Button>
        </div>
      </div>
    );
  }

  const typeInfo = getTypeInfo(formation.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      {/* Back button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/formations')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة إلى التدريبات
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="flex items-center mb-6">
                <Badge className={`${typeInfo.color} font-semibold text-lg px-4 py-2 shadow-lg flex items-center gap-2`}>
                  {typeInfo.icon}
                  {typeInfo.label}
                </Badge>
                {formation.level && (
                  <Badge variant="secondary" className="mr-3 text-lg px-4 py-2 shadow-lg">
                    {formation.level === 'beginner' ? 'مبتدئ' :
                     formation.level === 'intermediate' ? 'متوسط' :
                     formation.level === 'advanced' ? 'متقدم' : formation.level}
                  </Badge>
                )}
                {formation.formationCode && (
                  <Badge variant="outline" className="mr-3 text-sm px-3 py-1 bg-white/20 text-white border-white">
                    <Code className="h-3 w-3 ml-1" />
                    {formation.formationCode}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                {formation.title}
              </h1>
              
              {formation.category && (
                <p className="text-xl text-yellow-400 font-semibold mb-6">
                  {formation.category}
                </p>
              )}
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {formation.description}
              </p>

              {/* Type Description */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                <p className="text-blue-100 leading-relaxed">
                  {typeInfo.description}
                </p>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center mb-8">
                <div className="flex items-center ml-6">
                  {formation.difficulty && renderStars(formation.difficulty)}
                  <span className="text-lg font-semibold mr-2">
                    صعوبة: {formation.difficulty}/5
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-200">
                    ({formation.reviews?.length || 0} تقييم)
                  </span>
                </div>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-yellow-400 ml-3" />
                  <div>
                    <div className="text-sm text-blue-200">المدة</div>
                    <div className="font-semibold">{formation.durationWeeks} أسابيع • {formation.estimatedHours}</div>
                  </div>
                </div>
             
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-4xl font-bold text-yellow-400">
                  {formation.price === 0 ? 'مجاني' : `${formation.price} د.ت`}
                  {formation.type === 'sociétés' && (
                    <div className="text-sm text-blue-200 font-normal">
                      السعر قابل للتفاوض حسب حجم المجموعة
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Pre-inscription Status */}
              {checkingPreinscription ? (
                <div className="mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                    <span className="text-sm text-blue-100">جاري التحقق...</span>
                  </div>
                </div>
              ) : existingPreinscription ? (
                <div className="mb-4 p-4 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-300/30">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">
                        تم إرسال الطلب مسبقاً
                      </h4>
                      <p className="text-sm text-blue-100 mb-2">
                        لديك طلب تسجيل مسبق لهذا التدريب.
                      </p>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(existingPreinscription.status)}
                      </div>
                      {existingPreinscription.status === 'pending' && (
                        <p className="text-xs text-blue-200 mt-2">
                          يرجى انتظار تأكيد المركز.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <Button 
                onClick={handleEnrollment}
                size="lg" 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-10 py-4 rounded-full shadow-2xl hover-lift text-lg transition-all duration-300"
                disabled={enrolling || existingPreinscription || checkingPreinscription}
              >
                <GraduationCap className="ml-3 h-6 w-6" />
                {enrolling ? (
                  'جاري التسجيل...'
                ) : existingPreinscription ? (
                  'تم إرسال الطلب'
                ) : formation.type === 'sociétés' ? (
                  'طلب عرض سعر'
                ) : (
                  'سجل الآن'
                )}
              </Button>

              {existingPreinscription && (
                <p className="text-xs text-center text-blue-200 mt-4">
                  يمكنك إرسال طلب واحد فقط لكل تدريب.
                </p>
              )}
            </div>
            
            <div className="relative animate-scale-in animation-delay-400">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl overflow-hidden shadow-2xl hover-scale transition-transform duration-300">
                {formation.thumbnail && formation.thumbnail ? (
                  <img 
                    src={formation.thumbnail.startsWith('http') ? formation.thumbnail : `https://api.formation-ipforma.com/${formation.thumbnail}`}
                    alt={formation.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-24 w-24 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-gray-100 p-2 rounded-xl animate-slide-up">
              <TabsTrigger value="overview" className="text-lg font-semibold py-3 rounded-lg transition-all duration-300">نظرة عامة</TabsTrigger>
              <TabsTrigger value="curriculum" className="text-lg font-semibold py-3 rounded-lg transition-all duration-300">المنهج</TabsTrigger>
              <TabsTrigger value="instructors" className="text-lg font-semibold py-3 rounded-lg transition-all duration-300">المدربون</TabsTrigger>
              <TabsTrigger value="reviews" className="text-lg font-semibold py-3 rounded-lg transition-all duration-300">التقييمات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {/* Type-specific Information */}
                  <Card className="hover-lift animate-slide-up transition-all duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        {typeInfo.icon}
                        <span className="mr-3">معلومات التدريب</span>
                      </h3>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                        <p className="text-gray-700 leading-relaxed text-lg mb-4">
                          {typeInfo.description}
                        </p>
                        {formation.type === 'sociétés' && (
                          <div className="space-y-2">
                            <p className="text-blue-700 font-semibold">مميزات التدريب للشركات:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              <li>تدريب مخصص حسب احتياجات الشركة</li>
                              <li>إمكانية التدريب في مقر الشركة</li>
                              <li>شهادات معتمدة لجميع المشاركين</li>
                              <li>متابعة ما بعد التدريب</li>
                            </ul>
                          </div>
                        )}
                        {formation.type === 'passagers' && (
                          <div className="space-y-2">
                            <p className="text-green-700 font-semibold">مميزات التدريب الفردي:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              <li>تدريب شخصي مكثف</li>
                              <li>مرونة في المواعيد</li>
                              <li>متابعة فردية مع المدرب</li>
                              <li>شهادة معتمدة شخصية</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Objectives */}
                  <Card className="hover-lift animate-slide-up transition-all duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Target className="h-6 w-6 text-blue-600 ml-3" />
                        أهداف التدريب
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {formation.objectives}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Prerequisites */}
                  <Card className="hover-lift animate-slide-up animation-delay-100 transition-all duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <BookOpen className="h-6 w-6 text-blue-600 ml-3" />
                        المتطلبات المسبقة
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {formation.prerequisites}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card className="hover-lift animate-slide-up animation-delay-200 transition-all duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <MessageCircle className="h-6 w-6 text-blue-600 ml-3" />
                        وصف التدريب
                      </h3>
                      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        {formation.description}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Course Info */}
                  <Card className="hover-lift animate-slide-up animation-delay-300 transition-all duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">معلومات التدريب</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">النوع:</span>
                          <Badge className={typeInfo.color}>
                            {typeInfo.icon}
                            <span className="mr-1">{formation.type === 'sociétés' ? 'شركات' : 'أفراد'}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">المدة:</span>
                          <span className="font-semibold">{formation.durationWeeks} أسابيع</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">الساعات المقدرة:</span>
                          <span className="font-semibold">{formation.estimatedHours}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">المستوى:</span>
                          <span className="font-semibold">
                            {formation.level === 'beginner' ? 'مبتدئ' :
                             formation.level === 'intermediate' ? 'متوسط' :
                             formation.level === 'advanced' ? 'متقدم' : formation.level}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">مستوى الصعوبة:</span>
                          <div className="flex items-center">
                            {renderStars(formation.difficulty)}
                          </div>
                        </div>
                        {formation.formationCode && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">رمز التدريب:</span>
                            <span className="font-semibold font-mono">{formation.formationCode}</span>
                          </div>
                        )}
                        {formation.startDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">تاريخ البداية:</span>
                            <span className="font-semibold">
                              {new Date(formation.startDate).toLocaleDateString('ar-TN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  {formation.tags && formation.tags.length > 0 && (
                    <Card className="hover-lift animate-slide-up animation-delay-400 transition-all duration-300">
                      <CardContent className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">المواضيع</h3>
                        <div className="flex flex-wrap gap-2">
                          {formation.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-sm hover-scale transition-transform duration-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Contact */}
                  <Card className="hover-lift animate-slide-up animation-delay-500 transition-all duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">تحتاج مساعدة؟</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-blue-600 ml-3" />
                          <span className="text-gray-700">+216 95 606 361</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-blue-600 ml-3" />
                          <span className="text-gray-700">ipforma.sfax1@gmail.com</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/contact')}
                        className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg hover-lift transition-all duration-300"
                      >
                        اتصل بنا
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Benefits */}
                  <Card className="hover-lift animate-slide-up animation-delay-600 transition-all duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">ما ستحصل عليه</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                          <span className="text-gray-700">وصول مدى الحياة</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                          <span className="text-gray-700">شهادة إتمام</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                          <span className="text-gray-700">دعم فني</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                          <span className="text-gray-700">مواد تدريبية شاملة</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="animate-fade-in">
              <Card className="hover-lift transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                    <BookOpen className="h-6 w-6 text-blue-600 ml-3" />
                    منهج التدريب
                  </h3>
                  {formation.content && formation.content.length > 0 ? (
                    <div className="space-y-6">
                      {formation.content.map((module, index) => (
                        <div key={module._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-semibold text-gray-900">
                              الوحدة {module.order}: {module.title}
                            </h4>
                            <Badge variant="outline">
                              {module.lessons?.length || 0} درس
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {module.description}
                          </p>
                          {module.lessons && module.lessons.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="font-semibold text-gray-800">الدروس:</h5>
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div key={lesson._id} className="flex items-start bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold ml-3 mt-1">
                                      {lesson.order}
                                    </div>
                                    <div className="flex-1">
                                      <h6 className="font-medium text-gray-900 mb-1">{lesson.title}</h6>
                                      <p className="text-sm text-gray-600">{lesson.content}</p>
                                    
                                      {lesson.duration && (
                                        <span className="text-xs text-gray-500 mt-1 block">
                                          المدة: {lesson.duration}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 animate-fade-in">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">
                        سيتم إضافة تفاصيل المنهج قريباً. للمزيد من المعلومات، يرجى الاتصال بنا.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructors" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {formation.professors && formation.professors.length > 0 ? (
                  formation.professors.map((professor, index) => (
                    <Card key={professor._id} className="hover-lift animate-slide-up transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-8 text-center">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl hover-scale transition-transform duration-300">
                          {professor.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{professor.name}</h3>
                        <p className="text-blue-600 font-semibold mb-4">مدرب خبير</p>
                        <p className="text-gray-600 leading-relaxed">
                          {professor.bio}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 animate-fade-in">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      سيتم إضافة معلومات المدربين قريباً.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="animate-fade-in">
              <div className="space-y-8">
                {/* Rating Summary */}
                <Card className="hover-lift transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-blue-600 mb-4 animate-pulse-custom">
                          {getAverageRating(formation.reviews)}
                        </div>
                        <div className="flex items-center justify-center mb-4">
                          {renderStars(Math.round(getAverageRating(formation.reviews)))}
                        </div>
                        <p className="text-gray-600">
                          {formation.reviews?.length || 0} تقييم{formation.reviews?.length > 1 ? 'ات' : ''}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = formation.reviews?.filter(r => r.rating === rating).length || 0;
                          const percentage = formation.reviews?.length ? (count / formation.reviews.length) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-4">
                              <span className="text-sm text-gray-600 w-8">{rating} ⭐</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                {formation.reviews && formation.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {formation.reviews.map((review, index) => (
                      <Card key={index} className="hover-lift animate-slide-up transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 hover-scale transition-transform duration-300">
                                {review.studentName?.charAt(0) || 'ط'}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.studentName || 'طالب مجهول'}
                                </h4>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date ? new Date(review.date).toLocaleDateString('ar-TN') : 'منذ فترة'}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="hover-lift transition-all duration-300">
                    <CardContent className="p-12 text-center">
                      <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        لا توجد تقييمات بعد
                      </h3>
                      <p className="text-gray-600">
                        كن أول من يقيم هذا التدريب بعد إكماله!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float animation-delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <div className="flex items-center justify-center mb-8">
              <Sparkles className="h-8 w-8 text-yellow-400 ml-3 animate-pulse-custom" />
              <span className="text-yellow-400 font-bold text-xl">ابدأ رحلتك اليوم</span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="block">هل أنت مستعد</span>
              <span className="block text-yellow-400">للانطلاق؟</span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              {formation.type === 'sociétés' ? 
                'تدريب متخصص للشركات! اتصل بنا للحصول على عرض سعر مخصص لشركتك.' :
                formation.price === 0 ? 
                'تدريب مجاني! سجل الآن ولا تفوت هذه الفرصة الذهبية.' :
                'لا تفوت الفرصة! سجل الآن واحصل على خصم خاص للمسجلين الأوائل.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up animation-delay-200">
              <Button 
                onClick={handleEnrollment}
                size="lg" 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-10 py-5 rounded-full shadow-2xl hover-lift text-lg transition-all duration-300"
                disabled={enrolling || existingPreinscription || checkingPreinscription}
              >
                <Trophy className="ml-3 h-6 w-6" />
                {enrolling ? (
                  'جاري التسجيل...'
                ) : existingPreinscription ? (
                  'تم إرسال الطلب'
                ) : formation.type === 'sociétés' ? (
                  'طلب عرض سعر للشركة'
                ) : formation.price === 0 ? (
                  'سجل مجاناً الآن'
                ) : (
                  'سجل الآن واحصل على خصم 20%'
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                style={{color:'black'}}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold px-10 py-5 rounded-full backdrop-blur-sm text-lg hover-lift transition-all duration-300"
                onClick={() => navigate('/contact')}
              >
                <MessageCircle color='black' className="ml-3 h-6 w-6" />
                تحدث مع مستشار
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormationDetails;
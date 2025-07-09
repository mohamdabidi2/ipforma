import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  FileText,
  Building
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('تم إرسال الرسالة بنجاح! سنرد عليك في أقرب وقت ممكن.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "العنوان الرئيسي",
      details: [
        "صفاقس باب الجبلي عمارة رباط المدينة بجانب صفاقس 2000 قبالة الكاس المدرج",
        " 'أ' أو 'د'، الطابق الخامس، مكتب رقم 509"
      ],
      color: "text-blue-600"
    },
    {
      icon: MapPin,
      title: "العنوان الفرعي",
      details: [
        "شارع 5 أوت صفاقس نهج 19 جويلية جانب نزل بيزنس",
        "في عمارة العفاس الطابق الثاني فوق مركز الأعمال"
      ],
      color: "text-green-600"
    },
    {
      icon: Phone,
      title: "الهاتف",
      details: [
        "74.400.692",
        "95.606.361", 
        "55.547.993",
        "29.938.313",
        "74.206.216",
        "94.740.222",
        "94.558.222"
      ],
      color: "text-purple-600"
    },
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      details: ["ipforma.sfax1@gmail.com","ipforma.sfax@gmail.com"],
      color: "text-red-600"
    },
    {
      icon: Clock,
      title: "ساعات العمل",
      details: [
        "الاثنين - الجمعة: 8:00 صباحًا - 5:00 مساءً", 
        "السبت: 8:00 صباحًا - 2:00 ظهرًا"
      ],
      color: "text-orange-600"
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-blue-600" },
    { icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { icon: Instagram, href: "#", color: "hover:text-pink-600" },
    { icon: Linkedin, href: "#", color: "hover:text-blue-700" }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
              اتصل <span className="text-yellow-400">بنا</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-up animation-delay-200">
              نحن هنا للإجابة على جميع أسئلتك ودعمك في مسيرتك التدريبية المهنية. تواصل معنا وابدأ رحلة التميز.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-slide-up">
              <Card className="hover-lift">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    أرسل لنا رسالة
                  </h2>
                  <form action="https://formsubmit.co/ipforma.sfax1@gmail.com" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="اسمك الكامل"
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          البريد الإلكتروني 
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          الهاتف*
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+216 XX XXX XXX"
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          الموضوع *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="موضوع رسالتك"
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        الرسالة *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="صف طلبك بالتفصيل..."
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full hover-lift transition-all duration-300" 
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                          جاري الإرسال...
                        </div>
                      ) : (
                        <>
                          إرسال الرسالة
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8 animate-slide-up animation-delay-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  معلومات الاتصال
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <Card key={index} className="hover-lift transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardContent className="p-6">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 ${info.color} ml-4`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                                {info.title}
                              </h3>
                              {info.details.map((detail, idx) => (
                                <p key={idx} className="text-gray-600 mb-2 leading-relaxed">
                                  {detail}
                                </p>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Company Registration Info */}
              <div className="grid grid-cols-1 gap-6">
                <Card className="hover-lift transition-all duration-300 animate-slide-up animation-delay-600">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-blue-600 ml-4">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                          المعرف الجبائي
                        </h3>
                        <p className="text-gray-600 font-mono text-lg" style={{direction:"ltr",textAlign:"right"}}>1516179/A/A/P/000</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift transition-all duration-300 animate-slide-up animation-delay-700">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-green-600 ml-4">
                        <Building className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                          رقم التسجيل
                        </h3>
                        <p className="text-gray-600 font-mono text-lg">61-382-20</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              الأسئلة الشائعة
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ابحث بسرعة عن إجابات للأسئلة الأكثر شيوعًا حول تدريباتنا وخدماتنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover-lift transition-all duration-300 animate-slide-up animation-delay-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  كيف يمكنني التسجيل في دورة تدريبية؟
                </h3>
                <p className="text-gray-600">
                  يمكنك التسجيل مباشرة عبر الإنترنت بالنقر على 'تسجيل' في صفحة الدورة التدريبية التي تهمك، أو عن طريق الاتصال بنا عبر الهاتف أو زيارة مكاتبنا.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-all duration-300 animate-slide-up animation-delay-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  هل تقدمون تدريبات مخصصة للشركات؟
                </h3>
                <p className="text-gray-600">
                  نعم، نقوم بتطوير برامج تدريب مخصصة لتلبية الاحتياجات المحددة للشركات والمجموعات مع إمكانية التدريب في موقع العمل.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-all duration-300 animate-slide-up animation-delay-300">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  هل التدريبات معتمدة؟
                </h3>
                <p className="text-gray-600">
                  جميع تدريباتنا تمنح شهادة إتمام تدريب معترف بها محليًا ودوليًا. بعض التدريبات تقدم أيضًا شهادات مهنية متخصصة.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-all duration-300 animate-slide-up animation-delay-400">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  ما هي طرق الدفع المقبولة؟
                </h3>
                <p className="text-gray-600">
                  نقبل الدفع عن طريق التحويل المصرفي، الشيك، والنقد. تتوفر أيضًا تسهيلات الدفع على أقساط للدورات طويلة المدى.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;


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
  Star,
  FileText,
  Building
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: "التميز",
      description: "نلتزم بتقديم تدريب بأعلى جودة وفقًا لمعايير التميز العالمية."
    },
    {
      icon: Heart,
      title: "الشغف",
      description: "شغفنا بالتعليم والتطوير المهني يوجه كل ما نقوم به من أجل نجاحكم."
    },
    {
      icon: Users,
      title: "التعاون",
      description: "نؤمن بالتعلم التعاوني وإنشاء مجتمع متفاعل من المتعلمين والخبراء."
    },
    {
      icon: Award,
      title: "الابتكار",
      description: "نعتمد أحدث التقنيات والأساليب التعليمية المبتكرة لتحقيق أفضل تعلم."
    }
  ];

  const team = [
    {
      name: "د. أحمد منصوري",
      role: "المدير العام",
      description: "خبير في التدريب المهني مع أكثر من 15 عامًا من الخبرة في المجال التعليمي والتطوير المؤسسي.",
      image: "/api/placeholder/300/300",
      letter: "A"
    },
    {
      name: "فاطمة بن سالم",
      role: "المديرة التعليمية",
      description: "متخصصة في الهندسة التعليمية وتطوير برامج التدريب المبتكرة والمناهج الحديثة.",
      image: "/api/placeholder/300/300",
      letter: "F"
    },
    {
      name: "محمد طرابلسي",
      role: "المسؤول التقني",
      description: "خبير في التقنيات التعليمية ومنصات التعلم الإلكتروني والحلول الرقمية المتطورة.",
      image: "/api/placeholder/300/300",
      letter: "M"
    }
  ];

  const achievements = [
    { number: "2000+", label: "طلاب متخرجون" },
    { number: "95%", label: "نسبة الرضا" },
    { number: "20+", label: "مدربون خبراء" },
    { number: "8+", label: "سنوات الخبرة" }
  ];

  return (
    <div className="min-h-screen" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-slide-up">
               <span className="text-yellow-400">IPforma</span>
            </h1>
            <p style={{fontSize:"30px", background:"red",color:"white"}} className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto animate-slide-up animation-delay-200">
             مسجل بوزارة التكوين المهني و التشغيل تحت عدد 61/382/20 
            </p>
            <br />
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto animate-slide-up animation-delay-200">
              معهد تكوين و تدريب مهني مخصص للتميز التعليمي وتطوير المهارات لبناء مستقبل مهني ناجح ومشرق.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8 border-r-4 border-r-blue-600 hover-lift animate-slide-up">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <Target className="h-12 w-12 text-blue-600 ml-4" />
                  <h2 className="text-3xl font-bold text-gray-900">مهمتنا</h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  توفير تدريب مهني عالي الجودة يمكّن طلابنا من اكتساب المهارات اللازمة للتميز في مجالهم والمساهمة في التنمية الاقتصادية والاجتماعية لتونس. مهمتنا العامة هي توجيه المرشحين نحو التدريب المناسب الذي يتماشى مع مستواهم الأكاديمي وعمرهم واحتياجاتهم وحتى مستقبلهم المهني.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 border-r-4 border-r-green-600 hover-lift animate-slide-up animation-delay-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <Eye className="h-12 w-12 text-green-600 ml-4" />
                  <h2 className="text-3xl font-bold text-gray-900">رؤيتنا</h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  أن نصبح مركز التدريب المرجعي في تونس، المعترف به لتميز برامجه، والابتكار التربوي، والتأثير الإيجابي على المسار المهني لخريجينا. نحن معهد تكوين خاص مستمر وأساسي نقبل جميع المستويات الدراسية ونسعى لتحقيق التميز في كل ما نقدمه.
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
            <div className="animate-slide-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                قصتنا
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  تأسست IPforma في عام 2017، وُلدت من رؤية إنشاء مركز تدريب يلبي الاحتياجات الحقيقية لسوق العمل التونسي. حدد مؤسسونا، الخبراء في مجالاتهم، فجوة بين المهارات التي يتم تدريسها وتلك التي تطلبها الشركات.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  منذ تأسيسنا، قمنا بتدريب أكثر من 2000 محترف في مجالات مختلفة، بمعدل توظيف 85% في غضون 6 أشهر بعد التدريب. يتيح لنا نهجنا العملي وشبكة شركائنا من الشركات تقديم تدريب يتماشى مع واقع السوق.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  تدريباتنا تتكون من فئتين رئيسيتين: برامج مخصصة للشركات وبرامج فردية للأشخاص الراغبين في تطوير مهاراتهم الشخصية والمهنية.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center animate-slide-up animation-delay-300">
                    <CheckCircle className="h-6 w-6 text-green-600 ml-3" />
                    <span className="text-gray-700">تدريبات معتمدة ومعترف بها دوليًا</span>
                  </div>
                  <div className="flex items-center animate-slide-up animation-delay-400">
                    <CheckCircle className="h-6 w-6 text-green-600 ml-3" />
                    <span className="text-gray-700">مدربون خبراء ومتخصصون في القطاع</span>
                  </div>
                  <div className="flex items-center animate-slide-up animation-delay-2000">
                    <CheckCircle className="h-6 w-6 text-green-600 ml-3" />
                    <span className="text-gray-700">متابعة شخصية ودعم مستمر للطلاب</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in animation-delay-600">
              <div className="aspect-square bg-gradient-to-br from-blue-2000 to-purple-600 rounded-lg hover-scale">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="../lbg.png" alt="IPforma" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              قيمنا الأساسية
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              المبادئ التي توجه نهجنا التعليمي والتزامنا بالتميز والجودة في كل ما نقدمه
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center p-6 hover-lift transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 hover-scale">
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
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              إنجازاتنا المتميزة
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              أرقام تشهد على التزامنا وتأثيرنا الإيجابي في مجال التدريب المهني والتطوير
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2 animate-pulse-custom">
                  {achievement.number}
                </div>
                <div className="text-blue-100">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Registration Info */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 hover-lift animate-slide-up">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <FileText className="h-8 w-8 text-blue-600 ml-3" />
                  <h3 className="text-xl font-bold text-gray-900">المعرف الجبائي</h3>
                </div>
                <p className="text-lg text-gray-700 font-mono" style={{direction:"ltr"}}>1516179/A/A/P/000</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover-lift animate-slide-up animation-delay-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <Building className="h-8 w-8 text-green-600 ml-3" />
                  <h3 className="text-xl font-bold text-gray-900">رقم التسجيل</h3>
                </div>
                <p className="text-lg text-gray-700 font-mono">61-382-20</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              هل أنت مستعد لبدء رحلتك؟
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              اتصل بنا لمعرفة كيف يمكن لتدريباتنا المتميزة أن تحول مسيرتك المهنية وتفتح لك آفاقًا جديدة من النجاح والتميز.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200">
              <a href="/contact" className="inline-block">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover-lift">
                  اتصل بنا
                </button>
              </a>
              <a href="/formations" className="inline-block">
                <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover-lift">
                  شاهد تدريباتنا
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;


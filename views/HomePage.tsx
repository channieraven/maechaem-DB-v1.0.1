import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TreeDeciduous, 
  Map, 
  BarChart3, 
  Shield, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Smartphone,
  Share,
  X
} from 'lucide-react';

interface HomePageProps {
  onLoginClick?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  const { login, isLoading } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  // Detect iOS Safari — computed once; these values never change during the component lifecycle
  const isIOS = React.useMemo(
    () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    []
  );
  const isInStandaloneMode = React.useMemo(
    () =>
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches,
    []
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };
    const installedHandler = () => setShowInstallButton(false);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // Show iOS install banner when running in Safari on iOS and not yet installed
    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('ios-install-banner-dismissed');
      if (!dismissed) {
        setShowIOSBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [isIOS, isInStandaloneMode]);

  const handleDismissIOSBanner = () => {
    setShowIOSBanner(false);
    localStorage.setItem('ios-install-banner-dismissed', '1');
  };

  // Show the iOS banner and clear any previous dismissal so users can re-read the instructions
  const handleShowIOSBanner = () => {
    localStorage.removeItem('ios-install-banner-dismissed');
    setShowIOSBanner(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <TreeDeciduous className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-sm sm:text-lg md:text-xl tracking-tight text-gray-900 leading-tight whitespace-nowrap">ระบบบันทึกข้อมูลรายแปลง</span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">สำนักวิจัยและพัฒนาการป่าไม้</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showInstallButton && (
              <button
                onClick={handleInstall}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-lg shadow-green-600/20 flex items-center gap-1 md:gap-2 whitespace-nowrap"
              >
                <Smartphone size={14} className="w-3 h-3 md:w-4 md:h-4" />
                ติดตั้งแอพ
              </button>
            )}
            {isIOS && !isInStandaloneMode && (
              <button
                onClick={handleShowIOSBanner}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-lg shadow-green-600/20 flex items-center gap-1 md:gap-2 whitespace-nowrap"
              >
                <Smartphone size={14} className="w-3 h-3 md:w-4 md:h-4" />
                ติดตั้งแอพ
              </button>
            )}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-lg shadow-gray-900/20 flex items-center gap-1 md:gap-2 whitespace-nowrap"
            >
              {isLoading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
              <ArrowRight size={16} className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* iOS Install Banner */}
      {showIOSBanner && (
        <div className="w-full bg-green-700 text-white px-4 py-3 flex items-start gap-3 z-40">
          <div className="flex-shrink-0 mt-0.5">
            <Smartphone size={20} className="text-green-200" />
          </div>
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-semibold mb-1">ติดตั้งแอพบน iPhone / iPad</p>
            <p className="text-green-100 text-xs">
              แตะ <span className="inline-flex items-center gap-0.5 font-semibold text-white">
                <Share size={13} className="inline" /> แชร์
              </span>{' '}
              ในแถบเมนูของ Safari แล้วเลือก{' '}
              <span className="font-semibold text-white">"เพิ่มไปที่หน้าจอโฮม"</span>{' '}
              เพื่อติดตั้งแอพบนหน้าจอของคุณ
            </p>
          </div>
          <button
            onClick={handleDismissIOSBanner}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="ปิด"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            ระบบฐานข้อมูลอย่างเป็นทางการ
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-tight">
            ร่วมอนุรักษ์ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">ร่วมพัฒนาป่าอเนกประสงค์แม่แจ่ม</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            แพลตฟอร์มดิจิทัลครบวงจรสำหรับนักวิจัยและเจ้าหน้าที่ป่าไม้ เพื่อติดตาม วิเคราะห์ และบริหารจัดการข้อมูลต้นไม้ในพื้นที่อำเภอแม่แจ่ม จังหวัดเชียงใหม่
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg shadow-xl shadow-green-600/20 transition-all transform hover:-translate-y-1"
            >
              เข้าถึงฐานข้อมูล
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-lg transition-all"
            >
              เรียนรู้เพิ่มเติม
            </a>
            {showInstallButton && (
              <button
                onClick={handleInstall}
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Smartphone size={20} />
                ติดตั้งแอพบนโทรศัพท์
              </button>
            )}
            {isIOS && !isInStandaloneMode && (
              <button
                onClick={handleShowIOSBanner}
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Smartphone size={20} />
                ติดตั้งแอพบน iPhone / iPad
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">เครื่องมือทรงพลังสำหรับนักวิจัย</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">ทุกสิ่งที่คุณต้องการเพื่อการจัดการข้อมูลป่าไม้อย่างมีประสิทธิภาพและแม่นยำ</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="w-6 h-6 text-blue-600" />,
                title: "บันทึกข้อมูลครบถ้วน",
                desc: "ติดตามรายละเอียดชนิดพันธุ์ การเติบโต และสถานะสุขภาพของต้นไม้ พร้อมรองรับพืชหลากหลายประเภท"
              },
              {
                icon: <Map className="w-6 h-6 text-green-600" />,
                title: "แผนที่ภูมิสารสนเทศ",
                desc: "แผนที่แบบโต้ตอบพร้อมระบบติดตามพิกัด เพื่อแสดงตำแหน่งแปลงและกระจายตัวของต้นไม้"
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
                title: "การวิเคราะห์ข้อมูล",
                desc: "สถิติและการแสดงผลข้อมูลแบบเรียลไทม์ ทั้งความหนาแน่นของป่า ความหลากหลายทางชีวภาพ และแนวโน้มการเติบโต"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed break-words">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Privacy & Transparency */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
                <Shield size={14} />
                ความเป็นส่วนตัวต้องมาก่อน
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">ความโปร่งใสในการใช้ข้อมูล</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                เราให้ความสำคัญกับความเป็นส่วนตัวและมุ่งมั่นที่จะปกป้องข้อมูลส่วนบุคคลของคุณ
              </p>
              
              <div className="space-y-4">
                {[
                  "การยืนยันตัวตนสำหรับนักวิจัยที่ได้รับอนุญาต",
                  "การควบคุมการเข้าถึงตามบทบาท (ผู้ดูแลระบบ, นักวิจัย)",
                  "การจัดการเซสชันที่ปลอดภัย",
                  "ไม่มีการแบ่งปันข้อมูลส่วนบุคคลกับบุคคลที่สาม"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Users className="text-gray-900" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">การขอใช้ข้อมูลผู้ใช้</h3>
                  <p className="text-sm text-gray-500">เหตุผลที่เราต้องการข้อมูลของคุณ</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">อีเมลและชื่อ:</strong> ใช้เพื่อสร้างโปรไฟล์ผู้ใช้และระบุตัวตนของคุณในระบบ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <TreeDeciduous className="text-green-400 h-5 w-5" />
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base">ระบบบันทึกข้อมูลรายแปลง</span>
                <span className="text-[10px] text-gray-400">สำนักวิจัยและพัฒนาการป่าไม้</span>
              </div>
            </div>
            <div className="flex gap-6 text-xs text-gray-400">
              <a href="mailto:support@maechaem-tree-db.com" className="hover:text-white transition-colors">ติดต่อฝ่ายสนับสนุน</a>
            </div>
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} ระบบบันทึกข้อมูลรายแปลง สำนักวิจัยและพัฒนาการป่าไม้
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle, { useTheme } from './components/ThemeToggle';
import LanguagePopup from './components/LanguagePopup';
import { useLanguage } from './i18n/LanguageContext';

const COPY = {
  en: { heading: "Ready to transform your life,\none at a time until Boston\nis a better place?", home: "I have a home", help: "I need help", assess: "Assess Your Situation" },
  es: { heading: "¿Listo para transformar tu vida,\nuna vez a la vez hasta que Boston\nsea un lugar mejor?", home: "Tengo una casa", help: "Necesito ayuda", assess: "Evalúa Tu Situación" },
  zh: { heading: "准备好改变您的生活，\n一步一步让波士顿\n变得更美好？", home: "我有房子", help: "我需要帮助", assess: "评估您的情况" },
  hi: { heading: "क्या आप जीवन बदलने के लिए तैयार हैं,\nएक कदम एक समय बोस्टन को\nबेहतर बनाने के लिए?", home: "मेरे पास घर है", help: "मुझे मदद चाहिए", assess: "अपनी स्थिति का आकलन करें" },
  fr: { heading: "Prêt à transformer votre vie,\nune étape à la fois jusqu'à ce que\nBoston devienne meilleur?", home: "J'ai une maison", help: "J'ai besoin d'aide", assess: "Évaluez Votre Situation" },
  ar: { heading: "هل أنت مستعد لتغيير حياتك،\nخطوة بخطوة حتى تصبح بوسطن\nمكانًا أفضل؟", home: "لدي منزل", help: "أحتاج مساعدة", assess: "تقييم وضعك" },
}

const FadeIn = ({ children, delay = 0, duration = 1000, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div className={`transition-opacity ease-out ${className} ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDuration: `${duration}ms` }}>
      {children}
    </div>
  );
};

const AnimatedHeading = ({ text }) => {
  const lines = text.split('\n');
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 200);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-8 text-center" style={{ letterSpacing: '-0.04em', color: 'white' }}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="block overflow-hidden">
          {line.split('').map((char, charIndex) => (
            <span key={charIndex} style={{
              display: 'inline-block',
              transition: 'opacity 500ms ease-out, transform 500ms ease-out',
              transitionDelay: `${lineIndex * line.length * 30 + charIndex * 30}ms`,
              opacity: isAnimating ? 1 : 0,
              transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
            }}>
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </div>
      ))}
    </h1>
  );
};

export default function App() {
  const { theme, toggle } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';
  const copy = COPY[lang] || COPY.en;

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans bg-black">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: isDark ? 'brightness(0.5)' : 'brightness(0.75)' }}>
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
      </video>

      {/* Light-mode tint overlay */}
      {!isDark && <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'rgba(200,220,255,0.18)' }} />}

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Navbar */}
        <nav className="px-6 md:px-12 lg:px-16 pt-6">
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.35)',
            borderRadius: '0.75rem', padding: '0.5rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>BUHHS</div>

            <div className="hidden md:flex items-center gap-8">
              {["Story", "Impact", "Partners", "Contact"].map((item) => (
                <a key={item} href="#" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                >{item}</a>
              ))}
              <Link to="/evacuation" style={{ textDecoration: 'none', background: '#DC2626', color: '#fff', borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
              >🚨 Evacuate</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ThemeToggle theme={theme} onToggle={toggle} />
              <LanguagePopup />
            </div>
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 pb-12">
          <div className="max-w-4xl flex flex-col items-center">
            <AnimatedHeading text={copy.heading} />
            <FadeIn delay={1200} duration={1000} className="flex flex-wrap gap-6 justify-center mt-4">
              <button className="bg-white text-black px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 scale-105 hover:scale-110 active:scale-95">
                {copy.home}
              </button>
              <button className="bg-red-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 scale-105 hover:scale-110 active:scale-95 shadow-lg shadow-red-600/20">
                {copy.help}
              </button>
              <Link to="/assessment" style={{ textDecoration: 'none' }}>
                <button className="px-10 py-4 rounded-lg font-semibold transition-all duration-300 scale-105 hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  {copy.assess}
                </button>
              </Link>
            </FadeIn>
          </div>
        </main>
      </div>
    </div>
  );
}

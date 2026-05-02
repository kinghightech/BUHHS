import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle, { useTheme } from './components/ThemeToggle';
import LanguagePopup from './components/LanguagePopup';

// FadeIn component: A wrapper that starts with opacity: 0 and transitions to opacity: 1 
// after a configurable delay (ms) using a setTimeout + React state.
const FadeIn = ({ children, delay = 0, duration = 1000, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-opacity ease-out ${className} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// AnimatedHeading component: Splits text by \n into lines, then each line into individual characters.
const AnimatedHeading = ({ text, initialDelay = 200, charDelay = 30 }) => {
  const lines = text.split('\n');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-8 text-center" style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, lineIndex) => {
        const lineChars = line.split('');
        return (
          <div key={lineIndex} className="block overflow-hidden">
            {lineChars.map((char, charIndex) => {
              const delay = (lineIndex * 20 * charDelay) + (charIndex * charDelay);
              const displayChar = char === ' ' ? '\u00A0' : char;
              
              const style = {
                display: 'inline-block',
                transition: `opacity 500ms ease-out, transform 500ms ease-out`,
                transitionDelay: `${delay}ms`,
                opacity: isAnimating ? 1 : 0,
                transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
              };

              return (
                <span key={charIndex} style={style}>
                  {displayChar}
                </span>
              );
            })}
          </div>
        );
      })}
    </h1>
  );
};

export default function App() {
  const { theme, toggle } = useTheme();
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans bg-black">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="px-6 md:px-12 lg:px-16 pt-6">
          <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
            <div className="text-2xl font-semibold tracking-tight cursor-pointer">BUHHS</div>
            
            <div className="hidden md:flex items-center gap-8">
              {["Story", "Impact", "Partners", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-white/90 hover:text-gray-300 transition-colors"
                >
                  {item}
                </a>
              ))}
              <Link
                to="/evacuation"
                style={{ textDecoration: 'none', background: '#DC2626', color: '#fff', borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
              >
                🚨 Evacuate
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={toggle} />
              <LanguagePopup />
            </div>
          </div>
        </nav>

        {/* Hero Content - Centered */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 pb-12">
          <div className="max-w-4xl flex flex-col items-center">
            <AnimatedHeading text={"Ready to transform your life,\none at a time until Boston\nis a better place?"} />
            
            <FadeIn delay={1200} duration={1000} className="flex flex-wrap gap-6 justify-center mt-4">
              <button 
                className="bg-white text-black px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 scale-105 hover:scale-110 active:scale-95"
              >
                I have a home
              </button>
              <button 
                className="bg-red-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 scale-105 hover:scale-110 active:scale-95 shadow-lg shadow-red-600/20"
              >
                I need help
              </button>
            </FadeIn>
          </div>
        </main>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';

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
// Each character is an inline-block <span> with CSS transitions on opacity and transform (translateX).
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

const AuthScreen = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-6">
      <div className="liquid-glass border border-white/20 p-8 rounded-2xl w-full max-w-md">
        <div className="mb-8">
          <div className="text-2xl font-semibold tracking-tight mb-2">BUHHS</div>
          <h2 className="text-3xl font-normal mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-400">{isLogin ? 'Enter your details to access your account' : 'Join the BUHHS community'}</p>
        </div>
        
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••"
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Confirm Password</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}
          
          <button className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-white hover:underline underline-offset-4"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
          <button 
            onClick={onBack}
            className="mt-8 text-sm text-gray-500 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showAuth, setShowAuth] = useState(false);

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

      {showAuth ? (
        <AuthScreen onBack={() => setShowAuth(false)} />
      ) : (
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
              </div>

              <button 
                onClick={() => setShowAuth(true)}
                className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Sign In
              </button>
            </div>
          </nav>

          {/* Hero Content - Centered */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 pb-12">
            <div className="max-w-4xl flex flex-col items-center">
              <AnimatedHeading text={"Ready to transform your life,\none at a time until Boston\nis a better place?"} />
              
              <FadeIn delay={1200} duration={1000} className="flex flex-wrap gap-6 justify-center mt-4">
                <button 
                  onClick={() => setShowAuth(true)}
                  className="bg-white text-black px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 scale-105 hover:scale-110 active:scale-95"
                >
                  I have a home
                </button>
                <button 
                  onClick={() => setShowAuth(true)}
                  className="bg-red-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 scale-105 hover:scale-110 active:scale-95 shadow-lg shadow-red-600/20"
                >
                  I need help
                </button>
              </FadeIn>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
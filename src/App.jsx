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

  let globalCharIndex = 0;

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4" style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, lineIndex) => {
        const lineChars = line.split('');
        const lineResult = (
          <div key={lineIndex} className="block overflow-hidden">
            {lineChars.map((char, charIndex) => {
              const delay = (lineIndex * line.length * charDelay) + (charIndex * charDelay);
              const displayChar = char === ' ' ? '\u00A0' : char;
              
              const style = {
                display: 'inline-block',
                transition: `opacity 500ms ease-out, transform 500ms ease-out`,
                transitionDelay: `${delay}ms`,
                opacity: isAnimating ? 1 : 0,
                transform: isAnimating ? 'translateX(0)' : 'translateX(-18px)',
              };

              return (
                <span key={charIndex} style={style}>
                  {displayChar}
                </span>
              );
            })}
          </div>
        );
        return lineResult;
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
          <div className="text-2xl font-semibold tracking-tight mb-2">VEX</div>
          <h2 className="text-3xl font-normal mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-400">{isLogin ? 'Enter your details to access your account' : 'Join the VEX community'}</p>
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
              <div className="text-2xl font-semibold tracking-tight cursor-pointer">VEX</div>
              
              <div className="hidden md:flex items-center gap-8">
                {["Story", "Investing", "Building", "Advisory"].map((item) => (
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
                Start a Chat
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <main className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
            <div className="lg:grid lg:grid-cols-2 lg:items-end">
              {/* Left Column */}
              <div className="mb-12 lg:mb-0">
                <AnimatedHeading text={"Shaping tomorrow\nwith vision and action."} />
                
                <FadeIn delay={800} duration={1000}>
                  <p className="text-base md:text-lg text-gray-300 mb-8 max-w-lg">
                    We back visionaries and craft ventures that define what comes next.
                  </p>
                </FadeIn>

                <FadeIn delay={1200} duration={1000} className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setShowAuth(true)}
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Start a Chat
                  </button>
                  <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-300">
                    Explore Now
                  </button>
                </FadeIn>
              </div>

              {/* Right Column */}
              <div className="flex items-end justify-start lg:justify-end">
                <FadeIn delay={1400} duration={1000}>
                  <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                    <span className="text-lg md:text-xl lg:text-2xl font-light tracking-wide">
                      Investing. Building. Advisory.
                    </span>
                  </div>
                </FadeIn>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
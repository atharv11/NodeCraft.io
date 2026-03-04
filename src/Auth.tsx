import React, { useState , useRef , useEffect} from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './FireBase.js'; 

export default function Auth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [Name, setName] = useState("");
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: Name });
        }
      }
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (videoRef.current) {
    // 1. Force the muted property at the DOM level
    videoRef.current.muted = true;
    // 2. Some browsers specifically look for this property
    videoRef.current.defaultMuted = true;
    
    // 3. Manually trigger play to bypass the "autoplay-block"
    const playPromise = videoRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // This usually triggers if the phone is in Low Power Mode
        console.log("Autoplay prevented by mobile settings:", error);
      });
    }
  }
}, []);

  return (
   
    <div className="flex items-center justify-center min-h-dvh bg-[#efefef] font-extralight p-4 sm:p-6">
      
      {/* 2. Used 'w-full' and restricted 'max-w-md' for consistent width on all screens */}
      <div className="w-full max-w-md border-2 border-white bg-[linear-gradient(to_bottom,#E0F2FE,transparent)] rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="relative w-full h-32 sm:h-40 flex items-center justify-center bg-gray-800">
          <video 
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover z-0" 
            src="/Pink_gradient.mp4" 
            autoPlay 
            loop 
            muted
            playsInline 
          />
          <h1 className="relative z-10 text-3xl sm:text-4xl font-light text-white mix-blend-difference tracking-wide">
            NodeCraft.io
          </h1>
        </div>
            
        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl  text-center text-gray-800 mb-1">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-center text-gray-500 mb-6 text-xs sm:text-sm">
            {isLogin ? 'Enter your details to sign in.' : 'Start your journey with us.'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs sm:text-sm p-3 rounded-lg mb-4 border border-red-200 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 sm:py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none" /* Added appearance-none and text-base to prevent iOS zoom */
                  placeholder="Your Name"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 sm:py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 sm:py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 sm:py-3 rounded-lg text-black font-semibold  transition duration-200 active:scale-[0.98] mt-2
                ${loading ? ' cursor-not-allowed' : ' hover:bg-blue-100'}`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600  hover:underline focus:outline-none p-2" 
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './FireBase.js'; // Ensure this points to your firebase.ts

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Registration Logic
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Success is handled by the listener in App.tsx automatically
    } catch (err: any) {
  
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden ">
        
        {/* HEADER SECTION:
            - Changed h-[10vw] (which is tiny on mobile) to h-32 (mobile) and sm:h-40 (desktop).
        */}
        <div className="relative w-full h-32 sm:h-40 flex items-center justify-center bg-gray-800 ">
          <video 
            className="absolute top-0 left-0 w-full h-full object-cover z-0 shadow-xl overflow-hidden " 
            src="/Pink_gradient.mp4" 
            autoPlay 
            loop 
            muted
          />

          {/* TEXT:
              - Changed text-[2vw] to text-3xl.
              - Added mix-blend-difference for visibility over the video.
          */}
          <h1 className="relative z-10 text-3xl sm:text-4xl font-light text-white mix-blend-difference tracking-wide">
            NodeCraft.io
          </h1>
        </div>
            
        {/* CONTENT SECTION:
            - Added explicit padding (p-6 to p-8) for better spacing.
        */}
        <div className="p-6 sm:p-8">
        
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isLogin ? 'Welcome!':''}
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm sm:text-base">
            {isLogin ? 'Enter your details to sign in.' : 'Start your journey with us.'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 border border-red-200 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition duration-200 mt-2
                ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
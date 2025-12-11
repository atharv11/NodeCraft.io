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
      // Firebase errors look like "auth/user-not-found"
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="  shadow-xl w-full max-w-md h-[35vw] border-gray-200">
         <div className="relative w-full h-[12vw] rounded-t-2xl overflow-hidden flex items-center justify-center">
  
  {/* 1. VIDEO (Background Layer) */}
  <video 
    className="absolute top-0 left-0 w-full h-full object-cover z-0" // object-cover prevents stretching
    src="/Pink_gradient.mp4" 
    autoPlay 
    loop 
    muted 
  />

  {/* 2. TEXT (Foreground Layer) */}
  <h1 className="relative z-10 text-[2vw] font-light text-white mix-blend-difference">
    NodeCraft.io
  </h1>

</div>
            
        <div className='login/sign-up_content p-5 bg-white rounded-b-2xl'>
        {/* Header */}
        <h2 className="text-3xl  font-bold text-center text-gray-800">
          {isLogin ? 'Welcome' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {isLogin ? 'Enter your details to sign in.' : 'Start your journey with us.'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition duration-200 
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
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}
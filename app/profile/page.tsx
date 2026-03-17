'use client';

import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';

export default function Profile() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isSigninOpen, setIsSigninOpen] = useState(false);

  const openSignup = () => {
    setIsSignupOpen(true);
    setIsSigninOpen(false);
  };

  const openSignin = () => {
    setIsSigninOpen(true);
    setIsSignupOpen(false);
  };

  const closeModals = () => {
    setIsSignupOpen(false);
    setIsSigninOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">Profile</h1>
        <p className="text-xl mb-10">Connect your wallet or create an account to access your collection, orders, and settings.</p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={openSignup}
            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
          >
            Signup
          </button>
          <button 
            onClick={openSignin}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
          >
            Sign In
          </button>
        </div>

        {/* Signup Modal */}
        {isSignupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={closeModals}>
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>

              <h2 className="text-3xl font-bold text-center mb-6">Create Your Profile</h2>

              <form className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Username</label>
                  <input 
                    type="text" 
                    placeholder="Choose a username"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    placeholder="your@email.com"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Wallet Address</label>
                  <div className="p-3 bg-gray-700 rounded-lg text-gray-400">
                    <WalletConnect />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
                >
                  Create Profile
                </button>
              </form>

              <p className="text-center text-gray-400 mt-4">
                Already have an account? <button onClick={openSignin} className="text-purple-300 hover:underline">Sign In</button>
              </p>
            </div>
          </div>
        )}

        {/* Sign In Modal */}
        {isSigninOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={closeModals}>
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>

              <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>

              <form className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Email or Wallet</label>
                  <input 
                    type="text" 
                    placeholder="your@email.com or 0x..."
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Password (or Wallet Connect)</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500 mb-4"
                    required
                  />
                  <div className="p-3 bg-gray-700 rounded-lg text-gray-400">
                    <WalletConnect />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
                >
                  Sign In
                </button>
              </form>

              <p className="text-center text-gray-400 mt-4">
                New here? <button onClick={openSignup} className="text-purple-300 hover:underline">Create an Account</button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
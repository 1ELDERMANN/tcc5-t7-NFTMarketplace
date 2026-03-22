'use client';

import { useState, useEffect } from 'react';
import WalletConnect from '@/components/WalletConnect';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Load logged-in user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setWalletAddress(user.wallet || null);
    }
  }, []);

  const closeModals = () => {
    setIsSignupOpen(false);
    setIsSigninOpen(false);
    setError('');
    setSuccess('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const handleAuth = (e: React.FormEvent, isSignup: boolean) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let users = JSON.parse(localStorage.getItem('users') || '[]');

    if (isSignup) {
      // Signup
      if (!username || !email || !password) {
        setError('All fields required');
        return;
      }
      if (users.find((u: any) => u.email === email)) {
        setError('Email already exists');
        return;
      }

      const newUser = { username, email, password, wallet: null };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      setSuccess('Profile created! Now connect your wallet.');
      setCurrentUser(newUser);
    } else {
      // Signin
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        setError('Invalid email or password');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      setSuccess('Signed in! Connect your wallet if not already.');
      setWalletAddress(user.wallet || null);
    }

    closeModals();
  };

  const handleWalletConnected = (address: string) => {
    if (!currentUser) {
      setError('Please sign in or create a profile first');
      return;
    }

    setWalletAddress(address);

    // Save wallet to current user
    const updatedUser = { ...currentUser, wallet: address };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Update users list
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.map((u: any) =>
      u.email === currentUser.email ? { ...u, wallet: address } : u
    );
    localStorage.setItem('users', JSON.stringify(users));

    setSuccess('Wallet linked to your profile! You can now list products.');
  };

  if (currentUser) {
    // Logged in view
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome, {currentUser.username}!</h1>
          <p className="text-xl mb-10">Your profile is ready. Connect your wallet to start listing products.</p>

          <div className="max-w-md mx-auto">
            {walletAddress ? (
              <div className="bg-gray-800 p-6 rounded-xl">
                <p className="text-green-400 text-xl mb-4">
                  Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <p className="text-gray-300 mb-6">You can now go to Admin to upload products.</p>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition w-full"
                >
                  Go to Admin
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-6 rounded-xl">
                <p className="text-xl mb-6">Connect your wallet to link it to your profile</p>
                <WalletConnect onConnect={handleWalletConnected} />
                {error && <p className="text-red-500 mt-4">{error}</p>}
              </div>
            )}

            {/* Logout Button Added Here */}
            <button
              onClick={() => {
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
                setWalletAddress(null);
                setSuccess('Logged out successfully');
              }}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-medium text-white transition shadow-lg transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show buttons to open modals
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">Profile</h1>
        <p className="text-xl mb-10">Create an account or sign in to access your collection, orders, and settings.</p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => { setIsSignupOpen(true); setIsSigninOpen(false); }}
            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
          >
            Signup
          </button>
          <button 
            onClick={() => { setIsSigninOpen(true); setIsSignupOpen(false); }}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Signup Modal */}
      {isSignupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>

            <h2 className="text-3xl font-bold text-center mb-6">Create Your Profile</h2>

            <form onSubmit={(e) => handleAuth(e, true)} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Username</label>
                <input 
                  type="text" 
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-400 text-center">{success}</p>}

              <button 
                type="submit"
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
              >
                Create Profile
              </button>
            </form>

            <p className="text-center text-gray-400 mt-4">
              Already have an account? <button onClick={() => { setIsSigninOpen(true); setIsSignupOpen(false); }} className="text-purple-300 hover:underline">Sign In</button>
            </p>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {isSigninOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>

            <h2 className="text-3xl font-bold text-center mb-6">Sign In to Profile</h2>

            <form onSubmit={(e) => handleAuth(e, false)} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-400 text-center">{success}</p>}

              <button 
                type="submit"
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg shadow-lg transform hover:scale-105 transition"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-gray-400 mt-4">
              New here? <button onClick={() => { setIsSignupOpen(true); setIsSigninOpen(false); }} className="text-purple-300 hover:underline">Create an Account</button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { X, Loader, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  language: 'en' | 'ta';
  role: 'patient' | 'nurse';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, role, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role }
          }
        });

        if (signUpError) throw signUpError;
        if (user) {
          navigate(`/dashboard/${role}`);
        }
      } else {
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile?.role !== role) {
            await supabase.auth.signOut();
            throw new Error(
              language === 'en'
                ? `This account is registered as a ${profile?.role}. Please use the correct login option.`
                : `இந்த கணக்கு ${profile?.role === 'patient' ? 'நோயாளி' : 'செவிலியர்'} ஆக பதிவு செய்யப்பட்டுள்ளது. சரியான உள்நுழைவு விருப்பத்தைப் பயன்படுத்தவும்.`
            );
          }

          navigate(`/dashboard/${role}`);
        }
      }

      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-primary">
          {isSignUp
            ? `${role === 'patient' ? 'Patient' : 'Nurse'} Registration`
            : `${role === 'patient' ? 'Patient' : 'Nurse'} Login`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                  text-gray-900 placeholder-gray-400
                  focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                  transition-colors duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                  text-gray-900 placeholder-gray-400
                  focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                  transition-colors duration-200"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 
              bg-primary text-white rounded-lg font-medium
              hover:bg-primary/90 active:bg-primary/95 transform hover:translate-y-[-1px]
              transition-all duration-200 shadow-sm hover:shadow
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="h-5 w-5" />
                Sign Up
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-primary hover:text-primary/80 
              transition-colors duration-200 py-2"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
};
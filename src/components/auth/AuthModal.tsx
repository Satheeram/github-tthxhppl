import React, { useState } from 'react';
import { X, Loader, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PatientRegistrationForm } from './PatientRegistrationForm';
import { NurseRegistrationForm } from './NurseRegistrationForm';

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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setError(language === 'en' ? 'Email is required' : 'மின்னஞ்சல் தேவை');
      return false;
    }
    if (!password.trim()) {
      setError(language === 'en' ? 'Password is required' : 'கடவுச்சொல் தேவை');
      return false;
    }
    if (password.length < 6) {
      setError(language === 'en' 
        ? 'Password must be at least 6 characters long' 
        : 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் நீளமாக இருக்க வேண்டும்');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Check if user exists first
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          throw new Error(language === 'en'
            ? 'An account with this email already exists. Please sign in instead.'
            : 'இந்த மின்னஞ்சல் முகவரியுடன் ஏற்கனவே ஒரு கணக்கு உள்ளது. தயவுசெய்து உள்நுழையவும்.');
        }

        // Proceed with sign up
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            throw new Error(language === 'en'
              ? 'An account with this email already exists. Please sign in instead.'
              : 'இந்த மின்னஞ்சல் முகவரியுடன் ஏற்கனவே ஒரு கணக்கு உள்ளது. தயவுசெய்து உள்நுழையவும்.');
          }
          throw signUpError;
        }

        if (user) {
          setUserId(user.id);
          setShowRegistrationForm(true);
        }
      } else {
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error(language === 'en'
              ? 'Invalid email or password. Please try again.'
              : 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். மீண்டும் முயற்சிக்கவும்.');
          }
          throw signInError;
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          if (profile?.role !== role) {
            await supabase.auth.signOut();
            throw new Error(language === 'en'
              ? `This account is registered as a ${profile?.role}. Please use the correct login option.`
              : `இந்த கணக்கு ${profile?.role === 'patient' ? 'நோயாளி' : 'செவிலியர்'} ஆக பதிவு செய்யப்பட்டுள்ளது. சரியான உள்நுழைவு விருப்பத்தைப் பயன்படுத்தவும்.`);
          }

          navigate(`/dashboard/${role}`);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
      // If there was an error during sign up, ensure user is signed out
      if (isSignUp) {
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationCancel = async () => {
    await supabase.auth.signOut();
    setShowRegistrationForm(false);
    setIsSignUp(false);
    setEmail('');
    setPassword('');
    onClose();
  };

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showRegistrationForm) {
          handleRegistrationCancel();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showRegistrationForm]);

  // Handle click outside to close modal
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('auth-modal');
      if (modal && !modal.contains(event.target as Node)) {
        if (showRegistrationForm) {
          handleRegistrationCancel();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRegistrationForm]);

  if (showRegistrationForm) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full">
            {role === 'patient' ? (
              <PatientRegistrationForm
                userId={userId}
                email={email}
                onComplete={onClose}
                onCancel={handleRegistrationCancel}
                language={language}
              />
            ) : (
              <NurseRegistrationForm
                userId={userId}
                email={email}
                onComplete={onClose}
                onCancel={handleRegistrationCancel}
                language={language}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        id="auth-modal"
        className="bg-white rounded-2xl max-w-md w-full p-6 relative"
      >
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
              {language === 'en' ? 'Email' : 'மின்னஞ்சல்'}
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
                placeholder={language === 'en' ? 'Enter your email' : 'உங்கள் மின்னஞ்சலை உள்ளிடவும்'}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Password' : 'கடவுச்சொல்'}
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
                placeholder={language === 'en' ? 'Enter your password' : 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்'}
                required
                minLength={6}
              />
            </div>
            {isSignUp && (
              <p className="mt-1 text-sm text-gray-500">
                {language === 'en' 
                  ? 'Password must be at least 6 characters long'
                  : 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் நீளமாக இருக்க வேண்டும்'}
              </p>
            )}
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
                {language === 'en' ? 'Sign Up' : 'பதிவு செய்'}
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                {language === 'en' ? 'Sign In' : 'உள்நுழை'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="w-full text-center text-sm text-primary hover:text-primary/80 
              transition-colors duration-200 py-2"
          >
            {isSignUp 
              ? (language === 'en' ? 'Already have an account? Sign in' : 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்')
              : (language === 'en' ? 'Need an account? Sign up' : 'கணக்கு தேவையா? பதிவு செய்யவும்')}
          </button>
        </form>
      </div>
    </div>
  );
};
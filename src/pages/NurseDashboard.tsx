import React from 'react';
import { useAuth } from '../lib/auth';
import { LogOut, User, Calendar, Clock, Users, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const NurseDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-semibold">Welcome, {profile?.name}</h1>
                <p className="text-sm text-white/80">Nurse Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg
                hover:bg-white/20 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Today's Schedule</h2>
            </div>
            <div className="text-gray-500">No appointments scheduled for today</div>
          </div>

          {/* Active Patients */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Active Patients</h2>
            </div>
            <div className="text-gray-500">No active patients</div>
          </div>

          {/* Service Areas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Service Areas</h2>
            </div>
            <div className="text-gray-500">No service areas configured</div>
          </div>
        </div>
      </main>
    </div>
  );
};
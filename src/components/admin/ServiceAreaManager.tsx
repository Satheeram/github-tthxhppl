import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader, Save, Plus, Trash } from 'lucide-react';

interface ServiceArea {
  pincode: string;
  service_id: string;
  is_available: boolean;
}

export const ServiceAreaManager: React.FC = () => {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newArea, setNewArea] = useState<ServiceArea>({
    pincode: '',
    service_id: '',
    is_available: true
  });

  const loadServiceAreas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServiceAreas(data || []);
    } catch (err) {
      setError('Error loading service areas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServiceAreas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newArea.pincode || !newArea.service_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.rpc('update_service_area', {
        p_pincode: newArea.pincode,
        p_service_id: newArea.service_id,
        p_is_available: newArea.is_available
      });

      if (error) throw error;

      setNewArea({
        pincode: '',
        service_id: '',
        is_available: true
      });
      
      await loadServiceAreas();
    } catch (err) {
      setError('Error updating service area');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (pincode: string, service_id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('service_areas')
        .delete()
        .match({ pincode, service_id });

      if (error) throw error;
      await loadServiceAreas();
    } catch (err) {
      setError('Error deleting service area');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Manage Service Areas</h1>

      {/* Add New Service Area Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-primary mb-4">Add New Service Area</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              value={newArea.pincode}
              onChange={(e) => setNewArea(prev => ({ ...prev, pincode: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20"
              maxLength={6}
              pattern="\d{6}"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service ID *
            </label>
            <input
              type="text"
              value={newArea.service_id}
              onChange={(e) => setNewArea(prev => ({ ...prev, service_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-4 bg-primary text-white rounded-lg font-medium
                hover:bg-primary/90 active:bg-primary/95
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Service Area
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Service Areas List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pincode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serviceAreas.map((area, index) => (
                <tr key={`${area.pincode}-${area.service_id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {area.pincode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {area.service_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${area.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}`}
                    >
                      {area.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(area.pincode, area.service_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
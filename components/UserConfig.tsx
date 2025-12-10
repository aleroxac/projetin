import React, { useState } from 'react';
import { User } from '../types';
import { UserCog, Save, Shield } from 'lucide-react';

interface UserConfigProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const UserConfig: React.FC<UserConfigProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState<User>(user);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
    setMessage('User settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Account Settings */}
      <div className="bg-card p-8 rounded-xl border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <UserCog className="text-primary" /> Account Settings
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                    />
                </div>
            </div>

            <div>
                 <label className="block text-sm text-gray-400 mb-2">Bio</label>
                 <textarea 
                    value={formData.bio || ''}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                    placeholder="Tell us a bit about yourself..."
                 />
            </div>

            {/* Delegation Section (Mocked) */}
            <div className="bg-darker/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Shield size={18} className="text-secondary" /> Account Delegation
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                    Allow other users (Coaches, Nutritionists) to manage your profiles and protocols.
                </p>
                <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="Enter user email to invite..."
                        className="flex-1 bg-card border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    />
                    <button type="button" className="bg-secondary text-white px-4 py-2 rounded text-sm font-bold">Invite</button>
                </div>
                <div className="mt-4">
                     {formData.delegatedUsers.length === 0 && <span className="text-xs text-gray-500 italic">No delegates added yet.</span>}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <span className="text-emerald-400 text-sm font-bold">{message}</span>
                <button type="submit" className="bg-primary text-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-emerald-400 transition-colors">
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default UserConfig;
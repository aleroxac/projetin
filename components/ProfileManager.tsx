import React, { useState, useEffect } from 'react';
import { Profile, UserRole, Sport } from '../types';
import { User, Plus, Shield, Ruler, Activity, Trash2, Edit2, Calculator } from 'lucide-react';

interface ProfileManagerProps {
  profiles: Profile[];
  onAddProfile: (profile: Profile) => void;
  onUpdateProfile: (profile: Profile) => void;
  onDeleteProfile: (id: string) => void;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ 
    profiles, onAddProfile, onUpdateProfile, onDeleteProfile, activeProfileId, setActiveProfileId 
}) => {
  const [mode, setMode] = useState<'VIEW' | 'CREATE' | 'EDIT'>('VIEW');
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const startCreate = () => {
    setFormData({
        name: '',
        roles: [],
        sports: [],
        heightCm: 175,
        weightKg: 75,
        activityLevel: 1.5,
        gender: 'M',
        birthDate: '1990-01-01',
        bodyStats: { bodyFat: 0 }
    });
    setMode('CREATE');
  };

  const startEdit = (profile: Profile) => {
    setFormData({ ...profile });
    setMode('EDIT');
  };

  const calculateBodyFatEstimate = () => {
    // Basic BMI method for estimation if no tape measurements
    // Deurenberg formula: BF = (1.20 * BMI) + (0.23 * Age) - (10.8 * sex) - 5.4
    // Sex: 1 for male, 0 for female
    if (!formData.heightCm || !formData.weightKg || !formData.birthDate) return;

    const heightM = formData.heightCm / 100;
    const bmi = formData.weightKg / (heightM * heightM);
    
    const birthDate = new Date(formData.birthDate);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    const genderFactor = formData.gender === 'M' ? 1 : 0;
    
    let bf = (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
    bf = Math.round(bf * 10) / 10; // Round to 1 decimal

    setFormData(prev => ({
        ...prev,
        bodyStats: {
            ...prev.bodyStats,
            bodyFat: bf
        }
    }));
  };

  const toggleRole = (role: UserRole) => {
    const roles = formData.roles || [];
    if (roles.includes(role)) {
      setFormData({ ...formData, roles: roles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, roles: [...roles, role] });
    }
  };

  const toggleSport = (sport: Sport) => {
    const sports = formData.sports || [];
    if (sports.includes(sport)) {
      setFormData({ ...formData, sports: sports.filter(s => s !== sport) });
    } else {
      setFormData({ ...formData, sports: [...sports, sport] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'CREATE') {
        const newProfile: Profile = {
            id: crypto.randomUUID(),
            userId: 'current-user', 
            name: formData.name || 'New Profile',
            roles: formData.roles || [],
            sports: formData.sports || [],
            birthDate: formData.birthDate || '1995-01-01',
            gender: formData.gender as 'M' | 'F',
            heightCm: formData.heightCm || 170,
            weightKg: formData.weightKg || 70,
            activityLevel: formData.activityLevel || 1.2,
            bodyStats: formData.bodyStats || {}
        };
        onAddProfile(newProfile);
    } else if (mode === 'EDIT' && formData.id) {
        onUpdateProfile(formData as Profile);
    }
    setMode('VIEW');
  };

  if (mode === 'CREATE' || mode === 'EDIT') {
    return (
      <div className="bg-card p-6 rounded-xl border border-gray-700 shadow-xl max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="text-primary" /> {mode === 'CREATE' ? 'Create New Profile' : 'Edit Profile'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1">Profile Name (e.g., 2024 Prep)</label>
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-darker border border-gray-700 rounded p-2 text-white focus:border-primary outline-none"
                    placeholder="My Fitness Journey"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Gender</label>
                    <select 
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value as 'M' | 'F'})}
                        className="w-full bg-darker border border-gray-700 rounded p-2 text-white"
                    >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                </div>
                <div>
                     <label className="block text-sm text-gray-400 mb-1">Birth Date</label>
                     <input 
                        type="date"
                        value={formData.birthDate}
                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full bg-darker border border-gray-700 rounded p-2 text-white"
                     />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                    <input type="number" value={formData.weightKg} onChange={e => setFormData({...formData, weightKg: Number(e.target.value)})} className="w-full bg-darker border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Height (cm)</label>
                    <input type="number" value={formData.heightCm} onChange={e => setFormData({...formData, heightCm: Number(e.target.value)})} className="w-full bg-darker border border-gray-700 rounded p-2 text-white" />
                </div>
            </div>

            <div className="bg-darker/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-emerald-400 font-bold">Body Fat %</label>
                    <button 
                        type="button" 
                        onClick={calculateBodyFatEstimate}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded flex items-center gap-1"
                    >
                        <Calculator size={12} /> Auto-Calc (BMI Method)
                    </button>
                </div>
                <input 
                    type="number" 
                    step="0.1"
                    value={formData.bodyStats?.bodyFat || 0} 
                    onChange={e => setFormData({
                        ...formData, 
                        bodyStats: { ...formData.bodyStats, bodyFat: Number(e.target.value) }
                    })} 
                    className="w-full bg-darker border border-gray-700 rounded p-2 text-white font-bold" 
                />
                <p className="text-[10px] text-gray-500 mt-1">
                    Tip: Enter sex, age, weight and height then click Auto-Calc for an estimate.
                </p>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-2">Roles</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(UserRole).map(role => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => toggleRole(role)}
                            className={`px-3 py-1 rounded-full text-xs border ${
                                formData.roles?.includes(role) 
                                ? 'bg-primary/20 border-primary text-primary' 
                                : 'bg-transparent border-gray-600 text-gray-400'
                            }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-2">Sports</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(Sport).map(sport => (
                        <button
                            key={sport}
                            type="button"
                            onClick={() => toggleSport(sport)}
                            className={`px-3 py-1 rounded-full text-xs border ${
                                formData.sports?.includes(sport) 
                                ? 'bg-secondary/20 border-secondary text-secondary' 
                                : 'bg-transparent border-gray-600 text-gray-400'
                            }`}
                        >
                            {sport}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary text-black font-bold py-2 rounded hover:bg-emerald-400">
                    {mode === 'CREATE' ? 'Create Profile' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setMode('VIEW')} className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800">Cancel</button>
            </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Profiles</h2>
        <button onClick={startCreate} className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-400">
            <Plus size={18} /> New Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map(profile => (
            <div 
                key={profile.id}
                className={`relative group p-5 rounded-xl border transition-all ${
                    activeProfileId === profile.id 
                    ? 'bg-primary/5 border-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'bg-card border-gray-700 hover:border-gray-500'
                }`}
            >
                <div onClick={() => setActiveProfileId(profile.id)} className="cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-white">{profile.name}</h3>
                        {activeProfileId === profile.id && <span className="bg-primary text-black text-[10px] px-2 py-0.5 rounded font-bold">ACTIVE</span>}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                        {profile.sports.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30">{s}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-4 border-t border-gray-700 pt-3">
                        <div className="flex flex-col items-center">
                            <Ruler size={14} className="mb-1 text-primary" />
                            <span>{profile.heightCm}cm</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Shield size={14} className="mb-1 text-primary" />
                            <span>{profile.weightKg}kg</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Activity size={14} className="mb-1 text-primary" />
                            <span>{profile.bodyStats.bodyFat || '--'}% BF</span>
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(profile); }} 
                        className="p-1.5 bg-gray-800 rounded hover:bg-blue-600 text-white"
                        title="Edit"
                    >
                        <Edit2 size={12} />
                    </button>
                    {profiles.length > 1 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); if(confirm('Delete this profile?')) onDeleteProfile(profile.id); }} 
                            className="p-1.5 bg-gray-800 rounded hover:bg-red-600 text-white"
                            title="Delete"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileManager;
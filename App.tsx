import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Utensils, 
    Dumbbell, 
    UserCircle, 
    Settings,
    Menu,
    X,
    Activity,
    UserCog
} from 'lucide-react';

import ProfileManager from './components/ProfileManager';
import DietTracker from './components/DietTracker';
import WorkoutTracker from './components/WorkoutTracker';
import UserConfig from './components/UserConfig';

import { Profile, Protocol, Meal, Workout, UserRole, Sport, User, FoodDefinition, MealCacheEntry } from './types';

const INITIAL_USER: User = {
    id: 'user-1',
    name: 'Atleta Exemplo',
    email: 'atleta@projetin.com',
    delegatedUsers: [],
    bio: 'Focado no shape.'
};

const MOCK_PROFILE: Profile = {
    id: 'prof-1',
    userId: 'user-1',
    name: 'Cutting Verão 2025',
    roles: [UserRole.ATHLETE],
    sports: [Sport.BODYBUILDING],
    birthDate: '1995-05-20',
    gender: 'M',
    heightCm: 180,
    weightKg: 88,
    activityLevel: 1.55,
    bodyStats: { bodyFat: 12, chest: 110, arms: 42, waist: 85, legs: 65 }
};

const MOCK_PROTOCOL: Protocol = {
    id: 'prot-1',
    profileId: 'prof-1',
    name: 'Déficit Agressivo',
    goal: 'LOSE',
    startDate: '2024-01-01',
    endDate: '2024-04-01',
    stats: {
        tmb: 1950,
        tdee: 2800,
        targetCalories: 2300,
        targetProtein: 220,
        targetCarbs: 200,
        targetFat: 60,
        weeklyWeightGoal: 0.5
    },
    freeMealsPerWeek: 1,
    supplements: [],
    events: []
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diet' | 'workout' | 'profile' | 'settings'>('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [profiles, setProfiles] = useState<Profile[]>([MOCK_PROFILE]);
  const [activeProfileId, setActiveProfileId] = useState<string>(MOCK_PROFILE.id);
  const [protocols, setProtocols] = useState<Protocol[]>([MOCK_PROTOCOL]);
  
  // Persistent States
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('projetin_meals');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('projetin_workouts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [foodLibrary, setFoodLibrary] = useState<Record<string, FoodDefinition>>(() => {
    const saved = localStorage.getItem('projetin_food_library');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [mealCache, setMealCache] = useState<Record<string, MealCacheEntry>>(() => {
    const saved = localStorage.getItem('projetin_meal_cache');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistence Syncing
  useEffect(() => { localStorage.setItem('projetin_meals', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('projetin_workouts', JSON.stringify(workouts)); }, [workouts]);
  useEffect(() => { localStorage.setItem('projetin_food_library', JSON.stringify(foodLibrary)); }, [foodLibrary]);
  useEffect(() => { localStorage.setItem('projetin_meal_cache', JSON.stringify(mealCache)); }, [mealCache]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const activeProtocol = protocols.find(p => p.profileId === activeProfileId) || protocols[0];

  const handleUpdateUser = (updatedUser: User) => setUser(updatedUser);

  const handleAddProfile = (newProfile: Profile) => {
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    const defaultProtocol: Protocol = {
        ...MOCK_PROTOCOL,
        id: crypto.randomUUID(),
        profileId: newProfile.id,
        name: `Protocolo para ${newProfile.name}`
    };
    setProtocols(prev => [...prev, defaultProtocol]);
  };

  const handleUpdateProfile = (updatedProfile: Profile) => {
      setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const handleDeleteProfile = (id: string) => {
      setProfiles(prev => {
          const filtered = prev.filter(p => p.id !== id);
          if (activeProfileId === id && filtered.length > 0) {
              setActiveProfileId(filtered[0].id);
          }
          return filtered;
      });
  };

  // Diet Handlers
  const handleAddMeal = (meal: Meal) => setMeals(prev => [meal, ...prev]);
  const handleUpdateMeal = (updatedMeal: Meal) => setMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
  const handleDeleteMeal = (id: string) => setMeals(prev => prev.filter(m => m.id !== id));

  // Memory/Cache Handlers
  const handleUpdateLibrary = (name: string, definition: FoodDefinition) => {
    setFoodLibrary(prev => ({ ...prev, [name]: definition }));
  };
  const handleRemoveLibraryItem = (name: string) => {
    setFoodLibrary(prev => {
        const newState = { ...prev };
        delete newState[name];
        return newState;
    });
  };
  const handleUpdateMealCache = (description: string, entry: MealCacheEntry) => {
    setMealCache(prev => ({ ...prev, [description.trim().toLowerCase()]: entry }));
  };
  const handleRemoveCacheItem = (description: string) => {
    setMealCache(prev => {
        const newState = { ...prev };
        delete newState[description.toLowerCase()];
        return newState;
    });
  };

  // Workout Handlers
  const handleAddWorkout = (workout: Workout) => setWorkouts(prev => [workout, ...prev]);
  const handleUpdateWorkout = (updatedWorkout: Workout) => setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
  const handleDeleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button
        onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeTab === id 
            ? 'bg-primary/10 text-primary border-r-2 border-primary' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </button>
  );

  const DashboardView = () => {
    const caloriesConsumed = meals.reduce((acc, m) => acc + m.macros.calories, 0);
    const caloriesRemaining = activeProtocol.stats.targetCalories - caloriesConsumed;
    
    return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Peso Atual</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                    {activeProfile.weightKg} <span className="text-sm text-gray-500 mb-1">kg</span>
                </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Kcal Restantes</div>
                <div className={`text-2xl font-bold flex items-end gap-2 ${caloriesRemaining < 0 ? 'text-red-500' : 'text-primary'}`}>
                    {Math.round(caloriesRemaining)} <span className="text-sm text-gray-500 mb-1">kcal</span>
                </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Treinos (Total)</div>
                <div className="text-2xl font-bold text-white">
                    {workouts.length}
                </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">BF Est.</div>
                <div className="text-2xl font-bold text-white">
                    {activeProfile.bodyStats.bodyFat}%
                </div>
            </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-700 min-h-[400px]">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-primary" /> Feed de Atividade
             </h3>
             <div className="relative border-l border-gray-700 ml-3 space-y-6 pb-4">
                {[...meals, ...workouts]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10) 
                    .map((item: any) => (
                    <div key={item.id} className="ml-6 relative">
                        <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-darker ${item.macros ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-secondary shadow-[0_0_5px_#3b82f6]'}`}></span>
                        <div className="bg-darker/50 p-4 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-200">
                                    {item.macros ? 'Refeição' : 'Treino'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-medium truncate">{item.name || item.description}</p>
                            {item.exercises && (
                                <div className="mt-2 text-[10px] text-secondary bg-secondary/10 inline-block px-2 py-0.5 rounded border border-secondary/20 uppercase font-bold">
                                    {item.exercises.length} Exercícios
                                </div>
                            )}
                            {item.macros && (
                                <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 inline-block px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                                    {item.macros.calories} kcal
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {meals.length === 0 && workouts.length === 0 && (
                     <div className="ml-6 text-gray-500 italic">Nenhuma atividade. Hora de começar!</div>
                )}
             </div>
        </div>
    </div>
  )};

  return (
    <div className="min-h-screen bg-darker text-gray-100 font-sans flex flex-col md:flex-row overflow-hidden">
      
      <div className="md:hidden bg-card border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-primary tracking-tight">PROJETIN</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-gray-700 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
            <h1 className="text-2xl font-bold text-primary tracking-tighter flex items-center gap-2">
                <Activity size={28} />
                PROJETIN
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter font-bold">Social Fitness Protocol</p>
        </div>

        <div className="px-3 space-y-1">
            <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <SidebarItem id="profile" label="Perfis" icon={UserCircle} />
            <SidebarItem id="diet" label="Dieta" icon={Utensils} />
            <SidebarItem id="workout" label="Treinos" icon={Dumbbell} />
            <SidebarItem id="settings" label="Configurações" icon={UserCog} />
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase border border-primary/30">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-white">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate uppercase">{activeProfile?.name}</p>
                </div>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {activeTab === 'dashboard' && 'Visão Geral'}
                    {activeTab === 'profile' && 'Gestão de Perfis'}
                    {activeTab === 'diet' && 'Protocolo Nutricional'}
                    {activeTab === 'workout' && 'Laboratório de Treino'}
                    {activeTab === 'settings' && 'Configurações'}
                </h2>
                {activeTab !== 'settings' && (
                    <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
                        {activeProfile.name} <span className="mx-2 text-gray-700">|</span> <span className="text-secondary">{activeProtocol.name}</span>
                    </p>
                )}
            </div>
            <div className="hidden md:flex gap-4">
                <button 
                    onClick={() => setActiveTab('settings')}
                    className="bg-dark border border-gray-700 p-2 rounded-full text-gray-400 hover:text-white hover:border-primary transition-all shadow-lg active:scale-90"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'settings' && (
            <UserConfig user={user} onUpdateUser={handleUpdateUser} />
        )}
        {activeTab === 'profile' && (
            <ProfileManager 
                profiles={profiles} 
                onAddProfile={handleAddProfile} 
                onUpdateProfile={handleUpdateProfile}
                onDeleteProfile={handleDeleteProfile}
                activeProfileId={activeProfileId}
                setActiveProfileId={setActiveProfileId}
            />
        )}
        {activeTab === 'diet' && (
            <DietTracker 
                protocol={activeProtocol} 
                meals={meals} 
                foodLibrary={foodLibrary}
                mealCache={mealCache}
                onAddMeal={handleAddMeal} 
                onUpdateMeal={handleUpdateMeal}
                onDeleteMeal={handleDeleteMeal}
                onUpdateLibrary={handleUpdateLibrary}
                onUpdateMealCache={handleUpdateMealCache}
                onRemoveLibraryItem={handleRemoveLibraryItem}
                onRemoveCacheItem={handleRemoveCacheItem}
            />
        )}
        {activeTab === 'workout' && (
            <WorkoutTracker 
                protocol={activeProtocol} 
                workouts={workouts} 
                onAddWorkout={handleAddWorkout}
                onUpdateWorkout={handleUpdateWorkout}
                onDeleteWorkout={handleDeleteWorkout}
            />
        )}
      </main>
      
      {mobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Utensils, 
    Dumbbell, 
    UserCircle, 
    Calendar,
    Settings,
    Menu,
    X,
    Activity,
    UserCog
} from 'lucide-react';

// Components
import ProfileManager from './components/ProfileManager';
import DietTracker from './components/DietTracker';
import WorkoutTracker from './components/WorkoutTracker';
import UserConfig from './components/UserConfig';

// Types & Mock Data
import { Profile, Protocol, Meal, Workout, UserRole, Sport, User } from './types';

// --- MOCK DATA INITIALIZATION ---
const INITIAL_USER: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    delegatedUsers: [],
    bio: 'Aspiring Bodybuilder'
};

const MOCK_PROFILE: Profile = {
    id: 'prof-1',
    userId: 'user-1',
    name: 'Summer Cut 2025',
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
    name: 'Aggressive Cut',
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
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diet' | 'workout' | 'profile' | 'settings'>('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [profiles, setProfiles] = useState<Profile[]>([MOCK_PROFILE]);
  const [activeProfileId, setActiveProfileId] = useState<string>(MOCK_PROFILE.id);
  const [protocols, setProtocols] = useState<Protocol[]>([MOCK_PROTOCOL]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derived State
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const activeProtocol = protocols.find(p => p.profileId === activeProfileId) || protocols[0];

  // --- HANDLERS ---
  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
  };

  const handleAddProfile = (newProfile: Profile) => {
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newProfile.id);
    const defaultProtocol: Protocol = {
        ...MOCK_PROTOCOL,
        id: crypto.randomUUID(),
        profileId: newProfile.id,
        name: `Protocol for ${newProfile.name}`
    };
    setProtocols([...protocols, defaultProtocol]);
  };

  const handleUpdateProfile = (updatedProfile: Profile) => {
      setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const handleDeleteProfile = (id: string) => {
      const newProfiles = profiles.filter(p => p.id !== id);
      setProfiles(newProfiles);
      if (activeProfileId === id && newProfiles.length > 0) {
          setActiveProfileId(newProfiles[0].id);
      }
  };

  const handleAddMeal = (meal: Meal) => setMeals([meal, ...meals]);
  const handleUpdateMeal = (updatedMeal: Meal) => setMeals(meals.map(m => m.id === updatedMeal.id ? updatedMeal : m));
  const handleDeleteMeal = (id: string) => setMeals(meals.filter(m => m.id !== id));

  const handleAddWorkout = (workout: Workout) => setWorkouts([workout, ...workouts]);

  // --- UI COMPONENTS ---
  
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
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Current Weight</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                    {activeProfile.weightKg} <span className="text-sm text-gray-500 mb-1">kg</span>
                </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Calories Left</div>
                <div className={`text-2xl font-bold flex items-end gap-2 ${caloriesRemaining < 0 ? 'text-red-500' : 'text-primary'}`}>
                    {caloriesRemaining} <span className="text-sm text-gray-500 mb-1">kcal</span>
                </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Workouts (Week)</div>
                <div className="text-2xl font-bold text-white">
                    {workouts.length}
                </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Condition</div>
                <div className="text-2xl font-bold text-white">
                    {activeProfile.bodyStats.bodyFat}% <span className="text-sm text-gray-500">BF</span>
                </div>
            </div>
        </div>

        {/* Timeline Placeholder */}
        <div className="bg-card p-6 rounded-xl border border-gray-700 min-h-[400px]">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-primary" /> Activity Feed
             </h3>
             <div className="relative border-l border-gray-700 ml-3 space-y-6 pb-4">
                {[...meals, ...workouts]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5) // Show last 5 items
                    .map((item: any) => (
                    <div key={item.id} className="ml-6 relative">
                        <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-darker ${item.macros ? 'bg-emerald-500' : 'bg-secondary'}`}></span>
                        <div className="bg-darker/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-200">
                                    {item.macros ? 'Meal Tracked' : 'Workout Completed'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">{item.name || item.description}</p>
                            {item.exercises && (
                                <div className="mt-2 text-xs text-secondary bg-secondary/10 inline-block px-2 py-1 rounded">
                                    {item.exercises.length} Exercises
                                </div>
                            )}
                            {item.macros && (
                                <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 inline-block px-2 py-1 rounded">
                                    {item.macros.calories} kcal
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {meals.length === 0 && workouts.length === 0 && (
                     <div className="ml-6 text-gray-500 italic">No activity yet. Start by logging a meal or workout!</div>
                )}
             </div>
        </div>
    </div>
  )};

  return (
    <div className="min-h-screen bg-darker text-gray-100 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-primary tracking-tight">PROJETIN</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-gray-700 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
            <h1 className="text-2xl font-bold text-primary tracking-tighter flex items-center gap-2">
                <Activity size={28} />
                PROJETIN
            </h1>
            <p className="text-xs text-gray-500 mt-1">Fitness Social Protocol</p>
        </div>

        <div className="px-3 space-y-1">
            <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <SidebarItem id="profile" label="Profiles" icon={UserCircle} />
            <SidebarItem id="diet" label="Diet Protocol" icon={Utensils} />
            <SidebarItem id="workout" label="Workout Lab" icon={Dumbbell} />
            <SidebarItem id="settings" label="Settings" icon={UserCog} />
            {/* Future Features */}
            <div className="pt-4 mt-4 border-t border-gray-700 px-4 text-xs font-bold text-gray-500 uppercase">
                Social
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition opacity-50 cursor-not-allowed">
                <Calendar size={20} /> Agenda
            </button>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{activeProfile?.name}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white">
                    {activeTab === 'dashboard' && 'Overview'}
                    {activeTab === 'profile' && 'Profile Management'}
                    {activeTab === 'diet' && 'Nutrition Protocol'}
                    {activeTab === 'workout' && 'Training Lab'}
                    {activeTab === 'settings' && 'User Settings'}
                </h2>
                {activeTab !== 'settings' && (
                    <p className="text-gray-400 text-sm mt-1">
                        {activeProfile.name} • <span className="text-secondary">{activeProtocol.name}</span>
                    </p>
                )}
            </div>
            <div className="hidden md:flex gap-4">
                <button 
                    onClick={() => setActiveTab('settings')}
                    className="bg-dark border border-gray-700 p-2 rounded-full text-gray-400 hover:text-white hover:border-gray-500 transition"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>

        {/* View Routing */}
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
                onAddMeal={handleAddMeal} 
                onUpdateMeal={handleUpdateMeal}
                onDeleteMeal={handleDeleteMeal}
            />
        )}
        {activeTab === 'workout' && (
            <WorkoutTracker 
                protocol={activeProtocol} 
                workouts={workouts} 
                onAddWorkout={handleAddWorkout} 
            />
        )}
      </main>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
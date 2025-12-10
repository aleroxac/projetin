import React, { useState } from 'react';
import { Workout, Protocol, WorkoutPlan, Exercise } from '../types';
import { parseWorkoutWithAI } from '../services/geminiService';
import BodyMap from './BodyMap';
import { Dumbbell, Plus, Loader2, ChevronRight, Calendar, BookOpen, Play } from 'lucide-react';

interface WorkoutTrackerProps {
  protocol: Protocol;
  workouts: Workout[];
  onAddWorkout: (workout: Workout) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ protocol, workouts, onAddWorkout }) => {
  const [activeTab, setActiveTab] = useState<'PLANS' | 'SESSIONS'>('SESSIONS');
  
  // Plans State
  const [plans, setPlans] = useState<WorkoutPlan[]>([
      { id: 'plan-1', protocolId: protocol.id, name: 'Push Day A', targetMuscleGroups: ['Chest', 'Shoulders', 'Triceps'], exercises: [] }
  ]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  // Session State
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // --- Handlers ---

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) return;
    const newPlan: WorkoutPlan = {
        id: crypto.randomUUID(),
        protocolId: protocol.id,
        name: newPlanName,
        targetMuscleGroups: [],
        exercises: []
    };
    setPlans([...plans, newPlan]);
    setNewPlanName('');
    setIsCreatingPlan(false);
  };

  const handleLogFromAI = async () => {
    if (!inputText.trim()) return;
    setProcessing(true);
    const result = await parseWorkoutWithAI(inputText);
    
    if (result && result.exercises) {
        const newWorkout: Workout = {
            id: crypto.randomUUID(),
            protocolId: protocol.id,
            timestamp: new Date().toISOString(),
            name: result.name || "AI Logged Workout",
            exercises: result.exercises
        };
        onAddWorkout(newWorkout);
        setInputText('');
    }
    setProcessing(false);
  };

  const startSessionFromPlan = (plan: WorkoutPlan) => {
    // In a real app, this would open a live session tracker pre-filled with the plan
    // For now, we mock completing it immediately
    const newWorkout: Workout = {
        id: crypto.randomUUID(),
        protocolId: protocol.id,
        planId: plan.id,
        timestamp: new Date().toISOString(),
        name: plan.name,
        exercises: plan.exercises
    };
    onAddWorkout(newWorkout);
    alert(`Started session for ${plan.name}! (Mocked as completed)`);
  };

  const filteredWorkouts = selectedMuscle 
    ? workouts.filter(w => w.exercises.some(e => 
        e.muscleGroup && e.muscleGroup.toLowerCase().includes(selectedMuscle.toLowerCase())
      ))
    : workouts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* --- LEFT COLUMN: CONTENT --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-gray-700 pb-2">
            <button 
                onClick={() => setActiveTab('SESSIONS')}
                className={`flex items-center gap-2 pb-2 px-1 ${activeTab === 'SESSIONS' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <Calendar size={18} /> History & Log
            </button>
            <button 
                onClick={() => setActiveTab('PLANS')}
                className={`flex items-center gap-2 pb-2 px-1 ${activeTab === 'PLANS' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <BookOpen size={18} /> My Plans
            </button>
        </div>

        {activeTab === 'PLANS' && (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold">Training Plans</h3>
                    <button onClick={() => setIsCreatingPlan(true)} className="text-xs bg-primary text-black px-3 py-1 rounded font-bold hover:bg-emerald-400">
                        + New Plan
                    </button>
                </div>

                {isCreatingPlan && (
                    <div className="bg-card p-4 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs text-gray-400">Plan Name</label>
                        <div className="flex gap-2 mt-1">
                            <input 
                                value={newPlanName}
                                onChange={e => setNewPlanName(e.target.value)}
                                placeholder="e.g. Pull Day Hypertrophy"
                                className="flex-1 bg-darker border border-gray-600 rounded p-2 text-white"
                            />
                            <button onClick={handleCreatePlan} className="bg-primary text-black px-4 rounded font-bold">Save</button>
                            <button onClick={() => setIsCreatingPlan(false)} className="text-gray-400 px-2">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-card p-4 rounded-xl border border-gray-700 hover:border-primary transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-lg">{plan.name}</h4>
                                <button onClick={() => startSessionFromPlan(plan)} className="bg-secondary text-white p-2 rounded-full hover:scale-110 transition-transform" title="Start Session">
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>
                            <div className="text-xs text-gray-400">
                                {plan.exercises.length} Exercises defined
                            </div>
                            <div className="mt-4 flex gap-1 flex-wrap">
                                {plan.targetMuscleGroups.map(m => (
                                    <span key={m} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{m}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'SESSIONS' && (
            <>
                {/* AI Log Input */}
                <div className="bg-card p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Dumbbell size={18} className="text-secondary" /> Quick Log (AI)
                    </h3>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your workout here. E.g.: Chest Day. Bench Press 4x10 80kg, Incline Flys 3x12 20kg..."
                        className="w-full h-24 bg-darker border border-gray-600 rounded-lg p-3 text-white focus:border-secondary outline-none text-sm font-mono mb-3"
                    />
                    <div className="flex justify-end">
                        <button 
                            onClick={handleLogFromAI} 
                            disabled={processing}
                            className="bg-secondary hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {processing ? <Loader2 className="animate-spin" /> : "Log Session"}
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex justify-between items-center">
                        <span>Recent Sessions</span>
                        {selectedMuscle && (
                            <span 
                                onClick={() => setSelectedMuscle(null)}
                                className="text-xs bg-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-gray-600 flex items-center gap-1"
                            >
                                Filter: {selectedMuscle} <span className="text-red-400">x</span>
                            </span>
                        )}
                    </h3>
                    
                    {filteredWorkouts.map(workout => (
                        <div key={workout.id} className="bg-card border border-gray-700 rounded-xl overflow-hidden">
                            <div className="bg-darker/50 p-3 border-b border-gray-700 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-white block">{workout.name}</span>
                                    <span className="text-xs text-gray-500">{new Date(workout.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                                    Completed
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="space-y-2">
                                    {workout.exercises.map((ex, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-800 pb-1 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <ChevronRight size={14} className="text-secondary" />
                                                <span className="text-gray-200">{ex.name}</span>
                                            </div>
                                            <div className="text-gray-400 text-xs font-mono">
                                                {ex.sets.length} sets | Top: {Math.max(...ex.sets.map(s => s.weight))}kg
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                     {filteredWorkouts.length === 0 && (
                        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                            {selectedMuscle ? `No workouts found for ${selectedMuscle}` : 'No workouts logged yet.'}
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      {/* --- RIGHT COLUMN: VISUALIZATION --- */}
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Human Blueprint</h3>
            <BodyMap onSelectMuscle={setSelectedMuscle} selectedMuscle={selectedMuscle} />
            <p className="text-xs text-center text-gray-500 mt-4">
                Interactive Map: Click a muscle group to filter history.
            </p>
        </div>

        {selectedMuscle && (
             <div className="bg-card p-6 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-right-4 border-l-4 border-l-primary">
                <h3 className="text-md font-bold text-white mb-2 text-primary">{selectedMuscle} Stats</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Total Volume (Week)</span>
                        <span className="text-white font-mono">12,400kg</span>
                    </div>
                     <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Est. 1RM</span>
                        <span className="text-white font-mono">140kg</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Frequency</span>
                        <span className="text-white font-mono">2x / week</span>
                    </div>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
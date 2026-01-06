import React, { useState } from 'react';
import { Workout, Protocol, WorkoutPlan, Exercise, ExerciseSet } from '../types';
import { parseWorkoutWithAI } from '../services/geminiService';
import BodyMap from './BodyMap';
import { 
  Dumbbell, Plus, Loader2, ChevronRight, Calendar, 
  BookOpen, Play, Edit2, Trash2, X, Save, 
  ChevronDown, ChevronUp, Clock, FileText, Activity 
} from 'lucide-react';

interface WorkoutTrackerProps {
  protocol: Protocol;
  workouts: Workout[];
  onAddWorkout: (workout: Workout) => void;
  onUpdateWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ 
  protocol, workouts, onAddWorkout, onUpdateWorkout, onDeleteWorkout 
}) => {
  const [activeTab, setActiveTab] = useState<'PLANS' | 'SESSIONS'>('SESSIONS');
  
  // Plans State
  const [plans, setPlans] = useState<WorkoutPlan[]>([
      { id: 'plan-1', protocolId: protocol.id, name: 'Push Day A', targetMuscleGroups: ['Chest', 'Shoulders', 'Triceps'], exercises: [] }
  ]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  // Session States
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Creation State
  const [manualWorkout, setManualWorkout] = useState<Partial<Workout>>({
      name: '',
      timestamp: new Date().toISOString(),
      exercises: []
  });

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
            name: result.name || "Treino IA",
            exercises: result.exercises
        };
        onAddWorkout(newWorkout);
        setInputText('');
    }
    setProcessing(false);
  };

  const startSessionFromPlan = (plan: WorkoutPlan) => {
    const newWorkout: Workout = {
        id: crypto.randomUUID(),
        protocolId: protocol.id,
        planId: plan.id,
        timestamp: new Date().toISOString(),
        name: plan.name,
        exercises: plan.exercises
    };
    onAddWorkout(newWorkout);
    alert(`Treino de ${plan.name} iniciado e logado com sucesso!`);
  };

  const handleOpenManual = (workout?: Workout) => {
      if (workout) {
          setEditingWorkout(workout);
          setManualWorkout({ ...workout });
      } else {
          setEditingWorkout(null);
          setManualWorkout({
              name: '',
              timestamp: new Date().toISOString().slice(0, 16),
              exercises: [{ 
                  name: '', 
                  muscleGroup: '', 
                  sets: [{ reps: 0, weight: 0, rpe: 0, type: 'WORKING' }],
                  restSeconds: 60
              }]
          });
      }
      setIsManualModalOpen(true);
  };

  const addManualExercise = () => {
      setManualWorkout(prev => ({
          ...prev,
          exercises: [
              ...(prev.exercises || []),
              { name: '', muscleGroup: '', sets: [{ reps: 0, weight: 0, rpe: 0, type: 'WORKING' }], restSeconds: 60 }
          ]
      }));
  };

  const addSetToManualExercise = (exIndex: number) => {
      setManualWorkout(prev => {
          const exercises = [...(prev.exercises || [])];
          const lastSet = exercises[exIndex].sets[exercises[exIndex].sets.length - 1];
          exercises[exIndex].sets.push({ ...lastSet });
          return { ...prev, exercises };
      });
  };

  const updateManualExercise = (index: number, field: keyof Exercise, value: any) => {
      setManualWorkout(prev => {
          const exercises = [...(prev.exercises || [])];
          exercises[index] = { ...exercises[index], [field]: value };
          return { ...prev, exercises };
      });
  };

  const updateManualSet = (exIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
      setManualWorkout(prev => {
          const exercises = [...(prev.exercises || [])];
          const sets = [...exercises[exIndex].sets];
          sets[setIndex] = { ...sets[setIndex], [field]: value };
          exercises[exIndex].sets = sets;
          return { ...prev, exercises };
      });
  };

  const handleSaveManual = () => {
      const workoutToSave: Workout = {
          id: editingWorkout ? editingWorkout.id : crypto.randomUUID(),
          protocolId: protocol.id,
          timestamp: manualWorkout.timestamp || new Date().toISOString(),
          name: manualWorkout.name || "Treino Manual",
          exercises: manualWorkout.exercises as Exercise[]
      };

      if (editingWorkout) {
          onUpdateWorkout(workoutToSave);
      } else {
          onAddWorkout(workoutToSave);
      }
      setIsManualModalOpen(false);
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
                <Calendar size={18} /> Histórico e Log
            </button>
            <button 
                onClick={() => setActiveTab('PLANS')}
                className={`flex items-center gap-2 pb-2 px-1 ${activeTab === 'PLANS' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <BookOpen size={18} /> Meus Planos
            </button>
        </div>

        {activeTab === 'PLANS' && (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold">Planos de Treinamento</h3>
                    <button onClick={() => setIsCreatingPlan(true)} className="text-xs bg-primary text-black px-3 py-1 rounded font-bold hover:bg-emerald-400">
                        + Novo Plano
                    </button>
                </div>

                {isCreatingPlan && (
                    <div className="bg-card p-4 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs text-gray-400">Nome do Plano</label>
                        <div className="flex gap-2 mt-1">
                            <input 
                                value={newPlanName}
                                onChange={e => setNewPlanName(e.target.value)}
                                placeholder="ex: Push Day Hipertrofia"
                                className="flex-1 bg-darker border border-gray-600 rounded p-2 text-white"
                            />
                            <button onClick={handleCreatePlan} className="bg-primary text-black px-4 rounded font-bold">Salvar</button>
                            <button onClick={() => setIsCreatingPlan(false)} className="text-gray-400 px-2">Cancelar</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-card p-4 rounded-xl border border-gray-700 hover:border-primary transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-lg">{plan.name}</h4>
                                <button onClick={() => startSessionFromPlan(plan)} className="bg-secondary text-white p-2 rounded-full hover:scale-110 transition-transform" title="Iniciar Sessão">
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>
                            <div className="text-xs text-gray-400">
                                {plan.exercises.length} Exercícios definidos
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
                {/* Entry Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AI Log Input */}
                    <div className="bg-card p-6 rounded-xl border border-gray-700 h-full flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Activity size={18} className="text-primary" /> Log Rápido (IA)
                        </h3>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Cole seu treino aqui. Ex: Treino de Peito. Supino 4x10 80kg, Crucifixo 3x12 20kg..."
                            className="flex-1 w-full min-h-[100px] bg-darker border border-gray-600 rounded-lg p-3 text-white focus:border-primary outline-none text-sm font-mono mb-3"
                        />
                        <button 
                            onClick={handleLogFromAI} 
                            disabled={processing}
                            className="bg-primary hover:bg-emerald-600 text-black font-bold px-6 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                        >
                            {processing ? <Loader2 className="animate-spin" /> : "Analisar e Logar"}
                        </button>
                    </div>

                    {/* Manual Entry Trigger */}
                    <div className="bg-card p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-secondary transition-all" onClick={() => handleOpenManual()}>
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Registro Manual</h3>
                        <p className="text-xs text-gray-500 mt-2 max-w-[200px]">Monte seu treino série por série com total precisão.</p>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex justify-between items-center">
                        <span>Sessões Recentes</span>
                        {selectedMuscle && (
                            <span 
                                onClick={() => setSelectedMuscle(null)}
                                className="text-xs bg-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-gray-600 flex items-center gap-1"
                            >
                                Filtro: {selectedMuscle} <span className="text-red-400">x</span>
                            </span>
                        )}
                    </h3>
                    
                    {filteredWorkouts.map(workout => (
                        <div key={workout.id} className="bg-card border border-gray-700 rounded-xl overflow-hidden group hover:border-gray-500 transition-all">
                            <div className="bg-darker/50 p-4 border-b border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                                        <Dumbbell size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-white block leading-tight">{workout.name}</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(workout.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenManual(workout)} className="p-2 hover:bg-gray-700 rounded text-blue-400 transition-colors" title="Editar">
                                            <Edit2 size={16}/>
                                        </button>
                                        <button onClick={() => { if(confirm('Excluir este treino?')) onDeleteWorkout(workout.id); }} className="p-2 hover:bg-gray-700 rounded text-red-400 transition-colors" title="Excluir">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                    <div className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded border border-secondary/20 font-bold">
                                        Finalizado
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workout.exercises.map((ex, idx) => (
                                    <div key={idx} className="bg-darker/30 p-3 rounded-lg border border-gray-800/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-gray-200 font-bold text-sm uppercase tracking-tight">{ex.name}</span>
                                            <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{ex.muscleGroup || 'Geral'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {ex.sets.map((set, sIdx) => (
                                                <div key={sIdx} className="text-[10px] bg-darker px-2 py-1 rounded border border-gray-700 text-gray-400 font-mono">
                                                    {set.reps}x{set.weight}kg <span className="text-primary font-bold">@RPE{set.rpe}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                     {filteredWorkouts.length === 0 && (
                        <div className="text-center py-16 text-gray-500 border border-dashed border-gray-700 rounded-xl italic">
                            {selectedMuscle ? `Nenhum treino encontrado para ${selectedMuscle}` : 'Nenhum treino registrado ainda. Bora puxar ferro!'}
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      {/* --- RIGHT COLUMN: VISUALIZATION --- */}
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-xl border border-gray-700 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-secondary" /> Mapa Muscular
            </h3>
            <BodyMap onSelectMuscle={setSelectedMuscle} selectedMuscle={selectedMuscle} />
            <p className="text-[10px] text-center text-gray-500 mt-4 uppercase font-bold tracking-widest">
                Clique nos grupos para filtrar o histórico
            </p>
        </div>

        {selectedMuscle && (
             <div className="bg-card p-6 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-right-4 border-l-4 border-l-secondary shadow-lg">
                <h3 className="text-md font-bold text-white mb-2 text-secondary">{selectedMuscle.toUpperCase()} Stats</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Volume Total (Semana)</span>
                        <span className="text-white font-mono font-bold">12,400kg</span>
                    </div>
                     <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Estimativa 1RM</span>
                        <span className="text-white font-mono font-bold">140kg</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Frequência</span>
                        <span className="text-white font-mono font-bold">2x / semana</span>
                    </div>
                </div>
             </div>
        )}
      </div>

      {/* --- MANUAL ENTRY MODAL --- */}
      {isManualModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-card w-full max-w-4xl rounded-2xl border border-gray-700 p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Dumbbell className="text-secondary" /> {editingWorkout ? 'Editar Sessão' : 'Novo Registro Manual'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Configure cada detalhe do seu treino</p>
                      </div>
                      <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Nome do Treino</label>
                            <input 
                                value={manualWorkout.name}
                                onChange={e => setManualWorkout({...manualWorkout, name: e.target.value})}
                                placeholder="ex: Peito e Tríceps Insano"
                                className="w-full bg-darker border border-gray-700 rounded-lg p-3 text-white focus:border-secondary outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Data e Hora</label>
                            <input 
                                type="datetime-local"
                                value={manualWorkout.timestamp?.slice(0, 16)}
                                onChange={e => setManualWorkout({...manualWorkout, timestamp: new Date(e.target.value).toISOString()})}
                                className="w-full bg-darker border border-gray-700 rounded-lg p-3 text-white focus:border-secondary outline-none font-bold"
                            />
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h4 className="text-sm font-black text-secondary uppercase border-b border-gray-800 pb-2">Exercícios</h4>
                          {manualWorkout.exercises?.map((ex, exIdx) => (
                              <div key={exIdx} className="bg-darker/50 p-6 rounded-xl border border-gray-700 space-y-4 relative">
                                  <button 
                                    onClick={() => setManualWorkout(prev => ({ ...prev, exercises: prev.exercises?.filter((_, i) => i !== exIdx) }))}
                                    className="absolute top-4 right-4 text-gray-600 hover:text-red-400"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="md:col-span-2">
                                          <label className="text-[9px] text-gray-500 uppercase font-bold">Exercício</label>
                                          <input 
                                            value={ex.name}
                                            onChange={e => updateManualExercise(exIdx, 'name', e.target.value)}
                                            placeholder="ex: Supino Reto"
                                            className="w-full bg-dark border border-gray-700 rounded p-2 text-white text-sm"
                                          />
                                      </div>
                                      <div>
                                          <label className="text-[9px] text-gray-500 uppercase font-bold">Grupo Muscular</label>
                                          <input 
                                            value={ex.muscleGroup}
                                            onChange={e => updateManualExercise(exIdx, 'muscleGroup', e.target.value)}
                                            placeholder="ex: Chest"
                                            className="w-full bg-dark border border-gray-700 rounded p-2 text-white text-sm"
                                          />
                                      </div>
                                  </div>

                                  <div className="space-y-2">
                                      <label className="text-[9px] text-gray-500 uppercase font-bold block">Séries</label>
                                      {ex.sets.map((set, sIdx) => (
                                          <div key={sIdx} className="grid grid-cols-4 md:grid-cols-5 gap-2 items-center">
                                              <div className="text-[10px] text-gray-600 font-bold uppercase">SET {sIdx + 1}</div>
                                              <div className="flex items-center gap-1">
                                                  <input 
                                                    type="number" 
                                                    value={set.reps} 
                                                    onChange={e => updateManualSet(exIdx, sIdx, 'reps', parseInt(e.target.value))}
                                                    className="w-full bg-dark border border-gray-700 rounded p-1.5 text-white text-xs text-center"
                                                  />
                                                  <span className="text-[8px] text-gray-500">REPS</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                  <input 
                                                    type="number" 
                                                    value={set.weight} 
                                                    onChange={e => updateManualSet(exIdx, sIdx, 'weight', parseInt(e.target.value))}
                                                    className="w-full bg-dark border border-gray-700 rounded p-1.5 text-white text-xs text-center"
                                                  />
                                                  <span className="text-[8px] text-gray-500">KG</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                  <input 
                                                    type="number" 
                                                    value={set.rpe} 
                                                    onChange={e => updateManualSet(exIdx, sIdx, 'rpe', parseInt(e.target.value))}
                                                    className="w-full bg-dark border border-gray-700 rounded p-1.5 text-white text-xs text-center"
                                                  />
                                                  <span className="text-[8px] text-gray-500">RPE</span>
                                              </div>
                                              <button 
                                                onClick={() => setManualWorkout(prev => {
                                                    const exercises = [...(prev.exercises || [])];
                                                    exercises[exIdx].sets = exercises[exIdx].sets.filter((_, i) => i !== sIdx);
                                                    return { ...prev, exercises };
                                                })}
                                                className="text-red-900 hover:text-red-500 p-1"
                                              >
                                                  <X size={14} />
                                              </button>
                                          </div>
                                      ))}
                                      <button 
                                        onClick={() => addSetToManualExercise(exIdx)}
                                        className="text-[10px] text-secondary hover:text-white flex items-center gap-1 mt-2 bg-secondary/10 px-3 py-1 rounded"
                                      >
                                          <Plus size={12} /> ADICIONAR SÉRIE
                                      </button>
                                  </div>
                              </div>
                          ))}
                          
                          <button 
                            onClick={addManualExercise}
                            className="w-full py-4 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2 font-bold uppercase text-xs"
                          >
                              <Plus size={18} /> Adicionar Novo Exercício
                          </button>
                      </div>

                      <div className="flex gap-4 pt-8">
                          <button 
                            onClick={handleSaveManual}
                            className="flex-1 bg-secondary text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                          >
                              <Save size={20} /> {editingWorkout ? 'SALVAR ALTERAÇÕES' : 'CONCLUIR REGISTRO'}
                          </button>
                          <button 
                            onClick={() => setIsManualModalOpen(false)}
                            className="px-8 py-4 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 font-bold"
                          >
                              DESCARTAR
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
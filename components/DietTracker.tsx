import React, { useState } from 'react';
import { Meal, Protocol, FoodItem } from '../types';
import { analyzeMealWithAI } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, Plus, Loader2, Edit2, Trash2, X, Save } from 'lucide-react';

interface DietTrackerProps {
  protocol: Protocol;
  meals: Meal[];
  onAddMeal: (meal: Meal) => void;
  onUpdateMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Protein, Carbs, Fat

const DietTracker: React.FC<DietTrackerProps> = ({ protocol, meals, onAddMeal, onUpdateMeal, onDeleteMeal }) => {
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  
  // Daily Totals
  const totalCalories = meals.reduce((acc, m) => acc + m.macros.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.macros.protein, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.macros.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.macros.fat, 0);

  // Remaining
  const remainingCalories = protocol.stats.targetCalories - totalCalories;
  const remainingProtein = protocol.stats.targetProtein - totalProtein;
  const remainingCarbs = protocol.stats.targetCarbs - totalCarbs;
  const remainingFat = protocol.stats.targetFat - totalFat;

  const handleAnalyzeAndAdd = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    
    const analysis = await analyzeMealWithAI(description);
    
    const newMeal: Meal = {
        id: crypto.randomUUID(),
        protocolId: protocol.id,
        timestamp: new Date().toISOString(),
        description,
        name: "Meal " + (meals.length + 1),
        mood: 'NEUTRAL',
        shapePerception: 5,
        items: analysis?.items || [],
        macros: {
            calories: analysis?.total?.calories || 0,
            protein: analysis?.total?.protein || 0,
            carbs: analysis?.total?.carbs || 0,
            fat: analysis?.total?.fat || 0
        },
        aiInsight: analysis?.insight
    };

    onAddMeal(newMeal);
    setDescription('');
    setAnalyzing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeal) {
        // Recalculate totals from items
        const newMacros = editingMeal.items.reduce((acc, item) => ({
            calories: acc.calories + (Number(item.calories) || 0),
            protein: acc.protein + (Number(item.protein) || 0),
            carbs: acc.carbs + (Number(item.carbs) || 0),
            fat: acc.fat + (Number(item.fat) || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        onUpdateMeal({ ...editingMeal, macros: newMacros });
        setEditingMeal(null);
    }
  };

  const updateItem = (index: number, field: keyof FoodItem, value: any) => {
    if (!editingMeal) return;
    const newItems = [...editingMeal.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingMeal({ ...editingMeal, items: newItems });
  };

  const deleteItem = (index: number) => {
      if (!editingMeal) return;
      const newItems = editingMeal.items.filter((_, i) => i !== index);
      setEditingMeal({ ...editingMeal, items: newItems });
  }

  const chartData = [
    { name: 'Protein', value: totalProtein },
    { name: 'Carbs', value: totalCarbs },
    { name: 'Fat', value: totalFat },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* --- DASHBOARD HEADER (Mobile First) --- */}
      <div className="lg:col-span-3 bg-card p-4 rounded-xl border border-gray-700 flex flex-wrap gap-4 justify-around items-center">
        <div className="text-center">
            <div className="text-xs text-gray-400 uppercase">Remaining Calories</div>
            <div className={`text-3xl font-bold ${remainingCalories < 0 ? 'text-red-500' : 'text-primary'}`}>
                {remainingCalories} <span className="text-sm text-gray-500">kcal</span>
            </div>
        </div>
        <div className="h-8 w-[1px] bg-gray-700 hidden sm:block"></div>
        <div className="flex gap-6 text-sm">
            <div className="text-center">
                <div className="text-gray-400 text-xs">Protein</div>
                <div className="font-bold text-emerald-400">{remainingProtein}g left</div>
            </div>
            <div className="text-center">
                <div className="text-gray-400 text-xs">Carbs</div>
                <div className="font-bold text-blue-400">{remainingCarbs}g left</div>
            </div>
            <div className="text-center">
                <div className="text-gray-400 text-xs">Fats</div>
                <div className="font-bold text-yellow-400">{remainingFat}g left</div>
            </div>
        </div>
      </div>

      {/* --- MEAL INPUT & LIST --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Quick Add */}
        <div className="bg-card p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" /> AI Quick Add
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 200g steak, 150g potato, 1tbsp olive oil"
                    className="flex-1 bg-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeAndAdd()}
                />
                <button 
                    onClick={handleAnalyzeAndAdd} 
                    disabled={analyzing}
                    className="bg-primary hover:bg-emerald-600 text-black font-bold px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {analyzing ? <Loader2 className="animate-spin" /> : <Plus />} Add
                </button>
            </div>
        </div>

        {/* Meal List */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Today's Meals</h3>
            {meals.map(meal => (
                <div key={meal.id} className="bg-card rounded-xl border border-gray-700 overflow-hidden group">
                    <div className="p-4 flex justify-between items-start bg-darker/30">
                        <div>
                            <div className="text-white font-bold text-lg">{meal.name}</div>
                            <div className="text-xs text-gray-400">{new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                <div className="text-xl font-bold text-white">{meal.macros.calories}</div>
                                <div className="text-[10px] text-gray-500 uppercase">kcal</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingMeal(meal)} className="p-2 hover:bg-gray-700 rounded text-blue-400"><Edit2 size={16}/></button>
                                <button onClick={() => onDeleteMeal(meal.id)} className="p-2 hover:bg-gray-700 rounded text-red-400"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Food Items Breakdown */}
                    <div className="p-4 border-t border-gray-700/50 space-y-2">
                        {meal.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                    <span className="text-gray-300">{item.name} <span className="text-gray-500 text-xs">({item.quantity})</span></span>
                                </div>
                                <div className="text-gray-400 font-mono text-xs">
                                    {item.calories}kcal <span className="text-emerald-500/70">P:{item.protein}</span> <span className="text-blue-500/70">C:{item.carbs}</span> <span className="text-yellow-500/70">F:{item.fat}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {meal.aiInsight && (
                        <div className="px-4 pb-4">
                            <div className="bg-primary/5 p-2 rounded text-xs text-gray-300 border-l-2 border-primary">
                                <span className="font-bold text-primary mr-1">AI Insight:</span> {meal.aiInsight}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {meals.length === 0 && <div className="text-gray-500 text-center py-10 italic">No meals tracked today.</div>}
        </div>
      </div>

      {/* --- STATS PANEL --- */}
      <div className="bg-card p-6 rounded-xl border border-gray-700 h-fit sticky top-4 hidden lg:block">
        <h3 className="text-lg font-bold text-white mb-6">Macro Distribution</h3>
        <div className="h-48 relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">{totalCalories}</span>
                <span className="text-xs text-gray-400">kcal consumed</span>
            </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {editingMeal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Edit Meal</h3>
                    <button onClick={() => setEditingMeal(null)}><X className="text-gray-400" /></button>
                </div>
                
                <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Meal Name</label>
                        <input 
                            value={editingMeal.name} 
                            onChange={e => setEditingMeal({...editingMeal, name: e.target.value})}
                            className="w-full bg-darker border border-gray-600 rounded p-2 text-white"
                        />
                    </div>

                    <div className="space-y-3">
                         <label className="block text-xs text-gray-400">Items (Edit macros per item)</label>
                         {editingMeal.items.map((item, idx) => (
                             <div key={idx} className="bg-darker p-3 rounded border border-gray-600 space-y-2">
                                <div className="flex justify-between">
                                     <input 
                                        value={item.name}
                                        onChange={e => updateItem(idx, 'name', e.target.value)}
                                        className="bg-transparent text-white font-bold border-b border-gray-600 w-1/2 focus:border-primary outline-none"
                                     />
                                     <button type="button" onClick={() => deleteItem(idx)} className="text-red-400 text-xs hover:underline">Remove</button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <span className="text-[10px] text-gray-400 block">Kcal</span>
                                        <input type="number" value={item.calories} onChange={e => updateItem(idx, 'calories', Number(e.target.value))} className="w-full bg-gray-800 text-white text-xs p-1 rounded"/>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-emerald-400 block">Prot</span>
                                        <input type="number" value={item.protein} onChange={e => updateItem(idx, 'protein', Number(e.target.value))} className="w-full bg-gray-800 text-white text-xs p-1 rounded"/>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-blue-400 block">Carbs</span>
                                        <input type="number" value={item.carbs} onChange={e => updateItem(idx, 'carbs', Number(e.target.value))} className="w-full bg-gray-800 text-white text-xs p-1 rounded"/>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-yellow-400 block">Fat</span>
                                        <input type="number" value={item.fat} onChange={e => updateItem(idx, 'fat', Number(e.target.value))} className="w-full bg-gray-800 text-white text-xs p-1 rounded"/>
                                    </div>
                                </div>
                             </div>
                         ))}
                    </div>

                    <button type="submit" className="w-full bg-primary text-black font-bold py-3 rounded flex items-center justify-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default DietTracker;
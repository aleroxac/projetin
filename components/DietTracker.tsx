import React, { useState } from 'react';
import { Meal, Protocol, FoodItem, FoodDefinition, MealCacheEntry } from '../types';
import { analyzeMealWithAI } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Sparkles, Plus, Loader2, Edit2, Trash2, X, Save, 
  Zap, ChevronDown, ChevronUp, Brain, Info, Database, 
  ArrowRightLeft, ToggleLeft, ToggleRight
} from 'lucide-react';

interface DietTrackerProps {
  protocol: Protocol;
  meals: Meal[];
  foodLibrary: Record<string, FoodDefinition>;
  mealCache: Record<string, MealCacheEntry>;
  onAddMeal: (meal: Meal) => void;
  onUpdateMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
  onUpdateLibrary: (name: string, definition: FoodDefinition) => void;
  onUpdateMealCache: (description: string, entry: MealCacheEntry) => void;
  onRemoveLibraryItem: (name: string) => void;
  onRemoveCacheItem: (description: string) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; 

const DietTracker: React.FC<DietTrackerProps> = ({ 
  protocol, meals, foodLibrary, mealCache, onAddMeal, onUpdateMeal, onDeleteMeal, onUpdateLibrary, onUpdateMealCache,
  onRemoveLibraryItem, onRemoveCacheItem
}) => {
  const [description, setDescription] = useState('');
  const [customMealName, setCustomMealName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showMemoryManager, setShowMemoryManager] = useState(false);
  const [requestInsight, setRequestInsight] = useState(true);
  const [expandedOriginalText, setExpandedOriginalText] = useState<Record<string, boolean>>({});

  const totalCalories = meals.reduce((acc, m) => acc + m.macros.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.macros.protein, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.macros.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.macros.fat, 0);

  const remainingCalories = protocol.stats.targetCalories - totalCalories;
  const remainingProtein = protocol.stats.targetProtein - totalProtein;
  const remainingCarbs = protocol.stats.targetCarbs - totalCarbs;
  const remainingFat = protocol.stats.targetFat - totalFat;

  const extractWeight = (quantityStr: string): number => {
    const match = quantityStr.match(/(\d+(?:\.\d+)?)\s*(g|gr|gramas|ml|ml)/i);
    if (match) return parseFloat(match[1]);
    const unitMatch = quantityStr.match(/^(\d+)/);
    if (unitMatch) return parseFloat(unitMatch[1]);
    return 100;
  };

  const normalizeName = (name: string): string => {
      return name.toLowerCase()
        .replace(/^(um|uma|dois|duas|de|com|feito|na|no)\s+/g, '')
        .replace(/\s+(de|com|feito|na|no)\s+/g, ' ')
        .trim();
  };

  const handleAnalyzeAndAdd = async () => {
    const rawDescription = description.trim();
    if (!rawDescription) return;
    setAnalyzing(true);

    const cachedMeal = mealCache[rawDescription.toLowerCase()];
    if (cachedMeal) {
        const newMeal: Meal = {
            id: crypto.randomUUID(),
            protocolId: protocol.id,
            timestamp: new Date().toISOString(),
            description: rawDescription,
            name: customMealName || cachedMeal.name,
            mood: 'NEUTRAL',
            shapePerception: 5,
            items: cachedMeal.items,
            macros: cachedMeal.macros,
            aiInsight: requestInsight ? cachedMeal.insight + " (Recuperado do seu histórico)" : undefined,
            tier: requestInsight ? cachedMeal.tier : undefined,
            swaps: requestInsight ? cachedMeal.swaps : undefined
        };
        onAddMeal(newMeal);
        resetForm();
        return;
    }
    
    const analysis = await analyzeMealWithAI(rawDescription, protocol.goal, remainingCalories);

    if (!analysis) {
        setAnalyzing(false);
        return;
    }

    const processedItems = analysis.items.map((item: any) => {
        const nameNormalized = normalizeName(item.name);
        const weight = extractWeight(item.quantity || "100g");
        const cachedFood = foodLibrary[nameNormalized];
        if (cachedFood) {
            return {
                ...item,
                calories: Math.round(cachedFood.caloriesPerGram * weight),
                protein: Math.round(cachedFood.proteinPerGram * weight * 10) / 10,
                carbs: Math.round(cachedFood.carbsPerGram * weight * 10) / 10,
                fat: Math.round(cachedFood.fatPerGram * weight * 10) / 10,
            };
        } else {
            const unitWeight = weight > 0 ? weight : 1;
            const density: FoodDefinition = {
                name: nameNormalized,
                caloriesPerGram: item.calories / unitWeight,
                proteinPerGram: item.protein / unitWeight,
                carbsPerGram: item.carbs / unitWeight,
                fatPerGram: item.fat / unitWeight,
                lastQuantityStr: item.quantity
            };
            onUpdateLibrary(nameNormalized, density);
            return item;
        }
    });

    const finalMacros = processedItems.reduce((acc: any, item: any) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const finalMealMacros = {
        calories: Math.round(finalMacros.calories),
        protein: Math.round(finalMacros.protein * 10) / 10,
        carbs: Math.round(finalMacros.carbs * 10) / 10,
        fat: Math.round(finalMacros.fat * 10) / 10
    };

    const newMeal: Meal = {
        id: crypto.randomUUID(),
        protocolId: protocol.id,
        timestamp: new Date().toISOString(),
        description: rawDescription,
        name: customMealName || analysis.name || "Refeição",
        mood: 'NEUTRAL',
        shapePerception: 5,
        items: processedItems,
        macros: finalMealMacros,
        aiInsight: requestInsight ? analysis.insight : undefined,
        tier: requestInsight ? analysis.tier : undefined,
        swaps: requestInsight ? analysis.swaps : undefined
    };

    onUpdateMealCache(rawDescription, {
        name: newMeal.name,
        items: processedItems,
        macros: finalMealMacros,
        insight: analysis.insight,
        tier: analysis.tier,
        swaps: analysis.swaps
    });

    onAddMeal(newMeal);
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setCustomMealName('');
    setAnalyzing(false);
  };

  const toggleOriginalText = (id: string) => {
    setExpandedOriginalText(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTierColor = (tier?: string) => {
      switch(tier) {
          case 'S': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
          case 'A': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
          case 'B': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
          case 'C': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
          case 'D': return 'text-red-400 bg-red-400/10 border-red-400/30';
          default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      }
  }

  const chartData = [
    { name: 'Protein', value: totalProtein },
    { name: 'Carbs', value: totalCarbs },
    { name: 'Fat', value: totalFat },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Metrics Banner */}
      <div className="lg:col-span-3 bg-card p-4 rounded-xl border border-gray-700 flex flex-wrap gap-4 justify-around items-center shadow-lg">
        <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Meta Restante</div>
            <div className={`text-3xl font-bold ${remainingCalories < 0 ? 'text-red-500' : 'text-primary'}`}>
                {Math.round(remainingCalories)} <span className="text-sm text-gray-500">kcal</span>
            </div>
        </div>
        <div className="h-8 w-[1px] bg-gray-700 hidden sm:block"></div>
        <div className="flex gap-6 text-sm">
            <div className="text-center">
                <div className="text-gray-400 text-[10px] uppercase font-bold">P</div>
                <div className="font-bold text-emerald-400">{Math.round(remainingProtein)}g</div>
            </div>
            <div className="text-center">
                <div className="text-gray-400 text-[10px] uppercase font-bold">C</div>
                <div className="font-bold text-blue-400">{Math.round(remainingCarbs)}g</div>
            </div>
            <div className="text-center">
                <div className="text-gray-400 text-[10px] uppercase font-bold">G</div>
                <div className="font-bold text-yellow-400">{Math.round(remainingFat)}g</div>
            </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        
        {/* Entry Box */}
        <div className="bg-card p-6 rounded-xl border border-gray-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50"></div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-400" /> Registro Inteligente
                </h3>
                <button 
                    onClick={() => setShowMemoryManager(true)}
                    className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-primary transition-colors bg-gray-800 px-2 py-1 rounded border border-gray-700"
                >
                    <Database size={12} /> GERENCIAR MEMÓRIA
                </button>
            </div>
            
            <div className="space-y-4">
                <input 
                    type="text" 
                    value={customMealName}
                    onChange={(e) => setCustomMealName(e.target.value)}
                    placeholder="Título da Refeição (ex: Almoço de Domingo)"
                    className="w-full bg-darker border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-primary outline-none transition-all"
                />
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="O que você comeu? Ex: 100g arroz, 2 bifes..."
                        className="flex-1 bg-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeAndAdd()}
                    />
                    <button 
                        onClick={handleAnalyzeAndAdd} 
                        disabled={analyzing}
                        className="bg-primary hover:bg-emerald-600 text-black font-bold px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {analyzing ? <Loader2 className="animate-spin" /> : <Plus />}
                    </button>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setRequestInsight(!requestInsight)}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            {requestInsight ? <ToggleRight className="text-primary" /> : <ToggleLeft />}
                            Pedir Insight da IA
                        </button>
                    </div>
                    {description.trim() && mealCache[description.trim().toLowerCase()] && (
                        <div className="flex items-center gap-1 text-[10px] text-primary font-bold animate-pulse">
                            <Zap size={10} fill="currentColor" /> MEMÓRIA ENCONTRADA
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Linha do Tempo <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-normal">{meals.length}</span>
            </h3>
            {meals.map(meal => (
                <div key={meal.id} className="bg-card rounded-xl border border-gray-700 overflow-hidden group hover:border-gray-500 transition-all">
                    <div className="p-4 flex justify-between items-start bg-darker/30">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-white font-bold text-lg">{meal.name}</span>
                                {meal.tier && (
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${getTierColor(meal.tier)}`}>
                                        TIER {meal.tier}
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-gray-500 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span>{new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <button 
                                        onClick={() => toggleOriginalText(meal.id)}
                                        className="text-primary hover:underline flex items-center gap-0.5"
                                    >
                                        {expandedOriginalText[meal.id] ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                        Texto Original
                                    </button>
                                </div>
                                {expandedOriginalText[meal.id] && (
                                    <div className="bg-darker p-2 rounded border border-gray-800 italic text-gray-400 mt-1 max-w-sm">
                                        "{meal.description}"
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                <div className="text-xl font-bold text-white leading-none">{meal.macros.calories}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">kcal</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingMeal(meal)} className="p-2 hover:bg-gray-700 rounded text-blue-400 transition-colors"><Edit2 size={16}/></button>
                                <button onClick={() => onDeleteMeal(meal.id)} className="p-2 hover:bg-gray-700 rounded text-red-400 transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-700/50 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {meal.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0"></div>
                                    <span className="text-gray-300 truncate font-medium">{item.name}</span>
                                    <span className="text-gray-500 text-[10px] flex-shrink-0">({item.quantity})</span>
                                </div>
                                <div className="text-gray-500 font-mono flex-shrink-0 ml-2">
                                    <span className="text-emerald-500/80">{item.protein}p</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(meal.aiInsight || (meal.swaps && meal.swaps.length > 0)) && (
                        <div className="px-4 pb-4 space-y-2">
                            {meal.aiInsight && (
                                <div className="bg-primary/5 p-2 rounded text-[11px] text-gray-300 border-l-2 border-primary flex gap-2">
                                    <Brain size={14} className="text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-primary uppercase text-[9px] mr-2">Nutri-Insight</span> 
                                        {meal.aiInsight}
                                    </div>
                                </div>
                            )}
                            {meal.swaps && meal.swaps.length > 0 && (
                                <div className="bg-blue-500/5 p-2 rounded text-[11px] text-gray-300 border-l-2 border-blue-500 flex gap-2">
                                    <ArrowRightLeft size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-blue-500 uppercase text-[9px] mr-2">Smart Swaps</span> 
                                        {meal.swaps.join(' • ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            {meals.length === 0 && <div className="text-gray-500 text-center py-12 border border-dashed border-gray-700 rounded-xl italic">Aguardando seu primeiro registro...</div>}
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border border-gray-700 h-fit sticky top-4 hidden lg:block shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Info size={18} className="text-primary" /> Balanço do Dia</h3>
        <div className="h-56 relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white leading-none">{Math.round(totalCalories)}</span>
                <span className="text-[10px] text-gray-500 uppercase mt-1 font-bold">kcal consumidas</span>
            </div>
        </div>
        
        <div className="space-y-2">
            {[
                { label: 'Proteína', current: totalProtein, target: protocol.stats.targetProtein, color: 'emerald' },
                { label: 'Carbos', current: totalCarbs, target: protocol.stats.targetCarbs, color: 'blue' },
                { label: 'Gordura', current: totalFat, target: protocol.stats.targetFat, color: 'yellow' }
            ].map((macro) => (
                <div key={macro.label} className="p-3 bg-darker/50 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">{macro.label}</span>
                        <span className="text-xs font-bold text-white">{Math.round(macro.current)}g / {macro.target}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full bg-${macro.color}-500 transition-all duration-500`} 
                            style={{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {showMemoryManager && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-card w-full max-w-2xl rounded-2xl border border-gray-700 p-8 max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Database className="text-primary" /> Memory Manager
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Visualize e edite as associações aprendidas</p>
                      </div>
                      <button onClick={() => setShowMemoryManager(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                          <h4 className="text-sm font-black text-primary uppercase tracking-tighter flex items-center gap-2">
                              Densidades ({Object.keys(foodLibrary).length})
                              <Info size={12} className="text-gray-500" />
                          </h4>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {(Object.entries(foodLibrary) as [string, FoodDefinition][]).map(([name, def]) => (
                                  <div key={name} className="bg-darker/50 p-3 rounded-xl border border-gray-800 flex justify-between items-center group">
                                      <div className="overflow-hidden">
                                          <div className="text-white font-bold text-sm truncate uppercase">{name}</div>
                                          <div className="text-[10px] text-gray-500 font-mono">
                                              {def.caloriesPerGram.toFixed(2)} kcal/g
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => onRemoveLibraryItem(name)}
                                        className="text-gray-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <Trash2 size={14} />
                                      </button>
                                  </div>
                              ))}
                              {Object.keys(foodLibrary).length === 0 && <p className="text-xs text-gray-600 italic">Nenhum alimento aprendido.</p>}
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h4 className="text-sm font-black text-secondary uppercase tracking-tighter flex items-center gap-2">
                              Frases em Cache ({Object.keys(mealCache).length})
                          </h4>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {(Object.entries(mealCache) as [string, MealCacheEntry][]).map(([phrase, entry]) => (
                                  <div key={phrase} className="bg-darker/50 p-3 rounded-xl border border-gray-800 flex justify-between items-center group">
                                      <div className="overflow-hidden">
                                          <div className="text-white font-bold text-sm truncate italic">"{phrase}"</div>
                                          <div className="text-[10px] text-secondary font-bold uppercase">
                                              {entry.name} • {entry.macros.calories}kcal
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => onRemoveCacheItem(phrase)}
                                        className="text-gray-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <Trash2 size={14} />
                                      </button>
                                  </div>
                              ))}
                              {Object.keys(mealCache).length === 0 && <p className="text-xs text-gray-600 italic">Nenhuma frase salva.</p>}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {editingMeal && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Ajustar Refeição</h3>
                    <button onClick={() => setEditingMeal(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onUpdateMeal(editingMeal);
                    setEditingMeal(null);
                }} className="space-y-6">
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Título</label>
                        <input value={editingMeal.name} onChange={e => setEditingMeal({...editingMeal, name: e.target.value})} className="w-full bg-darker border border-gray-600 rounded p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg">
                        <Save size={18} /> Salvar Alterações
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default DietTracker;
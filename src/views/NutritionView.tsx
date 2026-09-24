import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Droplets,
  Sparkles,
  Zap,
  Flame,
  Search,
  Clock,
  FlaskConical,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { GlassCard } from '../components/common/GlassCard';
import { HUDBar } from '../components/common/HUDBar';

const QUICK_FOOD_ITEMS = [
  { name: 'Double Scoop Whey Isolate', calories: 240, protein: 50, carbs: 4, fat: 2 },
  { name: 'Grilled Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fat: 7 },
  { name: 'Steak & Sweet Potato Feast', calories: 650, protein: 52, carbs: 58, fat: 20 },
  { name: 'Oatmeal & Peanut Butter Bowl', calories: 480, protein: 18, carbs: 64, fat: 16 },
  { name: 'Greek Yogurt & Honey Parfait', calories: 280, protein: 24, carbs: 32, fat: 4 },
  { name: 'Egg White Omelet & Toast', calories: 360, protein: 34, carbs: 30, fat: 8 },
];

export const NutritionView: React.FC = () => {
  const [state, actions] = usePlayerStore();
  const { nutrition } = state;

  // Food logging form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState(450);
  const [protein, setProtein] = useState(40);
  const [carbs, setCarbs] = useState(45);
  const [fat, setFat] = useState(12);

  // Search filter for presets
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = QUICK_FOOD_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickAddPreset = (item: typeof QUICK_FOOD_ITEMS[0]) => {
    actions.addFood({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    });
  };

  const handleCustomAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    actions.addFood({
      name: foodName,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
    });

    setFoodName('');
    setShowAddModal(false);
  };

  const waterPercent = Math.min(
    100,
    Math.round((nutrition.waterConsumedMl / (nutrition.waterGoalMl || 1)) * 100)
  );

  const proteinPercent = Math.min(
    100,
    Math.round((nutrition.proteinConsumed / (nutrition.proteinGoal || 1)) * 100)
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* MP Calorie Energy Bar (Hero Element) */}
      <GlassCard variant="violet" cornerCut="both" className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <h2 className="font-hud text-sm font-bold tracking-wider text-white uppercase">
              MP Energetic Budget (Calorie Reserve)
            </h2>
          </div>
          <span className="font-tech text-xs text-slate-400">
            Target: <strong className="font-hud text-violet-300">{nutrition.calorieGoal} KCAL</strong>
          </span>
        </div>

        <HUDBar
          current={nutrition.caloriesConsumed}
          max={nutrition.calorieGoal}
          label="Remaining Capacity"
          sublabel={`${nutrition.caloriesConsumed} / ${nutrition.calorieGoal} kcal`}
          variant="violet"
          size="lg"
          showPercentage
        />

        {/* Macro Nutrient Sub-bars */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Protein Bar */}
          <div className="p-3 bg-black/50 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-xs font-tech text-slate-300 uppercase">
              <span className="text-cyan-400 font-bold">Protein</span>
              <span className="font-hud">{nutrition.proteinConsumed}g</span>
            </div>
            <div className="w-full bg-slate-950 h-2 border border-cyan-500/30 overflow-hidden">
              <div
                className="h-full bg-cyan-400 shadow-[0_0_8px_#00D4FF]"
                style={{ width: `${Math.min(100, (nutrition.proteinConsumed / nutrition.proteinGoal) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-tech text-slate-500 mt-1 block text-right">
              Goal: {nutrition.proteinGoal}g
            </span>
          </div>

          {/* Carbs Bar */}
          <div className="p-3 bg-black/50 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-xs font-tech text-slate-300 uppercase">
              <span className="text-amber-400 font-bold">Carbs</span>
              <span className="font-hud">{nutrition.carbsConsumed}g</span>
            </div>
            <div className="w-full bg-slate-950 h-2 border border-amber-500/30 overflow-hidden">
              <div
                className="h-full bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                style={{ width: `${Math.min(100, (nutrition.carbsConsumed / nutrition.carbsGoal) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-tech text-slate-500 mt-1 block text-right">
              Goal: {nutrition.carbsGoal}g
            </span>
          </div>

          {/* Fat Bar */}
          <div className="p-3 bg-black/50 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-xs font-tech text-slate-300 uppercase">
              <span className="text-rose-400 font-bold">Fat</span>
              <span className="font-hud">{nutrition.fatConsumed}g</span>
            </div>
            <div className="w-full bg-slate-950 h-2 border border-rose-500/30 overflow-hidden">
              <div
                className="h-full bg-rose-400 shadow-[0_0_8px_#FF3B5C]"
                style={{ width: `${Math.min(100, (nutrition.fatConsumed / nutrition.fatGoal) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-tech text-slate-500 mt-1 block text-right">
              Goal: {nutrition.fatGoal}g
            </span>
          </div>
        </div>
      </GlassCard>

      {/* STR Potion (Protein) & Mana Flask (Water) Dual Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STR Potion Tracker (Protein Progress Ring) */}
        <GlassCard variant="cyan" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <h3 className="font-hud text-xs font-bold text-white uppercase tracking-wider">
                STR Potion Synthesis
              </h3>
            </div>
            <span className="font-tech text-xs text-cyan-300">{proteinPercent}% Synthesized</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Circular Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#00D4FF"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - proteinPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 shadow-glow-cyan"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-hud text-base font-black text-cyan-300">
                  {nutrition.proteinConsumed}g
                </span>
                <span className="font-tech text-[9px] text-slate-400 uppercase">
                  / {nutrition.proteinGoal}g
                </span>
              </div>
            </div>

            {/* Quick-add chips */}
            <div className="flex-1 space-y-2">
              <span className="font-tech text-xs text-slate-300 uppercase block">Quick Infusion Chips</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[20, 30, 45].map((g) => (
                  <button
                    key={g}
                    onClick={() => actions.addProtein(g)}
                    className="py-1.5 px-2 bg-black/60 hover:bg-cyan-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-hud text-xs font-bold transition-all active:scale-95"
                  >
                    +{g}g
                  </button>
                ))}
              </div>
              <p className="font-sans text-[10px] text-slate-400">
                Directly feeds the STR attribute and activates muscular cell repair.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Mana Flask Hydration Tracker (Water) */}
        <GlassCard variant="cyan" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <h3 className="font-hud text-xs font-bold text-white uppercase tracking-wider">
                Mana Flask Hydration
              </h3>
            </div>
            <span className="font-tech text-xs text-cyan-300">{waterPercent}% Capacity</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Visual Droplet Flask Container */}
            <div className="relative w-20 h-24 bg-black/60 border-2 border-cyan-500/40 clip-corner-br flex flex-col justify-end overflow-hidden shrink-0">
              <div
                className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 transition-all duration-500 shadow-[0_0_15px_#00D4FF]"
                style={{ height: `${waterPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-hud text-xs font-black text-white drop-shadow-md">
                {nutrition.waterConsumedMl}ml
              </div>
            </div>

            {/* Quick Water Chips */}
            <div className="flex-1 space-y-2">
              <span className="font-tech text-xs text-slate-300 uppercase block">Tappable Flask Refills</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[250, 500, 750].map((ml) => (
                  <button
                    key={ml}
                    onClick={() => actions.addWater(ml)}
                    className="py-1.5 px-2 bg-black/60 hover:bg-cyan-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-hud text-xs font-bold transition-all active:scale-95"
                  >
                    +{ml}ml
                  </button>
                ))}
              </div>
              <p className="font-sans text-[10px] text-slate-400">
                Target: {nutrition.waterGoalMl}ml daily. Feeds the INT (Intelligence) stat.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Meal Logging & Presets */}
      <GlassCard variant="default" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-cyan-400" />
            <h3 className="font-hud text-sm font-bold text-white uppercase tracking-wider">
              Food & Nutrition Extraction Log
            </h3>
          </div>

          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-3 py-1.5 bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-hud text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 hover:bg-cyan-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Log Custom Meal
          </button>
        </div>

        {/* Custom Food Entry Drawer */}
        {showAddModal && (
          <form
            onSubmit={handleCustomAddFood}
            className="p-4 bg-black/60 border border-cyan-500/30 space-y-3 animate-in fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-tech text-xs text-slate-300 uppercase mb-1">
                  Meal / Food Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Eggs, Avocado Toast & Shake"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-tech text-[10px] text-slate-400 uppercase mb-1">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full bg-black/60 border border-slate-700 px-2 py-1.5 text-xs text-center text-white"
                  />
                </div>
                <div>
                  <label className="block font-tech text-[10px] text-cyan-400 uppercase mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full bg-black/60 border border-slate-700 px-2 py-1.5 text-xs text-center text-white"
                  />
                </div>
                <div>
                  <label className="block font-tech text-[10px] text-amber-400 uppercase mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full bg-black/60 border border-slate-700 px-2 py-1.5 text-xs text-center text-white"
                  />
                </div>
                <div>
                  <label className="block font-tech text-[10px] text-rose-400 uppercase mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value))}
                    className="w-full bg-black/60 border border-slate-700 px-2 py-1.5 text-xs text-center text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-black font-hud text-xs font-bold uppercase tracking-wider"
            >
              Record Nutritional Infusion
            </button>
          </form>
        )}

        {/* Quick Food Presets Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-tech text-xs uppercase tracking-wider text-slate-400">
              Quick Hunter Rations
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rations..."
                className="w-full pl-8 pr-2.5 py-1 bg-black/60 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-tech"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredPresets.map((item) => (
              <div
                key={item.name}
                onClick={() => handleQuickAddPreset(item)}
                className="p-2.5 bg-black/40 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="font-hud text-xs font-bold text-slate-200">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-tech text-slate-400 mt-0.5">
                    <span className="text-white">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400">{item.protein}g P</span>
                  </div>
                </div>
                <span className="text-xs font-hud text-cyan-400 font-bold">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Food Log History */}
        <div className="space-y-2 pt-2">
          <span className="font-tech text-xs uppercase tracking-wider text-slate-400 block">
            Today's Logged Items ({nutrition.foodLogs.length})
          </span>

          <div className="space-y-1.5">
            {nutrition.foodLogs.map((food) => (
              <div
                key={food.id}
                className="p-2.5 bg-black/30 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-tech text-slate-400">{food.time}</span>
                  <span className="font-sans font-medium text-slate-200">{food.name}</span>
                </div>
                <div className="flex items-center gap-3 font-hud text-[11px]">
                  <span className="text-white font-bold">{food.calories} kcal</span>
                  <span className="text-cyan-400">{food.protein}g P</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

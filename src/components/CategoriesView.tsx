import React from 'react';
import {
  BookOpen,
  Laptop,
  Shirt,
  Home,
  Users,
  Grid,
  ArrowRight,
} from 'lucide-react';
import { Category, ParentCategoryGroup } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onSelectCategory,
}) => {
  const groups: { name: ParentCategoryGroup; description: string; icon: any }[] = [
    { name: 'Academic', description: 'Textbooks, calculators, lab gear, notes & drafting sets', icon: BookOpen },
    { name: 'Electronics', description: 'Laptops, tablets, chargers, monitors, peripherals & audio', icon: Laptop },
    { name: 'Personal', description: 'Apparel, collegiate hoodies, uniforms, backpacks & watches', icon: Shirt },
    { name: 'Dormitory', description: 'Desk lamps, fans, organizers, mini-fridges & dorm chairs', icon: Home },
    { name: 'Organization', description: 'Campus club merchandise, event tickets, varsity gear', icon: Users },
    { name: 'Others', description: 'Sports equipment, musical instruments & miscellaneous', icon: Grid },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-serif">
          Browse by Campus Categories
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Curated departments for students, professors, and university staff
        </p>
      </div>

      <div className="space-y-8">
        {groups.map((grp) => {
          const Icon = grp.icon;
          const groupCategories = categories.filter((c) => c.parentGroup === grp.name);
          if (groupCategories.length === 0) return null;

          return (
            <div key={grp.name} className="space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-yellow-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{grp.name} Department</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{grp.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-yellow-400 hover:shadow-md cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-yellow-400 transition">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-800 dark:group-hover:text-yellow-400 px-2.5 py-1 rounded-lg transition">
                        {cat.itemCount} items
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-800 dark:group-hover:text-yellow-400 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

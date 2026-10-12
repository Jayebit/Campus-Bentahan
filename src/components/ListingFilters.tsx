import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Category, Department, MeetupLocation } from '../types';

interface ListingFiltersProps {
  categories: Category[];
  departments: Department[];
  meetupLocations: MeetupLocation[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedMeetupId: string;
  setSelectedMeetupId: (locId: string) => void;
  negotiableOnly: boolean;
  setNegotiableOnly: (val: boolean) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onResetFilters: () => void;
}

export const ListingFilters: React.FC<ListingFiltersProps> = ({
  categories,
  departments,
  meetupLocations,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedDepartment,
  setSelectedDepartment,
  selectedMeetupId,
  setSelectedMeetupId,
  negotiableOnly,
  setNegotiableOnly,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onResetFilters,
}) => {
  const conditions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'NEW', label: 'Brand New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
  ];

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedCondition !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    selectedDepartment !== 'all' ||
    selectedMeetupId !== 'all' ||
    negotiableOnly ||
    statusFilter !== 'AVAILABLE';

  return (
    <div className="space-y-4">
      {/* Category Pills Bar (Horizontal scrollable on phone & iPad) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 rounded-full border transition whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full border transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{cat.name}</span>
            {cat.itemCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.itemCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Secondary Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side Quick Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Condition Dropdown */}
          <div className="relative">
            <select
              value={selectedCondition}
              onChange={(e) => onSelectCondition(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 pr-7 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {conditions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Safe Meetup Spot Dropdown */}
          <div className="relative hidden sm:block">
            <select
              value={selectedMeetupId}
              onChange={(e) => setSelectedMeetupId(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 pr-7 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[180px] truncate"
            >
              <option value="all">All Campus Meetup Spots</option>
              {meetupLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Department Filter */}
          <div className="relative hidden md:block">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 pr-7 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[160px] truncate"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.code} - {d.college}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Price Range Inputs */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
            <span className="text-slate-400 font-mono">₱</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-14 bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
            <span className="text-slate-300 dark:text-slate-600">-</span>
            <span className="text-slate-400 font-mono">₱</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-14 bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>

          {/* Negotiable Only Checkbox */}
          <label className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={negotiableOnly}
              onChange={(e) => setNegotiableOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Negotiable Only</span>
          </label>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Right Side: Sorting Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Sort:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 pr-7 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest Listed</option>
              <option value="lowest_price">Price: Low to High</option>
              <option value="highest_price">Price: High to Low</option>
              <option value="most_popular">Most Popular</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

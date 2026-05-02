'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Star, MessageCircle, Heart, MapPin, DollarSign, Filter, Grid, List, X } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface GalleryItem {
  id: string;
  title: string;
  beforeImage: string;
  afterImage: string;
  colorFamily: string;
  tone: string;
  service: string;
  rating: number;
  reviews: number;
  likes: number;
  stylist: string;
  location: string;
  priceRange: string;
  badges: string[];
}

interface ColorgeniusGalleryProps {
  items: GalleryItem[];
  className?: string;
}

const colorFilters = ['All', 'Blonde', 'Brunette', 'Red', 'Black', 'Fantasy'];
const toneFilters = ['All', 'Warm', 'Cool', 'Neutral', 'Ash'];
const serviceFilters = ['All', 'Full Color', 'Balayage', 'Highlights', 'Root Touch-up'];
const sortOptions = ['Top Rated', 'Most Reviewed', 'Trending', 'Recent'];

export function ColorgeniusGallery({ items, className }: ColorgeniusGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeColor, setActiveColor] = useState('All');
  const [activeTone, setActiveTone] = useState('All');
  const [activeService, setActiveService] = useState('All');
  const [activeSort, setActiveSort] = useState('Top Rated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.stylist.toLowerCase().includes(query) ||
        item.colorFamily.toLowerCase().includes(query)
      );
    }

    // Color filter
    if (activeColor !== 'All') {
      result = result.filter(item => item.colorFamily === activeColor);
    }

    // Tone filter
    if (activeTone !== 'All') {
      result = result.filter(item => item.tone === activeTone);
    }

    // Service filter
    if (activeService !== 'All') {
      result = result.filter(item => item.service === activeService);
    }

    // Sort
    switch (activeSort) {
      case 'Top Rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'Most Reviewed':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'Trending':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'Recent':
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [items, searchQuery, activeColor, activeTone, activeService, activeSort]);

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setActiveColor('All');
    setActiveTone('All');
    setActiveService('All');
    setSearchQuery('');
  };

  return (
    <section className={cn('py-16 bg-gray-50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Explore Color Transformations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse real results from our community. Filter by color, style, or rating to find your perfect match.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search colors, styles, stylists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          {/* Color Family */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {colorFilters.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveColor(color)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  activeColor === color
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
                )}
              >
                {color}
              </motion.button>
            ))}
          </div>

          {/* Tone */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {toneFilters.map((tone) => (
              <motion.button
                key={tone}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTone(tone)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
                  activeTone === tone
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                )}
              >
                {tone}
              </motion.button>
            ))}
          </div>

          {/* Service */}
          <div className="flex flex-wrap gap-2 justify-center">
            {serviceFilters.map((service) => (
              <motion.button
                key={service}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveService(service)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
                  activeService === service
                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300'
                )}
              >
                {service}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Sort and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(activeColor !== 'All' || activeTone !== 'All' || activeService !== 'All') && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {activeColor !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">
                {activeColor}
                <button onClick={() => setActiveColor('All')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeTone !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">
                {activeTone}
                <button onClick={() => setActiveTone('All')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeService !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm">
                {activeService}
                <button onClick={() => setActiveService('All')}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Before/After Slider */}
                  <div className="relative">
                    <BeforeAfterSlider
                      beforeImage={item.beforeImage}
                      afterImage={item.afterImage}
                      className="rounded-none"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.badges.map((badge) => (
                        <span
                          key={badge}
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            badge === 'Trending' && 'bg-orange-100 text-orange-700',
                            badge === "Editor's Pick" && 'bg-indigo-100 text-indigo-700',
                            badge === 'Top Rated' && 'bg-yellow-100 text-yellow-700',
                            badge === 'New' && 'bg-green-100 text-green-700'
                          )}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-gray-900">{item.rating}</span>
                        <span>({item.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className={cn(
                          'w-4 h-4 cursor-pointer transition-colors',
                          likedItems.has(item.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'
                        )} onClick={() => toggleLike(item.id)} />
                        <span>{item.likes + (likedItems.has(item.id) ? 1 : 0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {item.priceRange}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">by {item.stylist}</span>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          View Formula
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search with different keywords.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ColorgeniusGallery;

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Camera, Star, ArrowRight, Sparkles } from 'lucide-react';

interface ColorgeniusHeroProps {
  className?: string;
}

const rotatingWords = ['Perfect', 'Personalized', 'Professional'];

const colorSwatches = [
  { color: '#F5E6D3', name: 'Blonde' },
  { color: '#E8D5B7', name: 'Golden' },
  { color: '#C8956C', name: 'Bronze' },
  { color: '#A0522D', name: 'Auburn' },
  { color: '#8B4513', name: 'Brunette' },
  { color: '#2C1810', name: 'Black' },
  { color: '#E6B8D4', name: 'Rose' },
  { color: '#D4A574', name: 'Honey' },
];

export function ColorgeniusHero({ className }: ColorgeniusHeroProps) {
  const [currentWord, setCurrentWord] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={cn('relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50', className)}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating circles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-100/50"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              left: `${20 + i * 25}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">AI-Powered Hair Color</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Get{' '}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5 }}
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {rotatingWords[currentWord]}
                </motion.span>
              </AnimatePresence>
              <br />
              Color Formulation
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-lg text-gray-600 max-w-lg mx-auto lg:mx-0"
            >
              Get salon-perfect color matched to your unique hair profile in seconds. 
              Our AI analyzes your hair and creates a personalized formula just for you.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                  'inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full',
                  'text-white font-semibold text-lg',
                  'bg-gradient-to-r from-indigo-600 to-purple-600',
                  'shadow-xl shadow-indigo-500/30',
                  'transition-all duration-300'
                )}
              >
                <Camera className="w-5 h-5" />
                Analyze My Hair
                <motion.span
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full',
                  'text-gray-700 font-semibold text-lg',
                  'bg-white border-2 border-gray-200',
                  'hover:border-indigo-300 hover:text-indigo-600',
                  'transition-all duration-300'
                )}
              >
                View Gallery
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {['S', 'M', 'A', 'J', 'K'][i]}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">Trusted by 10,000+ stylists</span>
              </div>
            </motion.div>
          </div>

          {/* Right content - Orbiting color swatches */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[400px] h-[400px]">
              {/* Center element */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 z-10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              {/* Orbiting swatches */}
              {colorSwatches.map((swatch, i) => {
                const angle = (i / colorSwatches.length) * 2 * Math.PI;
                const radius = 160;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      marginLeft: -24,
                      marginTop: -24,
                    }}
                    animate={{
                      x: [x, x * 1.1, x],
                      y: [y, y * 1.1, y],
                      rotate: [0, 360],
                    }}
                    transition={{
                      x: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                      y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                      rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full shadow-lg cursor-pointer"
                      style={{ backgroundColor: swatch.color }}
                      whileHover={{ scale: 1.3, zIndex: 20 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                          {swatch.name}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Orbit ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-dashed border-indigo-200" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ColorgeniusHero;

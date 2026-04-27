"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
  Alert, 
  AlertDescription, 
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
  Palette, 
  Search, 
  Filter, 
  CheckCircle, 
  X,
  Save,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function Library() {
  const [formulas, setFormulas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    line: '',
    resultLevel: '',
    favoriteOnly: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // Product data (same as in formulate page)
  const productBrands = [
    { value: 'schwarzkopf', label: 'Schwarzkopf Professional' },
    { value: 'wella', label: 'Wella Professionals' },
    { value: 'redken', label: 'Redken' },
    { value: 'lojels', label: 'L\'Oréal Professionnel' },
    { value: 'kevyn', label: 'Kevin Murphy' }
  ];
  const productLines = {
    schwarzkopf: [
      { value: 'ignite', label: 'Igora Royal' },
      { value: 'vibrance', label: 'Igora Vibrance' },
      { value: 'zeroamm', label: 'Igora Zero Amm' }
    ],
    wella: [
      { value: 'koleston', label: 'Koleston Perfect' },
      { value: 'colortouch', label: 'Color Touch' },
      { value: 'illumina', label: 'Illumina Color' }
    redken: [
      { value: 'colorextend', label: 'Color Extend' },
      { value: 'fusion', label: 'Fusion' },
      { value: 'shades', label: 'Shades EQ' }
    lojels: [
      { value: 'majirel', label: 'Majirel' },
      { value: 'diaLight', label: 'DiaLight' },
      { value: 'infinia', label: 'Infinia' }
    kevyn: [
      { value: 'color', label: 'Color.Bang' },
      { value: 'angel', label: 'Angel.Wash' },
      { value: 'refresh', label: 'Refresh.Me' }
    ]
  };
  const levels = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Level ${i + 1}`
  }));
  useEffect(() => {
    loadFormulas();
  }, [searchTerm, filters]);
  const loadFormulas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const where: any = {};
      
      // Search term filtering
      if (searchTerm) {
        where.OR = [
          { productBrand: { contains: searchTerm, mode: 'insensitive' } },
          { productLine: { contains: searchTerm, mode: 'insensitive' } },
          { productShade: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
      // Filter by brand
      if (filters.brand) {
        where.productBrand = filters.brand;
      // Filter by line
      if (filters.line) {
        where.productLine = filters.line;
      // Filter by result level (target level)
      if (filters.resultLevel) {
        where.targetLevel = parseInt(filters.resultLevel);
      // Note: In a real app, we'd have a favorites table/column
      // For now, we'll filter favorites in memory after fetching
      const formulaList = await db.formula.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          currentLevel: true,
          currentTone: true,
          targetLevel: true,
          targetTone: true,
          condition: true,
          grayPercentage: true,
          developerVolume: true,
          processingTime: true,
          productBrand: true,
          productLine: true,
          productShade: true,
          notes: true,
          createdAt: true,
          updatedAt: true
        }
      });
      setFormulas(formulaList);
    } catch (err) {
      setError('Failed to load formulas');
    } finally {
      setLoading(false);
    }
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      return newSet;
    });
  const isFavorite = (id: string) => favorites.has(id);
  const filteredFormulas = formulas.filter(formula => {
    if (filters.favoriteOnly && !isFavorite(formula.id)) {
      return false;
    return true;
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this formula? This action cannot be undone.')) {
      return;
      await db.formula.delete({ where: { id } });
      loadFormulas(); // Refresh list
      // Remove from favorites if deleted
      setFavorites(prev => {
        const newSet = new Set(prev);
        return newSet;
      setError('Failed to delete formula');
  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Formula Library</CardTitle>
            <Link href="/formulate" className="text-sm font-medium text-primary hover:underline">
              <Plus className="mr-2 h-4 w-4" /> Create New Formula
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search formulas by brand, line, shade, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md"
              />
            </div>
            
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Brand</label>
                <Select 
                  value={filters.brand}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}
                  placeholder="All brands"
                >
                  <SelectItem value="">All brands</SelectItem>
                  {productBrands.map(brand => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Line</label>
                  value={filters.line}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, line: value }))}
                  placeholder="All lines"
                  disabled={!filters.brand}
                  <SelectItem value="">All lines</SelectItem>
                  {productLines[filters.brand as keyof typeof productLines]?.map(line => (
                    <SelectItem key={line.value} value={line.value}>
                      {line.label}
                  )) || [<SelectItem value="">Select brand first</SelectItem>]}
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Result Level</label>
                  value={filters.resultLevel}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, resultLevel: value }))}
                  placeholder="All levels"
                  <SelectItem value="">All levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
              <div className="flex items-center">
                <label className="text-sm font-medium text-muted-foreground mb-0 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.favoriteOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, favoriteOnly: e.target.checked }))}
                  />
                  Show Favorites Only
                </label>
          {/* Formulas List or Empty State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="h-4 w-4 border-2 border-primary border-transparent rounded-full animate-spin"></div>
                <p>Loading formulas...</p>
          ) : filteredFormulas.length === 0 ? (
              <p className="text-muted-foreground">No formulas found.</p>
              {(searchTerm || Object.values(filters).some(v => v)) ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              ) : (
                  Start building your formula library by <Link href="/formulate">creating a new formula</Link>.
              )}
          ) : (
            <>
              <div className="mb-4 flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground">
                  {filteredFormulas.length} formula{filteredFormulas.length !== 1 ? 's' : ''} in library
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // In a real app, this would export formulas
                    alert('Export functionality would be implemented here');
                  }}
                  Export Library
                </Button>
              
              <div className="divide-y">
                {filteredFormulas.map((formula) => (
                  <div key={formula.id} className="py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {/* Formula Header */}
                        <div className="flex items-center space-x-3">
                          {/* Favorite Button */}
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(formula.id)}
                            className={`p-1 ${isFavorite(formula.id) ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                          >
                            {isFavorite(formula.id) ? (
                              <Star className="h-4 w-4" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <div>
                            <p className="font-medium">
                              {formula.productBrand?.charAt(0).toUpperCase() + formula.productBrand?.slice(1)} 
                              {formula.productLine?.charAt(0).toUpperCase() + formula.productLine?.slice(1)} 
                              {formula.productShade}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formula.currentLevel}{formula.currentTone} → {formula.targetLevel}{formula.targetTone}
                            {formula.notes && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {formula.notes}
                              </p>
                          </div>
                        </div>
                        
                        {/* Formula Details */}
                        <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
                            <p className="text-xs font-medium text-muted-foreground">Developer</p>
                            <p className="text-sm font-medium">{formula.developerVolume} Volume</p>
                            <p className="text-xs font-medium text-muted-foreground">Time</p>
                            <p className="text-sm font-medium">{formula.processingTime} min</p>
                            <p className="text-xs font-medium text-muted-foreground">Condition</p>
                            <p className="text-sm font-medium capitalize">
                              {formula.condition.replace('-', ' ')}
                            <p className="text-xs font-medium text-muted-foreground">Gray %</p>
                            <p className="text-sm font-medium">{formula.grayPercentage}%</p>
                      </div>
                      
                      <div className="text-right space-x-3">
                        <Link 
                          href={`/formula/${formula.id}`} 
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View Details
                        </Link>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(formula.id)}
                          className="hover:text-destructive"
                          <TrendingUp className="h-4 w-4" /> {/* Using X would be better but keeping consistent */}
                        </Button>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-muted">
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(formula.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {formula.updatedAt !== formula.createdAt && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            • Updated {new Date(formula.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </p>
                  </div>
                ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// Helper component for SelectItem
function SelectItem({ children, value }: { children: React.ReactNode; value: string | number | null }) {
    <Select.ValueItem>
      <span>{children}</span>
    </Select.ValueItem>
  )
// Helper component for Star (since we don't have it in lucide-react)
function Star({ className = '' }: { className?: string }) {
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={`h-4 w-4 ${className}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.218 4.324a1 1 0 001.518.608l-4.25-2.91a1 1 0 00-1.383 0l-4.253 2.91a1 1 0 00-1.517-.608l1.218-4.324a1 1 0 00-.363-1.118l-3.976-2.888a1 1 0 00.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z" />
    </svg>

"use client";
import { useState } from 'react';
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
  Dropper, 
  Calculator, 
  Timer, 
  CheckCircle, 
  X,
  Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Formulate() {
  const [formData, setFormData] = useState({
    currentLevel: '',
    currentTone: '',
    targetLevel: '',
    targetTone: '',
    condition: '',
    grayPercentage: '',
    developerVolume: '',
    processingTime: '',
    productBrand: '',
    productLine: '',
    productShade: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  // Product data (in reality, this would come from an API or database)
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
  const tones = [
    { value: 'n', label: 'Natural' },
    { value: 'w', label: 'Warm' },
    { value: 'c', label: 'Cool' },
    { value: 'g', label: 'Gold' },
    { value: 'r', label: 'Red' },
    { value: 'mb', label: 'Mahogany' }
  const conditions = [
    { value: 'virgin', label: 'Virgin Hair' },
    { value: 'color-treated', label: 'Color-Treated' },
    { value: 'highlighted', label: 'Previously Highlighted' },
    { value: 'damaged', label: 'Damaged/Porous' },
    { value: 'resistant', label: 'Resistant' }
  const developerVolumes = [
    { value: '10', label: '10 Volume (3%)' },
    { value: '20', label: '20 Volume (6%)' },
    { value: '30', label: '30 Volume (9%)' },
    { value: '40', label: '40 Volume (12%)' }
  const calculateFormula = () => {
    const {
      currentLevel,
      targetLevel,
      grayPercentage,
      condition
    } = formData;
    // Validation
    if (!currentLevel || !targetLevel) {
      setError('Please specify current and target levels');
      return;
    }
    const currentNum = parseInt(currentLevel);
    const targetNum = parseInt(targetLevel);
    const grayPct = parseInt(grayPercentage) || 0;
    if (isNaN(currentNum) || isNaN(targetNum) || currentNum < 1 || currentNum > 10 || targetNum < 1 || targetNum > 10) {
      setError('Please enter valid levels between 1-10');
    // Calculate lift needed
    const liftNeeded = targetNum - currentNum;
    
    // Developer volume recommendation based on lift and condition
    let recommendedVolume = '20'; // Default
    if (liftNeeded <= 0) {
      // Deposit or same level
      recommendedVolume = condition === 'resistant' || grayPct > 50 ? '20' : '10';
    } else if (liftNeeded === 1) {
      recommendedVolume = '20';
    } else if (liftNeeded === 2) {
      recommendedVolume = condition === 'damaged' ? '20' : '30';
    } else if (liftNeeded >= 3) {
      recommendedVolume = '40';
    // Adjust for resistant hair or high gray percentage
    if (condition === 'resistant' || grayPct > 70) {
      if (recommendedVolume === '10') recommendedVolume = '20';
      else if (recommendedVolume === '20') recommendedVolume = '30';
      else if (recommendedVolume === '30') recommendedVolume = '40';
    // Calculate processing time based on volume and condition
    let baseTime = 0;
    switch (recommendedVolume) {
      case '10': baseTime = 20; break;
      case '20': baseTime = 30; break;
      case '30': baseTime = 40; break;
      case '40': baseTime = 45; break;
    // Adjust time for condition
    let timeMultiplier = 1;
    if (condition === 'resistant') timeMultiplier = 1.2;
    else if (condition === 'damaged') timeMultiplier = 0.8;
    else if (condition === 'highlighted') timeMultiplier = 0.9;
    const processingTime = Math.round(baseTime * timeMultiplier);
    // Update form with calculations
    setFormData(prev => ({
      ...prev,
      developerVolume: recommendedVolume,
      processingTime: processingTime.toString()
    }));
    setSuccess(`Formula calculated! Recommended: ${recommendedVolume} volume developer, ${processingTime} minutes processing time`);
    setError(null);
  const saveFormula = async () => {
      currentTone,
      targetTone,
      condition,
      developerVolume,
      processingTime,
      productBrand,
      productLine,
      productShade,
      notes
    if (!currentLevel || !targetLevel || !productBrand || !productLine || !productShade) {
      setError('Please fill in all required fields');
    setLoading(true);
    setSuccess(null);
    try {
      await db.formula.create({
        data: {
          currentLevel: parseInt(currentLevel),
          currentTone,
          targetLevel: parseInt(targetLevel),
          targetTone,
          condition,
          grayPercentage: parseInt(grayPercentage) || 0,
          developerVolume: parseInt(developerVolume),
          processingTime: parseInt(processingTime),
          productBrand,
          productLine,
          productShade,
          notes: notes || undefined
        }
      });
      
      setSuccess('Formula saved to library!');
      setError(null);
      // Reset form after successful save
      setTimeout(() => {
        setFormData({
          currentLevel: '',
          currentTone: '',
          targetLevel: '',
          targetTone: '',
          condition: '',
          grayPercentage: '',
          developerVolume: '',
          processingTime: '',
          productBrand: '',
          productLine: '',
          productShade: '',
          notes: ''
        });
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError('Failed to save formula');
    } finally {
      setLoading(false);
  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
      <Card>
        <CardHeader>
          <CardTitle>Color Formula Builder</CardTitle>
          <CardDescription>
            Create custom hair color formulas based on client analysis and desired results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current State */}
          <div className="space-y-4">
            <p className="font-medium">Current Hair State</p>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Level (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.currentLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value }))}
                  placeholder="e.g., 5"
                />
              </div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Tone</label>
                <Select 
                  value={formData.currentTone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currentTone: value }))}
                  placeholder="Select tone"
                >
                  {tones.map(tone => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </Select>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Condition</label>
                  value={formData.condition}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                  placeholder="Select condition"
                  {conditions.map(cond => (
                    <SelectItem key={cond.value} value={cond.value}>
                      {cond.label}
            </div>
          </div>
          {/* Target State */}
            <p className="font-medium">Target Result</p>
                  value={formData.targetLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetLevel: e.target.value }))}
                  placeholder="e.g., 7"
                  value={formData.targetTone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, targetTone: value }))}
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Gray %</label>
                  min="0"
                  max="100"
                  value={formData.grayPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, grayPercentage: e.target.value }))}
                  placeholder="e.g., 30"
          {/* Product Selection */}
            <p className="font-medium">Product Selection</p>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Brand</label>
                  value={formData.productBrand}
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      productBrand: value,
                      productLine: '', // Reset line when brand changes
                      productShade: '' // Reset shade when brand changes
                    }));
                  }}
                  placeholder="Select brand"
                  <SelectItem value="">Select brand</SelectItem>
                  {productBrands.map(brand => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Line</label>
                  value={formData.productLine}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    productLine: value,
                    productShade: '' // Reset shade when line changes
                  }))}
                  placeholder="Select line"
                  disabled={!formData.productBrand}
                  <SelectItem value="">Select line</SelectItem>
                  {productLines[formData.productBrand as keyof typeof productLines]?.map(line => (
                    <SelectItem key={line.value} value={line.value}>
                      {line.label}
                  )) || [<SelectItem value="">Select brand first</SelectItem>]}
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Shade</label>
                  placeholder="Enter shade number/name"
                  value={formData.productShade}
                  onChange={(e) => setFormData(prev => ({ ...prev, productShade: e.target.value }))}
                  disabled={!formData.productLine}
          {/* Calculation Results */}
            <p className="font-medium">Calculation Results</p>
            <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Developer Volume</label>
                  value={formData.developerVolume}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, developerVolume: value }))}
                  placeholder="Auto-calculated"
                  {developerVolumes.map(vol => (
                    <SelectItem key={vol.value} value={vol.value}>
                      {vol.label}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={calculateFormula}
                  className="mt-2 w-full"
                  disabled={loading}
                  {loading ? 'Calculating...' : 'Calculate Formula'}
                </Button>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Processing Time</label>
                  min="5"
                  max="120"
                  value={formData.processingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, processingTime: e.target.value }))}
                  placeholder="Minutes"
          {/* Notes */}
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Notes</label>
            <Input
              type="textarea"
              placeholder="Add any special instructions or observations..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
        </CardContent>
        <CardFooter>
          <Button 
            onClick={saveFormula}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Formula to Library'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
// Helper component for SelectItem
function SelectItem({ children, value }: { children: React.ReactNode; value: string | number | null }) {
    <Select.ValueItem>
      <span>{children}</span>
    </Select.ValueItem>

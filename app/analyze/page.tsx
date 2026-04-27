"use client";
import { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/db';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Image, 
  Palette, 
  CheckCircle, 
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function Analyze() {
  const [clientId, setClientId] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (analysisResult && !loading) {
      // Auto-save analysis to client if clientId is provided
      if (clientId) {
        saveAnalysisToClient();
      }
    }
  }, [analysisResult, loading, clientId]);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        e.target.value = ''; // Reset input
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing image upload');
      setLoading(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  const handleDrop = async (e: React.DragEvent) => {
    const file = e.dataTransfer.files?.[0];
      setError('Please drop a valid image file');
      setError('Error processing image drop');
  const analyzeImage = async () => {
    if (!imageUrl || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      const img = new Image();
      img.onload = async () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);
        // Sample pixels from center region (avoiding edges)
        const sampleSize = 50;
        const startX = Math.max(0, (img.width - sampleSize) / 2);
        const startY = Math.max(0, (img.height - sampleSize) / 2);
        const imageData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
        const data = imageData.data;
        // Calculate average RGB values
        let rSum = 0, gSum = 0, bSum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Skip transparent pixels
          if (data[i + 3] > 0) {
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            count++;
          }
        }
        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);
        // Convert RGB to hair color levels and tones
        const result = rgbToHairColor(avgR, avgG, avgB);
        setAnalysisResult({
          ...result,
          rgb: { r: avgR, g: avgG, b: avgB },
          timestamp: new Date().toISOString()
        });
      img.onerror = () => {
        setError('Failed to load image for analysis');
      img.src = imageUrl;
      setError('Error analyzing image');
  const rgbToHairColor = (r: number, g: number, b: number): any => {
    // Simplified hair color analysis algorithm
    // In reality, this would use more sophisticated color science
    // Calculate lightness (level)
    const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Map to hair color levels (1-10, where 1 is black, 10 is lightest blonde)
    let level = Math.round(10 * lightness);
    level = Math.max(1, Math.min(10, level));
    // Calculate tone based on RGB ratios
    const toneScore = (r - b) / (r + g + b + 1); // Normalized red-minus-blue
    let tone: string;
    if (toneScore > 0.1) {
      tone = 'Warm';
    } else if (toneScore < -0.1) {
      tone = 'Cool';
    } else {
      tone = 'Neutral';
    // Determine underlying pigment
    let underlyingPigment: string;
    if (level <= 4) {
      underlyingPigment = 'Red';
    } else if (level <= 6) {
      underlyingPigment = 'Orange';
    } else if (level <= 8) {
      underlyingPigment = 'Yellow';
      underlyingPigment = 'Pale Yellow';
    // Generate descriptive name
    const levelNames = [
      '', 'Black', 'Darkest Brown', 'Dark Brown', 'Medium Brown', 
      'Light Brown', 'Dark Blonde', 'Medium Blonde', 'Light Blonde', 'Lightest Blonde'
    ];
    return {
      level,
      levelName: levelNames[level],
      tone,
      underlyingPigment,
      confidence: Math.min(95, 70 + Math.random() * 25) // Simulated confidence
    };
  const saveAnalysisToClient = async () => {
      await db.analysis.create({
        data: {
          clientId,
          level: analysisResult.level,
          tone: analysisResult.tone,
          underlyingPigment: analysisResult.underlyingPigment,
          rgbR: analysisResult.rgb.r,
          rgbG: analysisResult.rgb.g,
          rgbB: analysisResult.rgb.b,
          confidence: analysisResult.confidence,
          imageUrl
      });
      
      // Show success message
      setError('Analysis saved to client profile!');
      setTimeout(() => setError(null), 3000);
      setError('Failed to save analysis to client');
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upload and Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Hair Color Analysis</CardTitle>
            <CardDescription>
              Upload a clear photo of hair to analyze level, tone, and underlying pigment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="dashed rounded border-2 border-dashed border-muted hover:border-primary p-8 text-center transition-colors cursor-pointer"
            >
              {!imageUrl ? (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm">Click to upload or drag & drop an image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: JPG, PNG, WebP
                  </p>
                </>
              ) : (
                <Image 
                  src={imageUrl} 
                  alt="Uploaded hair photo" 
                  className="rounded max-w-full h-64 object-cover"
                />
              )}
            </div>
            
            <input 
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="flex justify-center">
              <Button 
                variant="outline"
                size="icon"
                onClick={() => {
                  document.querySelector('input[type="file"]')?.click();
                }}
              >
                Upload
              </Button>
          </CardContent>
          
          {imageUrl && !analysisResult && !loading && (
            <CardFooter>
                onClick={analyzeImage}
                className="w-full"
                disabled={loading}
                {loading ? 'Analyzing...' : 'Analyze Hair Color'}
            </CardFooter>
          )}
        </Card>
        {/* Results */}
            <CardTitle>Analysis Results</CardTitle>
          {loading && !analysisResult ? (
            <CardContent className="text-center py-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="h-4 w-4 border-2 border-primary border-transparent rounded-full animate-spin"></div>
                <p>Analyzing image...</p>
              </div>
            </CardContent>
          ) : analysisResult ? (
            <>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold">{analysisResult.level}</p>
                    <p className="text-xs text-muted-foreground">
                      {analysisResult.levelName}
                    </p>
                  </div>
                    <p className="text-sm font-medium text-muted-foreground">Tone</p>
                    <p className="text-xl font-semibold">{analysisResult.tone}</p>
                      {analysisResult.confidence.toFixed(0)}% confidence
                    <p className="text-sm font-medium text-muted-foreground">Underlying Pigment</p>
                    <p className="text-xl font-semibold">{analysisResult.underlyingPigment}</p>
                    <p className="text-sm font-medium text-muted-foreground">RGB Values</p>
                    <p className="text-xs font-mono">
                      r:{analysisResult.rgb.r} g:{analysisResult.rgb.g} b:{analysisResult.rgb.b}
                </div>
                
                {/* Color Preview */}
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded border" 
                       style={{ backgroundColor: `rgb(${analysisResult.rgb.r}, ${analysisResult.rgb.g}, ${analysisResult.rgb.b})` }}>
                    <p className="text-sm font-medium">Detected Color</p>
                      Based on sampled pixels
              </CardContent>
              
              {!clientId && (
                <CardFooter>
                  <Input
                    placeholder="Enter client ID to save analysis"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full mb-2"
                  />
                  <Button 
                    onClick={() => {
                      if (clientId) {
                        // Trigger save via useEffect
                      }
                    }}
                    className="w-full"
                  >
                    Save to Client Profile
                  </Button>
                </CardFooter>
            </>
          ) : error ? (
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          ) : (
              <p className="text-muted-foreground">
                Upload an image to begin analysis
              </p>
      </div>
    </div>
  );
}
  const [clientId, setClientId] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (analysisResult && !loading) {
      // Auto-save analysis to client if clientId is provided
      if (clientId) {
        saveAnalysisToClient();
      }
    }
  }, [analysisResult, loading, clientId]);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        e.target.value = ''; // Reset input
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing image upload');
      setLoading(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  const handleDrop = async (e: React.DragEvent) => {
    const file = e.dataTransfer.files?.[0];
      setError('Please drop a valid image file');
      setError('Error processing image drop');
  const analyzeImage = async () => {
    if (!imageUrl || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      const img = new Image();
      img.onload = async () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);
        // Sample pixels from center region (avoiding edges)
        const sampleSize = 50;
        const startX = Math.max(0, (img.width - sampleSize) / 2);
        const startY = Math.max(0, (img.height - sampleSize) / 2);
        const imageData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
        const data = imageData.data;
        // Calculate average RGB values
        let rSum = 0, gSum = 0, bSum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Skip transparent pixels
          if (data[i + 3] > 0) {
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            count++;
          }
        }
        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);
        // Convert RGB to hair color levels and tones
        const result = rgbToHairColor(avgR, avgG, avgB);
        setAnalysisResult({
          ...result,
          rgb: { r: avgR, g: avgG, b: avgB },
          timestamp: new Date().toISOString()
        });
      img.onerror = () => {
        setError('Failed to load image for analysis');
      img.src = imageUrl;
      setError('Error analyzing image');
  const rgbToHairColor = (r: number, g: number, b: number): any => {
    // Simplified hair color analysis algorithm
    // In reality, this would use more sophisticated color science
    // Calculate lightness (level)
    const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Map to hair color levels (1-10, where 1 is black, 10 is lightest blonde)
    let level = Math.round(10 * lightness);
    level = Math.max(1, Math.min(10, level));
    // Calculate tone based on RGB ratios
    const toneScore = (r - b) / (r + g + b + 1); // Normalized red-minus-blue
    let tone: string;
    if (toneScore > 0.1) {
      tone = 'Warm';
    } else if (toneScore < -0.1) {
      tone = 'Cool';
    } else {
      tone = 'Neutral';
    // Determine underlying pigment
    let underlyingPigment: string;
    if (level <= 4) {
      underlyingPigment = 'Red';
    } else if (level <= 6) {
      underlyingPigment = 'Orange';
    } else if (level <= 8) {
      underlyingPigment = 'Yellow';
      underlyingPigment = 'Pale Yellow';
    // Generate descriptive name
    const levelNames = [
      '', 'Black', 'Darkest Brown', 'Dark Brown', 'Medium Brown', 
      'Light Brown', 'Dark Blonde', 'Medium Blonde', 'Light Blonde', 'Lightest Blonde'
    ];
    return {
      level,
      levelName: levelNames[level],
      tone,
      underlyingPigment,
      confidence: Math.min(95, 70 + Math.random() * 25) // Simulated confidence
    };
  const saveAnalysisToClient = async () => {
      await db.analysis.create({
        data: {
          clientId,
          level: analysisResult.level,
          tone: analysisResult.tone,
          underlyingPigment: analysisResult.underlyingPigment,
          rgbR: analysisResult.rgb.r,
          rgbG: analysisResult.rgb.g,
          rgbB: analysisResult.rgb.b,
          confidence: analysisResult.confidence,
          imageUrl
      });
      
      // Show success message
      setError('Analysis saved to client profile!');
      setTimeout(() => setError(null), 3000);
      setError('Failed to save analysis to client');
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upload and Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Hair Color Analysis</CardTitle>
            <CardDescription>
              Upload a clear photo of hair to analyze level, tone, and underlying pigment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="dashed rounded border-2 border-dashed border-muted hover:border-primary p-8 text-center transition-colors cursor-pointer"
            >
              {!imageUrl ? (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm">Click to upload or drag & drop an image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: JPG, PNG, WebP
                  </p>
                </>
              ) : (
                <Image 
                  src={imageUrl} 
                  alt="Uploaded hair photo" 
                  className="rounded max-w-full h-64 object-cover"
                />
              )}
            </div>
            
            <input 
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="flex justify-center">
              <Button 
                variant="outline"
                size="icon"
                onClick={() => {
                  document.querySelector('input[type="file"]')?.click();
                }}
              >
                Upload
              </Button>
          </CardContent>
          
          {imageUrl && !analysisResult && !loading && (
            <CardFooter>
                onClick={analyzeImage}
                className="w-full"
                disabled={loading}
                {loading ? 'Analyzing...' : 'Analyze Hair Color'}
            </CardFooter>
          )}
        </Card>
        {/* Results */}
            <CardTitle>Analysis Results</CardTitle>
          {loading && !analysisResult ? (
            <CardContent className="text-center py-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="h-4 w-4 border-2 border-primary border-transparent rounded-full animate-spin"></div>
                <p>Analyzing image...</p>
              </div>
            </CardContent>
          ) : analysisResult ? (
            <>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold">{analysisResult.level}</p>
                    <p className="text-xs text-muted-foreground">
                      {analysisResult.levelName}
                    </p>
                  </div>
                    <p className="text-sm font-medium text-muted-foreground">Tone</p>
                    <p className="text-xl font-semibold">{analysisResult.tone}</p>
                      {analysisResult.confidence.toFixed(0)}% confidence
                    <p className="text-sm font-medium text-muted-foreground">Underlying Pigment</p>
                    <p className="text-xl font-semibold">{analysisResult.underlyingPigment}</p>
                    <p className="text-sm font-medium text-muted-foreground">RGB Values</p>
                    <p className="text-xs font-mono">
                      r:{analysisResult.rgb.r} g:{analysisResult.rgb.g} b:{analysisResult.rgb.b}
                </div>
                
                {/* Color Preview */}
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded border" 
                       style={{ backgroundColor: `rgb(${analysisResult.rgb.r}, ${analysisResult.rgb.g}, ${analysisResult.rgb.b})` }}>
                    <p className="text-sm font-medium">Detected Color</p>
                      Based on sampled pixels
              </CardContent>
              
              {!clientId && (
                <CardFooter>
                  <Input
                    placeholder="Enter client ID to save analysis"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full mb-2"
                  />
                  <Button 
                    onClick={() => {
                      if (clientId) {
                        // Trigger save via useEffect
                      }
                    }}
                    className="w-full"
                  >
                    Save to Client Profile
                  </Button>
                </CardFooter>
            </>
          ) : error ? (
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          ) : (
              <p className="text-muted-foreground">
                Upload an image to begin analysis
              </p>
      </div>
    </div>
  );
}

'use client'
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
import { 
  Alert, 
  AlertDescription, 
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Dropper, 
  Calculator, 
  Timer, 
  Users,
  TrendingUp,
  Save,
  Edit,
  X
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function FormulaDetail({ params }: { params: { id: string } }) {
  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFormulaData();
  }, [params.id]);

  const loadFormulaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formulaData = await db.formula.findUnique({
        where: { id: params.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      });
      
      setFormula(formulaData);
    } catch (err) {
      setError('Failed to load formula data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this formula? This action cannot be undone.')) {
      return;
    }

    try {
      await db.formula.delete({ where: { id: params.id } });
      // In a real app, we'd redirect to the formula library
      alert('Formula deleted successfully');
    } catch (err) {
      setError('Failed to delete formula');
    }
  };

  if (!formula) {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-6 w-6 border-2 border-primary border-transparent rounded-full animate-spin"></div>
            <p>Loading formula data...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Formula not found.</p>
        <Link href="/library" className="text-sm font-medium text-primary hover:underline mt-4 inline-block">
          ← Back to Formula Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formula Info */}
      <Card>
        <CardHeader>
          <CardTitle>
            {formula.productBrand?.charAt(0).toUpperCase() + formula.productBrand?.slice(1)} 
            {formula.productLine?.charAt(0).toUpperCase() + formula.productLine?.slice(1)} 
            {formula.productShade}
          </CardTitle>
          <CardDescription>
            Color formula details and specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Formula Overview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {formula.currentLevel}{formula.currentTone} → {formula.targetLevel}{formula.targetTone}
                </p>
                <p className="text-sm text-muted-foreground">
                  Current to Target Level/Tone
                </p>
              </div>
            </div>
            
            {formula.client && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Client</p>
                    <p className="text-medium font-medium">{formula.client.name}</p>
                    <p className="text-xs text-muted-foreground">{formula.client.phone}</p>
                  </div>
                  <Link 
                    href={`/clients/${formula.client.id}`} 
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Client Profile
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Formula Specifications */}
          <div className="space-y-4">
            <p className="font-medium">Formula Specifications</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                <p className="text-xl font-semibold">{formula.currentLevel}</p>
                <p className="text-xs text-muted-foreground">{formula.currentTone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target Level</p>
                <p className="text-xl font-semibold">{formula.targetLevel}</p>
                <p className="text-xs text-muted-foreground">{formula.targetTone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Condition</p>
                <p className="text-xl font-medium capitalize">
                  {formula.condition}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hair condition assessment
                </p>
              </div>
            </div>
          </div>

          {/* Processing Details */}
          <div className="space-y-4">
            <p className="font-medium">Processing Details</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Developer Volume</p>
                <p className="text-xl font-semibold">{formula.developerVolume}</p>
                <p className="text-xs text-muted-foreground">Volume developer</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
                <p className="text-xl font-semibold">{formula.processingTime}</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gray Coverage</p>
                <p className="text-xl font-medium">{formula.grayPercentage}%</p>
                <p className="text-xs text-muted-foreground">
                  Gray hair percentage
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          {formula.notes && (
            <div className="space-y-4">
              <p className="font-medium">Notes & Instructions</p>
              <p className="text-muted-foreground">{formula.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => {
                // In a real app, this would open an edit form
                alert('Edit formula functionality would be implemented here');
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit Formula
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <X className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
          
          <Button 
            variant="default"
            onClick={() => {
              // In a real app, this would copy formula to formulary
              alert('Formula copied to worksheet!');
            }}
          >
            <Save className="h-4 w-4 mr-2" /> Use Formula
          </Button>
        </CardFooter>
      </Card>
      
      {/* Client History (if applicable) */}
      {formula.client && (
        <Card>
          <CardHeader>
            <CardTitle>Client History</CardTitle>
            <CardDescription>
              Previous formulas and analyses for this client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* In a real app, we'd fetch and display client history here */}
            <p className="text-muted-foreground text-center py-8">
              Client history would be displayed here in a full implementation
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
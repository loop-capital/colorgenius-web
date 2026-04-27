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
  Users, 
  Palette, 
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function ClientDetail({ params }: { params: { id: string } }) {
  const [client, setClient] = useState(null);
  const [formulas, setFormulas] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClientData();
  }, [params.id]);

  const loadClientData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch client data
      const clientData = await db.client.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      // Fetch client formulas
      const clientFormulas = await db.formula.findMany({
        where: { clientId: params.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          currentLevel: true,
          currentTone: true,
          targetLevel: true,
          targetTone: true,
          productBrand: true,
          productLine: true,
          productShade: true,
          createdAt: true
        }
      });
      
      // Fetch client analyses
      const clientAnalyses = await db.analysis.findMany({
        where: { clientId: params.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          level: true,
          tone: true,
          underlyingPigment: true,
          rgbR: true,
          rgbG: true,
          rgbB: true,
          confidence: true,
          imageUrl: true,
          createdAt: true
        }
      });
      
      setClient(clientData);
      setFormulas(clientFormulas);
      setAnalyses(clientAnalyses);
    } catch (err) {
      setError('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  if (!client) {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-6 w-6 border-2 border-primary border-transparent rounded-full animate-spin"></div>
            <p>Loading client data...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client not found.</p>
        <Link href="/clients" className="text-sm font-medium text-primary hover:underline mt-4 inline-block">
          ← Back to Clients
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

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>{client.name}</CardTitle>
          <CardDescription>
            Client profile and history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg font-medium">{client.phone}</p>
            </div>
            {client.email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-medium truncate">{client.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-lg font-medium">
                {new Date(client.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {client.updatedAt !== client.createdAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-lg font-medium">
                  {new Date(client.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-muted">
            <div className="flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={() => {
                  // In a real app, this would open an edit form
                  alert('Edit client functionality would be implemented here');
                }}
              >
                Edit Client
              </Button>
              <Link href={`/clients/${client.id}/edit`} className="text-sm font-medium text-primary hover:underline">
                View Edit Form
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Formulas Created</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">{formulas.length}</p>
            <p className="text-sm text-muted-foreground">
              Total color formulas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Color Analyses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">{analyses.length}</p>
            <p className="text-sm text-muted-foreground">
              Hair color analyses performed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">
              {Math.max(
                formulas.length ? formulas[0].createdAt.getTime() : 0,
                analyses.length ? analyses[0].createdAt.getTime() : 0
              ) > 0 ? 'Recent' : 'None'}
            </p>
            <p className="text-sm text-muted-foreground">
              Most recent formula or analysis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulas Section */}
      {formulas.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Client Formulas</CardTitle>
              <Link href="/formulate" className="text-sm font-medium text-primary hover:underline">
                Create New Formula
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formulas.map((formula) => (
                <div key={formula.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium">
                        {formula.productBrand?.charAt(0).toUpperCase() + formula.productBrand?.slice(1)} 
                        {formula.productLine?.charAt(0).toUpperCase() + formula.productLine?.slice(1)} 
                        {formula.productShade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formula.currentLevel}{formula.currentTone} → {formula.targetLevel}{formula.targetTone}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(formula.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Developer</p>
                      <p className="text-sm font-medium">{formula.developerVolume} Volume</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{formula.processingTime} min</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Condition</p>
                      <p className="text-sm font-medium capitalize">
                        {formula.condition.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Gray %</p>
                      <p className="text-sm font-medium">{formula.grayPercentage}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyses Section */}
      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Color Analyses</CardTitle>
              <Link href="/analyze" className="text-sm font-medium text-primary hover:underline">
                New Analysis
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        {analysis.level}{analysis.tone} - {analysis.underlyingPigment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        RGB: {analysis.rgbR},{analysis.rgbG},{analysis.rgbB} • 
                        {analysis.confidence}% confidence
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  
                  {analysis.imageUrl && (
                    <div className="mt-3">
                      <img 
                        src={analysis.imageUrl} 
                        alt="Hair analysis" 
                        className="rounded max-w-xs h-24 object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
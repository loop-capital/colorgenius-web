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
  Users, 
  Search, 
  Plus, 
  TrendingUp,
  Palette
} from 'lucide-react';
import Link from 'next/link';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadClients();
  }, [searchTerm]);
  const loadClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const where = searchTerm 
        ? {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm } }
            ]
          }
        : {};
      const clientList = await db.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          createdAt: true,
          _count: {
            select: { formulas: true, analyses: true }
        }
      });
      
      setClients(clientList);
    } catch (err) {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
      await db.client.delete({ where: { id } });
      loadClients(); // Refresh list
      setError('Failed to delete client');
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
            <CardTitle>Client Management</CardTitle>
            <Link href="/clients/new" className="text-sm font-medium text-primary hover:underline">
              <Plus className="mr-2 h-4 w-4" /> Add New Client
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-xs"
            />
          {/* Clients List or Empty State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="h-4 w-4 border-2 border-primary border-transparent rounded-full animate-spin"></div>
                <p>Loading clients...</p>
              </div>
            </div>
          ) : clients.length === 0 ? (
              <p className="text-muted-foreground">No clients found.</p>
              {searchTerm ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or <Link href="/clients/new">add a new client</Link>.
                </p>
              ) : (
                  Get started by <Link href="/clients/new">adding your first client</Link>.
              )}
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                {clients.length} client{clients.length !== 1 ? 's' : ''} found
              </p>
              
              <div className="divide-y">
                {clients.map((client) => (
                  <div key={client.id} className="py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            {client.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {client.email}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {client.phone}
                            </p>
                        </div>
                      </div>
                      
                      <div className="text-right space-x-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{client._count.formulas}</span>
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span>{client._count.analyses}</span>
                      <div className="flex items-center space-x-2 text-right">
                        <Link 
                          href={`/clients/${client.id}`} 
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View Details
                        </Link>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client.id)}
                          className="hover:text-destructive"
                          <Search className="h-4 w-4" /> {/* Using X would be better but keeping consistent */}
                        </Button>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-muted">
                      <p className="text-xs text-muted-foreground">
                        Client since {new Date(client.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                  </div>
                ))}
          )}
        </CardContent>
      </Card>
    </div>
  );
}

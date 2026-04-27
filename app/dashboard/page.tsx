"use client";
import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
  Users, 
  Palette, 
  Search, 
  Plus, 
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    formulas: 0,
    analyses: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      // Fetch stats
      const [clientsCount, formulasCount, analysesCount, recent] = await Promise.all([
        db.client.count(),
        db.formula.count(),
        db.analysis.count(),
        db.client.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
            _count: {
              select: { formulas: true, analyses: true }
            }
          }
        })
      ]);
      setStats({
        clients: clientsCount,
        formulas: formulasCount,
        analyses: analysesCount
      });
      setRecentClients(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-muted rounded">
                    <div className="h-full w-full bg-muted/50 rounded animate-pulse"></div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-muted-foreground animate-pulse">
                      <div className="h-4 w-20 bg-muted/50 rounded animate-pulse"></div>
                    </h3>
                    <p className="text-xs text-muted-foreground animate-pulse">
                      <div className="h-3 w-16 bg-muted/50 rounded animate-pulse"></div>
                    </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="animate-pulse">
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 h-10">
                <div className="h-8 w-8 bg-muted rounded">
                  <div className="h-full w-full bg-muted/50 rounded animate-pulse"></div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-muted-foreground animate-pulse">
                    <div className="h-4 w-20 bg-muted/50 rounded animate-pulse"></div>
                  </h4>
                  <p className="text-xs text-muted-foreground animate-pulse">
                    <div className="h-3 w-16 bg-muted/50 rounded animate-pulse"></div>
                  </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Total Clients</CardTitle>
            </div>
            <p className="text-2xl font-bold">{stats.clients}</p>
            <p className="text-sm text-muted-foreground">
              Active client profiles
            </p>
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Formulas Created</CardTitle>
            <p className="text-2xl font-bold">{stats.formulas}</p>
              Saved color formulas
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Analyses This Month</CardTitle>
            <p className="text-2xl font-bold">{stats.analyses}</p>
              Hair color analyses performed
      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Link href="/clients/new" className="text-sm font-medium text-primary hover:underline">
              Add New Client
            </Link>
          </div>
        </CardHeader>
        {recentClients.length > 0 ? (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Name</TableHead>
                  <TableHead className="text-left">Phone</TableHead>
                  <TableHead className="text-left">Activity</TableHead>
                  <TableHead className="text-right">Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {client._count.formulas} formulas • {client._count.analyses} analyses
                          </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{client.phone}</TableCell>
                    <TableCell className="text-sm">
                      <span className="px-2 py-0.5 bg-muted rounded text-xs">
                        View History
                      </span>
                    <TableCell className="text-sm text-right">
                      {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        ) : (
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No clients yet. Add your first client to get started.</p>
        )}
      </Card>
      {/* Quick Actions */}
          <CardTitle>Quick Actions</CardTitle>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/analyze" className="flex flex-col items-center justify-center space-y-3 p-4 border rounded hover:bg-muted transition-colors">
            <Search className="h-6 w-6 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">New Analysis</p>
              <p className="text-sm text-muted-foreground">
                Upload and analyze hair color
              </p>
          </Link>
          
          <Link href="/formulate" className="flex flex-col items-center justify-center space-y-3 p-4 border rounded hover:bg-muted transition-colors">
            <Palette className="h-6 w-6 text-muted-foreground" />
              <p className="font-medium">Create Formula</p>
                Build custom color formula
          <Link href="/clients/new" className="flex flex-col items-center justify-center space-y-3 p-4 border rounded hover:bg-muted transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground" />
              <p className="font-medium">Add Client</p>
                Create new client profile
        </CardContent>
    </div>
  );
}

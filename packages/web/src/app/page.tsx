import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 bg-background">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold text-primary">
          ColorGenius
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          AI-powered hair color formulation and salon consultation platform
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/analyze" 
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M9 12h6" />
              <path d="M12 9v6" />
            </svg>
            Analyze Hair
          </Link>
          
          <Link 
            href="/formulate" 
            className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Create Formula
          </Link>
          
          <Link 
            href="/clients" 
            className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-4-4h-3a4 4 0 00-4 4v2" />
            </svg>
            Manage Clients
          </Link>
          
          <Link 
            href="/library" 
            className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
            </svg>
            Color Library
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground">
          <p>Professional tools for modern salons</p>
          <p className="mt-2">
            <strong>Beta Launch:</strong> August 15, 2026 • <strong>Target:</strong> 50+ stylists
          </p>
        </div>
      </div>
    </main>
  );
}
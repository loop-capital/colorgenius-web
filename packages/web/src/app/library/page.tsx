import Link from 'next/link';

export default function LibraryPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 bg-background">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold text-primary">
          Color Library
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Browse and search professional hair color shades from leading brands
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/formulate"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Formulation
          </Link>
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

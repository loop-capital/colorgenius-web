import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-muted-foreground">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 7c.77-1.333-.262-2.853-1.964-3H5.864c-1.7 0-2.734 1.52-1.964 3l-1.033 4L7 14H6.06c-.18.353-.18.763-.001 1.079A8.553 8.553 0 0012 21a8.553 8.553 0 005.912-2.921c.18-.353.18-.763-.001-1.079h-1.06l-.288-.967A5.831 5.831 0 0012 9z" />
        </svg>
      </div>
      <h1 className="mb-4 text-2xl font-bold">Page Not Found</h1>
      <p className="mb-6 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Return to Home
      </Link>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFormulateApi } from '@/lib/api';

export default function FormulatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formulation, setFormulation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadFormulation(id);
    }
  }, [searchParams]);

  const loadFormulation = async (id) => {
    setIsLoading(true);
    try {
      const response = await getFormulateApi(id);
      if (response.data) {
        setFormulation(response.data);
      } else {
        setError('Failed to load formulation');
      }
    } catch (err) {
      setError('Error loading formulation');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading formulation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Color Formulation</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Formulation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Formulation page is under development. Check back soon for updates.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

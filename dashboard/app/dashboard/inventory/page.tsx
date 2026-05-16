'use client';

import { useState, useCallback } from 'react';
import { InventoryDashboard, AddInventoryItem } from '@/components/custom';
import { useCanEdit } from '@/lib/user-context';
import { Lock } from 'lucide-react';

export default function InventoryPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleAdded = useCallback(() => setRefreshKey(k => k + 1), []);
  const { canEdit, isLoading } = useCanEdit();

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
            Inventory <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
            {canEdit
              ? 'Track color stock levels — auto-deducted with each formula'
              : 'View current stock levels (read-only)'
            }
          </p>
        </div>

        {!isLoading && !canEdit && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Lock className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
            <p className="text-sm" style={{ color: 'var(--cg-text-secondary)' }}>
              Only salon owners and managers can modify inventory. Contact your manager to make changes.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <AddInventoryItem onAdded={handleAdded} />
          <InventoryDashboard key={refreshKey} />
        </div>
      </div>
    </div>
  );
}

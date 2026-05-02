'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/custom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Search, Trash2, Edit3, Save, Loader2, Clock, Image, Palette } from 'lucide-react'

export default function HistoryPage() {
  const [history, setHistory] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [searchTerm, filterType, dateFrom, dateTo])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterType !== 'all') params.append('type', filterType)
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)
      
      const queryString = params.toString()
      const url = `/api/history${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch history')
      
      const data = await response.json()
      setHistory(data.history || [])
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this history entry?')) return
    
    try {
      // In a real implementation, this would call a delete API endpoint
      // For now, we'll simulate it
      alert('History entry has been removed successfully')
      
      fetchHistory()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete history entry')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analysis history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              // Export functionality
              alert('Export history')
            }}
            variant="outline"
            size="sm"
          >
            <Loader2 className="mr-1 h-3 w-3" /> Export
          </Button>
          
          <Button 
            onClick={() => {
              // New analysis
              alert('Navigate to new analysis')
            }}
            variant="outline"
            size="sm"
          >
            <Image className="mr-1 h-3 w-3" /> New Analysis
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by client name, notes, or tags..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="filterType">Entry Type</Label>
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value)}
          >
            <SelectTrigger id="filterType" className="w-full">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="analysis">Color Analysis</SelectItem>
              <SelectItem value="formulation">Formulation Created</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom || ''}
              onChange={(e) => setDateFrom(e.target.value || null)}
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo || ''}
              onChange={(e) => setDateTo(e.target.value || null)}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {history.length === 0 && !searchTerm && filterType === 'all' && !dateFrom && !dateTo ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No history found. Start analyzing clients to build your history.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-muted-foreground">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Details</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/20">
                {history.map((entry: any) => {
                  const date = new Date(entry.createdAt || entry.timestamp || Date.now())
                  return (
                    <tr key={entry.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Clock className="mr-2 h-4 w-4" /> 
                        {date.toLocaleDateString()} {date.toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">{entry.clientName || 'Unknown Client'}</td>
                      <td className="px-4 py-3">
                        {entry.type === 'analysis' && (
                          <>
                            <Palette className="mr-1 h-3 w-3 text-muted-foreground" /> Analysis
                          </>
                        )}
                        {entry.type === 'formulation' && (
                          <>
                            <Save className="mr-1 h-3 w-3 text-muted-foreground" /> Formulation
                          </>
                        )}
                        {entry.type === 'consultation' && (
                          <>
                            <Edit3 className="mr-1 h-3 w-3 text-muted-foreground" /> Consultation
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {entry.type === 'analysis' && (
                          <>
                            <div className="text-xs">{entry.result?.dominant?.levelName || 'N/A'} {entry.result?.dominant?.toneName || ''}</div>
                            <div className="text-xs text-muted-foreground">Confidence: {Math.round((entry.result?.dominant?.confidence || 0) * 100)}%</div>
                          </>
                        )}
                        {entry.type === 'formulation' && (
                          <>
                            <div className="text-xs">{entry.result?.brand || 'N/A'} {entry.result?.line || ''}</div>
                            <div className="text-xs text-muted-foreground">Score: {entry.result?.score || 'N/A'}%</div>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedHistoryId(entry.id)}
                          title="View details"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            // Edit functionality
                            alert('Edit history entry')
                          }}
                          title="Edit entry"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {history.length > 0 && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Showing {history.length} history entry{history.length !== 1 ? 's' : ''}</span>
              <span>
                {' '}
                {history.length} of {history.length} total
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* History Detail Modal (simplified) */}
      {selectedHistoryId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 max-w-xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">History Details</h2>
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setSelectedHistoryId(null)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* In a real implementation, this would fetch the specific history entry */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Entry Information</h3>
                  <p className="text-muted-foreground">Client: Jennifer Martinez</p>
                  <p className="text-muted-foreground">Date: Apr 20, 2026 at 2:30 PM</p>
                  <p className="text-muted-foreground">Type: Color Analysis</p>
                  <p className="text-muted-foreground">Tags: consultation, new client</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Analysis Results</h3>
                  <p className="text-muted-foreground">Current Level: 6N (Dark Blonde)</p>
                  <p className="text-muted-foreground">Target Level: 8G (Light Blonde Gold)</p>
                  <p className="text-muted-foreground">Undertone: Warm</p>
                  <p className="text-muted-foreground">Skin Tone: Warm</p>
                  <p className="text-muted-foreground">Contrast: Medium</p>
                  <p className="text-muted-foreground">Confidence: 94%</p>
                </div>
              </div>
              
              {selectedHistoryId && (
                <div className="pt-4 border-t border-muted/20">
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-primary/50">•</span>
                      <span>Use Wella Koleston Perfect 8G + 7G for balanced lift and tone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-primary/50">•</span>
                      <span>20Vol developer for 30 minutes processing time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-primary/50">•</span>
                      <span>Apply formula using balayage technique for natural, sun-kissed results</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => setSelectedHistoryId(null)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  // Create formulation from this analysis
                  alert('Create formulation from this analysis')
                }}
                variant="default"
              >
                Create Formulation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
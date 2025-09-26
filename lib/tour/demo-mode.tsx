'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, Zap, Users, Settings } from 'lucide-react';
import { useTour } from './tour-provider';

interface DemoModeControlsProps {
  className?: string;
  showBadge?: boolean;
  onSeedData?: () => void;
  onResetData?: () => void;
}

export function DemoModeControls({
  className,
  showBadge = true,
  onSeedData,
  onResetData,
}: DemoModeControlsProps) {
  const { isDemoMode, setDemoMode, resetTour } = useTour();

  const handleToggleDemo = (enabled: boolean) => {
    setDemoMode(enabled);

    if (enabled && onSeedData) {
      onSeedData();
    } else if (!enabled && onResetData) {
      onResetData();
    }
  };

  const handleResetDemo = () => {
    resetTour();
    if (onSeedData && isDemoMode) {
      onSeedData();
    }
  };

  return (
    <div className={className}>
      {showBadge && isDemoMode && (
        <Badge variant="secondary" className="mb-2">
          <Zap className="h-3 w-3 mr-1" />
          Demo Mode
        </Badge>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="demo-mode"
            checked={isDemoMode}
            onCheckedChange={handleToggleDemo}
          />
          <label htmlFor="demo-mode" className="text-sm font-medium">
            Demo Mode
          </label>
        </div>

        {isDemoMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemo}
            className="h-8"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset Demo
          </Button>
        )}
      </div>
    </div>
  );
}

export function DemoSeedData() {
  return {
    users: [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@acme.com',
        role: 'Product Manager',
        avatar: '👩‍💼',
        status: 'active',
        lastActive: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@acme.com',
        role: 'Developer',
        avatar: '👨‍💻',
        status: 'active',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        name: 'Carol Chen',
        email: 'carol@acme.com',
        role: 'Designer',
        avatar: '👩‍🎨',
        status: 'away',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    projects: [
      {
        id: '1',
        name: 'AI Knowledge Base',
        description: 'Building an intelligent search and retrieval system',
        status: 'in_progress',
        progress: 75,
        team: ['1', '2'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        name: 'Mobile App Redesign',
        description: 'Refreshing the user interface for better UX',
        status: 'planning',
        progress: 25,
        team: ['1', '3'],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    documents: [
      {
        id: '1',
        title: 'Product Requirements Document',
        content: 'This document outlines the key requirements for our AI-powered knowledge retrieval system...',
        tags: ['product', 'requirements', 'ai'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'Technical Architecture Guide',
        content: 'Our system leverages Azure AI Search with vector embeddings for semantic search capabilities...',
        tags: ['technical', 'architecture', 'azure'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    metrics: {
      totalUsers: 152,
      activeUsers: 89,
      searchQueries: 1247,
      documentsIndexed: 3456,
      avgResponseTime: '245ms',
      uptime: '99.9%',
    },
  };
}

export function useDemoMode() {
  const { isDemoMode, setDemoMode } = useTour();

  const seedData = () => {
    const data = DemoSeedData();

    // Store demo data in localStorage with a prefix
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(`demo_${key}`, JSON.stringify(value));
    });

    // Set feature flags
    localStorage.setItem('demo_features', JSON.stringify({
      advancedSearch: true,
      aiSuggestions: true,
      analytics: true,
      collaboration: true,
    }));

    console.log('Demo data seeded successfully');
  };

  const resetData = () => {
    // Clear all demo data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('demo_')) {
        localStorage.removeItem(key);
      }
    });

    console.log('Demo data cleared');
  };

  const getDemoData = <T>(key: string): T | null => {
    if (!isDemoMode) return null;

    const data = localStorage.getItem(`demo_${key}`);
    return data ? JSON.parse(data) : null;
  };

  const isFeatureEnabled = (feature: string): boolean => {
    if (!isDemoMode) return false;

    const features = localStorage.getItem('demo_features');
    if (!features) return false;

    const parsed = JSON.parse(features);
    return parsed[feature] === true;
  };

  return {
    isDemoMode,
    setDemoMode,
    seedData,
    resetData,
    getDemoData,
    isFeatureEnabled,
  };
}
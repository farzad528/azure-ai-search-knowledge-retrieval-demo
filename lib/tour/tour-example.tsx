'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Settings, Users, BarChart3, FileText } from 'lucide-react';
import { TourProvider, TourStep, useTour } from './tour-provider';
import { InteractiveTour } from './interactive-tour';
import { DemoModeControls, useDemoMode } from './demo-mode';
import { initializeAnalytics } from './analytics';

// Example tour steps for a knowledge retrieval demo
const demoTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Knowledge Base!',
    content: 'This interactive tour will guide you through the key features of our AI-powered search and retrieval system.',
    position: 'center',
  },
  {
    id: 'search-bar',
    targetSelector: '[data-tour="search-bar"]',
    title: 'Smart Search',
    content: 'Start by typing your question here. Our AI understands natural language and finds relevant documents using semantic search.',
    position: 'bottom',
  },
  {
    id: 'search-filters',
    targetSelector: '[data-tour="search-filters"]',
    title: 'Advanced Filters',
    content: 'Use these filters to narrow down your search by document type, date, or tags for more precise results.',
    position: 'right',
  },
  {
    id: 'try-search',
    targetSelector: '[data-tour="search-bar"]',
    title: 'Try It Out!',
    content: 'Go ahead and search for "product requirements" to see the AI in action. This is a milestone step - you need to complete a search to continue.',
    position: 'bottom',
    milestone: true,
    nextCondition: () => {
      // Check if a search has been performed
      return localStorage.getItem('demo_search_performed') === 'true';
    },
  },
  {
    id: 'results',
    targetSelector: '[data-tour="search-results"]',
    title: 'Smart Results',
    content: 'Results are ranked by relevance using AI embeddings. Notice how documents are grouped by similarity and show confidence scores.',
    position: 'left',
  },
  {
    id: 'analytics',
    targetSelector: '[data-tour="analytics"]',
    title: 'Usage Analytics',
    content: 'Track search patterns, popular queries, and system performance to optimize your knowledge base.',
    position: 'top',
  },
  {
    id: 'team',
    targetSelector: '[data-tour="team"]',
    title: 'Collaboration',
    content: 'See who else is using the system and collaborate on improving the knowledge base together.',
    position: 'bottom',
  },
  {
    id: 'settings',
    targetSelector: '[data-tour="settings"]',
    title: 'Customize Your Experience',
    content: 'Configure search preferences, AI models, and data sources to match your workflow.',
    position: 'left',
  },
];

function ExampleAppLayout() {
  const { startTour, isDemoMode } = useTour();
  const { seedData, getDemoData, isFeatureEnabled } = useDemoMode();

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    localStorage.setItem('demo_search_performed', 'true');

    // Simulate search results in demo mode
    if (isDemoMode) {
      const results = [
        { title: 'Product Requirements Document', relevance: 95 },
        { title: 'Technical Specification', relevance: 87 },
        { title: 'User Stories & Acceptance Criteria', relevance: 82 },
      ];
      localStorage.setItem('demo_search_results', JSON.stringify(results));
    }
  };

  const searchResults = isDemoMode ?
    JSON.parse(localStorage.getItem('demo_search_results') || '[]') : [];

  const metrics = isDemoMode ? getDemoData('metrics') : null;
  const users = isDemoMode ? getDemoData('users') : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              AI Knowledge Retrieval Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Intelligent search and document discovery powered by Azure AI
            </p>
          </div>

          <div className="flex items-center gap-4">
            <DemoModeControls
              onSeedData={seedData}
              className="flex items-center gap-2"
            />
            <Button onClick={() => startTour()}>
              <Play className="h-4 w-4 mr-2" />
              Start Tour
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Knowledge Base</CardTitle>
            <CardDescription>
              Ask questions in natural language and get AI-powered answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1" data-tour="search-bar">
                <Input
                  placeholder="Ask anything... e.g., 'What are the product requirements for the mobile app?'"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e.currentTarget.value);
                    }
                  }}
                />
              </div>
              <Button onClick={() => handleSearch('product requirements')}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div data-tour="search-filters" className="flex gap-2">
              <Badge variant="outline">Documents</Badge>
              <Badge variant="outline">Recent</Badge>
              <Badge variant="outline">High Relevance</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <Card className="mb-6" data-tour="search-results">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.map((result: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.title}</h4>
                      <Badge variant="secondary">{result.relevance}% match</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analytics Card */}
          <Card data-tour="analytics">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Search Analytics
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics as any)?.searchQueries || '1,247'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total queries this month
              </p>
            </CardContent>
          </Card>

          {/* Team Card */}
          <Card data-tour="team">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics as any)?.activeUsers || '89'}
              </div>
              <p className="text-xs text-muted-foreground">
                Users online now
              </p>
              {users && Array.isArray(users) && users.length > 0 && (
                <div className="flex -space-x-2 mt-2">
                  {users.slice(0, 3).map((user: any) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                      title={user.name}
                    >
                      {user.avatar}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card data-tour="settings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Configuration
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Search</span>
                  <Badge variant={isFeatureEnabled('advancedSearch') ? 'default' : 'secondary'}>
                    {isFeatureEnabled('advancedSearch') ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics</span>
                  <Badge variant={isFeatureEnabled('analytics') ? 'default' : 'secondary'}>
                    {isFeatureEnabled('analytics') ? 'On' : 'Off'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function TourExample() {
  useEffect(() => {
    // Initialize analytics for the demo
    initializeAnalytics({
      enabled: true,
      debug: true,
      batchSize: 5,
      flushInterval: 3000,
    });
  }, []);

  return (
    <TourProvider
      defaultSteps={demoTourSteps}
      onStepChange={(step, index) => {
        console.log('Step changed:', step.title, 'Index:', index);
      }}
      onTourEnd={(reason) => {
        console.log('Tour ended:', reason);
      }}
      analyticsTracker={(event, data) => {
        console.log('Analytics:', event, data);
      }}
    >
      <ExampleAppLayout />
      <InteractiveTour />
    </TourProvider>
  );
}
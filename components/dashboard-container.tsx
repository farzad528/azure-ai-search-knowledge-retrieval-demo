"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DashboardView } from './dashboard-view';
import { fetchKnowledgeSources, fetchAgents } from '@/lib/api';

interface DashboardContainerProps {
  initialAgents: any[];
  initialKnowledgeSources: any[];
  initialError: string | null;
}

export function DashboardContainer({ initialAgents, initialKnowledgeSources, initialError }: DashboardContainerProps) {
  const [agents, setAgents] = useState<any[]>(initialAgents || []);
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>(initialKnowledgeSources || []);
  const [error, setError] = useState<string | null>(initialError || null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const lastRefreshRef = useRef<number>(Date.now());
  const retryRef = useRef<number | null>(null);

  // On mount, if we had an error from SSR or empty data, attempt client refresh
  useEffect(() => {
    setHydrated(true);
    if (initialError || (initialAgents.length === 0 && initialKnowledgeSources.length === 0)) {
      refresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ksData, agentsData] = await Promise.all([
        fetchKnowledgeSources(),
        fetchAgents()
      ]);
      const mappedSources = (ksData.value || []).map((source: any) => ({
        id: source.name,
        name: source.name,
        kind: source.kind,
        docCount: 0,
        lastUpdated: null,
        status: 'active',
        description: source.description
      }));
      const mappedAgents = (agentsData.value || []).map((agent: any) => ({
        id: agent.name,
        name: agent.name,
        model: agent.models?.[0]?.azureOpenAIParameters?.modelName,
        sources: (agent.knowledgeSources || []).map((ks: any) => ks.name),
        sourceDetails: (agent.knowledgeSources || []).map((ks: any) => ({ name: ks.name, kind: ks.kind })),
        status: 'active',
        lastRun: null,
        createdBy: null,
        description: agent.description,
        outputConfiguration: agent.outputConfiguration
      }));
      setKnowledgeSources(mappedSources);
      setAgents(mappedAgents);
      lastRefreshRef.current = Date.now();
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Visibility-based retry if there was an error
  useEffect(() => {
    if (!error) return;
    const handler = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [error, refresh]);

  // Periodic stale refresh (every 2 minutes) when tab visible
  useEffect(() => {
    function tick() {
      if (document.visibilityState === 'visible') {
        const age = Date.now() - lastRefreshRef.current;
        if (age > 120000 && !loading) {
          refresh();
        }
      }
      retryRef.current = window.setTimeout(tick, 30000);
    }
    retryRef.current = window.setTimeout(tick, 30000);
    return () => {
      if (retryRef.current) window.clearTimeout(retryRef.current);
    };
  }, [refresh, loading]);

  return (
    <DashboardView
      knowledgeSources={knowledgeSources}
      agents={agents}
      loading={loading && (hydrated || (agents.length === 0 && knowledgeSources.length === 0))}
      error={error}
      onRefresh={refresh}
    />
  );
}

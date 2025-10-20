"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DashboardView } from './dashboard-view';
import { fetchKnowledgeSources, fetchKnowledgeBases } from '@/lib/api';

interface DashboardContainerProps {
  initialKnowledgeBases: any[];
  initialKnowledgeSources: any[];
  initialError: string | null;
}

export function DashboardContainer({ initialKnowledgeBases, initialKnowledgeSources, initialError }: DashboardContainerProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>(initialKnowledgeBases || []);
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>(initialKnowledgeSources || []);
  const [error, setError] = useState<string | null>(initialError || null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const lastRefreshRef = useRef<number>(Date.now());
  const retryRef = useRef<number | null>(null);

  // On mount, if we had an error from SSR or empty data, attempt client refresh
  useEffect(() => {
    setHydrated(true);
    if (initialError || (initialKnowledgeBases.length === 0 && initialKnowledgeSources.length === 0)) {
      refresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ksData, knowledgeBaseData] = await Promise.all([
        fetchKnowledgeSources(),
        fetchKnowledgeBases()
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
      const sourceKindMap = new Map<string, string>();
      mappedSources.forEach((source: any) => {
        if (source?.name) {
          sourceKindMap.set(source.name, source.kind || 'unknown');
        }
      });

      const mappedKnowledgeBases = (knowledgeBaseData.value || []).map((base: any) => {
        const knowledgeSourceNames = (base.knowledgeSources || []).map((ks: any) => ks.name);
        return {
          id: base.name,
          name: base.name,
          model: base.models?.[0]?.azureOpenAIParameters?.modelName,
          sources: knowledgeSourceNames,
          sourceDetails: knowledgeSourceNames.map((name: string) => ({
            name,
            kind: sourceKindMap.get(name) || 'unknown',
          })),
          status: base.status || 'active',
          lastRun: base.lastUpdatedOn || base.lastModifiedOn || null,
          createdBy: base.createdBy || null,
        };
      });
      setKnowledgeSources(mappedSources);
      setKnowledgeBases(mappedKnowledgeBases);
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
      knowledgeBases={knowledgeBases}
      loading={loading && (hydrated || (knowledgeBases.length === 0 && knowledgeSources.length === 0))}
      error={error}
      onRefresh={refresh}
    />
  );
}

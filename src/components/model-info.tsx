'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export function ModelInfoPanel() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/model-stats')
      .then(res => {
        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch model stats:", err);
        setIsLoading(false);
      });
  }, []);
  
  return (
    <div className="p-3 bg-muted/30 rounded-lg border">
      <h4 className="font-semibold mb-2 text-xs">🤖 AI Architecture</h4>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>Qwen-Max:</span>
          <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background">Deep analysis</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Qwen-2.5:</span>
          <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background">Fast filtering</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Qwen-Audio:</span>
          <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background">Voice processing</span>
        </div>
        
        {(stats || isLoading) && (
          <div className="mt-2 pt-2 border-t">
            <h5 className="font-medium text-foreground/90 mb-1">API Usage</h5>
            {isLoading ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-4" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Calls:</span>
                  <span className="font-medium text-foreground">{Object.values(stats).reduce((a: any, b: any) => a + b.calls, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response:</span>
                  <span className="font-medium text-foreground">{Math.round(Math.max(...Object.values(stats).map((s: any) => s.avgTime || 0)))}ms</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

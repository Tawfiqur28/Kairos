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
          // Do not throw an error, just log it and continue
          console.error(`API responded with status ${res.status}`);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setStats(data);
        }
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
          <span>{process.env.NEXT_PUBLIC_MODEL_1_NAME || 'Qwen-Max'}:</span>
          <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background">Deep analysis</span>
        </div>
        <div className="flex justify-between items-center">
          <span>{process.env.NEXT_PUBLIC_MODEL_2_NAME || 'Qwen-2.5'}:</span>
          <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background">Fast filtering</span>
        </div>
        <div className="flex justify-between items-center">
          <span>{process.env.NEXT_PUBLIC_MODEL_3_NAME || 'Qwen-Audio'}:</span>
          <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background">Voice processing</span>
        </div>
      </div>
    </div>
  );
}

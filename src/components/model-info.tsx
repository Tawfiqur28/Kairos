'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ModelInfoPanel() {
  return (
    <TooltipProvider>
      <div className="p-3 bg-muted/30 rounded-lg border relative">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-xs flex items-center gap-1">
            <span>🤖</span> AI Architecture
          </h4>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">
              <p>KAIROS uses multiple AI models for different tasks to provide the best experience.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between items-center group hover:bg-muted/50 p-1 rounded transition-colors">
            <span className="flex items-center gap-1">
              <span className="text-blue-500">🔵</span>
              {process.env.NEXT_PUBLIC_MODEL_1_NAME || 'Qwen-Max'}:
            </span>
            <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background border">
              Deep analysis
            </span>
          </div>
          
          <div className="flex justify-between items-center group hover:bg-muted/50 p-1 rounded transition-colors">
            <span className="flex items-center gap-1">
              <span className="text-green-500">🟢</span>
              {process.env.NEXT_PUBLIC_MODEL_2_NAME || 'Qwen-2.5'}:
            </span>
            <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background border">
              Fast filtering
            </span>
          </div>
          
          <div className="flex justify-between items-center group hover:bg-muted/50 p-1 rounded transition-colors">
            <span className="flex items-center gap-1">
              <span className="text-purple-500">🟣</span>
              {process.env.NEXT_PUBLIC_MODEL_3_NAME || 'Qwen-Audio'}:
            </span>
            <span className="font-mono text-foreground/80 text-[11px] px-1.5 py-0.5 rounded bg-background border">
              Voice processing
            </span>
          </div>
        </div>
        
        {/* Fallback indicator if env vars aren't set */}
        {!process.env.NEXT_PUBLIC_MODEL_1_NAME && (
          <div className="mt-2 pt-2 border-t text-[10px] text-muted-foreground">
            ⚡ Using default model names. Set NEXT_PUBLIC_MODEL_* env vars to customize.
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
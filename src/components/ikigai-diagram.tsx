import { cn } from "@/lib/utils";

export function IkigaiDiagram({ className }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 500 420"
        className={cn(className)}
        aria-labelledby="ikigai-title"
        role="img"
      >
        <title id="ikigai-title">Ikigai Diagram showing the intersection of what you love, what you are good at, what the world needs, and what you can be paid for.</title>
        <g style={{ mixBlendMode: 'power' }} className="dark:opacity-80 dark:[mix-blend-mode:screen]">
          <circle cx="250" cy="130" r="100" fill="hsl(var(--primary) / 0.5)" />
          <circle cx="330" cy="230" r="100" fill="hsl(var(--chart-1) / 0.5)" />
          <circle cx="170" cy="230" r="100" fill="hsl(var(--accent) / 0.5)" />
          <circle cx="250" cy="300" r="100" fill="hsl(var(--chart-4) / 0.5)" />
        </g>
        <g className="fill-foreground text-center font-medium">
        <text x="250" y="65" textAnchor="middle" className="font-bold text-lg">
          What You Love
        </text>
        <text x="250" y="85" textAnchor="middle" className="text-sm opacity-80">
          Your passions & interests
        </text>

        <text x="405" y="225" textAnchor="middle" className="font-bold text-lg">
          What You're Good At
        </text>
        <text x="405" y="245" textAnchor="middle" className="text-sm opacity-80">
          Your talents & skills
        </text>

        <text x="250" y="385" textAnchor="middle" className="font-bold text-lg">
          What You Can Be Paid For
        </text>
        <text x="250" y="405" textAnchor="middle" className="text-sm opacity-80">
          Valuable & marketable
        </text>

        <text x="95" y="225" textAnchor="middle" className="font-bold text-lg">
          What The World Needs
        </text>
        <text x="95" y="245" textAnchor="middle" className="text-sm opacity-80">
          Problems you can solve
        </text>
        </g>
        <g>
          <circle cx="250" cy="215" r="50" fill="hsl(var(--primary))" />
          <text
            x="250"
            y="220"
            textAnchor="middle"
            className="fill-primary-foreground font-bold text-2xl tracking-widest"
          >
            IKIGAI
          </text>
        </g>
      </svg>
    );
  }

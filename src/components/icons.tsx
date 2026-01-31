import type { SVGProps } from 'react';

export const Icons = {
  // A simple representation of the Ikigai diagram.
  Ikigai: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="9" cy="9" r="3" />
      <circle cx="15" cy="9" r="3" />
      <circle cx="9" cy="15" r="3" />
      <circle cx="15" cy="15" r="3" />
    </svg>
  ),
};


import * as React from 'react';

export const Dot = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={16}
    height={16}
    {...props}
  >
    <circle cx="128" cy="128" r="64" fill="currentColor" />
  </svg>
);

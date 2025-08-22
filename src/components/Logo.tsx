import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={32}
    height={32}
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#logo-gradient)"
      d="M224,48H152a8,8,0,0,0-8,8V80a8,8,0,0,0,8,8h72a8,8,0,0,0,8-8V56A8,8,0,0,0,224,48ZM91.43,103,48,146.43,32.57,131A8,8,0,0,0,20,136.57l24,24a8,8,0,0,0,11.32,0l56-56a8,8,0,0,0-11.32-11.32Zm-48,15.15,10.85-10.84,18.82,18.82L51.3,147.43ZM224,120H152a8,8,0,0,0-8,8v24a8,8,0,0,0,8,8h72a8,8,0,0,0,8-8V128A8,8,0,0,0,224,120ZM96,192H32a8,8,0,0,0-8,8v24a8,8,0,0,0,8,8H96a8,8,0,0,0,8-8V200A8,8,0,0,0,96,192Zm128,0H152a8,8,0,0,0-8,8v24a8,8,0,0,0,8,8h72a8,8,0,0,0,8-8V200A8,8,0,0,0,224,192Z"
    />
  </svg>
);

export default Logo;

interface IconProps {
  size?: number;
  className?: string;
}

export function LinkedInIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM3.56 20.45h3.56V9H3.56z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 8.4s-.2-1.55-.83-2.23c-.79-.87-1.68-.87-2.09-.92C16.2 5 12 5 12 5h-.01s-4.2 0-7.08.25c-.4.05-1.29.05-2.08.92C2.2 6.85 2 8.4 2 8.4S1.8 10.2 1.8 12v1.6c0 1.8.2 3.6.2 3.6s.2 1.55.83 2.23c.79.87 1.83.84 2.3.93 1.66.16 7 .21 7.87.2.01 0 4.2-.01 7.08-.26.4-.05 1.29-.05 2.08-.92.63-.68.83-2.23.83-2.23s.2-1.8.2-3.6V12c0-1.8-.2-3.6-.2-3.6zM9.96 15.2V8.9l5.6 3.15z" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8.1v2.8h2.4V21z" />
    </svg>
  );
}

export function XIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.2 3h2.9l-6.3 7.2L21 21h-5.8l-4.5-5.9L5.3 21H2.4l6.7-7.7L2 3h5.9l4.1 5.4zm-1 16.3h1.6L7.9 4.6H6.2z" />
    </svg>
  );
}

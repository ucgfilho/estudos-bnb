interface BnbLogoProps {
  className?: string;
  size?: number;
}

/**
 * Logomarca oficial do Banco do Nordeste baseada no Manual de Paleta de Cores:
 * - Fundo Vermelho BNB (Pantone 194 C / #A6193C)
 * - Moldura Laranja BNB (Pantone 151 C / #F68B1F)
 * - Símbolo estilizado do coqueiro em branco
 */
export function BnbLogo({ className = 'size-8', size }: BnbLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="Banco do Nordeste"
      role="img"
    >
      <rect width="64" height="64" rx="14" fill="#A6193C" />
      <rect x="6" y="6" width="52" height="52" rx="11" stroke="#F68B1F" strokeWidth={4} />
      <g fill="#FFFFFF">
        <path d="M30 27 C28 21 22 17 14 18 C 17 23 23 26 28 28 Z" />
        <path d="M32 27 C34 21 40 17 48 18 C 45 23 39 26 34 28 Z" />
        <path d="M34 29 C40 31 45 36 47 42 C 41 41 36 36 32 31 Z" />
        <path d="M13 49 C14 43 18 36 28 29 C29 31 31 32 31 32 C26 37 21 43 19 49 Z" />
        <circle cx="31" cy="28.5" r="2.5" />
      </g>
    </svg>
  );
}

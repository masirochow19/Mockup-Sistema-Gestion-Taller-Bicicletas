export function BicicletasLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg 
        width="48" 
        height="48" 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rueda trasera */}
        <circle cx="12" cy="32" r="8" stroke="#10b981" strokeWidth="2" fill="none"/>
        <circle cx="12" cy="32" r="1.5" fill="#10b981"/>
        
        {/* Rueda delantera */}
        <circle cx="36" cy="32" r="8" stroke="#10b981" strokeWidth="2" fill="none"/>
        <circle cx="36" cy="32" r="1.5" fill="#10b981"/>
        
        {/* Cuadro */}
        <path d="M12 32 L20 18 L28 18 L36 32" stroke="#10b981" strokeWidth="2" fill="none"/>
        <path d="M20 18 L20 24 L12 32" stroke="#10b981" strokeWidth="2" fill="none"/>
        <path d="M20 24 L28 24" stroke="#10b981" strokeWidth="2" fill="none"/>
        
        {/* Manubrio */}
        <path d="M28 18 L32 14 L34 14" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        
        {/* Asiento */}
        <path d="M20 18 L18 12 L22 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

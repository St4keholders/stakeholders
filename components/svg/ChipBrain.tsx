export default function ChipBrain() {
  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <g className="pin">
        <line x1="50" y1="10" x2="50" y2="24"/><line x1="70" y1="10" x2="70" y2="24"/><line x1="90" y1="10" x2="90" y2="24"/>
        <line x1="50" y1="116" x2="50" y2="130"/><line x1="70" y1="116" x2="70" y2="130"/><line x1="90" y1="116" x2="90" y2="130"/>
        <line x1="10" y1="50" x2="24" y2="50"/><line x1="10" y1="70" x2="24" y2="70"/><line x1="10" y1="90" x2="24" y2="90"/>
        <line x1="116" y1="50" x2="130" y2="50"/><line x1="116" y1="70" x2="130" y2="70"/><line x1="116" y1="90" x2="130" y2="90"/>
      </g>
      <rect x="24" y="24" width="92" height="92" rx="10"/>
      <rect x="35" y="35" width="70" height="70" rx="6" opacity="0.5"/>
      <g className="brain">
        <path d="M70 46 c-8 -6 -20 -2 -22 6 c-8 1 -12 10 -7 16 c-5 5 -2 14 5 15 c0 7 9 11 15 7 c3 4 9 4 9 4 c0 0 6 0 9 -4 c6 4 15 0 15 -7 c7 -1 10 -10 5 -15 c5 -6 1 -15 -7 -16 c-2 -8 -14 -12 -22 -6 z"/>
        <path d="M70 46 q-4 8 0 16 q4 8 0 16 q-4 8 0 16"/>
        <path d="M52 62 q8 -4 12 2"/>
        <path d="M50 75 q8 -2 12 4"/>
        <path d="M56 87 q6 -4 10 0"/>
        <path d="M88 62 q-8 -4 -12 2"/>
        <path d="M90 75 q-8 -2 -12 4"/>
        <path d="M84 87 q-6 -4 -10 0"/>
      </g>
    </svg>
  );
}

export default function Panel() {
  return (
    <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
      <path d="M70 64 V52 q0 -6 6 -6 h28 q6 0 6 6 V64"/>
      <rect x="54" y="64" width="172" height="152" rx="8"/>
      <line x1="54" y1="100" x2="226" y2="100"/>
      <line x1="111" y1="64" x2="111" y2="216"/>
      <line x1="168" y1="64" x2="168" y2="216"/>
      <line x1="54" y1="139" x2="226" y2="139"/>
      <line x1="54" y1="178" x2="226" y2="178"/>
      <line x1="66" y1="83" x2="98" y2="83"/>
      <line x1="123" y1="83" x2="155" y2="83"/>
      <line x1="180" y1="83" x2="214" y2="83"/>
      <g className="sig s1">
        <line x1="82" y1="107" x2="82" y2="132"/>
        <path d="M90 113 c-3 -4 -13 -4 -13 2 c0 7 13 5 13 12 c0 6 -10 6 -13 2"/>
      </g>
      <g className="sig s2">
        <circle cx="132" cy="113" r="5"/>
        <circle cx="147" cy="127" r="5"/>
        <line x1="129" y1="131" x2="150" y2="108"/>
      </g>
      <g className="sig s3">
        <line x1="197" y1="109" x2="197" y2="131"/>
        <line x1="186" y1="120" x2="208" y2="120"/>
      </g>
      <g className="sig s4">
        <line x1="73" y1="153" x2="92" y2="153"/>
        <line x1="73" y1="163" x2="92" y2="163"/>
      </g>
      <g className="sig s5">
        <line x1="131" y1="150" x2="148" y2="167"/>
        <line x1="148" y1="150" x2="131" y2="167"/>
      </g>
      <g className="sig s6 key">
        <path d="M180 207 L194 192 L202 199 L214 184"/>
        <path d="M214 184 L205 185 M214 184 L212 193"/>
      </g>
    </svg>
  );
}

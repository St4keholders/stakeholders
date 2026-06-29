const fs = require('fs');
const path = require('path');

const svgPaths = {
  Home: 'Navigation/House_01.svg',
  Calendar: 'Calendar/Calendar.svg',
  Users: 'User/Users.svg',
  ShoppingCart: 'Interface/Shopping_Cart_01.svg',
  DollarSign: 'Interface/Credit_Card_02.svg',
  Activity: 'Interface/Chart_Line.svg',
  LogOut: 'Interface/Log_Out.svg',
  Settings: 'Interface/Settings.svg',
  CreditCard: 'Interface/Credit_Card_01.svg',
  TrendingUp: 'Interface/Trending_Up.svg',
  TrendingDown: 'Interface/Trending_Down.svg',
  ChevronLeft: 'Arrow/Arrow_Left_MD.svg',
  ChevronRight: 'Arrow/Arrow_Right_MD.svg',
  Plus: 'Edit/Add_Plus.svg',
  Search: 'Interface/Search_Magnifying_Glass.svg',
  Filter: 'Interface/Filter.svg'
}

let componentFile = `import React from 'react';

export function createIcon(svgPaths: string) {
  return function Icon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
        dangerouslySetInnerHTML={{ __html: svgPaths }}
      />
    )
  }
}

`;

const baseDir = '.gemini/scratch/coolicons/coolicons SVG';
for (const [name, relPath] of Object.entries(svgPaths)) {
  const fullPath = path.join(baseDir, relPath);
  try {
    let svgContent = fs.readFileSync(fullPath, 'utf8');
    const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match) {
      let inner = match[1].trim();
      inner = inner.replace(/stroke="[^"]*"/g, '');
      inner = inner.replace(/fill="[^"]*"/g, '');
      componentFile += `export const ${name} = createIcon(\`${inner}\`);\n`;
    }
  } catch(e) {
    console.error("Missing: " + relPath);
  }
}

fs.writeFileSync('components/ui/CoolIcons.tsx', componentFile);
console.log('Icons generated successfully.');

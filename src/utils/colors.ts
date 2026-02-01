export const categoryColors = [
  // Reds
  '#ef4444', // red
  '#dc2626', // red-600
  '#b91c1c', // red-700
  '#f43f5e', // rose
  '#e11d48', // rose-600

  // Oranges
  '#f97316', // orange
  '#ea580c', // orange-600
  '#f59e0b', // amber
  '#d97706', // amber-600

  // Yellows
  '#eab308', // yellow
  '#ca8a04', // yellow-600
  '#fbbf24', // amber-400

  // Greens
  '#84cc16', // lime
  '#65a30d', // lime-600
  '#22c55e', // green
  '#16a34a', // green-600
  '#10b981', // emerald
  '#059669', // emerald-600
  '#14b8a6', // teal
  '#0d9488', // teal-600

  // Blues
  '#06b6d4', // cyan
  '#0891b2', // cyan-600
  '#0ea5e9', // sky
  '#0284c7', // sky-600
  '#3b82f6', // blue
  '#2563eb', // blue-600
  '#1d4ed8', // blue-700

  // Purples
  '#6366f1', // indigo
  '#4f46e5', // indigo-600
  '#4338ca', // indigo-700
  '#8b5cf6', // violet
  '#7c3aed', // violet-600
  '#a855f7', // purple
  '#9333ea', // purple-600
  '#d946ef', // fuchsia
  '#c026d3', // fuchsia-600

  // Pinks
  '#ec4899', // pink
  '#db2777', // pink-600
  '#be185d', // pink-700

  // Neutrals
  '#64748b', // slate
  '#475569', // slate-600
  '#78716c', // stone
  '#57534e', // stone-600
];

export const getRandomColor = (): string => {
  return categoryColors[Math.floor(Math.random() * categoryColors.length)];
};

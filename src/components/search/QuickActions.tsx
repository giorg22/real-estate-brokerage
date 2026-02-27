import { Card } from "../ui/card";

export const QuickActions = () => {
  const actions = [
    { icon: "📊", label: "Price Statistics" },
    { icon: "⛷️", label: "Rent in Gudauri" },
    { icon: "❄️", label: "Rent in Bakuriani" },
    { icon: "🏢", label: "Apartments from Developers" },
    { icon: "🏗️", label: "Construction Projects" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto px-4 -mt-10 relative z-20">
      {actions.map((action, i) => (
        <Card key={i} className="flex flex-row items-center p-4 bg-white/95 backdrop-blur shadow-xl border-none hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="text-3xl mr-3 group-hover:scale-110 transition-transform">
            {action.icon}
          </div>
          <span className="text-xs font-bold text-slate-700 leading-tight">
            {action.label}
          </span>
        </Card>
      ))}
    </div>
  );
};
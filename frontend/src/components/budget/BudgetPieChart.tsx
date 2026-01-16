import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/Card';
import type { BudgetCategorie } from '@/types/budget';

interface BudgetPieChartProps {
  data: BudgetCategorie[];
  title?: string;
}

export function BudgetPieChart({ data, title = 'Répartition par catégorie' }: BudgetPieChartProps) {
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: BudgetCategorie }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-dark px-3 py-2 rounded-lg border border-primary">
          <p className="font-medium text-primary">{item.label}</p>
          <p className="text-primary-400 font-semibold">
            {item.montant.toLocaleString('fr-FR')}€
          </p>
          <p className="text-xs text-tertiary">{item.pourcentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => (
    <div className="mt-4 space-y-2">
      {data.map((item) => (
        <div key={item.categorie} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-secondary">{item.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-primary font-medium">
              {item.montant.toLocaleString('fr-FR')}€
            </span>
            <span className="text-muted w-10 text-right">
              {item.pourcentage}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-muted">
          Aucune donnée
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="montant"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {renderLegend()}
    </Card>
  );
}


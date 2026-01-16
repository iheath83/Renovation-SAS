import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface BudgetPieData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface BudgetPieChartProps {
  data: BudgetPieData[];
  total: number;
  spent: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark rounded-lg p-3 border border-primary">
        <p className="font-medium text-primary">{payload[0].name}</p>
        <p className="text-sm text-secondary">
          {payload[0].value.toLocaleString('fr-FR')}€
        </p>
      </div>
    );
  }
  return null;
};

export function BudgetPieChart({ data, total, spent }: BudgetPieChartProps) {
  const remaining = total - spent;
  const percentage = Math.round((spent / total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-primary font-display">
              {percentage}%
            </span>
            <span className="text-sm text-tertiary">utilisé</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-secondary">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {item.value.toLocaleString('fr-FR')}€
              </span>
            </div>
          ))}
        </div>

        {/* Budget remaining */}
        <div className="mt-4 pt-4 border-t border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-sm text-tertiary">Budget restant</span>
            <span className={`text-lg font-bold ${remaining >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
              {remaining.toLocaleString('fr-FR')}€
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


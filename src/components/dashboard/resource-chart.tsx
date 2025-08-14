import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';

interface ResourceChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export default function ResourceChart({ data }: ResourceChartProps) {
  const chartConfig = useMemo(() => {
    const config: any = {};
    data.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.color
        }
    });
    return config;
  }, [data]);

  return (
    <div className="h-20 w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <Tooltip
              cursor={{ fill: 'hsla(var(--accent))' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
              {data.map((entry) => (
                <rect key={entry.name} x={entry.value} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

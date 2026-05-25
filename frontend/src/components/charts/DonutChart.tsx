import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: { easy?: number; medium?: number; hard?: number };
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const chartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [data.easy || 0, data.medium || 0, data.hard || 0],
        backgroundColor: ['#4ade80', '#60a5fa', '#f87171'],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div style={{ width: 220, height: 220 }}>
      <Doughnut data={chartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
    </div>
  );
};

export default DonutChart;

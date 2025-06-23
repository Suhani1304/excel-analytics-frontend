import { Bar, Bubble, Doughnut, Line, Pie, PolarArea, Radar, Scatter } from "react-chartjs-2";

export default function ChartPage() {
  const data = {
    labels: ["A", "B", "C"],
    datasets: [{
      label: "Sample",
      data: [12, 19, 3],
      backgroundColor: ["#3b82f6", "#f97316", "#10b981"]
    }]
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      <Bar data={data} />
      <Pie data={data} />
      <Line data={data} />
      <Doughnut data={data} />
      <Radar data={data} />
      <PolarArea data={data} />
      <Bubble data={{
        datasets: [{
          label: "Bubble Dataset",
          data: [{ x: 20, y: 30, r: 10 }, { x: 10, y: 20, r: 15 }],
          backgroundColor: "#f43f5e"
        }]
      }} />
      <Scatter data={{
        datasets: [{
          label: "Scatter Dataset",
          data: [{ x: -10, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 5 }],
          backgroundColor: "#6366f1"
        }]
      }} />
    </div>
  );
}

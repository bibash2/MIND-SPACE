"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { MoodDataPoint } from "@/types";
import { getSentimentColor, formatShortDate } from "@/lib/utils";

Chart.register(
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Filler, Tooltip, Legend
);

interface Props {
  data: MoodDataPoint[];
  title?: string;
}

export default function MoodChart({ data, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(77, 217, 172, 0.25)");
    gradient.addColorStop(1, "rgba(77, 217, 172, 0)");

    const negGradient = ctx.createLinearGradient(0, 0, 0, 300);
    negGradient.addColorStop(0, "rgba(232, 112, 112, 0)");
    negGradient.addColorStop(1, "rgba(232, 112, 112, 0.15)");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => formatShortDate(d.date)),
        datasets: [
          {
            label: "Mood Score",
            data: data.map((d) => d.polarity_score),
            borderColor: "#4dd9ac",
            backgroundColor: gradient,
            borderWidth: 2,
            pointBackgroundColor: data.map((d) => getSentimentColor(d.label)),
            pointBorderColor: "transparent",
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#162032",
            borderColor: "rgba(255,255,255,0.07)",
            borderWidth: 1,
            titleColor: "#e8edf5",
            bodyColor: "#8b9ab5",
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const score = ctx.parsed.y;
                if (score == null) return "  Score: —";
                const label =
                  score >= 0.05 ? "Positive" : score <= -0.05 ? "Negative" : "Neutral";
                return `  Score: ${score >= 0 ? "+" : ""}${score.toFixed(3)} (${label})`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "#4a5a72", font: { size: 11, family: "DM Sans" } },
            border: { color: "transparent" },
          },
          y: {
            min: -1,
            max: 1,
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: {
              color: "#4a5a72",
              font: { size: 11, family: "JetBrains Mono" },
              callback: (v) => (Number(v) >= 0 ? `+${v}` : `${v}`),
              stepSize: 0.5,
            },
            border: { color: "transparent" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[--text-muted]">
        <p className="text-sm">No data yet</p>
        <p className="text-xs mt-1">Start journaling to see your mood trends</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-sm font-medium text-[--text-secondary]">{title}</h3>
      )}
      <div className="h-48">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

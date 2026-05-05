import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "../../app/useAppState";
import type { ChartData, SpendingCategory } from "../../data";
import { formatCurrency } from "../../utils/formatters";

type OverviewCardProps = {
  cardClassName?: string;
  chartClassName?: string;
  data: ChartData;
  title: string;
};

export function OverviewCard({ cardClassName = "overview-card", chartClassName = "", data, title }: OverviewCardProps) {
  const articleClassName = `card overview-card ${cardClassName === "overview-card" ? "" : cardClassName}`.trim();

  return (
    <article className={articleClassName} aria-labelledby={`${cardClassName}Title`}>
      <div className="card__header">
        <h2 className="card__title" id={`${cardClassName}Title`}>
          {title}
        </h2>
      </div>
      <div className="card__body">
        <div className={`chart-shell chart-shell--overview ${chartClassName}`}>
          <OverviewChart data={data} />
        </div>
        <div className="overview-card__legend" aria-label="Overview chart legend">
          <span className="overview-card__legend-item">
            <span className="overview-card__legend-swatch overview-card__legend-swatch--income" />
            <span>Income</span>
          </span>
          <span className="overview-card__legend-item">
            <span className="overview-card__legend-swatch overview-card__legend-swatch--expenses" />
            <span>Expenses</span>
          </span>
        </div>
      </div>
    </article>
  );
}

type SpendingCardProps = {
  cardClassName?: string;
  categories: SpendingCategory[];
  legendClassName?: string;
  title: string;
};

export function SpendingCard({ cardClassName = "spending-card", categories, legendClassName = "spending-card__legend", title }: SpendingCardProps) {
  const legendGroups = legendClassName === "analytics-spending-card__legends" ? [categories.slice(0, 3), categories.slice(3)] : [categories];
  const articleClassName = `card spending-card ${cardClassName === "spending-card" ? "" : cardClassName}`.trim();

  return (
    <article className={articleClassName} aria-labelledby={`${cardClassName}Title`}>
      <div className="card__header">
        <h2 className="card__title" id={`${cardClassName}Title`}>
          {title}
        </h2>
      </div>
      <div className={`card__body ${cardClassName}__body`}>
        <div className="chart-shell chart-shell--spending">
          <PieChart categories={categories} />
        </div>
        <div className={legendClassName}>
          {legendGroups.map((group, index) => (
            <div className={legendGroups.length > 1 ? "analytics-spending-card__legend-column" : ""} key={index}>
              <SpendingLegend categories={group} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function SpendingLegend({ categories }: { categories: SpendingCategory[] }) {
  return (
    <>
      {categories.map((category) => (
        <div className="spending-legend__item" key={category.label}>
          <div className="spending-legend__label-group">
            <span className="spending-legend__swatch" style={{ background: category.color }} />
            <p className="spending-legend__label">{category.label}</p>
          </div>
          <p className="spending-legend__value">{formatCurrency(category.value)}</p>
        </div>
      ))}
    </>
  );
}

function OverviewChart({ data }: { data: ChartData }) {
  const { theme } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitTargetsRef = useRef<{ x: number; y: number; width: number; height: number; text: string }[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const draw = () => {
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const styles = getComputedStyle(document.documentElement);
      const text = styles.getPropertyValue("--text").trim() || "#1f2937";
      const divider = styles.getPropertyValue("--divider").trim() || "#f4f4f4";
      const surface = styles.getPropertyValue("--surface").trim() || "#ffffff";
      const success = styles.getPropertyValue("--success").trim() || "#2f7c33";
      const danger = styles.getPropertyValue("--danger").trim() || "#cd1f2e";
      const padding = {
        top: 10,
        right: data.labels.length > 6 ? 24 : 18,
        bottom: 34,
        left: 52,
      };
      const chartWidth = rect.width - padding.left - padding.right;
      const chartHeight = rect.height - padding.top - padding.bottom;
      const bottom = padding.top + chartHeight;
      const maxValue = data.suggestedMax;
      const slot = chartWidth / data.labels.length;
      const barWidth = Math.min(data.labels.length > 6 ? 16 : 18, slot / 5);
      const barGap = Math.min(8, slot / 10);

      const yAt = (value: number) => bottom - (value / maxValue) * chartHeight;
      const centerXAt = (index: number) => padding.left + slot * index + slot / 2;
      const targets: typeof hitTargetsRef.current = [];

      context.lineWidth = 1;
      context.strokeStyle = divider;
      context.fillStyle = text;
      context.font = '400 16px "Inter", system-ui, sans-serif';
      context.textAlign = "right";
      context.textBaseline = "middle";

      [0, 1000, 2000, 3000, 4000].forEach((value) => {
        const y = yAt(value);
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(rect.width - padding.right, y);
        context.stroke();
        context.fillText(value === 0 ? "0" : `${value / 1000}k`, padding.left - 14, y);
      });

      context.textAlign = "center";
      context.textBaseline = "top";
      data.labels.forEach((label, index) => {
        context.fillText(label, centerXAt(index), bottom + 14);
      });

      data.labels.forEach((label, index) => {
        const center = centerXAt(index);
        const incomeValue = data.incomeBars[index] ?? 0;
        const expenseValue = data.expenseBars[index] ?? 0;
        const incomeX = center - barGap / 2 - barWidth;
        const expenseX = center + barGap / 2;
        const incomeY = yAt(incomeValue);
        const expenseY = yAt(expenseValue);

        context.fillStyle = success;
        context.fillRect(incomeX, incomeY, barWidth, bottom - incomeY);
        context.fillStyle = danger;
        context.fillRect(expenseX, expenseY, barWidth, bottom - expenseY);

        targets.push({
          x: incomeX - 5,
          y: incomeY,
          width: barWidth + 10,
          height: bottom - incomeY,
          text: `${label}: Income ${formatCurrency(incomeValue)}`,
        });
        targets.push({
          x: expenseX - 5,
          y: expenseY,
          width: barWidth + 10,
          height: bottom - expenseY,
          text: `${label}: Expenses ${formatCurrency(expenseValue)}`,
        });
      });

      drawLine(context, data.incomeLine, success, surface, padding.left, slot, bottom, chartHeight, maxValue);
      drawLine(context, data.expenseLine, danger, surface, padding.left, slot, bottom, chartHeight, maxValue);

      data.labels.forEach((label, index) => {
        const x = centerXAt(index);
        const incomeY = yAt(data.incomeLine[index] ?? 0);
        const expenseY = yAt(data.expenseLine[index] ?? 0);

        targets.push({
          x: x - 12,
          y: incomeY - 12,
          width: 24,
          height: 24,
          text: `${label}: Income trend ${formatCurrency(data.incomeLine[index] ?? 0)}`,
        });
        targets.push({
          x: x - 12,
          y: expenseY - 12,
          width: 24,
          height: 24,
          text: `${label}: Expense trend ${formatCurrency(data.expenseLine[index] ?? 0)}`,
        });
      });

      hitTargetsRef.current = targets;
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [data, theme]);

  function handlePointerMove(event: MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const target = hitTargetsRef.current.find(
      (item) => x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height,
    );

    setTooltip(target ? { x, y, text: target.text } : null);
  }

  return (
    <>
      <canvas
        className="chart-canvas"
        ref={canvasRef}
        role="img"
        aria-label="Income and expenses chart"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </>
  );
}

function PieChart({ categories }: { categories: SpendingCategory[] }) {
  const { theme } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slicesRef = useRef<{ start: number; end: number; text: string }[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const draw = () => {
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const total = categories.reduce((sum, category) => sum + category.value, 0);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.max(20, Math.min(rect.width, rect.height) / 2 - 10);
      let start = -Math.PI / 2;

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      context.font = '700 18px "Inter", system-ui, sans-serif';
      context.textAlign = "center";
      context.textBaseline = "middle";

      const slices: typeof slicesRef.current = [];

      categories.forEach((category) => {
        const share = total ? category.value / total : 0;
        const end = start + share * Math.PI * 2;
        const middle = start + (end - start) / 2;

        context.beginPath();
        context.moveTo(centerX, centerY);
        context.arc(centerX, centerY, radius, start, end);
        context.closePath();
        context.fillStyle = category.color;
        context.fill();
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.stroke();

        if (share > 0.07) {
          context.fillStyle = "#ffffff";
          context.fillText(`${Math.round(share * 100)}%`, centerX + Math.cos(middle) * radius * 0.58, centerY + Math.sin(middle) * radius * 0.58);
        }

        slices.push({ start, end, text: `${category.label}: ${formatCurrency(category.value)}` });
        start = end;
      });

      slicesRef.current = slices;
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [categories, theme]);

  function handlePointerMove(event: MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.max(20, Math.min(rect.width, rect.height) / 2 - 10);
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > radius) {
      setTooltip(null);
      return;
    }

    let angle = Math.atan2(dy, dx);

    if (angle < -Math.PI / 2) {
      angle += Math.PI * 2;
    }

    const target = slicesRef.current.find((slice) => angle >= slice.start && angle <= slice.end);

    setTooltip(target ? { x, y, text: target.text } : null);
  }

  return (
    <>
      <canvas
        className="chart-canvas"
        ref={canvasRef}
        role="img"
        aria-label="Spending breakdown chart"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </>
  );
}

function drawLine(
  context: CanvasRenderingContext2D,
  values: number[],
  color: string,
  surface: string,
  left: number,
  slot: number,
  bottom: number,
  chartHeight: number,
  maxValue: number,
) {
  const points = values.map((value, index) => ({
    x: left + slot * index + slot / 2,
    y: bottom - (value / maxValue) * chartHeight,
  }));

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
      return;
    }

    context.lineTo(point.x, point.y);
  });
  context.strokeStyle = color;
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();

  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 5.2, 0, Math.PI * 2);
    context.fillStyle = surface;
    context.fill();
    context.strokeStyle = color;
    context.lineWidth = 2.4;
    context.stroke();
  });
}

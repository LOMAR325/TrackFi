function getCssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function formatCurrency(value) {
  const hasCents = !Number.isInteger(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function applyChartDefaults() {
  if (typeof Chart === "undefined") {
    return;
  }

  Chart.defaults.font.family = '"Inter", system-ui, sans-serif';
  Chart.defaults.color = getCssVar("--text", "#1F2937");
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(17, 24, 39, 0.92)";
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
}

const pieShareLabelsPlugin = {
  id: "pieShareLabels",
  afterDatasetsDraw(chart, args, pluginOptions) {
    if (!pluginOptions?.display) {
      return;
    }

    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    if (!dataset || !meta?.data?.length) {
      return;
    }

    const total = dataset.data.reduce((sum, value) => sum + Number(value || 0), 0);

    if (!total) {
      return;
    }

    const { ctx } = chart;

    ctx.save();
    ctx.fillStyle = pluginOptions.color || "#FFFFFF";
    ctx.font = pluginOptions.font || '600 14px "Inter", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    meta.data.forEach((arc, index) => {
      const rawValue = Number(dataset.data[index] || 0);
      const share = Math.round((rawValue / total) * 100);

      if (!share) {
        return;
      }

      const angle = (arc.startAngle + arc.endAngle) / 2;
      const radius = arc.innerRadius + (arc.outerRadius - arc.innerRadius) * 0.62;
      const x = arc.x + Math.cos(angle) * radius;
      const y = arc.y + Math.sin(angle) * radius;

      ctx.fillText(`${share}%`, x, y);
    });

    ctx.restore();
  },
};

const fallbackCharts = new WeakMap();
const fallbackTooltips = new WeakMap();
let sharedTooltip = null;

export function createOverviewChart(canvas, overviewChartData) {
  if (!canvas) {
    return null;
  }

  if (typeof Chart === "undefined") {
    const render = () => drawOverviewFallback(canvas, overviewChartData);
    registerFallbackChart(canvas, render);
    render();
    return null;
  }

  applyChartDefaults();

  const success = getCssVar("--success", "#2F7C33");
  const danger = getCssVar("--danger", "#CD1F2E");
  const text = getCssVar("--text", "#1F2937");
  const divider = getCssVar("--divider", "#F4F4F4");

  return new Chart(canvas, {
    type: "bar",
    data: {
      labels: overviewChartData.labels,
      datasets: [
        {
          type: "bar",
          label: "Income",
          data: overviewChartData.incomeBars,
          backgroundColor: success,
          borderRadius: 0,
          borderSkipped: false,
          barThickness: overviewChartData.barThickness ?? 18,
          order: 2,
        },
        {
          type: "bar",
          label: "Expenses",
          data: overviewChartData.expenseBars,
          backgroundColor: danger,
          borderRadius: 0,
          borderSkipped: false,
          barThickness: overviewChartData.barThickness ?? 18,
          order: 2,
        },
        {
          type: "line",
          label: "Income Trend",
          data: overviewChartData.incomeLine,
          borderColor: success,
          backgroundColor: "#FFFFFF",
          tension: 0.35,
          borderWidth: 2.25,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 5,
          pointBorderWidth: 2,
          pointBorderColor: success,
          pointBackgroundColor: "#FFFFFF",
          order: 1,
        },
        {
          type: "line",
          label: "Expense Trend",
          data: overviewChartData.expenseLine,
          borderColor: danger,
          backgroundColor: "#FFFFFF",
          tension: 0.35,
          borderWidth: 2.25,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 5,
          pointBorderWidth: 2,
          pointBorderColor: danger,
          pointBackgroundColor: "#FFFFFF",
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500,
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      layout: {
        padding: {
          top: 0,
          right: 16,
          bottom: 0,
          left: 4,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: text,
            font: {
              size: 16,
              weight: 400,
            },
            padding: 10,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: overviewChartData.suggestedMax ?? 4000,
          ticks: {
            color: text,
            stepSize: overviewChartData.stepSize ?? 1000,
            font: {
              size: 16,
              weight: 400,
            },
            padding: 12,
            callback(value) {
              return value === 0 ? "0" : `${value / 1000}k`;
            },
          },
          grid: {
            color: divider,
          },
          border: {
            display: false,
          },
        },
      },
    },
  });
}

export function createSpendingChart(canvas, spendingCategories) {
  if (!canvas) {
    return null;
  }

  if (typeof Chart === "undefined") {
    const render = () => drawSpendingFallback(canvas, spendingCategories);
    registerFallbackChart(canvas, render);
    render();
    return null;
  }

  applyChartDefaults();

  return new Chart(canvas, {
    type: "pie",
    plugins: [pieShareLabelsPlugin],
    data: {
      labels: spendingCategories.map((category) => category.label),
      datasets: [
        {
          data: spendingCategories.map((category) => category.value),
          backgroundColor: spendingCategories.map((category) => category.color),
          borderColor: "#FFFFFF",
          borderWidth: 2,
          hoverOffset: 4,
          radius: "100%",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 450,
      },
      plugins: {
        legend: {
          display: false,
        },
        pieShareLabels: {
          display: true,
          color: "#FFFFFF",
          font: '600 14px "Inter", system-ui, sans-serif',
        },
        tooltip: {
          callbacks: {
            label(context) {
              const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
              const share = Math.round((context.parsed / total) * 100);
              return `${context.label}: ${formatCurrency(context.parsed)} (${share}%)`;
            },
          },
        },
      },
    },
  });
}

function prepareCanvas(canvas) {
  const parentRect = canvas.parentElement?.getBoundingClientRect();
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(280, parentRect?.width || rect.width || canvas.parentElement?.clientWidth || 320);
  const height = Math.max(200, parentRect?.height || rect.height || canvas.parentElement?.clientHeight || 220);

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  return { ctx, width, height };
}

function registerFallbackChart(canvas, render) {
  const existing = fallbackCharts.get(canvas);

  if (existing) {
    existing.render = render;
    return;
  }

  const state = {
    render,
    resizeTimer: null,
  };

  const redraw = () => {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => state.render(), 80);
  };

  window.addEventListener("resize", redraw);
  document.addEventListener("trackfi:themechange", redraw);
  fallbackCharts.set(canvas, state);
}

function drawOverviewFallback(canvas, data) {
  const { ctx, width, height } = prepareCanvas(canvas);
  const success = getCssVar("--success", "#2F7C33");
  const danger = getCssVar("--danger", "#CD1F2E");
  const text = getCssVar("--text", "#1F2937");
  const divider = getCssVar("--divider", "#E5E5E5");
  const max = data.suggestedMax ?? 4000;
  const labelFontSize = width < 560 ? 12 : 14;
  const tickFontSize = width < 560 ? 12 : 14;
  const padding = {
    top: 12,
    right: width < 560 ? 10 : 20,
    bottom: width < 560 ? 30 : 36,
    left: width < 560 ? 42 : 56,
  };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const hitAreas = [];

  ctx.clearRect(0, 0, width, height);
  ctx.font = `${tickFontSize}px "Inter", system-ui, sans-serif`;
  ctx.textBaseline = "middle";

  for (let tick = 0; tick <= max; tick += data.stepSize ?? 1000) {
    const y = padding.top + plotHeight - (tick / max) * plotHeight;
    ctx.strokeStyle = divider;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = text;
    ctx.textAlign = "right";
    ctx.fillText(tick === 0 ? "0" : `${tick / 1000}k`, padding.left - 12, y);
  }

  const groupWidth = plotWidth / data.labels.length;
  const barWidth = Math.max(5, Math.min(data.barThickness ?? 18, groupWidth / 4.8));
  const labelEvery = width < 520 && data.labels.length > 6 ? 2 : 1;

  data.labels.forEach((label, index) => {
    const centerX = padding.left + groupWidth * index + groupWidth / 2;

    hitAreas.push(
      drawBar(ctx, centerX - barWidth - 1, data.incomeBars[index], max, plotHeight, padding, barWidth, success, {
        title: data.labels[index],
        lines: [`Income: ${formatCurrency(data.incomeBars[index])}`],
      }),
      drawBar(ctx, centerX + 2, data.expenseBars[index], max, plotHeight, padding, barWidth, danger, {
        title: data.labels[index],
        lines: [`Expenses: ${formatCurrency(data.expenseBars[index])}`],
      }),
    );

    if (index % labelEvery === 0) {
      ctx.fillStyle = text;
      ctx.font = `${labelFontSize}px "Inter", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(label, centerX, height - 12);
    }
  });

  hitAreas.push(
    ...drawLine(ctx, data.incomeLine, max, plotWidth, plotHeight, padding, success, data.labels, "Income Trend"),
    ...drawLine(ctx, data.expenseLine, max, plotWidth, plotHeight, padding, danger, data.labels, "Expense Trend"),
  );

  setCanvasHitAreas(canvas, hitAreas);
}

function drawBar(ctx, x, value, max, plotHeight, padding, width, color, tooltip) {
  const barHeight = (value / max) * plotHeight;
  const y = padding.top + plotHeight - barHeight;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, barHeight);

  return {
    type: "rect",
    x,
    y,
    width,
    height: barHeight,
    tooltip,
  };
}

function drawLine(ctx, values, max, plotWidth, plotHeight, padding, color, labels, label) {
  const step = plotWidth / values.length;
  const points = [];

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.25;
  ctx.beginPath();

  values.forEach((value, index) => {
    const x = padding.left + step * index + step / 2;
    const y = padding.top + plotHeight - (value / max) * plotHeight;
    points.push({ x, y, value, index });

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  points.forEach((point) => {
    ctx.fillStyle = getCssVar("--surface", "#FFFFFF");
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  return points.map((point) => ({
    type: "circle",
    x: point.x,
    y: point.y,
    radius: 11,
    tooltip: {
      title: labels[point.index],
      lines: [`${label}: ${formatCurrency(point.value)}`],
    },
  }));
}

function drawSpendingFallback(canvas, categories) {
  const { ctx, width, height } = prepareCanvas(canvas);
  const total = categories.reduce((sum, category) => sum + Number(category.value || 0), 0);
  const radius = Math.min(width, height) / 2 - 8;
  const centerX = width / 2;
  const centerY = height / 2;
  let startAngle = -Math.PI / 2;
  const hitAreas = [];

  ctx.clearRect(0, 0, width, height);

  categories.forEach((category) => {
    const slice = (Number(category.value || 0) / total) * Math.PI * 2;
    const endAngle = startAngle + slice;

    ctx.fillStyle = category.color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    const labelAngle = startAngle + slice / 2;
    const labelRadius = radius * 0.62;
    const share = Math.round((Number(category.value || 0) / total) * 100);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = '600 14px "Inter", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${share}%`,
      centerX + Math.cos(labelAngle) * labelRadius,
      centerY + Math.sin(labelAngle) * labelRadius,
    );

    hitAreas.push({
      type: "arc",
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      tooltip: {
        title: category.label,
        lines: [`Amount: ${formatCurrency(category.value)}`, `Share: ${share}%`],
      },
    });

    startAngle = endAngle;
  });

  setCanvasHitAreas(canvas, hitAreas);
}

function setCanvasHitAreas(canvas, hitAreas) {
  const existing = fallbackTooltips.get(canvas);

  if (existing) {
    existing.hitAreas = hitAreas;
    return;
  }

  const state = { hitAreas };

  canvas.addEventListener("pointermove", (event) => {
    const point = getCanvasPoint(canvas, event);
    const hit = state.hitAreas.find((area) => isPointInsideArea(point, area));

    if (!hit) {
      canvas.style.cursor = "";
      hideChartTooltip();
      return;
    }

    canvas.style.cursor = "default";
    showChartTooltip(event, hit.tooltip);
  });

  canvas.addEventListener("pointerleave", () => {
    canvas.style.cursor = "";
    hideChartTooltip();
  });

  fallbackTooltips.set(canvas, state);
}

function getCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function isPointInsideArea(point, area) {
  if (area.type === "rect") {
    return (
      point.x >= area.x &&
      point.x <= area.x + area.width &&
      point.y >= area.y &&
      point.y <= area.y + area.height
    );
  }

  if (area.type === "circle") {
    return Math.hypot(point.x - area.x, point.y - area.y) <= area.radius;
  }

  if (area.type === "arc") {
    const distance = Math.hypot(point.x - area.centerX, point.y - area.centerY);

    if (distance > area.radius) {
      return false;
    }

    let angle = Math.atan2(point.y - area.centerY, point.x - area.centerX);
    if (angle < -Math.PI / 2) {
      angle += Math.PI * 2;
    }

    return angle >= area.startAngle && angle <= area.endAngle;
  }

  return false;
}

function showChartTooltip(event, tooltip) {
  const element = getSharedTooltip();
  element.innerHTML = `
    <p class="chart-tooltip__title">${escapeHtml(tooltip.title)}</p>
    ${tooltip.lines.map((line) => `<p class="chart-tooltip__line">${escapeHtml(line)}</p>`).join("")}
  `;
  element.classList.add("is-visible");

  const tooltipRect = element.getBoundingClientRect();
  const left = Math.min(window.innerWidth - tooltipRect.width - 12, Math.max(12, event.clientX + 14));
  const top = Math.min(window.innerHeight - tooltipRect.height - 12, Math.max(12, event.clientY + 14));

  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

function hideChartTooltip() {
  sharedTooltip?.classList.remove("is-visible");
}

function getSharedTooltip() {
  if (sharedTooltip) {
    return sharedTooltip;
  }

  sharedTooltip = document.createElement("div");
  sharedTooltip.className = "chart-tooltip";
  document.body.append(sharedTooltip);

  return sharedTooltip;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[character];
  });
}

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

export function createOverviewChart(canvas, overviewChartData) {
  if (!canvas || typeof Chart === "undefined") {
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
  if (!canvas || typeof Chart === "undefined") {
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

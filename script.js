const stockPresets = [
  {
    symbol: "AAPL",
    name: "Apple",
    annualReturn: 12.4,
    description: "Large-cap technology profile with a strong long-term growth reputation."
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    annualReturn: 11.8,
    description: "Mega-cap software and cloud business with steady historical compounding."
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    annualReturn: 15.5,
    description: "Higher-growth semiconductor profile with bigger upside and bigger volatility."
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    annualReturn: 10.6,
    description: "Consumer and cloud exposure with a growth-oriented long-term assumption."
  },
  {
    symbol: "SPY",
    name: "S&P 500 ETF",
    annualReturn: 8.5,
    description: "Broad-market benchmark for users who want index-style projections."
  }
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const elements = {
  stockSelect: document.querySelector("#stockSelect"),
  initialInvestment: document.querySelector("#initialInvestment"),
  monthlyContribution: document.querySelector("#monthlyContribution"),
  years: document.querySelector("#years"),
  annualReturn: document.querySelector("#annualReturn"),
  presetNotes: document.querySelector("#presetNotes"),
  futureValue: document.querySelector("#futureValue"),
  totalInvested: document.querySelector("#totalInvested"),
  totalGain: document.querySelector("#totalGain"),
  returnMultiple: document.querySelector("#returnMultiple"),
  heroFutureValue: document.querySelector("#heroFutureValue"),
  heroGain: document.querySelector("#heroGain"),
  projectionTableBody: document.querySelector("#projectionTableBody"),
  projectionChart: document.querySelector("#projectionChart"),
  chartCaption: document.querySelector("#chartCaption")
};

function populatePresets() {
  stockPresets.forEach((preset, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${preset.symbol} • ${preset.name}`;
    elements.stockSelect.append(option);
  });
}

function setPreset(index) {
  const preset = stockPresets[index];
  elements.stockSelect.value = String(index);
  elements.annualReturn.value = preset.annualReturn;
  elements.presetNotes.textContent = `${preset.symbol}: ${preset.description} Default return assumption: ${percent.format(preset.annualReturn)} annually.`;
}

function getInputs() {
  return {
    initialInvestment: Math.max(0, Number(elements.initialInvestment.value) || 0),
    monthlyContribution: Math.max(0, Number(elements.monthlyContribution.value) || 0),
    years: Math.min(50, Math.max(1, Number(elements.years.value) || 1)),
    annualReturn: Number(elements.annualReturn.value) || 0
  };
}

function projectInvestment({ initialInvestment, monthlyContribution, years, annualReturn }) {
  const monthlyRate = annualReturn / 100 / 12;
  const totalMonths = years * 12;
  let balance = initialInvestment;
  const yearlyData = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;

    if (month % 12 === 0) {
      const currentYear = month / 12;
      const totalInvested = initialInvestment + monthlyContribution * month;

      yearlyData.push({
        year: currentYear,
        totalInvested,
        value: balance,
        gain: balance - totalInvested
      });
    }
  }

  const finalYear = yearlyData[yearlyData.length - 1];
  return {
    yearlyData,
    futureValue: finalYear.value,
    totalInvested: finalYear.totalInvested,
    totalGain: finalYear.gain,
    returnMultiple: finalYear.totalInvested === 0 ? 0 : finalYear.value / finalYear.totalInvested
  };
}

function renderSummary(result) {
  elements.futureValue.textContent = currency.format(result.futureValue);
  elements.totalInvested.textContent = currency.format(result.totalInvested);
  elements.totalGain.textContent = currency.format(result.totalGain);
  elements.returnMultiple.textContent = `${result.returnMultiple.toFixed(2)}x`;
  elements.heroFutureValue.textContent = currency.format(result.futureValue);
  elements.heroGain.textContent = currency.format(result.totalGain);
}

function renderTable(yearlyData) {
  elements.projectionTableBody.innerHTML = "";

  yearlyData.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${currency.format(row.totalInvested)}</td>
      <td>${currency.format(row.value)}</td>
      <td>${currency.format(row.gain)}</td>
    `;
    elements.projectionTableBody.append(tr);
  });
}

function renderChart(yearlyData) {
  const svg = elements.projectionChart;
  const width = 760;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 38, left: 56 };
  const maxValue = Math.max(...yearlyData.map((row) => row.value), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const points = yearlyData.map((row, index) => {
    const x = padding.left + (index / Math.max(yearlyData.length - 1, 1)) * innerWidth;
    const y = padding.top + (1 - row.value / maxValue) * innerHeight;
    return { x, y, row };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L ${padding.left + innerWidth} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  const guideLines = Array.from({ length: 4 }, (_, index) => {
    const value = maxValue * ((index + 1) / 4);
    const y = padding.top + (1 - value / maxValue) * innerHeight;
    return `
      <line x1="${padding.left}" y1="${y}" x2="${padding.left + innerWidth}" y2="${y}" stroke="rgba(22, 33, 29, 0.08)" stroke-dasharray="6 6" />
      <text x="8" y="${y + 4}" fill="#5d6a64" font-size="12">${currency.format(value)}</text>
    `;
  }).join("");

  const yearLabels = points
    .map((point) => `
      <text x="${point.x}" y="${height - 12}" fill="#5d6a64" font-size="12" text-anchor="middle">${point.row.year}</text>
    `)
    .join("");

  const markers = points
    .map((point) => `
      <circle cx="${point.x}" cy="${point.y}" r="4.5" fill="#0f766e" />
    `)
    .join("");

  svg.innerHTML = `
    <defs>
      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f766e" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#0f766e" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    ${guideLines}
    <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${padding.left + innerWidth}" y2="${height - padding.bottom}" stroke="rgba(22, 33, 29, 0.18)" />
    <path d="${areaPath}" fill="url(#areaFill)"></path>
    <path d="${linePath}" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
    ${markers}
    ${yearLabels}
  `;

  const finalPoint = yearlyData[yearlyData.length - 1];
  elements.chartCaption.textContent = `By year ${finalPoint.year}, the projection reaches ${currency.format(finalPoint.value)}.`;
}

function updateProjection() {
  const inputs = getInputs();
  const result = projectInvestment(inputs);
  renderSummary(result);
  renderTable(result.yearlyData);
  renderChart(result.yearlyData);
}

populatePresets();
elements.initialInvestment.value = 10000;
elements.monthlyContribution.value = 500;
elements.years.value = 10;
setPreset(0);
updateProjection();

elements.stockSelect.addEventListener("change", (event) => {
  setPreset(Number(event.target.value));
  updateProjection();
});

[elements.initialInvestment, elements.monthlyContribution, elements.years, elements.annualReturn].forEach((input) => {
  input.addEventListener("input", updateProjection);
});

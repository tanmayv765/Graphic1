const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const compareElements = {
  amount: document.querySelector("#compareAmount"),
  years: document.querySelector("#compareYears"),
  stockReturn: document.querySelector("#stockReturnInput"),
  bondReturn: document.querySelector("#bondReturnInput"),
  inflation: document.querySelector("#compareInflation"),
  stockEndingValue: document.querySelector("#stockEndingValue"),
  bondEndingValue: document.querySelector("#bondEndingValue"),
  stockBarLabel: document.querySelector("#stockBarLabel"),
  bondBarLabel: document.querySelector("#bondBarLabel"),
  stockBar: document.querySelector("#stockBar"),
  bondBar: document.querySelector("#bondBar"),
  differenceValue: document.querySelector("#differenceValue"),
  takeawayText: document.querySelector("#takeawayText"),
  compareHeadline: document.querySelector("#compareHeadline")
};

function calculateFutureValue(amount, annualReturn, years) {
  return amount * Math.pow(1 + annualReturn / 100, years);
}

function updateComparison() {
  const amount = Math.max(0, Number(compareElements.amount.value) || 0);
  const years = Math.min(50, Math.max(1, Number(compareElements.years.value) || 1));
  const stockReturn = Number(compareElements.stockReturn.value) || 0;
  const bondReturn = Number(compareElements.bondReturn.value) || 0;
  const inflation = Math.max(0, Number(compareElements.inflation.value) || 0);
  const inflationFactor = Math.pow(1 + inflation / 100, years);

  const stockValue = calculateFutureValue(amount, stockReturn, years);
  const bondValue = calculateFutureValue(amount, bondReturn, years);
  const realStockValue = stockValue / inflationFactor;
  const realBondValue = bondValue / inflationFactor;
  const maxValue = Math.max(realStockValue, realBondValue, 1);
  const difference = realStockValue - realBondValue;

  compareElements.stockEndingValue.textContent = currency.format(realStockValue);
  compareElements.bondEndingValue.textContent = currency.format(realBondValue);
  compareElements.stockBarLabel.textContent = currency.format(realStockValue);
  compareElements.bondBarLabel.textContent = currency.format(realBondValue);
  compareElements.differenceValue.textContent = currency.format(Math.abs(difference));
  compareElements.stockBar.style.width = `${(realStockValue / maxValue) * 100}%`;
  compareElements.bondBar.style.width = `${(realBondValue / maxValue) * 100}%`;

  if (difference > 0) {
    compareElements.takeawayText.textContent = `Stocks lead by ${currency.format(difference)}`;
    compareElements.compareHeadline.textContent = `After inflation, stocks finish higher after ${years} years.`;
  } else if (difference < 0) {
    compareElements.takeawayText.textContent = `Bonds lead by ${currency.format(Math.abs(difference))}`;
    compareElements.compareHeadline.textContent = `After inflation, bonds finish higher after ${years} years.`;
  } else {
    compareElements.takeawayText.textContent = "They finish at the same value";
    compareElements.compareHeadline.textContent = `After inflation, both end at the same value after ${years} years.`;
  }
}

compareElements.amount.value = 10000;
compareElements.years.value = 10;
compareElements.stockReturn.value = 9;
compareElements.bondReturn.value = 4;
compareElements.inflation.value = 3;
updateComparison();

[compareElements.amount, compareElements.years, compareElements.stockReturn, compareElements.bondReturn, compareElements.inflation].forEach((input) => {
  input.addEventListener("input", updateComparison);
});

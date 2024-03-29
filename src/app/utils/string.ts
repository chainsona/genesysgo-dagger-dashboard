function secondsToDhms(seconds: number, full: boolean = false) {
  seconds = Number(seconds) / 1000;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return full ? `${d}d ${h}h ${m}min` : `${d}d ${h}h ${m}min`;
}

function formatNumbers(value: number, decimals: number = 2) {
  return `${(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export { formatNumbers, secondsToDhms };

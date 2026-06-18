const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

const creditsFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function compactNumber(value: string | number) {
  return compactNumberFormatter.format(Number(value));
}

export function formatCredits(value: string | number) {
  return `${creditsFormatter.format(Number(value))} CR`;
}

export function shortDate(value: string) {
  return shortDateFormatter.format(new Date(value));
}

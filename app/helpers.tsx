
type NumberStringMap = {
  value: number;
  str: string;
};

export function toWords(number: number): string {
  if (!Number.isInteger(number) || number < 0) {
    throw new Error("Input must be a positive integer");
  }

  if (number === 0) return "Zero";

  const NS: NumberStringMap[] = [
    { value: 1_000_000_000, str: "Billion" },
    { value: 1_000_000, str: "Million" },
    { value: 1_000, str: "Thousand" },
    { value: 100, str: "Hundred" },
    { value: 90, str: "Ninety" },
    { value: 80, str: "Eighty" },
    { value: 70, str: "Seventy" },
    { value: 60, str: "Sixty" },
    { value: 50, str: "Fifty" },
    { value: 40, str: "Forty" },
    { value: 30, str: "Thirty" },
    { value: 20, str: "Twenty" },
    { value: 19, str: "Nineteen" },
    { value: 18, str: "Eighteen" },
    { value: 17, str: "Seventeen" },
    { value: 16, str: "Sixteen" },
    { value: 15, str: "Fifteen" },
    { value: 14, str: "Fourteen" },
    { value: 13, str: "Thirteen" },
    { value: 12, str: "Twelve" },
    { value: 11, str: "Eleven" },
    { value: 10, str: "Ten" },
    { value: 9, str: "Nine" },
    { value: 8, str: "Eight" },
    { value: 7, str: "Seven" },
    { value: 6, str: "Six" },
    { value: 5, str: "Five" },
    { value: 4, str: "Four" },
    { value: 3, str: "Three" },
    { value: 2, str: "Two" },
    { value: 1, str: "One" }
  ];

  let result = "";

  for (const n of NS) {
    if (number >= n.value) {
      if (number < 100) {
        result += n.str;
        number -= n.value;
        if (number > 0) result += " ";
      } else {
        const t = Math.floor(number / n.value);
        const d = number % n.value;

        if (d > 0) {
          return `${toWords(t)} ${n.str} ${toWords(d)}`;
        } else {
          return `${toWords(t)} ${n.str}`;
        }
      }
    }
  }

  return result;
}
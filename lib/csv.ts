export type CsvRow = Record<string, string>;

function escapeCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(filename: string, headers: string[], rows: CsvRow[]) {
  const content = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readCsv(file: File): Promise<CsvRow[]> {
  const text = (await file.text()).replace(/^\uFEFF/, "");
  const cells: string[][] = [[]];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells[cells.length - 1].push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      cells[cells.length - 1].push(value);
      value = "";
      if (index < text.length - 1) cells.push([]);
    } else value += character;
  }
  cells[cells.length - 1].push(value);

  const headers = (cells.shift() || []).map((header) => header.trim().toLowerCase());
  if (!headers.length || !headers[0]) return [];
  return cells
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() || ""])));
}

export function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

export const promptsQuestion = [
  {
    type: "text",
    name: "title",
    message: "请输入标题",
  },
  {
    type: "text",
    name: "artist",
    message: "请输入作者",
    initial: "WebWorker.tech",
  },
  {
    type: "text",
    name: "album",
    message: "请输入专辑",
    initial: "Web Worker",
  },
  {
    type: "text",
    name: "APIC",
    message: "请输入封面图",
    initial: "./cover/webworker-logo-3k.png",
  },
  {
    type: "number",
    name: "TRCK",
    message: "请输入当前音轨",
  },
  // year: "2023",
  {
    type: "number",
    name: "year",
    message: "请输入年份",
    initial: 2023,
  },
  // date: 20230420
  {
    type: "text",
    name: "date",
    message: "请输入日期",
    initial: getCurrentDate(),
  },
];

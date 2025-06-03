export function getCurrentDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

export const promptsQuestion = [
  {
    type: 'text',
    name: 'title',
    message: '请输入标题',
  },
  {
    type: 'select',
    name: 'artist',
    message: '请输入作者',
    choices: [
      {
        title: 'WebWorker.tech',
        value: 'WebWorker.tech',
      },
      {
        title: '辛宝Otto',
        value: '辛宝Otto',
      },
    ],
  },
  {
    type: 'select',
    name: 'album',
    message: '请输入专辑',
    choices: [
      {
        title: 'Web Worker',
        value: 'Web Worker',
      },
      {
        title: '咿呀 能跑就行！',
        value: '咿呀 能跑就行！',
      },
    ],
  },
  {
    type: 'select',
    name: 'APIC',
    message: '请输入封面图',
    choices: [
      {
        title: 'Web Worker',
        value: './cover/webworker.png',
      },
      {
        title: '咿呀 能跑就行！',
        value: './cover/run.png',
      },
    ],
  },
  {
    type: 'number',
    name: 'TRCK',
    message: '请输入当前音轨',
  },
  // year: "2023",
  {
    type: 'number',
    name: 'year',
    message: '请输入年份',
    initial: 2023,
  },
  // date: 20230420
  {
    type: 'text',
    name: 'date',
    message: '请输入日期',
    initial: getCurrentDate(),
  },
]

export const cliEntryPrompt = [
  {
    type: 'select',
    name: 'type',
    message: '读取 meta 还是写入 meta?',
    choices: [
      {
        title: '读取',
        value: 'read',
        description: '写入对应的 metadata 信息',
      },
      {
        title: '写入',
        description: '写入对应的 metadata 信息',
        value: 'write',
      },
    ],
    initial: 0,
  },
]

export const handleFilePrompt = {
  type: 'select',
  name: 'type',
  message: '选择对文件进行的处理方式',
  choices: [
    // 处理 metadata 信息
    {
      title: '处理 metadata 信息',
      value: 'meta',
    },
    {
      title: '文件转为 wav 格式，方便转写',
      value: 'wav',
    },
    {
      title: '文件转为 mp3 格式',
      value: 'mp3',
    },

    // 文字转写
    {
      title: '文字转写',
      value: 'text',
    },
  ],
}

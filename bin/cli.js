#!/usr/bin/env node

import path from 'node:path'

import minimist from 'minimist'
import { handleUrl } from './download.js'
import { handleTrans } from './handleTrans.js'
// 接受 —p 和 -url 参数
const argv = minimist(process.argv.slice(2), {
  alias: {
    path: 'p',
    url: 'u',
  },
})

// let audioFilePath = "";
console.log(0, argv)

if (argv.url) {
  const res = await handleUrl(argv.url)
  console.log(res)
  if (res.status) {
    // 拼接当前位置和 res.path
    const currentPath = process.cwd()
    const absolutePath = path.resolve(currentPath, res.path)
    handleTrans(absolutePath)
  }
}
else if (argv.path) {
  handleTrans(argv.path)
}

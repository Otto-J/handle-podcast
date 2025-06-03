#!/usr/bin/env node

import { exec } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import id3 from 'node-id3'

import prompts from 'prompts'
import { BASE_PROMPT, FFMPEG_BIN, WHISPER_BIN, WHISPER_MODEL } from '../env.js'
import { cliEntryPrompt, handleFilePrompt, promptsQuestion } from '../src/model.js'
import { executeCommand, spawnCommand } from './utils.js'

export async function handleTrans(_path = '') {
  console.log(`1,文件地址是：${path}`)
  let handlePath = ''
  if (typeof _path !== 'string') {
    const promptsList = {
      type: 'text',
      name: 'path',
      message: '请输入文件路径',
    }
    console.log('未检测到远程路径')
    const response = await prompts(promptsList)
    handlePath = response.path
  }
  const isAbsolutePath = path.isAbsolute(_path)
  if (isAbsolutePath) {
    handlePath = _path
  }
  else {
    // 如果是相对路径
    const currentPath = process.cwd()
    handlePath = path.resolve(currentPath, _path)
  }

  // console.log("2, 文件地址是：" + handlePath);
  handleCommand(handlePath)
}

function mp3ToWav(filePath = '') {
  console.log('FFMPEG_BIN', FFMPEG_BIN)

  const command = `${FFMPEG_BIN} -i ${filePath} -acodec pcm_s16le -ac 1 -ar 16000 ${filePath}.wav`
  return executeCommand(command)
    .then(({ stdout, stderr }) => {
      console.log('4,stdout:', stdout)
      console.log('5,stderr:', stderr)
      return { status: true, path: `${filePath}.wav` }
    })
    .catch((error) => {
      console.error('Error:', error)
      return { status: false, filePath: '' }
    })
}

function othersToMp3(filePath = '') {
  const command = `${FFMPEG_BIN} -i ${filePath} -acodec libmp3lame -ab 192k -ac 2 ${filePath}.mp3`
  return executeCommand(command)
    .then(({ stdout, stderr }) => {
      console.log('4,stdout:', stdout)
      console.log('5,stderr:', stderr)
      return { status: true, path: `${filePath}.mp3` }
    })
    .catch((error) => {
      console.error('Error:', error)
      return { status: false, filePath: '' }
    })
}

async function handleTransFile(filePath = '') {
  // if(filepath)
  // 如果 filePath 的后缀不是 wav，补充 wav 后缀
  const isWav = filePath.endsWith('.wav')
  if (!isWav) {
    filePath = `${filePath}.wav`
  }
  const promptOption = {
    type: 'text',
    name: 'prompt',
    message: '请补充输入 prompt',
  }
  const { prompt } = await prompts(promptOption)

  // 请选择模型 base small medium
  const promptsList = {
    type: 'select',
    name: 'type',
    message: '请选择模型',
    choices: [
      // 处理 metadata 信息
      {
        title: 'base.en',
        value: 'base.en',
      },
      {
        title: 'small.en',
        value: 'small.en',
      },
      {
        title: 'medium.en',
        value: 'medium.en',
      },
      {
        title: 'base',
        value: 'base',
      },
      {
        title: 'medium',
        value: 'medium',
      },
      {
        title: 'small',
        value: 'small',
      },
      {
        title: 'large-v3',
        value: 'large-v3',
      },
    ],
  }
  const { type } = await prompts(promptsList)

  const bin = WHISPER_BIN
  // console.log(bin, bin2, bin === bin2);

  const command = `${bin} -m ${WHISPER_MODEL}/ggml-${type}.bin -f ${filePath} -osrt --prompt '${
    prompt || ''
  } ${BASE_PROMPT}'`

  const args = command.split(' ')
  console.log('command:', args[0], args.slice(1))

  return spawnCommand(args[0], args.slice(1))
    .then(() => {
      return { status: true }
    })
    .catch((error) => {
      console.error('Error:', error)
      return { status: false }
    })
}

async function handleCommand(filePath = '') {
  // console.log(3, filePath);
  // 核心不同入口
  const mainEntryPrompt = handleFilePrompt
  const { type } = await prompts(mainEntryPrompt)

  if (type === 'meta') {
    await handleMeta(filePath)
  }
  else if (type === 'mp3') {
    const res = await othersToMp3(filePath)
    if (res.status) {
      console.log('转换完成')
    }
  }
  else if (type === 'wav') {
    // 使用子进程调用 ffmpeg

    const res = await mp3ToWav(filePath)
    if (res.status) {
      console.log('转换完成')

      // 提问是否开始转写
      const promptsList = {
        type: 'confirm',
        name: 'isStart',
        message: '是否开始转写',
      }
      const response = await prompts(promptsList)
      if (response.isStart) {
        console.log('开始转写')
        await handleTransFile(filePath)
      }
      else {
        console.log('不需要转写')
      }
    }
  }
  else if (type === 'mp3') {
    // ffmpeg -i 00-0626-start.m4a -acodec libmp3lame -q:a 2 100-0626-start.mp3
    // 执行
    try {
      const bash = `${FFMPEG_BIN} -i ${audioFilePath} -acodec libmp3lame -q:a 2 ${audioFilePath}.mp3`
      exec(bash, (err, stdout, stderr) => {
        if (err) {
          console.log(err)
        }
        else {
          console.log('转换完成')
        }
      })
    }
    catch (error) {
      console.log(`处理失败${error}`)
    }
  }
  else if (type === 'text') {
    console.log('开始转写')
    try {
      await handleTransFile(filePath)
    }
    catch (error) {
      console.log(`转写失败${error}`)
    }
  }
}

// meta
async function handleMeta(filePath) {
  const { Promise: NodeID3Promise } = id3

  const writeMeta = (tags, filepath) => {
    NodeID3Promise.write(tags, filepath)
      .then((res) => {
        console.log('ok', res)
      })
      .catch((err) => {
        console.log('err', err)
      })
  }

  const readMeta = (filepath) => {
    NodeID3Promise.read(filepath).then((res) => {
      console.log(res)
    })
  }

  const promptsList = cliEntryPrompt

  const response = await prompts(promptsList)
  if (response.type === 'read') {
    console.log('read')
    readMeta(filePath)
  }
  else {
    console.log('write')
    const response2 = await prompts(promptsQuestion)

    const scriptUrl = import.meta.url
    const scriptPath = fileURLToPath(scriptUrl)
    const absolutePath = path.dirname(scriptPath)

    const cover = path.resolve(absolutePath, '../', response2.APIC)
    response2.APIC = cover

    writeMeta(response2, filePath)
  }
}

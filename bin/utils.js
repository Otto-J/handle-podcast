import { exec, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { SingleBar } from 'cli-progress'

export function spawnCommand(command, args) {
  // export const spawnCommand = (command: string, args: any) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args)

    childProcess.stdout.on('data', (data) => {
      console.log(data.toString())
    })

    childProcess.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    childProcess.on('error', (error) => {
      reject(error)
    })

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(void 0)
      }
      else {
        reject(new Error(`Command exited with code ${code}`))
      }
    })
  })
}

export function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ stdout, stderr })
    })
  })
}

// 下载 mp3 文件
export function downloadMp3File(fileUrl, targetFolderPath) {
  if (!fs.existsSync(targetFolderPath)) {
    fs.mkdirSync(targetFolderPath)
  }

  const fileName = path.basename(fileUrl)
  const filePath = path.join(targetFolderPath, fileName)
  const fileStream = fs.createWriteStream(filePath)

  const progressBar = new SingleBar({
    format: '进度 |{bar}| {percentage}% | ETA: {eta}s | {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  })
  const total = 100
  progressBar.start(total, 0)

  console.log('1, 准备下载 mp3 文件')
  return new Promise((resolve, reject) => {
    return fetch(fileUrl)
      .then((response) => {
        if (!response || !response.body) {
          throw new Error('下载失败')
        }
        else {
          // 设置总进度值
          response.body.pipe(fileStream)

          const totalSize = response.headers.get('content-length')
          let downloadedSize = 0

          response.body.on('data', (chunk) => {
            downloadedSize += chunk.length
            const progress = Math.round((downloadedSize / totalSize) * 100)
            progressBar.update(progress)
          })

          response.body.on('end', () => {
            console.log('下载完成')
            fileStream.close()
            progressBar.stop()
            resolve(filePath)
          })

          response.body.on('error', (err) => {
            reject(err)
          })
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}

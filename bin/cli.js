#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";

import minimist from "minimist";
import { promptsQuestion } from "../src/model.js";
import id3 from "node-id3";
import prompts from "prompts";

const argv = minimist(process.argv.slice(2), {
  alias: {
    path: "p",
  },
});

let audioFilePath = "";

// 如果没有找到 path 参数，则提示用户输入
if (!argv.path) {
  const promptsList = {
    type: "text",
    name: "path",
    message: "请输入文件路径",
  };
  console.log("未检测到文件路径，请输入要处理的音频文件路径");
  const response = await prompts(promptsList);
  audioFilePath = response.path;

  console.log(audioFilePath);
} else {
  audioFilePath = argv.path;
}

audioFilePath = path.resolve(process.cwd(), audioFilePath);

// 核心不同入口
const mainEntryPrompt = {
  type: "select",
  name: "type",
  message: "选择对文件进行的处理方式",
  choices: [
    // 处理 metadata 信息
    {
      title: "处理 metadata 信息",
      value: "meta",
    },
    {
      title: "文件转为 wav 格式，方便转写",
      value: "wav",
    },
    // 文件转为 mp3 格式
    {
      title: "文件转为 mp3 格式",
      value: "mp3",
    },
    // 文字转写
    {
      title: "文字转写",
      value: "text",
    },
  ],
};

const { type } = await prompts(mainEntryPrompt);

async function main() {
  if (type === "meta") {
    const { Promise: NodeID3Promise } = id3;

    const writeMeta = (tags, filepath) => {
      NodeID3Promise.write(tags, filepath)
        .then((res) => {
          console.log("ok", res);
        })
        .catch((err) => {
          console.log("err", err);
        });
    };

    const readMeta = (filepath) => {
      NodeID3Promise.read(filepath).then((res) => {
        console.log(res);
      });
    };

    const promptsList = [
      {
        type: "select",
        name: "type",
        message: "读取 meta 还是写入 meta?",
        choices: [
          {
            title: "读取",
            value: "read",
            description: "写入对应的 metadata 信息",
          },
          {
            title: "写入",
            description: "写入对应的 metadata 信息",
            value: "write",
          },
        ],
        initial: 0,
      },
    ];

    const response = await prompts(promptsList);
    if (response.type === "read") {
      console.log("read");
      // console.log(audioFilePath);
      readMeta(audioFilePath);
    } else {
      console.log("write");
      const response2 = await prompts(promptsQuestion);

      const scriptUrl = import.meta.url;
      const scriptPath = fileURLToPath(scriptUrl);
      const absolutePath = path.dirname(scriptPath);

      const cover = path.resolve(absolutePath, "../", response2.APIC);
      console.log(cover);
      response2.APIC = cover;
      // console.log(response2);

      writeMeta(response2, audioFilePath);
    }

    // async function main() {

    //   }
  } else if (type === "wav") {
    // 使用子进程调用 ffmpeg
    const { spawn, exec } = await import("child_process");
    // const { promisify } = await import("util");
    // const execPromise = promisify(exec);

    const spawnPromise = (command, args = []) => {
      return new Promise((resolve, reject) => {
        const child = spawn(command, args);
        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
          stdout += data;
          console.log(data.toString());
        });

        child.stderr.on("data", (data) => {
          stderr += data;
          console.error(data.toString());
        });

        child.on("close", (code) => {
          if (code !== 0) {
            reject(new Error(`Command ${command} exited with code ${code}`));
          } else {
            resolve({ stdout, stderr });
          }
        });
        // 处理 error
        child.on("error", reject);
      });
    };
    console.log("开始转换");
    try {
      const bash = `ffmpeg -i ${audioFilePath} -ar 16000 -ac 1 -c:a pcm_s16le ${audioFilePath}.wav`;
      const { stdout, stderr } = await spawnPromise(bash);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      console.log("转换完成");
    } catch (error) {
      console.log("处理失败" + error);
    }
    // 提问是否开始转写
    const promptsList = {
      type: "confirm",
      name: "isStart",
      message: "是否开始转写",
    };
    const response = await prompts(promptsList);
    if (response.isStart) {
      console.log("开始转写");
      const basePath = "/Users/otto/cpp-raw";
      try {
        await execPromise(
          `${basePath}/main -m ${basePath}/models/ggml-medium.bin -f ${audioFilePath}.wav -osrt -l zh`
        );
        console.log("转写完成");
        console.log('转写结果在当前目录下的 "output.srt" 文件中');
        console.log(audioFilePath);
      } catch (error) {
        console.log("转写失败" + error);
      }
      // 是否需要转 vtt
      const promptsList = {
        type: "confirm",
        name: "isVtt",
        message: "是否需要转换为 vtt 格式",
      };
      const response = await prompts(promptsList);
      if (response.isVtt) {
      } else {
        console.log("已取消");
      }
    } else {
      console.log("已取消");
    }
  }
}

main();

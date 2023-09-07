#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import { spawn, exec } from "child_process";
import { spawnCommand, executeCommand } from "./utils.js";

import { promptsQuestion } from "../src/model.js";
import id3 from "node-id3";
import prompts from "prompts";

export const handleTrans = async (_path = "") => {
  console.log("1,文件地址是：" + path);
  let handlePath = "";
  if (typeof _path !== "string") {
    const promptsList = {
      type: "text",
      name: "path",
      message: "请输入文件路径",
    };
    console.log("未检测到远程路径");
    const response = await prompts(promptsList);
    handlePath = response.path;
  }
  const isAbsolutePath = path.isAbsolute(_path);
  if (isAbsolutePath) {
    handlePath = _path;
  } else {
    // 如果是相对路径
    const currentPath = process.cwd();
    handlePath = path.resolve(currentPath, _path);
  }

  // console.log("2, 文件地址是：" + handlePath);
  handleCommand(handlePath);
};

const mp3ToWav = (filePath = "") => {
  const command = `ffmpeg -i ${filePath} -acodec pcm_s16le -ac 1 -ar 16000 ${filePath}.wav`;
  return executeCommand(command)
    .then(({ stdout, stderr }) => {
      console.log("4,stdout:", stdout);
      console.log("5,stderr:", stderr);
      return { status: true, path: filePath + ".wav" };
    })
    .catch((error) => {
      console.error("Error:", error);
      return { status: false, filePath: "" };
    });
};

const handleTransFile = async (filePath = "") => {
  // if(filepath)
  // 如果 filePath 的后缀不是 wav，补充 wav 后缀
  const isWav = filePath.endsWith(".wav");
  if (!isWav) {
    filePath = filePath + ".wav";
  }
  const promptOption = {
    type: "text",
    name: "prompt",
    message: "请补充输入 prompt",
  };
  const { prompt } = await prompts(promptOption);

  // 请选择模型 base small medium
  const promptsList = {
    type: "select",
    name: "type",
    message: "请选择模型",
    choices: [
      // 处理 metadata 信息
      {
        title: "base",
        value: "base",
      },
      {
        title: "small",
        value: "small",
      },
      {
        title: "medium",
        value: "medium",
      },
    ],
  };
  const { type } = await prompts(promptsList);
  const basePath = "/Users/otto/cpp-raw";

  const command = `${basePath}/main -m ${basePath}/models/ggml-${type}.en.bin -f ${filePath} -osrt --prompt 'Each identification waits for the discussion to end instead of breaking in the middle.${
    prompt || ""
  }'`;

  const args = command.split(" ");

  return spawnCommand(args[0], args.slice(1))
    .then(() => {
      return { status: true };
    })
    .catch((error) => {
      console.error("Error:", error);
      return { status: false };
    });
};

const handleCommand = async (filePath = "") => {
  console.log(3, filePath);
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
      // {
      //   title: "文件转为 mp3 格式",
      //   value: "mp3",
      // },
      // 文字转写
      {
        title: "文字转写",
        value: "text",
      },
    ],
  };
  const { type } = await prompts(mainEntryPrompt);

  if (type === "meta") {
    await handleMeta(filePath);
  } else if (type === "wav") {
    // 使用子进程调用 ffmpeg

    const res = await mp3ToWav(filePath);
    if (res.status) {
      console.log("转换完成");

      // 提问是否开始转写
      const promptsList = {
        type: "confirm",
        name: "isStart",
        message: "是否开始转写",
      };
      const response = await prompts(promptsList);
      if (response.isStart) {
        console.log("开始转写");
        await handleTransFile(filePath);

        //   const basePath = "/Users/otto/cpp-raw";
        //   try {
        //     const bash = `${basePath}/main -m ${basePath}/models/ggml-medium.en.bin -f ${audioFilePath}.wav -osrt `;

        //     // exec(bash, (err, stdout, stderr) => {
        //     //   if (err) {
        //     //     console.log(err);
        //     //   } else {
        //     //     console.log("转换完成");
        //     //   }
        //     // });
        //     console.log(bash);
        //     console.log('转写结果在当前目录下的 "output.srt" 文件中');
        //     console.log(audioFilePath);
        //   } catch (error) {
        //     console.log("转写失败" + error);
        //   }
        //   // 是否需要转 vtt
        //   const promptsList = {
        //     type: "confirm",
        //     name: "isVtt",
        //     message: "是否需要转换为 vtt 格式",
        //   };
        //   const response = await prompts(promptsList);
        //   if (response.isVtt) {
        //   } else {
        //     console.log("已取消");
        //   }
      } else {
        console.log("不需要转写");
      }
    }
  } else if (type === "mp3") {
    // ffmpeg -i 00-0626-start.m4a -acodec libmp3lame -q:a 2 100-0626-start.mp3
    // 执行
    try {
      const bash = `ffmpeg -i ${audioFilePath} -acodec libmp3lame -q:a 2 ${audioFilePath}.mp3`;
      exec(bash, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
        } else {
          console.log("转换完成");
        }
      });
    } catch (error) {
      console.log("处理失败" + error);
    }
  } else if (type === "text") {
    console.log("开始转写");
    try {
      await handleTransFile(filePath);
    } catch (error) {
      console.log("转写失败" + error);
    }
  }
};

// meta
const handleMeta = async (filePath) => {
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
    readMeta(filePath);
  } else {
    console.log("write");
    const response2 = await prompts(promptsQuestion);

    const scriptUrl = import.meta.url;
    const scriptPath = fileURLToPath(scriptUrl);
    const absolutePath = path.dirname(scriptPath);

    const cover = path.resolve(absolutePath, "../", response2.APIC);
    // console.log(cover);
    response2.APIC = cover;
    // console.log(response2);

    // console.log(response2, filePath);

    writeMeta(response2, filePath);
  }
};

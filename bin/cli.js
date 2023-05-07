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
}

// main();

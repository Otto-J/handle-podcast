#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch";

import minimist from "minimist";
import prompts from "prompts";

const targetFolderPath = "./temp";

// https://traffic.libsyn.com/syntax/Syntax_-_663.mp3
export const handleUrl = async (url = "") => {
  let _url = url;
  // 如果没有 url 提示用户输入
  if (typeof url !== "string") {
    const promptsList = {
      type: "text",
      name: "url",
      message: "请输入远程路径",
    };
    console.log("未检测到远程路径");
    const response = await prompts(promptsList);
    _url = response.url;
  }

  console.log("要下载的地址是：", _url);
  // for test
  _url = _url ?? "https://traffic.libsyn.com/syntax/Syntax_-_663.mp3";

  return downloadFile(_url, targetFolderPath)
    .then((filePath) => {
      console.log("文件下载完成:", filePath);
      return {
        status: true,
        path: filePath,
      };
    })
    .catch((err) => {
      console.error("下载文件时出现错误:", err);
      return {
        status: false,
        path: "",
      };
    });
};

function downloadFile(fileUrl, targetFolderPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(targetFolderPath)) {
      fs.mkdirSync(targetFolderPath);
    }

    const fileName = path.basename(fileUrl);
    const filePath = path.join(targetFolderPath, fileName);

    const fileStream = fs.createWriteStream(filePath);

    fetch(fileUrl)
      .then((response) => {
        response.body.pipe(fileStream);

        response.body.on("end", () => {
          fileStream.close();
          resolve(filePath);
        });

        response.body.on("error", (err) => {
          reject(err);
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

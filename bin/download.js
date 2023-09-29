#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch";

import minimist from "minimist";
import prompts from "prompts";
import { SingleBar } from "cli-progress";
import * as cheerio from "cheerio";

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

  console.log("1,要下载的地址是：", _url);
  // for test
  _url = _url;

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

    // 如果 后缀是音频文件，如果是 html 文件
    const isAudioFile = fileUrl.endsWith(".mp3");

    if (isAudioFile) {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(targetFolderPath, fileName);

      // 判断文件是否已经存在，如果已经存在提示退出
      if (fs.existsSync(filePath)) {
        console.log("文件已经存在，无需下载");
        resolve(filePath);
        return;
      }
      const fileStream = fs.createWriteStream(filePath);

      console.log("3,start download", fileUrl, isAudioFile);

      return fetch(fileUrl)
        .then((response) => {
          console.log("2,mp3 文件");

          const progressBar = new SingleBar({
            format:
              "进度 |{bar}| {percentage}% | ETA: {eta}s | {value}/{total}",
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true,
          });

          // 设置总进度值
          const total = 100;
          progressBar.start(total, 0);

          response.body.pipe(fileStream);

          const totalSize = response.headers.get("content-length");
          let downloadedSize = 0;

          response.body.on("data", (chunk) => {
            downloadedSize += chunk.length;
            const progress = Math.round((downloadedSize / totalSize) * 100);
            progressBar.update(progress);

            // console.log(`Downloaded: ${progress}%`);
          });

          response.body.on("end", () => {
            console.log("下载完成");
            fileStream.close();
            progressBar.stop();
            resolve(filePath);
          });

          response.body.on("error", (err) => {
            reject(err);
          });
        })

        .catch((err) => {
          reject(err);
        });
    } else {
      return fetch(fileUrl)
        .then((response) => {
          return response.text();
        })
        .then((text) => {
          console.log("4,html 文件");
          // 获取源代码

          // 使用cheerio解析HTML字符串
          const $ = cheerio.load(text);
          const matchResult = $("audio").attr("src");
          console.log(5, "matchResult", matchResult);
          if (matchResult) {
            console.log("6,mp3Url:", matchResult);
            return downloadFile(matchResult, targetFolderPath);
          } else {
            reject("未找到 mp3 的 url");
          }
        })

        .catch((err) => {
          reject(err);
        });
    }
  });
}

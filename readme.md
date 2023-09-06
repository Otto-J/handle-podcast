# mp3-meta

```sh
mp3-meta --path ~/Downloads/No.0-web-worker有名字了.m4a
mp3-meta --url http://xx.mp3
```

必须先指定音频文件。

- 第一次载入，查看配置文件

  - 如果没有，就提示创建
  - 如果有就载入

- 处理文件 metadata 信息
- 处理文件英文转写
  - 是否已经指定了 whisper 的地址
  - 首先处理为 wav 格式
  - 调用 whisper 进行处理

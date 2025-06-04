# mp3-meta

`mp3-meta` 是一个命令行工具，用于处理音频文件，主要功能包括提取 metadata 信息以及将音频内容转录为文字。

## 安装与配置

### 系统环境要求

开始使用 `mp3-meta` 前，请确保您的系统已安装以下软件：

- **Whisper C++**: 这是 OpenAI Whisper 模型的一个 C++ 移植版本，用于高效的音频转录。您可以搜索 "[Whisper C++](https://github.com/ggerganov/whisper.cpp)" 了解更多信息和安装指南。
- **FFmpeg**: 一个强大的多媒体处理工具，`mp3-meta` 使用 FFmpeg 进行音频格式转换（例如，转换为 Whisper C++ 所需的 WAV 格式）。您可以搜索 "[FFmpeg](https://ffmpeg.org/)" 获取安装包和文档。
- **Node.js / Bun**: 项目包含 `package.json` 文件，表明它依赖于 Node.js 环境。如果项目中存在 `bun.lock` 文件，则推荐使用 [Bun](https://bun.sh/) 作为 JavaScript 运行时和包管理器，它通常能提供更快的性能。如果只有 `package-lock.json` 或 `yarn.lock`，则使用 Node.js (配合 npm 或 yarn)。然后，在项目根目录下运行 `bun install` (如果使用 Bun) 或 `npm install` (如果使用 Node.js 和 npm) 来安装项目所需的依赖包。

### 项目配置

`mp3-meta` 通过根目录下的 `.env` 文件进行配置。此文件用于指定外部工具（如 Whisper C++ 和 FFmpeg）的路径以及其他操作参数。

例如，您需要在 `.env` 文件中设置 Whisper C++ 和 FFmpeg 的可执行文件路径。

### 环境变量

为了正确运行 `mp3-meta`，您需要在项目根目录下创建一个名为 `.env` 的文件。如果该文件不存在，请手动创建它。这个文件用于存放重要的配置信息，如外部工具的路径和转录参数。

以下是 `.env` 文件中可以配置的变量及其说明：

-   **`WHISPER_BIN`**
    -   **说明**: 指向 Whisper C++ 主程序（通常名为 `main` 或 `whisper`）的可执行文件路径。这是进行音频转录的核心工具。
    -   **示例**: `WHISPER_BIN=/path/to/your/whisper.cpp/main`

-   **`WHISPER_MODEL`**
    -   **说明**: 指向 Whisper C++ 模型文件所在的目录。模型文件通常具有 `.bin` 扩展名（例如 `ggml-base.en.bin`）。请确保路径指向包含这些模型文件的文件夹。
    -   **示例**: `WHISPER_MODEL=/path/to/your/whisper.cpp/models/`

-   **`FFMPEG_BIN`**
    -   **说明**: 指向 FFmpeg 可执行文件的路径。FFmpeg 用于在转录前将各种音频格式转换为 Whisper C++ 所需的 WAV 格式。如果 FFmpeg 已安装在系统的 PATH 环境变量中，您可以直接使用 `ffmpeg`。
    -   **示例**: `FFMPEG_BIN=/usr/local/bin/ffmpeg` 或 `FFMPEG_BIN=ffmpeg`

-   **`BASE_PROMPT`**
    -   **说明**: 这是提供给 Whisper C++ 的基础提示语（Initial Prompt）。它可以帮助引导模型生成更准确或特定风格的转录文本。这个提示语会作为转录任务的初始上下文。
    -   **示例**: `BASE_PROMPT="以下是会议记录，请确保识别所有发言人。"`

请根据您的实际安装路径和需求，修改 `.env` 文件中的示例值。

## 命令行使用

您可以通过以下命令行选项来使用 `mp3-meta`：

-   **`--path <文件路径>`**
    -   **用途**: 指定要处理的本地音频文件（例如 `.mp3`, `.m4a`, `.wav` 等）。
    -   **示例**:
        ```sh
        mp3-meta --path ~/Music/播客/No.0-web-worker有名字了.m4a
        ```

-   **`--url <音频URL>`**
    -   **用途**: 指定要处理的在线音频文件的 URL。程序将首先下载该文件，然后进行处理。
    -   **示例**:
        ```sh
        mp3-meta --url https://example.com/audio/podcast_episode.mp3
        ```

使用上述任一选项，`mp3-meta` 会执行以下操作：
1.  读取并解析音频文件的 metadata。
2.  如果配置了 Whisper C++，将音频内容转录为文本。

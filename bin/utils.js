import { spawn, exec } from "child_process";

export const spawnCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args);

    childProcess.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    childProcess.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    childProcess.on("error", (error) => {
      reject(error);
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
};

export const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

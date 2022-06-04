const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { downloadFile, findFile, moveFile, deleteAll } = require("./file");
const { ytdlpUrl, ffmpegUrl } = require("./links");
const { ytdlp, ffmpeg, ffmpegZip } = require("./pathways");

function checkFile() {
    if (!fs.existsSync(ytdlp) || !fs.existsSync(ffmpeg)) {
        downloadFile(ytdlpUrl, ytdlp, (err) => {
            if (err) {
                return console.log("Download Failed");
            }
            downloadFile(ffmpegUrl, ffmpegZip, (err2, spinner) => {
                if (err2) {
                    return console.log("Download Failed");
                }
                const dirname = path.dirname(ffmpegZip);
                const fileList = findFile("ffmpeg.exe", dirname);
                moveFile(fileList[0], ffmpeg);
                deleteAll(dirname, ["ffmpeg.exe", "yt-dlp.exe"]);
                spinner.succeed(chalk.green("Download Completed"));
                process.e;
                execSync("node index.js", { stdio: "inherit" });
            });
        });

        return false;
    } else {
        return true;
    }
}

module.exports = { checkFile };

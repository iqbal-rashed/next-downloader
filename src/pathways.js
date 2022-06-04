const path = require("path");
const os = require("os");

const ffmpeg = path.join(__dirname, "../", "bin", "ffmpeg.exe");
const ytdlp = path.join(__dirname, "../", "bin", "yt-dlp.exe");

const ffmpegZip = path.join(__dirname, "../", "bin", "ffmpeg.zip");
const homedir = os.userInfo().homedir;

const output = path.join(homedir, "Downloads", "/");

module.exports = {
    ffmpeg,
    ytdlp,
    ffmpegZip,
    output,
};

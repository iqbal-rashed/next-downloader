const os = require("os");

const ytdlpWin64 =
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
const ytdlpWin32 =
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_x86.exe";

const ffmpegWin64 =
    "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip";
const ffmpegWin32 =
    "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win32-gpl.zip";

const ytdlpUrl = detectOs(ytdlpWin32, ytdlpWin64);

const ffmpegUrl = detectOs(ffmpegWin32, ffmpegWin64);

function detectOs(x32Link, x64Link) {
    if (os.arch() === "x64") {
        return x64Link;
    } else if (os.arch() === "x32") {
        return x32Link;
    } else {
        console.log("Os not supported");
        process.exit(1);
    }
}

module.exports = { ytdlpUrl, ffmpegUrl };

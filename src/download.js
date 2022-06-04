const cp = require("child_process");
const { ffmpeg, ytdlp, output } = require("./pathways");

let tracker = {};

function downloadVideo(url, title, quality, socket, io, err) {
    console.log("Processing...");
    let handleInterval;
    tracker.title = title;
    tracker.start = Date.now();
    tracker.url = url;
    const downloadProcess = cp.spawn(ytdlp, [
        "-f",
        `bv*${err ? "" : `[height=${quality}]`}+ba`,
        url,
        "--merge-output-format",
        "mp4",
        "-o",
        `${output}${title}`,
        "--ffmpeg-location",
        ffmpeg,
        "-R",
        "infinite",
    ]);

    downloadProcess.stdout.on("data", (data) => {
        const str = Buffer.from(data).toString();
        console.log(str);
        if (
            str.includes("[download]") &&
            !str.includes("has already been downloaded")
        ) {
            if (!handleInterval) {
                handleInterval = setInterval(showProgress, 1000);
            }

            const dataStr = str.split(" ").filter((v) => v !== "");
            if (str.includes("ETA")) {
                tracker.percent = dataStr[1];
                tracker.total = dataStr[3].replace("i", "");
                tracker.speed = dataStr[5].replace("i", "");
                tracker.time = dataStr[7];
            }
        }
        if (str.includes("has already been downloaded")) {
            io.emit("alreadyHave");
            console.log("File already exist!");
        }
    });
    downloadProcess.stderr.on("data", (data) => {
        const errStr = Buffer.from(data).toString();
        if (errStr.includes("Requested format is not available")) {
            console.log("Format not found. Wait, Redownloading...");
            downloadVideo(url, title, "", socket, io, true);
        }
        console.log(errStr);
    });

    downloadProcess.on("close", () => {
        if (handleInterval) {
            clearInterval(handleInterval);

            if (tracker.percent && tracker.percent === "100%") {
                io.emit("complete", tracker);
            }
        }
    });

    function showProgress() {
        io.emit("downloading", tracker);
    }

    return downloadProcess;
}

function downloadAudio(url, title, socket, io) {
    let handleInterval;
    tracker.title = title;
    tracker.start = Date.now();
    tracker.url = url;
    const downloadProcess = cp.spawn(ytdlp, [
        "-f",
        "ba",
        "--audio-format",
        "mp3",
        url,
        "-o",
        `${output}${title}.mp3`,
        "-R",
        "infinite",
    ]);

    downloadProcess.stdout.on("data", (data) => {
        const str = Buffer.from(data).toString();
        if (
            str.includes("[download]") &&
            !str.includes("has already been downloaded")
        ) {
            if (!handleInterval) {
                handleInterval = setInterval(showProgress, 1000);
            }

            const dataStr = str.split(" ").filter((v) => v !== "");
            if (dataStr.length === 8) {
                tracker.percent = dataStr[1];
                tracker.total = dataStr[3].replace("i", "");
                tracker.speed = dataStr[5].replace("i", "");
                tracker.time = dataStr[7];
            }
        }
    });
    downloadProcess.stderr.on("data", (data) => {
        const errStr = Buffer.from(data).toString();
        console.log(errStr);
    });

    downloadProcess.on("close", () => {
        clearInterval(handleInterval);
        if (tracker.percent && tracker.percent === "100%") {
            io.emit("complete", tracker);
        }
    });

    function showProgress() {
        io.emit("downloading", tracker);
    }
    return downloadProcess;
}

module.exports = { downloadAudio, downloadVideo, tracker };

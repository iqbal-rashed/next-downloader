if (!require("./src/config").checkFile()) {
    return;
}
// import module
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const kill = require("tree-kill");
const { downloadAudio, downloadVideo, tracker } = require("./src/download");
// initialize
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// middleware
app.use(cors());

let isDisconnect = false;
let isTitle = "";

// socket io
io.on("connection", (socket) => {
    console.log("Server socket connected...");

    let downloadProcess;
    if (isDisconnect) {
        if (tracker.percent && tracker.percent === "100%") {
            socket.emit("complete", tracker);
            isTitle = tracker.title;
        }
        isDisconnect = false;
    }

    socket.on("canceldownload", () => {
        if (downloadProcess) {
            kill(downloadProcess.pid);
            downloadProcess = "";
        }
    });

    socket.on("download", (data) => {
        if (data.quality === "audio") {
            downloadProcess = downloadAudio(data.url, data.title, socket, io);
        } else {
            downloadProcess = downloadVideo(
                data.url,
                data.title,
                data.quality,
                socket,
                io
            );
        }
    });

    socket.on("disconnect", () => {
        console.log("Server socket disconnected...");
        socket.removeAllListeners("downloading");
        if (isTitle !== tracker.title) {
            isDisconnect = true;
        }
    });
});

// listen server
httpServer.listen(53422, () => {
    console.log("Server is running on port 32144");
});

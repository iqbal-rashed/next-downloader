const request = require("request");
const fs = require("fs");
const CliProgress = require("cli-progress");
const path = require("path");
const extract = require("extract-zip");
const ora = require("ora");
const chalk = require("chalk");

const downloadFile = (url, savePath, callback) => {
    if (!url || !savePath) {
        return callback("Url or save path not valid!");
    }
    const filename = path.basename(savePath);
    const progressBar = new CliProgress.SingleBar(
        {
            format: `Download ${filename} {bar} {percentage}% | {eta_formatted} remaining...`,
        },
        CliProgress.Presets.shades_classic
    );

    const file = fs.createWriteStream(savePath);
    let receivedBytes = 0;

    request
        .get(url)
        .on("response", (res) => {
            if (res.statusCode !== 200) {
                return callback("Response status was " + res.statusCode);
            }
            const totalBytes = res.headers["content-length"];
            progressBar.start(totalBytes, 0);
        })
        .on("data", (chunk) => {
            receivedBytes += chunk.length;
            progressBar.update(receivedBytes);
        })
        .pipe(file)
        .on("error", (err) => {
            fs.unlink(savePath);
        });

    file.on("finish", async () => {
        progressBar.stop();
        if (path.extname(savePath) === ".zip") {
            try {
                const el = ora({
                    text: chalk.yellow("Zip file found, Extracting..."),
                    color: "yellow",
                }).start();
                const dirname = path.dirname(savePath);
                await extract(savePath, { dir: dirname });

                file.close();
                callback(null, el);
            } catch (error) {
                callback(error.message);
            }
        } else {
            file.close();
            callback();
        }
    });

    file.on("error", (err) => {
        fs.unlink(savePath);
        progressBar.stop();
        return callback(err.message);
    });
};

function findFile(fileName, dirname = process.cwd(), fileList) {
    let files = fs.readdirSync(dirname);
    fileList = fileList || [];

    files.forEach((f) => {
        if (!f.startsWith(".")) {
            let filepath = path.join(dirname, f);
            if (fs.statSync(filepath).isDirectory()) {
                fileList = findFile(fileName, filepath, fileList);
            } else if (f === fileName) {
                fileList.push(filepath);
            }
        }
    });
    return fileList;
}

function moveFile(oldPath, newPath) {
    try {
        fs.renameSync(oldPath, newPath);
        return true;
    } catch (error) {
        return false;
    }
}

function deleteAll(dirname, filenames = []) {
    let files = fs.readdirSync(dirname);
    const filterFiles = files.filter((v) => !filenames.includes(v));
    filterFiles.forEach((v) => {
        const filepath = path.join(dirname, v);
        fs.rmSync(filepath, { recursive: true });
    });
}

module.exports = { downloadFile, moveFile, deleteAll, findFile };

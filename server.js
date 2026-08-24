const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 8000;

function getIPv4Address() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const network of interfaces[name]) {
            if (
                network.family === "IPv4" &&
                !network.internal
            ) {
                return network.address;
            }
        }
    }

    return "127.0.0.1";
}

const ip = getIPv4Address();

const server = http.createServer((req, res) => {
    let filePath = path.join(
        __dirname,
        req.url === "/" ? "index.html" : req.url
    );

    const ext = path.extname(filePath);

    const contentTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml"
    };

    const contentType = contentTypes[ext] || "text/plain";

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, {
                "Content-Type": "text/plain"
            });

            res.end("404 - File Not Found");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(content);
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("Server running!");
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://${ip}:${PORT}`);
    console.log("");
});
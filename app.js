const express = require("express");
const app = express();
const { exec } = require("child_process");
var HLSServer = require("hls-server");
var http = require("http");
var path = require("path");
const hls = require("hls-server");
const fs = require("fs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  // res.send("Hello World");
  return res.status(200).sendFile(`${__dirname}/index.html`);
});
app.get("/capture", function (req, res) {
  exec(
    "ffmpeg -f v4l2 -i /dev/video0 -vcodec libx264 -g 1 -hls_time 0.05 -strict experimental -pix_fmt yuv420p public/playlist.m3u8",
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      } else {
        // console.log(`stdout: ${stdout}`);
        return res.send({
          data: "",
        });
      }
    }
  );
  return res.send({
    data: "",
  });
});
app.get("/stop", function (req, res) {
  exec("pkill ffmpeg", (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    } else {
    }
  });
  setTimeout(() => {
    exec("rm -r public/*", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      } else {
      }
    });
  }, 0);
  return res.send({
    data: "stdout",
  });
});
const server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});

new hls(server, {
  provider: {
    exists: (req, cb) => {
      const ext = req.url.split(".").pop();

      if (ext !== "m3u8" && ext !== "ts") {
        return cb(null, true);
      }

      fs.access(__dirname + req.url, fs.constants.F_OK, function (err) {
        if (err) {
          console.log("File not exist");
          return cb(null, false);
        }
        cb(null, true);
      });
    },
    getManifestStream: (req, cb) => {
      const stream = fs.createReadStream(__dirname + req.url);
      cb(null, stream);
    },
    getSegmentStream: (req, cb) => {
      const stream = fs.createReadStream(__dirname + req.url);
      cb(null, stream);
    },
  },
});
// -vcodec libx264 - video codec (libx264 for h264).

// -acodec aac - audio codec (aac).

// -preset ultrafast - encoding preset (ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, placebo).

// -tune zerolatency - tune zerolatency sends an I-Frame (complete pic) every frame so that users to not need to wait for intermetiate frames to complete.

// -thread_type slice - slice-based threading tells all CPU threads work on the same frame, reducing latency a lot.

// -slices 1 - has to be 1 for vMix to decode the stream, don't know why.

// -intra-refresh 1 intra-refresh has to be set to 1 because vMix expects a latency of 1 frame, I think.

// -r 30 - framerate.

// -g 60 - GOP (Group of Pictures), simply multiply your output frame rate * 2.

// -s 800x600 - scale my webcam's native picture is 1600x1200, so I scale it down.

// -aspect 4:3 - aspect ratio, my webcam is a Logitec 9000 which is 4:3.

// -acodec aac - audio encode using AAC.

// -ar 44100 - audio sample rate 44.1 KHz.

// -b:v 2.5M - desired bitrate for video 2.5 Mbps, can play with this.

// -minrate:v 900k - min data rate video 900k, can play with this.

// -maxrate:v 2.5M - min data rate video 2.5 Mbps, can play with this.

// -bufsize:v 5M - buffer size for encoding, double max data rate seems to be a good starting point.

// -b:a 128K - desired bitrate for audio 128 Kbps, can play with this.

// -pix_fmt yuv420p - color space, has to be yuv420p for vMix to decode properly.

// -bufsize 5000k - buffer size (double max data rate seems to be a good starting point)

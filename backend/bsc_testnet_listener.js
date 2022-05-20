const bsc = require("./networks/bsc");
const bsc_testnet = require("./networks/bsc_testnet");
const ropsten = require("./networks/ropsten");
const eth = require("./networks/eth");
const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(__dirname + "/bsc_testnet_listener.log", {
  flags: "a",
});
const log_stdout = process.stdout;

const Queue = require("bull");
const RedeemTxQueue = new Queue("RedeemTxBackend", process.env.REDIS_URL);

console.log = function (d) {
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};

const network_id = {
  1: eth,
  3: ropsten,
  56: bsc,
  97: bsc_testnet,
};

const network_name_id = {
  1: "eth",
  3: "ropsten",
  56: "bsc",
  97: "bsc_testnet",
};

const init = async () => {
  let lastBlockCkecked = fs
    .readFileSync("bsc_testnet_last_block.txt")
    .toString();

  const currentBlockHeight = await bsc_testnet.web3.eth.getBlockNumber();

  console.log(lastBlockCkecked);
  console.log(currentBlockHeight);

  if (currentBlockHeight > lastBlockCkecked) {
    bsc_testnet.bridge
      .getPastEvents(
        "LogSwapInitialized",
        {
          fromBlock: lastBlockCkecked,
          toBlock: currentBlockHeight,
        },
        function (error, events) {}
      )
      .then(function (events) {
        events.forEach((event) => {
          console.log(event.transactionHash + " need to add");
          RedeemTxQueue.add(network_name_id[event.returnValues.chainTo], {
            data: event,
          });
        });
      });

    fs.writeFileSync(
      __dirname + "/bsc_testnet_last_block.txt",
      `${currentBlockHeight + 1}`,
      (err) => {}
    );
  }
};
init();
setInterval(() => {
  init();
}, 30000);

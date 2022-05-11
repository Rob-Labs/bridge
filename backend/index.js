const bsc = require("./networks/bsc");
const bsc_testnet = require("./networks/bsc_testnet");
const ropsten = require("./networks/ropsten");
const eth = require("./networks/eth");
const BigNumber = require("bignumber.js");
const fs = require("fs");
const util = require("util");
const { on } = require("events");
const log_file = fs.createWriteStream(__dirname + "/backend.log", {
  flags: "a",
});
const log_stdout = process.stdout;

const Queue = require("bull");
const RedeemTxQueue = new Queue("RedeemTxBackend", "redis:/127.0.0.1:6379");

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

const performRedeem = async (job, done) => {
  const data = job.data.data;
  const { from, to, amount, ticker, chainTo, chainFrom, nonce } =
    data.returnValues;
  console.log(
    `Confirming swap from ${network_id[chainFrom].network_name} to ${network_id[chainTo].network_name} Tx : ${network_id[chainFrom].explorer}${data.transactionHash}`
  );

  console.log(`Processing Redeem Tx: ${data.transactionHash} .....`);
  const message = network_id[chainTo].web3.utils
    .soliditySha3(
      { t: "address", v: from },
      { t: "address", v: to },
      { t: "uint256", v: amount },
      { t: "string", v: ticker },
      { t: "uint256", v: chainFrom },
      { t: "uint256", v: chainTo },
      { t: "uint256", v: nonce }
    )
    .toString("hex");

  const { signature } =
    network_id[chainTo].web3.eth.accounts.wallet[0].sign(message);

  const { address: validator } =
    network_id[chainTo].web3.eth.accounts.wallet[0];

  const tx = network_id[chainTo].bridge.methods.redeem(
    from,
    to,
    amount,
    ticker,
    chainFrom,
    chainTo,
    nonce,
    signature
  );

  const [gasPrice, gasCost] = await Promise.all([
    network_id[chainTo].web3.eth.getGasPrice(),
    tx.estimateGas({ from: validator }),
  ]);
  console.log(
    `Sending Redeem Tx ${data.transactionHash} to blockchain network, waiting for confirmation...`
  );

  tx.send({
    from: validator,
    gasPrice: gasPrice,
    gas: gasCost,
  }).on("receipt", (receipt) => {
    console.log(
      `Redeem Tx ${data.transactionHash} has been processed, check this redeem tx ${network_id[chainTo].explorer}${receipt.transactionHash}`
    );
    done();
  });
};

RedeemTxQueue.process(performRedeem);

console.log(`Bridge Backend Started ::`);
console.log(`Listening on swap event ......`);
bsc_testnet.bridge.events.LogSwapInitialized().on("data", async (data) => {
  RedeemTxQueue.add({ data });
});
ropsten.bridge.events.LogSwapInitialized().on("data", async (data) => {
  RedeemTxQueue.add({ data });
});

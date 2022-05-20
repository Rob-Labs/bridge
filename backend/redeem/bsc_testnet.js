const bsc = require("../redeem_networks/bsc");
const bsc_testnet = require("../redeem_networks/bsc_testnet");
const ropsten = require("../redeem_networks/ropsten");
const eth = require("../redeem_networks/eth");
const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(__dirname + "/bsc_testnet.log", {
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

const performRedeem = async (job, done) => {
  const data = job.data.data;
  const { from, to, amount, ticker, chainTo, chainFrom, nonce } =
    data.returnValues;
  console.log(
    `\nConfirming swap from ${network_id[chainFrom].network_name} to ${network_id[chainTo].network_name} Tx : ${network_id[chainFrom].explorer}${data.transactionHash}`
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

  let tempTxHash;
  try {
    tx.send({
      from: validator,
      gasPrice: gasPrice,
      gas: gasCost,
    })
      .on("transactionHash", function (hash) {
        tempTxHash = hash;
        console.log(
          `Sending Redeem Tx ${data.transactionHash} to BSC TESTNET blockchain network ${tempTxHash}, waiting for confirmation...`
        );
      })
      .on("receipt", (receipt) => {
        console.log(
          `Redeem Tx ${data.transactionHash} has been processed, check this redeem tx ${network_id[chainTo].explorer}${receipt.transactionHash}`
        );
        fs.writeFileSync(
          __dirname + "/bsc_testnet.result",
          `${network_id[chainFrom].explorer}${data.transactionHash};${network_id[chainTo].explorer}${receipt.transactionHash}\n`,
          { flag: "a+" },
          (err) => {}
        );
        done();
      })
      .on("error", function (error, receipt) {
        fs.writeFileSync(
          __dirname + "/bsc_testnet_error.result",
          `${network_id[chainFrom].explorer}${data.transactionHash};${network_id[chainTo].explorer}${tempTxHash}\n`,
          { flag: "a+" },
          (err) => {}
        );
        done();
      });
  } catch (error) {
    fs.writeFileSync(
      __dirname + "/bsc_testnet_error.result",
      `${network_id[chainFrom].explorer}${data.transactionHash};${network_id[chainTo].explorer}${tempTxHash}\n`,
      { flag: "a+" },
      (err) => {}
    );
    done();
  }
};

RedeemTxQueue.process("bsc_testnet", performRedeem);

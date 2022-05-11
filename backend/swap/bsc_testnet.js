require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const BRIDGE_ADDRESS = process.env.BSC_TESTNET_BRIDGE_ADDRESS;
const explorer = process.env.BSC_TESTNET_EXPLORER;
const BSC_TESTNET_WS = process.env.BSC_TESTNET_WS;
const fs = require("fs");
const util = require("util");
const { on } = require("events");

const Queue = require("bull");
const SwapTxBsc = new Queue("SwapTxBsc", "redis:/127.0.0.1:6379");

const log_file = fs.createWriteStream(__dirname + "/swap_testnet.log", {
  flags: "a",
});
const log_stdout = process.stdout;

console.log = function (d) {
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};

const PRIVATE_KEY = process.env.CLIENT_KEY;

const web3 = new Web3(BSC_TESTNET_WS);
web3.eth.accounts.wallet.add(PRIVATE_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

const { address: client } = web3.eth.accounts.wallet[0];

const performSwap = async (job, done) => {
  const amountSwap = job.data.amountSwap;

  console.log(`Prepare Swap Tx ......`);
  const fee = await bridge.methods.calculateFee().call({ from: client });
  console.log(`Swap fee is :  ${fee} wei`);
  const tx = bridge.methods.swap(client, amountSwap, "EMPIRE", "3", "97");

  const gasPrice = await web3.eth.getGasPrice();
  const gasCost = await tx.estimateGas({ from: client, value: fee });
  tx.send({
    from: client,
    gasPrice: gasPrice,
    gas: gasCost,
    value: fee,
  }).on("receipt", (receipt) => {
    console.log(
      `Swap Tx has been dispatch, check this tx ${explorer}${receipt.transactionHash}`
    );
    done();
  });
};

SwapTxBsc.process(performSwap);

for (let index = 10; index < 200; index++) {
  let val = BigInt(index).toString();
  const swap_value = web3.utils.toWei(val, "gwei");
  SwapTxBsc.add({ amountSwap: swap_value });
}

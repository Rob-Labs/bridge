require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const BRIDGE_ADDRESS = process.env.ETH_BRIDGE_ADDRESS;
const explorer = process.env.ETH_EXPLORER;
const ETH_WS = process.env.ETH_WS;
const fs = require("fs");
const util = require("util");
const { on } = require("events");
const log_file = fs.createWriteStream(__dirname + "/swap.log", { flags: "a" });
const log_stdout = process.stdout;

console.log = function (d) {
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};

const PRIVATE_KEY = "";

const web3 = new Web3(ETH_WS);
web3.eth.accounts.wallet.add(PRIVATE_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

const { address: client } = web3.eth.accounts.wallet[0];

const swap = async (value) => {
  console.log(`Prepare Swap Tx ......`);
  const fee = await bridge.methods.calculateFee().call({ from: client });
  console.log(`Swap fee is :  ${fee} wei`);
  const tx = bridge.methods.swap(client, value, "BTT", "56", "1");

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
  });
};

const swap_value = web3.utils.toWei("10", "gwei");
swap(swap_value);

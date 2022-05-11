const eth = require("./networks/eth");
const ropsten = require("./networks/ropsten");
const bsc = require("./networks/bsc");
const bsc_testnet = require("./networks/bsc_testnet");
const BigNumber = require("bignumber.js");
const tokenABI = require("./abis/Empire.json");
const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(__dirname + "/helper.log", {
  flags: "a",
});
const log_stdout = process.stdout;

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

// include token
const includeToken = async (chain, ticker, addr) => {
  const { address: validator } = network_id[chain].web3.eth.accounts.wallet[0];
  console.log(
    `Include Token on chain ${network_id[chain].network_name} Ticker : ${ticker} Address : ${addr}`
  );
  const gasPrice = await network_id[chain].web3.eth.getGasPrice();
  const gasEstimate = await network_id[chain].bridge.methods
    .includeToken(ticker, addr)
    .estimateGas({ from: validator });

  network_id[chain].bridge.methods
    .includeToken(ticker, addr)
    .send({ from: validator, gasPrice: gasPrice, gas: gasEstimate })
    .on("receipt", function (receipt) {
      console.log(
        `Include Token success on ${network_id[chain].explorer}${receipt.transactionHash}`
      );
    });
};
// exclude token
const excludeToken = async (chain, ticker) => {
  const { address: validator } = network_id[chain].web3.eth.accounts.wallet[0];
  console.log(
    `Exclude Token on chain ${network_id[chain].network_name} Ticker : ${ticker}`
  );
  const gasPrice = await network_id[chain].web3.eth.getGasPrice();
  const gasEstimate = await network_id[chain].bridge.methods
    .excludeToken(ticker)
    .estimateGas({ from: validator });

  network_id[chain].bridge.methods
    .excludeToken(ticker)
    .send({ from: validator, gasPrice: gasPrice, gas: gasEstimate })
    .on("receipt", function (receipt) {
      console.log(
        `Exclude Token success on ${network_id[chain].explorer}${receipt.transactionHash}`
      );
    });
};
// update chain token
const updateChainById = async (chain, chainId, isActive) => {
  const { address: validator } = network_id[chain].web3.eth.accounts.wallet[0];
  console.log(
    `Update swap destination chain ${network_id[chain].network_name} to chain : ${network_id[chainId].network_name} : ${isActive}`
  );
  const gasPrice = await network_id[chain].web3.eth.getGasPrice();
  const gasEstimate = await network_id[chain].bridge.methods
    .updateChainById(chainId, isActive)
    .estimateGas({ from: validator });

  network_id[chain].bridge.methods
    .updateChainById(chainId, isActive)
    .send({ from: validator, gasPrice: gasPrice, gas: gasEstimate })
    .on("receipt", function (receipt) {
      console.log(
        `Update success on ${network_id[chain].explorer}${receipt.transactionHash}`
      );
    });
};

// update chain token
const updateFee = async (chain, newFee) => {
  const { address: validator } = network_id[chain].web3.eth.accounts.wallet[0];
  console.log(
    `Update swap fee chain ${network_id[chain].network_name}  : ${newFee}`
  );
  const gasPrice = await network_id[chain].web3.eth.getGasPrice();
  const gasEstimate = await network_id[chain].bridge.methods
    .updateFee(newFee)
    .estimateGas({ from: validator });

  network_id[chain].bridge.methods
    .updateFee(newFee)
    .send({ from: validator, gasPrice: gasPrice, gas: gasEstimate })
    .on("receipt", function (receipt) {
      console.log(
        `Update success on ${network_id[chain].explorer}${receipt.transactionHash}`
      );
    });
};

// includeToken("3", "EMPIRE", "0xF33f0e354592eDb31bE24e664a6De116Cd56740f");
// includeToken("97", "EMPIRE", "0x8E3295632ED008860146fDd007e4EB9Ec9bA2778");
// updateChainById("97", "3", "True");
// updateChainById("3", "97", "True");
// updateFee("3", "20");
// updateFee("97", "20");

const eth = require("./networks/eth");
const rinkeby = require("./networks/rinkeby");
const bsc = require("./networks/bsc");
const bsc_testnet = require("./networks/bsc_testnet");
const avax = require("./networks/avax");
const fuji = require("./networks/fuji");
const BigNumber = require("bignumber.js");
const tokenABI = require("./abis/Token.json");
const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "a" });
const log_stdout = process.stdout;

console.log = function (d) {
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};

const network_id = {
  1: eth,
  4: rinkeby,
  56: bsc,
  97: bsc_testnet,
  43113: fuji,
  43114: avax,
};

const token_address = {
  1: "0x5C668e913D5b9395a43C075bf87534460CEE15f9",
  4: "",
  56: "0x5C668e913D5b9395a43C075bf87534460CEE15f9",
  97: "0x02f69719A27144A8ce81D3E68e4e3625c9D53CcE",
  43113: "0xAc080D8B62B61dA5dad21325372F70854E1a2785",
  43114: "",
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

// excludeToken("97", "BTT");
// excludeToken("43113", "BTT");
// includeToken("1", "BTT", "0x5C668e913D5b9395a43C075bf87534460CEE15f9");
// includeToken("56", "BTT", "0x5C668e913D5b9395a43C075bf87534460CEE15f9");
// updateChainById("56", "1", "True");
// updateChainById("1", "56", "True");
// eth.web3.eth.getGasPrice().then(console.log);

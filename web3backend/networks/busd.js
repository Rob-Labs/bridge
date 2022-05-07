require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/busd.json");
const VALIDATOR_KEY = process.env.VALIDATOR_KEY;
const BRIDGE_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const explorer = process.env.BSC_EXPLORER;
const network_name = "BSC MAINNET";
const BSC_WS = process.env.BSC_WS;

const web3 = new Web3(BSC_WS);
web3.eth.accounts.wallet.add(VALIDATOR_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

module.exports = { web3, bridge, explorer, network_name };

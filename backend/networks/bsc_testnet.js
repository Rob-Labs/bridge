require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const VALIDATOR_KEY = process.env.VALIDATOR_KEY;
const BRIDGE_ADDRESS = process.env.BSC_TESTNET_BRIDGE_ADDRESS;
const explorer = process.env.BSC_TESTNET_EXPLORER;
const network_name = "BSC TESTNET";
const BSC_TESTNET_WS = process.env.BSC_TESTNET_WS;

const web3 = new Web3(BSC_TESTNET_WS);
web3.eth.accounts.wallet.add(VALIDATOR_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

module.exports = { web3, bridge, explorer, network_name };

require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const VALIDATOR_KEY = process.env.VALIDATOR_KEY;
const BRIDGE_ADDRESS = process.env.FUJI_BRIDGE_ADDRESS;
const explorer = process.env.FUJI_EXPLORER;
const network_name = "FUJI TESTNET";
const FUJI_WS = process.env.FUJI_WS;

const web3 = new Web3(FUJI_WS);
web3.eth.accounts.wallet.add(VALIDATOR_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

module.exports = { web3, bridge, explorer, network_name };

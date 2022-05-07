require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const VALIDATOR_KEY = process.env.VALIDATOR_KEY;
const BRIDGE_ADDRESS = process.env.AVAX_BRIDGE_ADDRESS;
const explorer = process.env.AVAX_EXPLORER;
const network_name = "AVAX MAINNET";
const AVAX_WS = process.env.AVAX_WS;

const web3 = new Web3(AVAX_WS);
web3.eth.accounts.wallet.add(VALIDATOR_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

module.exports = { web3, bridge, explorer, network_name };

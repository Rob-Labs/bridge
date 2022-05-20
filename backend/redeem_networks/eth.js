require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const VALIDATOR_KEY = process.env.VALIDATOR_KEY;
const explorer = process.env.ETH_EXPLORER;
const network_name = "ETH";
const BRIDGE_ADDRESS = process.env.ETH_BRIDGE_ADDRESS;

const ETH_RPC_RPC = process.env.ETH_RPC_RPC;

const web3 = new Web3(ETH_RPC_RPC);
web3.eth.accounts.wallet.add(VALIDATOR_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

module.exports = { web3, bridge, explorer, network_name };

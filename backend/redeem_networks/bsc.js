require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const VALIDATOR_KEY = process.env.VALIDATOR_KEY;
const BRIDGE_ADDRESS = process.env.BSC_BRIDGE_ADDRESS;
const explorer = process.env.BSC_EXPLORER;
const network_name = "BSC MAINNET";
const BSC_REDEEM_RPC = process.env.BSC_REDEEM_RPC;

const web3 = new Web3(BSC_REDEEM_RPC);
web3.eth.accounts.wallet.add(VALIDATOR_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

module.exports = { web3, bridge, explorer, network_name };

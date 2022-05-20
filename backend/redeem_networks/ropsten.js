require("dotenv").config();
const Web3 = require("web3");
const bridgeABI = require("../abis/Bridge.json");
const VALIDATOR_KEY = process.env.VALIDATOR_KEY;
const explorer = process.env.ROPSTEN_EXPLORER;
const network_name = "ROPSTEN TESTNET";
const BRIDGE_ADDRESS = process.env.ROPSTEN_BRIDGE_ADDRESS;

const ROPSTEN_REDEEM_RPC = process.env.ROPSTEN_REDEEM_RPC;

const web3 = new Web3(ROPSTEN_REDEEM_RPC);
web3.eth.transactionBlockTimeout = 30000;
web3.eth.accounts.wallet.add(VALIDATOR_KEY);
const bridge = new web3.eth.Contract(bridgeABI, BRIDGE_ADDRESS);

module.exports = { web3, bridge, explorer, network_name };

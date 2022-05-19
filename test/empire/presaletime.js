const { expect } = require("chai");
const { ethers } = require("hardhat");
// const dotenv = require("dotenv");

const uniswapV2RouterAbi = require("./abi/IUniswapV2Router02.json").abi;
const uniswapV2PairAbi = require("./abi/IUniswapV2Pair.json").abi;
const uniswapV2RouterAddress = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
const deadAddress = "0x000000000000000000000000000000000000dEaD";

describe("Empire Token", function () {
  let deployer;
  let marketingWallet;
  let team;
  let client1;
  let client2;
  let client3;
  let client4;
  let client5;
  let client6;
  let client7;
  let client8;
  let client9;
  let client10;
  let emptyAddr;
  let bridgeAddr;
  let newWallet;
  let addrs;

  let token;

  const maxSupplyBn = ethers.BigNumber.from("1000000000000000000");

  beforeEach(async function () {
    // await ethers.provider.send("hardhat_reset"); // This resets removes the fork
    // Reset the fork
    await ethers.provider.send("hardhat_reset", [
      {
        forking: {
          jsonRpcUrl: process.env.BSCTESTNET_URL,
        },
      },
    ]);
    // Get signers
    [
      deployer,
      marketingWallet,
      teamWallet,
      client1,
      client2,
      client3,
      client4,
      client5,
      client6,
      client7,
      client8,
      client9,
      client10,
      emptyAddr,
      bridgeAddr,
      newWallet,
      ...addrs
    ] = await ethers.getSigners();
    // Deploy contract
    const Token = await ethers.getContractFactory("EmpireToken");
    token = await Token.deploy(marketingWallet.address, teamWallet.address);
    await token.deployed();

    // let's assume we finish presale, so I enable trading on each test
    // await token.enableTrading();
  });

  describe("Transactions at Presale Time", function () {
    it("Transfer fails when Presale Time although sender have enough tokens", async function () {
      // Try to send 50 token from deployer (1000000000 tokens) to client5 (0 tokens).
      // `require` will evaluate false and revert the transaction.

      expect(
        token.connect(deployer).transfer(client5.address, 50)
      ).to.be.revertedWith("Trading is disabled");
    });
  });
});

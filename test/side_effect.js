const { expect } = require("chai");
const { ethers } = require("hardhat");
// const dotenv = require("dotenv");

// const uniswapV2RouterAbi = require("./abi/IUniswapV2Router02.json").abi;
// const uniswapV2PairAbi = require("./abi/IUniswapV2Pair.json").abi;
// const uniswapV2RouterAddress = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
const deadAddress = "0x000000000000000000000000000000000000dEaD";

const airdropValue = ethers.utils.parseUnits("200000", 9);
const mintValue = ethers.utils.parseUnits("2000", 9);
const burnValue = ethers.utils.parseUnits("2000", 9);

describe("Empire Token", function () {
  let deployer;
  let marketingWallet;
  let teamWallet;
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
    await token.enableTrading();
    await token.setBridge(bridgeAddr.address);

    // airdrop for client
    await token.transfer(client1.address, airdropValue);
    await token.transfer(client2.address, airdropValue);
    await token.transfer(client3.address, airdropValue);
    await token.transfer(client4.address, airdropValue);
    await token.transfer(client5.address, airdropValue);
  });

  describe("Check Side Effect on burn and mint", function () {
    it("Correct balance change after burn", async function () {
      const client1_balance = await token.balanceOf(client1.address);
      const client2_balance_before = await token.balanceOf(client2.address);

      expect(client1_balance).to.equal(airdropValue);

      await token.connect(bridgeAddr).burn(client1.address, burnValue);

      const client2_balance_after_burn = await token.balanceOf(client2.address);
      expect(client2_balance_before).to.equal(client2_balance_after_burn);
    });

    it("Correct balance change after mint", async function () {
      const client1_balance = await token.balanceOf(client1.address);
      const client2_balance_before = await token.balanceOf(client2.address);

      expect(client1_balance).to.equal(airdropValue);

      await token.connect(bridgeAddr).mint(client1.address, burnValue);

      const client2_balance_after_mint = await token.balanceOf(client2.address);
      expect(client2_balance_before).to.equal(client2_balance_after_mint);
    });
  });
});

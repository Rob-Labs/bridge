const { expect } = require("chai");
const { ethers } = require("hardhat");
// const dotenv = require("dotenv");

const uniswapV2RouterAbi = require("./abi/IUniswapV2Router02.json").abi;
const uniswapV2PairAbi = require("./abi/IUniswapV2Pair.json").abi;
const uniswapV2RouterAddress = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
const deadAddress = "0x000000000000000000000000000000000000dEaD";

const airdropValue = ethers.utils.parseUnits("2000", 9);

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
    await token.enableTrading();

    // airdrop 2000 Empire to client1 - client10
    await token.transfer(client1.address, airdropValue);
    await token.transfer(client2.address, airdropValue);
    await token.transfer(client3.address, airdropValue);
    await token.transfer(client4.address, airdropValue);
    await token.transfer(client5.address, airdropValue);
    await token.transfer(client6.address, airdropValue);
    await token.transfer(client7.address, airdropValue);
    await token.transfer(client8.address, airdropValue);
    await token.transfer(client9.address, airdropValue);
    await token.transfer(client10.address, airdropValue);
  });

  describe("Reflection and Fee Test", function () {
    describe("Transfer between account", function () {
      it("Transfer between include in fee address", async function () {
        // Transfer 200 tokens from client1 to client2
        const transferValue = ethers.utils.parseUnits("200", 9);
        await token.connect(client1).transfer(client2.address, transferValue);
        expect(await token.balanceOf(client1.address)).to.equal(
          airdropValue.sub(transferValue)
        );
        expect(await token.balanceOf(client2.address)).to.equal(
          airdropValue.add(transferValue)
        );
      });
    });
  });
});

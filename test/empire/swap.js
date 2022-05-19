const { expect } = require("chai");
const { ethers } = require("hardhat");

const MaxUint256 = ethers.constants.MaxUint256;
// const dotenv = require("dotenv");

const uniswapV2RouterAbi = require("./abi/IUniswapV2Router02.json").abi;
const uniswapV2PairAbi = require("./abi/IUniswapV2Pair.json").abi;
const WBNBAbi = require("./abi/WBNB.json").abi;
const uniswapV2RouterAddress = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
const deadAddress = "0x000000000000000000000000000000000000dEaD";

const airdropValue = ethers.utils.parseUnits("2000", 9);

const deployerPkey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

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

  let routerContract;
  let pairContract;
  let pair0token;
  let pair1token;
  let WBNBContract;

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

    const empirePair = await token.uniswapV2Pair();

    routerContract = new ethers.Contract(
      uniswapV2RouterAddress,
      uniswapV2RouterAbi,
      ethers.provider
    );

    pairContract = new ethers.Contract(
      empirePair,
      uniswapV2PairAbi,
      ethers.provider
    );

    pair0token = await pairContract.token0();
    pair1token = await pairContract.token1();
    const wbnbAddress = await routerContract.WETH();

    WBNBContract = new ethers.Contract(wbnbAddress, WBNBAbi, ethers.provider);
  });

  describe("Integrate with Pancakeswap / AMM", function () {
    beforeEach(async function () {
      // add liquidity first
      const deployerInitialBalance = await token.balanceOf(deployer.address);

      // 500 BNB to liquidity
      const amountBNBToaddLiquidity = ethers.utils.parseUnits("500", 18);

      // approve first
      await token
        .connect(deployer)
        .approve(uniswapV2RouterAddress, deployerInitialBalance);

      // add liquidity when success
      //its always emit Mint and Sync on pair address

      await routerContract
        .connect(deployer)
        .addLiquidityETH(
          token.address,
          deployerInitialBalance,
          deployerInitialBalance,
          amountBNBToaddLiquidity,
          deployer.address,
          Math.floor(Date.now() / 1000) + 60 * 10,
          { value: amountBNBToaddLiquidity }
        );
    });
    describe("Swap Test", function () {
      it("Should be able to buy Empire", async function () {
        let client1EmpireBalance = await token.balanceOf(client1.address);

        //try to buy 1BNB
        const buyValue = ethers.utils.parseUnits("1", 18);

        const [amountIn, bnbIn] = await routerContract
          .connect(client1)
          .getAmountsIn(buyValue, [pair0token, pair1token]);

        // set slippage to 20% because pice impact to high
        const amountOutMin = amountIn.mul(80).div(100);
        expect(
          await routerContract
            .connect(client1)
            .swapExactETHForTokens(
              amountOutMin,
              [pair1token, pair0token],
              client1.address,
              MaxUint256,
              { value: buyValue }
            )
        )
          .to.emit(WBNBContract, "Deposit")
          .withArgs(routerContract.address, buyValue)
          .to.emit(WBNBContract, "Transfer")
          .withArgs(routerContract.address, pairContract.address, buyValue)
          .to.emit(token, "Transfer")
          .to.emit(pairContract, "Sync")
          .to.emit(pairContract, "Swap");

        let client1EmpireBalanceAfter = await token.balanceOf(client1.address);

        // client1 balance change
        expect(client1EmpireBalanceAfter.toNumber()).greaterThan(
          client1EmpireBalance.toNumber()
        );
      });
      it("Should be able to sell Empire", async function () {
        const client1EmpireBalance = await token.balanceOf(client1.address);

        //try to buy 1BNB
        const buyValue = ethers.utils.parseUnits("1", 18);

        const [amountIn, bnbIn] = await routerContract
          .connect(client1)
          .getAmountsIn(buyValue, [pair0token, pair1token]);

        // set slippage to 20% because pice impact to high
        const amountOutMin = amountIn.mul(80).div(100);
        expect(
          await routerContract
            .connect(client1)
            .swapExactETHForTokens(
              amountOutMin,
              [pair1token, pair0token],
              client1.address,
              MaxUint256,
              { value: buyValue }
            )
        )
          .to.emit(WBNBContract, "Deposit")
          .withArgs(routerContract.address, buyValue)
          .to.emit(WBNBContract, "Transfer")
          .withArgs(routerContract.address, pairContract.address, buyValue)
          .to.emit(token, "Transfer")
          .to.emit(pairContract, "Sync")
          .to.emit(pairContract, "Swap");

        const client1EmpireBalanceAfter = await token.balanceOf(
          client1.address
        );

        // client1 balance change
        expect(client1EmpireBalanceAfter.toNumber()).greaterThan(
          client1EmpireBalance.toNumber()
        );

        /**
         * sell test
         */

        await token
          .connect(client1)
          .approve(routerContract.address, client1EmpireBalanceAfter);

        expect(
          await routerContract
            .connect(client1)
            .swapExactTokensForETH(
              client1EmpireBalanceAfter,
              0,
              [pair0token, pair1token],
              client1.address,
              MaxUint256
            )
        );

        const client1EmpireBalanceAfterSell = await token.balanceOf(
          client1.address
        );

        expect(client1EmpireBalanceAfterSell.toNumber()).equal(0);
      });
    });
  });
});

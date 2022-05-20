const { expect } = require("chai");
const { ethers } = require("hardhat");

const utils = ethers.utils;
const parseUnits = utils.parseUnits;
const MaxUint256 = ethers.constants.MaxUint256;
// const dotenv = require("dotenv");

const uniswapV2RouterAbi = require("./abi/IUniswapV2Router02.json").abi;
const uniswapV2PairAbi = require("./abi/IUniswapV2Pair.json").abi;
const WBNBAbi = require("./abi/WBNB.json").abi;
const uniswapV2RouterAddress = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
const deadAddress = "0x000000000000000000000000000000000000dEaD";

const airdropValue = parseUnits("100000", 9);

describe("Empire Token Reflection and Fee Test", function () {
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

  let routerContract;
  let pairContract;
  let WBNBContract;

  let buyPath;
  let sellPath;

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
    const wbnbAddress = await routerContract.WETH();

    WBNBContract = new ethers.Contract(wbnbAddress, WBNBAbi, ethers.provider);
    buyPath = [wbnbAddress, token.address];
    sellPath = [token.address, wbnbAddress];

    // deployer set AMM to activate buy and sell tax
    await token.setAutomatedMarketMakerPair(empirePair);

    /**
     *
     * deployer make airdrop to 10 address which each address
     * got 100.000 Empire
     *
     */

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

  //   describe("Transfer between account, exclude AMM Pair address", function () {
  //     it("Should doesn't takes fee when transfer between wallets", async function () {
  //       // we know client 1 -10 have airdrop balance 100.000 Empire
  //       const initialClientBalance = airdropValue;

  //       // amount to transfer
  //       const transferAmount = parseUnits("10000", 9);

  //       /**
  //        * expect empire token to emit Transfer
  //        */
  //       expect(
  //         await token.connect(client1).transfer(client2.address, transferAmount)
  //       ).to.emit(token, "Transfer");

  //       /**
  //        * balance client 1 decrease to 90.000
  //        */
  //       expect(await token.balanceOf(client1.address)).to.equal(
  //         initialClientBalance.sub(transferAmount)
  //       );
  //       /**
  //        * balance client2 increase to 110.0000
  //        */
  //       expect(await token.balanceOf(client2.address)).to.equal(
  //         initialClientBalance.add(transferAmount)
  //       );
  //     });

  //   });

  describe("Transfer from or to AMM Pair address (Buy Sell Transfer)", function () {
    beforeEach(async function () {
      // add liquidity first before each test

      // initial deployer balance = 999.000.000 (1.000.000.000 - 1.000.000)
      // because 1 million already sent to airdrop
      const deployerInitialBalance = await token.balanceOf(deployer.address);

      // 500.000.000 Empire to add liquidity
      const amountEmpireToaddLiquidity = parseUnits("500000000", 9);

      // 500 BNB to liquidity
      const amountBNBToaddLiquidity = ethers.utils.parseUnits("500", 18);

      // deployer approve all balance
      await token
        .connect(deployer)
        .approve(uniswapV2RouterAddress, deployerInitialBalance);

      // deployer set initial liquidity to
      // 500M EMPIRE : 500 BNB
      // it expect when buy 1 BNB get close to 1M EMPIRE

      await routerContract
        .connect(deployer)
        .addLiquidityETH(
          token.address,
          amountEmpireToaddLiquidity,
          amountEmpireToaddLiquidity,
          amountBNBToaddLiquidity,
          deployer.address,
          Math.floor(Date.now() / 1000) + 60 * 10,
          { value: amountBNBToaddLiquidity }
        );
    });

    it("Make sure we already add Liquidity", async function () {
      // check deployer balance
      // it should be 499M Empire
      expect(await token.balanceOf(deployer.address)).equal(
        parseUnits("499000000", 9)
      );

      // check pair address balance
      // it should be 500M Empire
      expect(await token.balanceOf(pairContract.address)).equal(
        parseUnits("500000000", 9)
      );

      // check pair address balance
      // it should be 500 WBNB
      expect(await WBNBContract.balanceOf(pairContract.address)).equal(
        parseUnits("500", 18)
      );
    });

    it("Should be take correct fee when buy Empire", async function () {
      /**
       *
       * as we know, on before each hook deployer make airdrop to client 1-10
       * so client 1-10 have same 100.000 EMPIRE initial balance
       *
       * and also marketing, team, and contract balance is 0 at initial state
       *
       */

      const initialClient1Balance = airdropValue;
      const initialClient2Balance = airdropValue;
      const initialClient3Balance = airdropValue;
      const initialClient4Balance = airdropValue;
      const initialClient5Balance = airdropValue;
      const initialClient6Balance = airdropValue;
      const initialClient7Balance = airdropValue;
      const initialClient8Balance = airdropValue;
      const initialClient9Balance = airdropValue;
      const initialClient10Balance = airdropValue;

      const initialMarketingBalance = ethers.BigNumber.from("0");
      const initialTeamBalance = ethers.BigNumber.from("0");
      const initialContractBalance = ethers.BigNumber.from("0");

      /**
       * make sure we check buy fee and sell fee first
       *
       * total buyFee = 10 %
       *    - autoLp = 4
       *    - burn = 0
       *    - marketing = 3
       *    - tax (reflection) = 2
       *    - team = 1
       * total sellFee = 10
       *    - autoLp = 4
       *    - burn = 0
       *    - marketing = 3
       *    - tax (reflection) = 2
       *    - team = 1
       *
       */

      const tokenBuyFee = await token.buyFee();
      const tokenSellFee = await token.sellFee();

      // check buy fee
      expect(tokenBuyFee.autoLp.toNumber()).equal(4);
      expect(tokenBuyFee.burn.toNumber()).equal(0);
      expect(tokenBuyFee.marketing.toNumber()).equal(3);
      expect(tokenBuyFee.tax.toNumber()).equal(2);
      expect(tokenBuyFee.team.toNumber()).equal(1);

      // check sell fee
      expect(tokenSellFee.autoLp.toNumber()).equal(4);
      expect(tokenSellFee.burn.toNumber()).equal(0);
      expect(tokenSellFee.marketing.toNumber()).equal(3);
      expect(tokenSellFee.tax.toNumber()).equal(2);
      expect(tokenSellFee.team.toNumber()).equal(1);

      /**
       * lets try to perform buy
       */

      // try to buy 1BNB
      //   const buyEmpireInBNBValue = ethers.utils.parseUnits("1", 18);

      //   expect(
      //     await routerContract
      //       .connect(client1)
      //       .swapExactETHForTokens(0, buyPath, client1.address, MaxUint256, {
      //         value: buyEmpireInBNBValue,
      //       })
      //   )
      //     .to.emit(WBNBContract, "Deposit")
      //     .withArgs(routerContract.address, buyEmpireInBNBValue)
      //     .to.emit(WBNBContract, "Transfer")
      //     .withArgs(
      //       routerContract.address,
      //       pairContract.address,
      //       buyEmpireInBNBValue
      //     )
      //     .to.emit(token, "Transfer")
      //     .to.emit(pairContract, "Sync")
      //     .to.emit(pairContract, "Swap");

      //   let client1EmpireBalanceAfter = await token.balanceOf(client1.address);

      //   // client1 balance change
      //   expect(client1EmpireBalanceAfter.toNumber()).greaterThan(
      //     client1EmpireBalance.toNumber()
      //   );
    });

    // it("Should be able to sell Empire", async function () {
    //   const client1EmpireBalance = await token.balanceOf(client1.address);

    //   //try to buy 1BNB
    //   const buyValue = ethers.utils.parseUnits("1", 18);

    //   expect(
    //     await routerContract
    //       .connect(client1)
    //       .swapExactETHForTokens(0, buyPath, client1.address, MaxUint256, {
    //         value: buyValue,
    //       })
    //   )
    //     .to.emit(WBNBContract, "Deposit")
    //     .withArgs(routerContract.address, buyValue)
    //     .to.emit(WBNBContract, "Transfer")
    //     .withArgs(routerContract.address, pairContract.address, buyValue)
    //     .to.emit(token, "Transfer")
    //     .to.emit(pairContract, "Sync")
    //     .to.emit(pairContract, "Swap");

    //   const client1EmpireBalanceAfter = await token.balanceOf(client1.address);

    //   // client1 balance change
    //   expect(client1EmpireBalanceAfter.toNumber()).greaterThan(
    //     client1EmpireBalance.toNumber()
    //   );

    //   /**
    //    * sell test
    //    */

    //   await token
    //     .connect(client1)
    //     .approve(routerContract.address, client1EmpireBalanceAfter);

    //   expect(
    //     await routerContract
    //       .connect(client1)
    //       .swapExactTokensForETH(
    //         client1EmpireBalanceAfter,
    //         0,
    //         sellPath,
    //         client1.address,
    //         MaxUint256
    //       )
    //   );

    //   const client1EmpireBalanceAfterSell = await token.balanceOf(
    //     client1.address
    //   );

    //   expect(client1EmpireBalanceAfterSell.toNumber()).equal(0);
    // });
  });
});

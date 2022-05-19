const { expect } = require("chai");
const { ethers } = require("hardhat");

const zeroAddress = "0x0000000000000000000000000000000000000000";

describe("Bridge Test", function () {
  let validator;
  let feeReceiver;
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
  let newValidator;
  let newFeeReceiver;
  let newWallet;
  let addrs;

  let empireToken;
  let bridge;

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
      validator,
      feeReceiver,
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
      newValidator,
      newFeeReceiver,
      newWallet,
      ...addrs
    ] = await ethers.getSigners();
    // Deploy contract
    const Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy(feeReceiver.address);
    await bridge.deployed();
  });

  // describe("Deployment", function () {
  //   it("Should correct Fee Receiver address", async function () {
  //     expect(await bridge.feeRecevier()).to.equal(feeReceiver.address);
  //   });
  // });

  // describe("Functional Test", function () {
  //   describe("Function updateChainById", function () {
  //     it("Should add supported chain by chainID", async function () {
  //       // should emit log
  //       expect(
  //         await bridge.connect(validator).updateChainById(1, true)
  //       ).to.emit(bridge, "LogSupportedChain");

  //       // final expect
  //       expect(await bridge.activeChainIds(1)).to.equal(true);
  //     });

  //     it("Should remove supported chain by chainID", async function () {
  //       // should emit log
  //       expect(
  //         await bridge.connect(validator).updateChainById(1, false)
  //       ).to.emit(bridge, "LogSupportedChain");

  //       // final expect
  //       expect(await bridge.activeChainIds(1)).to.equal(false);
  //     });
  //   });

  //   describe("Function updateDecimal", function () {
  //     it("Should update native currency decimal and emit Log", async function () {
  //       // should emit log
  //       expect(await bridge.connect(validator).updateDecimal(9)).to.emit(
  //         bridge,
  //         "LogUpdateDecimal"
  //       );

  //       // final expect
  //       expect(await bridge.nativeDecimal()).to.equal(9);
  //     });
  //   });

  //   describe("Function updateFee", function () {
  //     it("Should update Fee and emit Log", async function () {
  //       // should emit log
  //       expect(await bridge.connect(validator).updateFee(100)).to.emit(
  //         bridge,
  //         "LogFeeUpdated"
  //       );

  //       // final expect
  //       expect(await bridge.fee()).to.equal(100);
  //     });
  //   });

  //   describe("Function updateFeeRecevier", function () {
  //     it("Should update Fee Recevier address and emit Log", async function () {
  //       // add supported ETH chain
  //       await bridge
  //         .connect(validator)
  //         .updateFeeRecevier(newFeeReceiver.address);

  //       // should emit log
  //       expect(
  //         await bridge
  //           .connect(validator)
  //           .updateFeeRecevier(newFeeReceiver.address)
  //       ).to.emit(bridge, "LogFeeUpdated");

  //       // final expect
  //       expect(await bridge.feeRecevier()).to.equal(newFeeReceiver.address);
  //     });
  //   });

  //   describe("Function updateValidator", function () {
  //     it("Should update Validator address and emit Log", async function () {
  //       // should emit log
  //       expect(
  //         await bridge.connect(validator).updateValidator(newValidator.address)
  //       ).to.emit(bridge, "LogFeeUpdated");

  //       // final expect
  //       expect(await bridge.validator()).to.equal(newValidator.address);
  //     });
  //   });

  //   describe("Function receive and fallback", function () {
  //     it("Should be able receive Native Currency and emit log", async function () {
  //       const initialBridgeBalance = await ethers.provider.getBalance(
  //         bridge.address
  //       );
  //       expect(
  //         await client1.sendTransaction({
  //           to: bridge.address,
  //           value: ethers.utils.parseEther("2", "ether"),
  //         })
  //       ).to.emit(bridge, "LogReceive");
  //       const BridgeBalance = await ethers.provider.getBalance(bridge.address);
  //       // final expect
  //       expect(BridgeBalance).to.equal(ethers.utils.parseEther("2", "ether"));
  //     });
  //   });

  //   describe("Function withdrawNative", function () {
  //     it("Should be able to withdraw Native to given address parameter Currency and emit log", async function () {
  //       await client1.sendTransaction({
  //         to: bridge.address,
  //         value: ethers.utils.parseEther("2", "ether"),
  //       });

  //       const initialBridgeBalance = await ethers.provider.getBalance(
  //         bridge.address
  //       );

  //       const initialValidatorBalance = await ethers.provider.getBalance(
  //         validator.address
  //       );
  //       expect(
  //         await bridge.connect(validator).withdrawNative(validator.address)
  //       ).to.emit(bridge, "LogWithdrawalNative");

  //       const BridgeBalance = await ethers.provider.getBalance(bridge.address);
  //       const ValidatorBalance = await ethers.provider.getBalance(
  //         validator.address
  //       );
  //       // final expect
  //       expect(BridgeBalance).to.not.equal(initialBridgeBalance);
  //       expect(ValidatorBalance).to.not.equal(initialValidatorBalance);
  //     });
  //   });
  // });

  describe("Integration Test including SWAP and REDEEM", function () {
    beforeEach(async function () {
      // Deploy Empire contract
      const EmpireToken = await ethers.getContractFactory("EmpireToken");
      empireToken = await EmpireToken.deploy(
        marketingWallet.address,
        teamWallet.address
      );
      await empireToken.deployed();
      await empireToken.enableTrading();
      await empireToken.setBridge(bridge.address);
    });

    describe("Function includeToken", function () {
      it("Should add supported EmpireToken on bridge and emit log", async function () {
        const empireSymbol = await empireToken.symbol();

        expect(
          await bridge
            .connect(validator)
            .includeToken(empireSymbol, empireToken.address)
        ).to.emit(bridge, "LogAddSupportedToken");

        // final expect
        expect(await bridge.tickerToToken(empireSymbol)).to.equal(
          empireToken.address
        );
      });
    });

    describe("Function excludeToken", function () {
      it("Should remove supported EmpireToken on bridge and emit log", async function () {
        const empireSymbol = await empireToken.symbol();
        expect(
          await bridge.connect(validator).excludeToken(empireSymbol)
        ).to.emit(bridge, "LogRemooveSupportedToken");

        expect(await bridge.tickerToToken(empireSymbol)).to.equal(zeroAddress);
      });
    });

    describe("Function withdrawERC20", function () {
      it("Should be able withdraw ERC20 on bridge and emit log", async function () {
        const empireSymbol = await empireToken.symbol();
        const empireDecimal = await empireToken.decimals();
        const transferValue = ethers.utils.parseUnits("200", empireDecimal);

        // send empire token to bridge
        // use validator because deployer of empire is validator
        await empireToken
          .connect(validator)
          .transfer(bridge.address, transferValue);

        expect(await empireToken.balanceOf(bridge.address)).to.equal(
          transferValue
        );

        // withdraw ERC20 to client1

        expect(
          await bridge
            .connect(validator)
            .withdrawERC20(empireToken.address, client1.address)
        ).to.emit(bridge, "LogWithdrawalERC20");

        expect(await empireToken.balanceOf(client1.address)).to.equal(
          transferValue
        );
      });
    });

    describe("Function Swap and Redeem", function () {
      beforeEach(async function () {
        // Send Airdrop from validator to client
        // so client be able to swap
        const empireDecimal = await empireToken.decimals();
        const empireSymbol = await empireToken.symbol();
        const airdropValue = ethers.utils.parseUnits("2000", empireDecimal);

        await empireToken.transfer(client1.address, airdropValue);
        await empireToken.transfer(client2.address, airdropValue);
        await empireToken.transfer(client3.address, airdropValue);

        // include empire in bridge
        await bridge.includeToken(empireSymbol, empireToken.address);

        // add supported chain
        await bridge.updateChainById(3, true);
      });

      it("Should be Revert or Fail when Fee below expected Fee", async function () {
        const swapValue = ethers.utils.parseUnits("200", 9);

        const { chainId } = await ethers.provider.getNetwork();
        const chainTo = 97;

        // try to swap with 2 wei fee
        const fee = {
          value: ethers.utils.parseUnits("2", "wei"),
        };

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainId, fee)
        ).to.not.emit(bridge, "LogSwapInitialized");

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainId, fee)
        ).to.be.revertedWith("Swap fee is not fulfilled");
      });

      it("Should be Revert or Fail when Wrong Chain From", async function () {
        const swapValue = ethers.utils.parseUnits("200", 9);

        // try to send from wrong chain from
        const chainFrom = 123456;
        const chainTo = 97;

        const feeAmount = await bridge.calculateFee();
        const fee = {
          value: feeAmount,
        };

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainFrom, fee)
        ).to.not.emit(bridge, "LogSwapInitialized");

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainFrom, fee)
        ).to.be.revertedWith("invalid chainFrom");
      });

      it("Should be Revert or Fail when Wrong Chain To", async function () {
        const swapValue = ethers.utils.parseUnits("200", 9);

        // try to send from wrong chain from
        const { chainId } = await ethers.provider.getNetwork();
        const chainTo = 1;

        const feeAmount = await bridge.calculateFee();
        const fee = {
          value: feeAmount,
        };

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainId, fee)
        ).to.not.emit(bridge, "LogSwapInitialized");

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainId, fee)
        ).to.be.revertedWith("ChainTo is not Active");
      });

      it("Should be Revert or Fail when amount swap is higher than balance", async function () {
        // try to send higher token than client have
        const swapValue = ethers.utils.parseUnits("20000", 9);

        const { chainId } = await ethers.provider.getNetwork();
        const chainTo = 3;

        const feeAmount = await bridge.calculateFee();
        const fee = {
          value: feeAmount,
        };

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainId, fee)
        ).to.not.emit(bridge, "LogSwapInitialized");

        expect(
          bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainId, fee)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });

      it("Should be Success Swap", async function () {
        const swapValue = ethers.utils.parseUnits("200", 9);

        const client1EmpireBalanceBeforeSwap = await empireToken.balanceOf(
          client1.address
        );

        const { chainId } = await ethers.provider.getNetwork();
        const chainTo = 3;

        const feeAmount = await bridge.calculateFee();
        const fee = {
          value: feeAmount,
        };

        expect(
          await bridge
            .connect(client1)
            .swap(client1.address, swapValue, "EMPIRE", chainTo, chainId, fee)
        ).to.emit(bridge, "LogSwapInitialized");

        const client1EmpireBalanceAfterSwap = await empireToken.balanceOf(
          client1.address
        );

        // because empire token has fee's of transfer / burn
        // and balance calculated by totalsupply
        // I just expect current clinet balance less than balancebefore - swap amount

        expect(client1EmpireBalanceAfterSwap.toNumber()).to.be.lessThanOrEqual(
          client1EmpireBalanceBeforeSwap.sub(swapValue).toNumber()
        );
      });
    });

    // swap
    // redeem
  });
});

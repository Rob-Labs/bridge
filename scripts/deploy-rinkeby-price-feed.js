const hre = require("hardhat");

const fee = "40";
async function main() {
  const PriceFeed = await hre.ethers.getContractFactory("ETHPrice");
  const priceFeed = await PriceFeed.deploy(fee);

  await priceFeed.deployed();

  console.log("Eth USD price feed deployed to:", priceFeed.address);

  try {
    await hre.run('verify', {
      address: priceFeed.address,
      constructorArgsParams: [fee]
    });
  } catch (error) {
    console.log(error)
    console.log(
      `Eth USD price feed Smart contract at address ${priceFeed.address} is already verified`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

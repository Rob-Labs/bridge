require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

require('dotenv').config()
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity:{
    compilers:[
      {
        version: "0.8.7",
        settings: {
          optimizer:{
            enabled: true,
            runs: 200
          }
        }
      },
    ],
  },

  networks: {
    bscTestnet: {
      live: true,
      saveDeployments: true,
      timeout: 8000000,
      gasPrice: "auto",
      accounts: [process.env.PRIVATE_KEY],
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
    },
    mumbai: {
      live: true,
      saveDeployments: true,
      timeout: 8000000,
      gasPrice: "auto",
      accounts: [process.env.PRIVATE_KEY],
      url: `https://rpc-mumbai.matic.today`,
    },
    rinkeby: {
      live: true,
      saveDeployments: true,
      timeout: 8000000,
      gasPrice: "auto",
      accounts: [process.env.PRIVATE_KEY],
      url: `https://rinkeby.infura.io/v3/14fe189e3976469698f6a9e45ca61200`,
    },
  },

  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGON_API_KEY,
      rinkeby: process.env.RINKEBY_API_KEY,
      bscTestnet: process.env.BINANCE_API_KEY
    }
  }
};

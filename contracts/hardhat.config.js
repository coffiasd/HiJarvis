require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    zen: {
      url: 'https://gobi-testnet.horizenlabs.io/ethv1',
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: "auto"
    },
  }
}
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    'zora-goerli': {
      url: 'https://testnet.rpc.zora.energy/',
      accounts: [process.env.PRIVATE_KEY],
    }
  }
}
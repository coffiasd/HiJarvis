// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

    // const lockedAmount = hre.ethers.utils.parseEther("1");
    // const Swap = await hre.ethers.getContractFactory("SwapERC20");
    const swap = await hre.ethers.deployContract("SwapERC20", ["0xEaB08b7987fAfB772b578236c9CAd4202DD11542", "0xFFA1753833c5643D512eBc1Ace2c96AAf3861bdC", "0x52bf58425cAd0B50fFcA8Dbe5447dcE9420a2610", 0]);

    await swap.waitForDeployment();

    console.log(
        `deployed to ${swap.target}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

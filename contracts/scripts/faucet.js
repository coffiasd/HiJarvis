// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

    // const lockedAmount = hre.ethers.utils.parseEther("1");
    const Faucet = await hre.ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy("usdc", "USDC");

    await faucet.waitForDeployment();

    console.log(
        `deployed to ${faucet.target}`
    );

    await faucet.requestTokens();

    console.log(await faucet.balanceOf("0x52bf58425cAd0B50fFcA8Dbe5447dcE9420a2610"));

    const Faucet2 = await hre.ethers.getContractFactory("Faucet");
    const faucet2 = await Faucet2.deploy("weth", "WETH");

    await faucet2.waitForDeployment();

    console.log(
        `deployed to ${faucet2.target}`
    );

    await faucet2.requestTokens();

    console.log(await faucet2.balanceOf("0x52bf58425cAd0B50fFcA8Dbe5447dcE9420a2610"));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

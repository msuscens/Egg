const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const EggToken = artifacts.require("EggToken")

const EGG_TOKEN_NAME = "Egg (Dragon-Masters)"
const EGG_TOKEN_SYMBOL = "EGG-DM"
const EGG_GEN0_LIMIT = 100


module.exports = async function (deployer, network, accounts) {

    // Deploy the EggToken (proxy & logic contracts)
    await deployProxy(
        EggToken, 
        [EGG_TOKEN_NAME, EGG_TOKEN_SYMBOL, EGG_GEN0_LIMIT], 
        {deployer, initializer: 'init_EggToken', from: accounts[0]}
    )
}

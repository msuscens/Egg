const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const EggToken = artifacts.require("EggToken")

const EGG_TOKEN_NAME = "Egg (Dragon-Masters)"
const EGG_TOKEN_SYMBOL = "EGG-DM"
const EGG_GEN0_LIMIT = 100

contract("2.1 EggToken - Contract Deployment", async accounts => {

    "use strict"

    let eggToken

    before("Deploy EggToken contract", async function() {

        // Deploy EggToken proxy (and'logic' contract)
        await truffleAssert.passes(
            eggToken = await deployProxy(
                EggToken,
                [EGG_TOKEN_NAME, EGG_TOKEN_SYMBOL, EGG_GEN0_LIMIT],
                {initializer: 'init_EggToken', from: accounts[0]}
            ),
            "Failed to deployProxy for EggToken contract"
        )
    })

      
    describe("Initial Deployed Contract State", () => {

        it ("should have the expected owner", async () => {
            let owner
            await truffleAssert.passes(
                owner = await eggToken.owner(),
                "Unable to get owner!"
            )
            assert.deepStrictEqual(owner, accounts[0])
        })

        it ("should have the expected token name", async () => {
            let name
            await truffleAssert.passes(
                name = await eggToken.name(),
                "Unable to get token name!"
            )
            assert.deepStrictEqual(name, EGG_TOKEN_NAME)
        })

        it ("should have the expected token symbol", async () => {
            let symbol
            await truffleAssert.passes(
                symbol = await eggToken.symbol(),
                "Unable to get token symbol!"
            )
            assert.deepStrictEqual(symbol, EGG_TOKEN_SYMBOL)
        })

        it (`should have the given Gen0 Egg limit (of ${EGG_GEN0_LIMIT}) on tokens`, async () => {
            let limit
            await truffleAssert.passes(
                limit = await eggToken.getGen0Limit(),
                "Unable to get eggToken contract's gen0 token limit!"
            )
            assert.deepStrictEqual(
                Number(limit),
                EGG_GEN0_LIMIT,
                `There is a Gen0 limit of ${limit} tokens set but expected limit was ${EGG_GEN0_LIMIT}!`
            )
        })

        it ("should NOT have any Egg tokens", async () => {
            let total
            await truffleAssert.passes(
                total = await eggToken.totalSupply(),
                "Unable to get token's total supply"
            )
            assert.deepStrictEqual(
                Number(total),
                0,
                `There are ${total} tokens but expected 0!`
            )
            await truffleAssert.reverts(
                eggToken.getEgg(0),
                "getEgg: No such egg!"
            )
        })
    })
})
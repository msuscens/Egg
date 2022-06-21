const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const EggToken = artifacts.require("EggToken")

const EGG_TOKEN_NAME = "Egg (Dragon-Masters)"
const EGG_TOKEN_SYMBOL = "EGG-DM"
const EGG_GEN0_LIMIT = 10

const SubSpecies = {Earth: 0, Fire: 1, Air: 2, Water: 3}
Object.freeze(SubSpecies)


//Function to convert string to big number
const toBN = web3.utils.toBN

// Function to convert an array (of string format numbers) into array of Numbers
const toNumbers = arr => arr.map(Number)  


contract("2.3 EggToken - mintGen0EggTo", async accounts => {

    "use strict"

    let eggToken

    before("Deploy Egg Contract", async function() {

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


    describe("Minting Generation 0 Eggs", () => {

        it ("should NOT allow non-owner (of EggToken contract) to mint Gen0 Eggs", async () => {

            await truffleAssert.reverts(
                eggToken.mintGen0EggTo(accounts[1], {from:accounts[1]}),
                "Ownable: caller is not the owner"
            )
        })

        let txResult

        it ("should allow owner to mintGen0EggTo, emitting EggGen0Minted event", async () => {
                
            await truffleAssert.passes(
                txResult = await eggToken.mintGen0EggTo(
                    accounts[0],
                    {from:accounts[0]}
                ),
                `Unable to mint Gen0 egg (eggId 0) to accounts[0]!`
            )

            truffleAssert.eventEmitted(txResult, 'EggGen0Minted', (ev) => {

                return ev.eggId == 0 && ev.owner == accounts[0]

            }, "Event EggGen0Minted has incorrect parameter values!")

            let eggOwner
            await truffleAssert.passes(
                eggOwner = await eggToken.ownerOf(
                    0 //eggId
                ),
                `Unable get egg's owner (for eggId 0)!`
            )
            assert.deepStrictEqual(
                eggOwner,
                accounts[0],
                `Owner of gen0 Egg (eggId 0) is: ${eggOwner}) but was expecting it to be: ${accounts[0]}`
            )
        })

        it ("should keep total of minted Gen0 Eggs & Egg total supply", async () => {
            
            //STATE: 1x Gen0 egg minted (with no eggs of later generations)

            let amountGen0Eggs
            await truffleAssert.passes(
                amountGen0Eggs = await eggToken.getAmountGen0EggsMinted(),
                `Failed to get the total number of Gen0 Egg tokens!`
            )
            assert.deepStrictEqual(
                Number(amountGen0Eggs),
                1,
                `Total of Gen0 Egg tokens minted is ${Number(amountGen0Eggs)} but total of 1 expected!`
            )

            let totalSupply
            await truffleAssert.passes(
                totalSupply = await eggToken.totalSupply(),
                `Failed to get the total supply of Egg tokens!`
            )
            assert.deepStrictEqual(
                Number(totalSupply),
                1,
                `Total supply of Egg tokens is ${Number(totalSupply)} but was expected it to be 1!`
            )
        })

        it ("should have total supply == Gen0 Eggs (provided only Gen0 eggs exist with none hatched)", async () => {

            let amountGen0Eggs
            await truffleAssert.passes(
                amountGen0Eggs = await eggToken.getAmountGen0EggsMinted(),
                `Failed to get the total number of Gen0 Egg tokens!`
            )
            let totalSupply
            await truffleAssert.passes(
                totalSupply = await eggToken.totalSupply(),
                `Failed to get the total supply of Egg tokens!`
            )
            assert.deepStrictEqual(
                Number(amountGen0Eggs),
                Number(totalSupply),
                `Total Gen0 Egg tokens minted (${Number(amountGen0Eggs)}) should currently match total supply ${Number(totalSupply)}!`
            )
        })

        it (`should allow (owner) to mint upto ${EGG_GEN0_LIMIT} Gen0 Eggs, emitting EggGen0Minted events`, async () => {

            for (let i=1; i<EGG_GEN0_LIMIT; i++) {
                
                await truffleAssert.passes(
                    txResult = await eggToken.mintGen0EggTo(
                        accounts[1],
                        {from:accounts[0]}
                    ),
                    `Unable to mint Gen0 egg (eggId ${i})!`
                )
                truffleAssert.eventEmitted(txResult, 'EggGen0Minted', (ev) => {
                    return ev.eggId == i && ev.owner == accounts[1]
                }, "Event EggGen0Minted has incorrect parameter values!")
            }
            let amountGen0Eggs
            await truffleAssert.passes(
                amountGen0Eggs = await eggToken.getAmountGen0EggsMinted(),
                `'Failed to get the total amount of Gen0 Egg tokens minted!`
            )
            assert.deepStrictEqual(
                Number(amountGen0Eggs),
                EGG_GEN0_LIMIT,
                `Total of Gen0 Egg tokens minted is ${Number(amountGen0Eggs)} but total of ${EGG_GEN0_LIMIT} expected!`
            )
        })

        it ("should have expected Gen0 egg details, ie. subspecies etc (of a minted gen0 egg)", async () => {
            
            // Get the block object for last minted Gen0 Egg (see previous test)
            let blockObject
            await truffleAssert.passes(
                blockObject = await web3.eth.getBlock(txResult.receipt.blockNumber),
                "Failed to get the block object!"
            )

            const expectedEgg = {
                subSpecies: SubSpecies.Earth,
                mumId: 0,
                dadId: 0,
                laidTime: blockObject.timestamp,
                incubationStartTime: 0
            }

            let egg
            await truffleAssert.passes(
                egg = await eggToken.getEgg(
                    EGG_GEN0_LIMIT-1 //Last egg minted
                ),
                "Unable to get Egg details of eggId 2!"
            )
            assert.deepStrictEqual(
                toNumbers(egg),
                toNumbers(Object.values(expectedEgg)),
                `Got gen0Egg (eggId 2) as: ${egg}) but was expecting it to be: ${expectedEgg}`
            )
        })

        it (`should NOT allow further gen0 egg minting past the ${EGG_GEN0_LIMIT} maximum limit`, async () => {
            
            await truffleAssert.reverts(
                eggToken.mintGen0EggTo(accounts[1], {from:accounts[0]}),
                "_mintGen0Egg: Hit Gen0 limit!"
            )
            let amountGen0Eggs
            await truffleAssert.passes(
                amountGen0Eggs = await eggToken.getAmountGen0EggsMinted(),
                `'Failed to get the total amount of Gen0 Egg tokens minted!`
            )
            assert.deepStrictEqual(
                Number(amountGen0Eggs),
                EGG_GEN0_LIMIT,
                `Total of Gen0 Egg tokens minted is ${Number(amountGen0Eggs)} but total of ${EGG_GEN0_LIMIT} expected!`
            )
        })
    })
})
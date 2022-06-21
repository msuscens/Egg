const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const timeMachine = require('ganache-time-traveler')

const EggToken = artifacts.require("EggToken")

const EGG_TOKEN_NAME = "Egg (Dragon-Masters)"
const EGG_TOKEN_SYMBOL = "EGG-DM"
const EGG_GEN0_LIMIT = 10

const INCUBATION_DURATION = 60    //Seconds


contract("2.5 EggToken - startIncubation", async accounts => {

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


    before("Mint a Gen0 Egg (eggId 0) to accounts[0]", async function() {

        await truffleAssert.passes(
            eggToken.mintGen0EggTo(
                accounts[0],
                {from:accounts[0]}
            ),
            `Contract owner unable to mint a Gen0 egg!`
        )
    })

    describe("Unit Test: startIncubation", () => {

        it ("should NOT be able to check incubation progress (if incubation hasn't begun)", async () => {

            await truffleAssert.reverts(
                eggToken.checkIncubation(
                    0, //eggId
                    {from: accounts[0]}
                ),
                "checkIncubation: Not begun!"
            )
        })

        it ("should NOT allow a non-owner of an egg to start its incubation", async () => {

            await truffleAssert.reverts(
                eggToken.startIncubation(
                    0, //eggId
                    {from: accounts[1]}
                ),
                "startIncubation: Not egg owner!"
            )

            await truffleAssert.reverts(
                eggToken.startIncubation(
                    0, //eggId
                    {from: accounts[2]}
                ),
                "startIncubation: Not egg owner!"
            )
        })

        let txResult

        it ("should allow egg owner to start to incubation, emitting EggIncubationStarted event", async () => {

            await truffleAssert.passes(
                txResult = await eggToken.startIncubation(
                    0, //eggId
                    {from: accounts[0]}
                ),
                "Egg's owner couldn't start incubation!"
            )

            truffleAssert.eventEmitted(txResult, 'EggIncubationStarted', (ev) => {
                return ev.eggId == 0 && ev.owner == accounts[0] 
            }, "Event EggIncubationStarted has incorrect parameter values!")   
        })

        it ("should allow check an owner to check egg's incubation progress (once being incubated)", async () => {

            // Get the block object for the procreated egg transaction
            let txBlockObject
            await truffleAssert.passes(
                txBlockObject = await web3.eth.getBlock(txResult.receipt.blockNumber),
                "Failed to get the incubation start Tx's block object!"
            )
            let latestBlockObject
            await truffleAssert.passes(
                latestBlockObject = await web3.eth.getBlock("latest"),
                "Failed to get the latest block object!"
            )

            let secondsRemaining
            await truffleAssert.passes(
                secondsRemaining = await eggToken.checkIncubation(
                    0, //eggId
                    {from: accounts[0]}
                ),
                "Egg owner was unable to check incubation time remaining!"
            )
            let expectedRemaining = INCUBATION_DURATION -
                (latestBlockObject.timestamp - txBlockObject.timestamp)

            assert.deepStrictEqual(
                Number(secondsRemaining),
                Number(expectedRemaining),
                `Check of incubation time gave ${secondsRemaining} (seconds) remaining, but was expecting ${expectedRemaining} (seconds)`
            )
        })

        it ("should NOT allow non-owner/operator to check on egg's incubation progress", async () => {

            // Accounts[0] is the owner, Accounts[1] is the eggs's 'specicies
            await truffleAssert.reverts(
                eggToken.checkIncubation(
                    0, //eggId
                    {from: accounts[2]}
                ),
                "checkIncubation: Not Owner/Optr!"
            )
        })

        it ("should NOT allow restart of egg's incubation (after it has already been started)", async () => {

            await truffleAssert.reverts(
                eggToken.startIncubation(
                    0, //eggId
                    {from: accounts[0]}
                ),
                "startIncubation: Already begun!"
            )
            await truffleAssert.reverts(
                eggToken.startIncubation(
                    0, //eggId
                    {from: accounts[1]}
                ),
                "startIncubation: Not egg owner!"
            )
        })
    })

    describe("Unit Test (Future Time): checkIncubation", () => {

        let snapshotId
        before("Capture Current Times State", async() => {
            let snapshot = await timeMachine.takeSnapshot()
            snapshotId = snapshot['result']
        })
     
        after("Revert To Previous Time", async() => {
            await timeMachine.revertToSnapshot(snapshotId)
        })
     
        it ("should allow the owner to determine when egg has completed its incubation ", async () => {

            // Advance time to after the incubation period
            await truffleAssert.passes(
                timeMachine.advanceTimeAndBlock(INCUBATION_DURATION),
                "Failed to advance time and block"
            )

            let timeRemaining
            await truffleAssert.passes(
                timeRemaining = await eggToken.checkIncubation(
                    0, //eggId
                    {from: accounts[0]}
                ),
                "Egg owner was unable to check incubation time remaining!"
            )

            assert.deepStrictEqual(
                Number(timeRemaining),
                0,  //no second remaing
                `Check of incubation time gave ${timeRemaining} (seconds) remaining, but was expecting 0 (seconds)`
            )
        })
    })
})
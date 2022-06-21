const truffleAssert = require("truffle-assertions")
const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const timeMachine = require('ganache-time-traveler')

const EggToken = artifacts.require("EggToken")

const EGG_TOKEN_NAME = "Egg (Dragon-Masters)"
const EGG_TOKEN_SYMBOL = "EGG-DM"
const EGG_GEN0_LIMIT = 10

const INCUBATION_DURATION = 60    //Seconds



contract("2.6 EggToken - Hatch a Gen0 Egg", async accounts => {

    "use strict"

    let eggToken

    before("Deploy Egg contract", async function() {

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

    before("Mint 2x Gen0 Eggs to accounts[2] & Start Incubation", async function() {

        for (let i=0; i<2; i++) {
            await truffleAssert.passes(
                eggToken.mintGen0EggTo(
                    accounts[2],
                    {from:accounts[0]}
                ),
                `Unable to mint Gen0Egg (eggId ${i})!`
            )
            await truffleAssert.passes(
                eggToken.startIncubation(
                    i, //eggId
                    {from: accounts[2]}
                ),
                `Failed to start incubation (of eggId ${i})!`
            )
        }
    })


    describe("Before Incubation complete: Hatch", () => {

        let snapshotId
        beforeEach("Advance Time to Mid-Incubation", async() => {
            let snapshot = await timeMachine.takeSnapshot()
            snapshotId = snapshot['result']

            // Advance time to half-way through incubation
            await truffleAssert.passes(
                timeMachine.advanceTimeAndBlock(
                    Math.abs(INCUBATION_DURATION/2)
                ),
                "Failed to advance time and block"
            )
        })

        afterEach("Revert To Start of Incubation Time", async() => {
            await timeMachine.revertToSnapshot(snapshotId)
        })

        it("should NOT allow egg owner to hatch it", async () => {

            await truffleAssert.reverts(
                eggToken.hatch(
                    0, //eggid
                    {from: accounts[2]}
                ),
                "hatch: Egg is not incubated!"
            )
        })

        it("should NOT allow non-owner of an egg to hatch it", async () => {

            await truffleAssert.reverts(
                eggToken.hatch(
                    0, //eggid
                    {from: accounts[0]}
                ),
                "hatch: Not egg owner!"
            )
        })
    })

     
    describe("After Incubation period: Hatch", () => {

        let snapshotId
        beforeEach("Advance Time to End of Incubation", async() => {

            let snapshot = await timeMachine.takeSnapshot()
            snapshotId = snapshot['result']

            // Incubate for required time
            await truffleAssert.passes(
                timeMachine.advanceTimeAndBlock(INCUBATION_DURATION),
                "Failed to advance time and block"
            )
        })

        afterEach("Revert To Start of Incubation Time", async() => {
            await timeMachine.revertToSnapshot(snapshotId)
        })

        it("should NOT allow non-owner of an egg to hatch it", async () => {

            await truffleAssert.reverts(
                eggToken.hatch(
                    0, //eggid
                    {from: accounts[0]}
                ),
                "hatch: Not egg owner!"
            )
        })

        it("should allow egg's owner to hatch it, emitting an Hatched event ", async () => {

            let txResult
            await truffleAssert.passes(
                txResult = await eggToken.hatch(
                    0, //eggid
                    {from: accounts[2]}
                )
            )
            truffleAssert.eventEmitted(txResult, 'Hatched', (ev) => {
                return ev.dragonId == 2 &&
                    ev.eggId == 0 &&
                    ev.owner == accounts[2]
            }, "Event Hatched has incorrect parameter values!")
        })

        it("should NOT allow egg to be hatched again (after its already been hatched!)", async () => {

            await truffleAssert.passes(
                eggToken.hatch(
                    1, //eggid
                    {from: accounts[2]}
                )
            )

            await truffleAssert.reverts(
                eggToken.hatch(
                    1, //eggid
                    {from: accounts[2]}
                ),
                "ERC721: owner query for nonexistent token"
            )
        })

        it("should NOT allow an egg to hatch after contract is 'paused' state", async () => {

            // Put contract into 'paused' state
            await truffleAssert.passes(
                eggToken.pause(),
                "Failed to put eggToken contract into 'paused' state!"
            )
            await truffleAssert.reverts(
                eggToken.hatch(
                    0, //eggid
                    {from: accounts[2]}
                ),
                "Pausable: paused"
            )
        })

        it("should allow an egg to hatch after 'paused' contract is 'unpaused'", async () => {

            // Put contract into 'paused' state
            await truffleAssert.passes(
                eggToken.pause(),
                "Failed to put eggToken contract into 'paused' state!"
            )
            // Put contract back into 'unpaused' state
            await truffleAssert.passes(
                eggToken.unpause(),
                "Failed to put eggToken contract into 'unpaused' state!"
            )
            let txResult
            await truffleAssert.passes(
                txResult = await eggToken.hatch(
                    0, //eggid
                    {from: accounts[2]}
                )
            )
            truffleAssert.eventEmitted(txResult, 'Hatched', (ev) => {
                return ev.eggId == 0 &&
                    ev.dragonId == 2 &&
                    ev.owner == accounts[2]
            }, "Event Hatched has incorrect parameter values!")
        })
    })


    describe("After Eggs Hatched (& destroyed): Mint & Hatch another Gen0 Egg", () => {

        before("Advance Time to End of Incubation", async() => {
            await truffleAssert.passes(
                timeMachine.advanceTimeAndBlock(INCUBATION_DURATION),
                "Failed to advance time and block"
            )
        })

        before("Hatch 2x eggs (eggIds 0 & 1)", async function() {

            await truffleAssert.passes(
                eggToken.hatch(
                    0, //eggid
                    {from: accounts[2]}
                )
            )
            await truffleAssert.passes(
                eggToken.hatch(
                    1, //eggid
                    {from: accounts[2]}
                )
            )
        })

        before("Mint 3rd Gen0 Egg (eggId 2) & Start Incubation", async function() {

            await truffleAssert.passes(
                eggToken.mintGen0EggTo(
                    accounts[2],
                    {from:accounts[0]}
                ),
                `Unable to mint Gen0Egg (eggId 2)!`
            )
            await truffleAssert.passes(
                eggToken.startIncubation(
                    2, //eggId
                    {from: accounts[2]}
                ),
                `Failed to start incubation (of eggId 2)!`
            )
        })

        before("Advance Time to End of Incubation period", async() => {

            await truffleAssert.passes(
                timeMachine.advanceTimeAndBlock(INCUBATION_DURATION),
                "Failed to advance time and block"
            )
        })

        it("should allow egg's owner to hatch it (into a dragon)", async () => {

            let txResult
            await truffleAssert.passes(
                txResult = await eggToken.hatch(
                    2, //eggid
                    {from: accounts[2]}
                )
            )
            truffleAssert.eventEmitted(txResult, 'Hatched', (ev) => {
                return ev.eggId == 2 &&
                    ev.dragonId == 2 &&
                    ev.owner == accounts[2]
            }, "Event Hatched has incorrect parameter values!")
        })
    })
})
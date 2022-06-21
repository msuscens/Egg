// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;


enum SubSpecies {Earth, Fire, Air, Water }

interface IEggToken {

    struct Egg {
        SubSpecies subSpecies;
        uint256 mumId;
        uint256 dadId;
        uint256 laidTime;
        uint256 incubationCompleteAt;
    }

    event EggGen0Minted(uint256 eggId, address owner);

    event EggIncubationStarted(
        uint256 eggId,
        address owner
    );

    event Hatched(
        uint256 eggId,
        uint256 dragonId,
        address owner
    );

    /*
    * Mints a generation 0 egg, transfering ownership to the specified owner.
    * The Egg's subSpecies is randomly set to one of the SubSpecies types.
    * Requirement: Only the contract owner may create a generation 0 egg.
    * Requirement: No more than the maximum generation eggs can be created
    * (the maximum being Egg contract's: _gen0EggLimit, set upon deployement).
    * Event emitted: EggGen0Minted 
    */
    function mintGen0EggTo(address owner) external;

    /*
    * Starts the incubation process of a given egg.
    * Requirement: Only the egg owner may start the incubation.
    * Requirement: The incubation process has not been already started.
    * Event emitted: EggIncubationStarted
    */
    function startIncubation(uint256 eggId) external;

    /*
    * Hatch egg, destroys/burns egg token in the process.
    * Requirement: Only the egg's owner may hatch an egg
    * Requirement: The egg must have completed its incubation period
    * Event emitted: EggHatched
    */
    function hatch(uint256 eggId) external;

    /*
    * Checks the incubation state of an egg, to determine how much longer the
    * egg needs in order to incubate (before it may be hatched).
    * Requirement: Only egg's owner or operator may check the incubation state.
    * Requirement: Previosuly started the incubation.
    * Returns: Seconds remaining.
    */
    function checkIncubation(uint256 eggId)
        external
        view
        returns (uint256 secondsRemaining);

    /*
    * Get total amount of Gen0 Egg tokens minted, including any burnt/hatched.
    * {Note: Different from totalSupply() and balanceOf(_species) which both
    * don't count burnt tokens and also include non-Gen-0 egg tokens.}
    * Returns: Number of minted Gen0 Egg tokens
    */
    function getAmountGen0EggsMinted() external view returns (uint256);

    /*
    * Get the Egg details of specified egg (eggId).
    * Throws if the specified egg doesn't exist
    * Returns: Struct containing the egg's details.
    */
    function getEgg(uint256 eggId) external view returns (Egg memory);


}
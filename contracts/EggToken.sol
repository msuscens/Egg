// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./IEggToken.sol";

contract EggToken is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    IEggToken
{
    uint256 private constant _INCUBATION_DURATION = 60;    //Seconds

    uint256 private _gen0EggLimit;
    uint256 private _gen0EggCount;

    // Mapping from egg's tokenId => Egg record 
    mapping (uint256 => Egg) private _tokenIdsToEggs;
    uint256 private _eggIdCounter;


// Constructor
    // Initializer for the upgradeable contract (instead of constructor) 
    // that can only be executed once (that must be done upon deployment)
    function init_EggToken(
        string memory tokenName, 
        string memory tokenSymbol,
        uint256 gen0EggLimit
    )
        initializer
        public
    {
        __ERC721_init(tokenName, tokenSymbol);
        __ERC721Enumerable_init();
        __Pausable_init();
        __Ownable_init();
        _gen0EggLimit = gen0EggLimit;
    }


// External functions

    function mintGen0EggTo(address owner)
        override
        external
        onlyOwner
        whenNotPaused
    {
        require(owner != address(0), "mintGen0EggTo: zero address!");

        uint256 eggId = _mintGen0Egg(owner);
        emit EggGen0Minted(eggId, owner);
    }


    function startIncubation(uint256 eggId)
        override
        external
        whenNotPaused
    {
        require(msg.sender == ownerOf(eggId), "startIncubation: Not egg owner!");
        require(
            _tokenIdsToEggs[eggId].incubationCompleteAt == 0,
            "startIncubation: Already begun!"
        );
        _tokenIdsToEggs[eggId].incubationCompleteAt = block.timestamp + _INCUBATION_DURATION;

        emit EggIncubationStarted(eggId, msg.sender);
    }


    function hatch(uint256 eggId)
        override
        external
        whenNotPaused
    {
        address owner = IERC721Upgradeable(address(this)).ownerOf(eggId);
        require(msg.sender == owner, "hatch: Not egg owner!");
        require(
            _hasIncubationStarted(eggId) == true &&
            _checkIncubation(eggId) == 0,
            "hatch: Egg is not incubated!"
        );

        uint256 dragonId = _hatch(eggId);

        emit Hatched(eggId, dragonId, owner);
    }


    function checkIncubation(uint256 eggId)
        override
        external
        view
        returns (uint256 secondsRemaining)
    {
        require(
            _isApprovedOrOwner(msg.sender, eggId),
            "checkIncubation: Not Owner/Optr!"
        );
        require(
            _hasIncubationStarted(eggId) == true,
            "checkIncubation: Not begun!"
        );
        secondsRemaining = _checkIncubation(eggId);
    }


    function getAmountGen0EggsMinted() override external view returns (uint256)
    {
        return _gen0EggCount;
    }


    function getEgg(uint256 eggId)
        override
        external
        view
        returns (Egg memory)
    {
        require(_exists(eggId), "getEgg: No such egg!");
        return ( _tokenIdsToEggs[eggId] );
    }


// Public functions

    // Functions to pause or unpause all functions that have
    // the whenNotPaused or whenPaused modify applied on them
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }


    // The following functions are overrides required by Solidity.
    // IERC165 
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    function getGen0Limit()
        public
        view
        returns (uint256)
    {
        return _gen0EggLimit;
    }


// Internal  functions

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable
        )
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, amount);
    }


// Private functions

    function _mintGen0Egg(address owner)
        private
        returns (uint256 eggId)
    {
        require(
            _gen0EggCount < _gen0EggLimit,
            "_mintGen0Egg: Hit Gen0 limit!"
        );        
        _gen0EggCount++;

        eggId = _mintEgg(owner, 0, 0, SubSpecies.Earth);
    }


    function _mintEgg(
        address owner,
        uint256 mumId,
        uint256 dadId,
        SubSpecies subSpecies
    ) 
        private
        returns (uint256 newEggId)
    {
        Egg memory newEgg = Egg(
            {
                subSpecies: subSpecies,
                mumId: mumId,
                dadId: dadId,
                laidTime: block.timestamp,
                incubationCompleteAt: 0
            }
        );
        newEggId = _eggIdCounter;
        _tokenIdsToEggs[newEggId] = newEgg;
        _eggIdCounter++;

        _safeMint(owner, newEggId);
    }


    function _hatch(uint256 eggId)
        private
        returns (uint256 dragonId)
    {
        // The egg breaks!
        delete _tokenIdsToEggs[eggId];
        _burn(eggId);

        return 2;  //hardwired
    }


    function _hasIncubationStarted(uint256 eggId)
        private
        view
        returns (bool)
    {

        if (_tokenIdsToEggs[eggId].incubationCompleteAt == 0) return false;
        return true;
    }


    function _checkIncubation(uint256 eggId)
        private
        view
        returns (uint256 secondsRemaining)
    {
        if (_tokenIdsToEggs[eggId].incubationCompleteAt <= block.timestamp) {
            return 0;  //Ready to hatch!
        }
        return(_tokenIdsToEggs[eggId].incubationCompleteAt - block.timestamp);
    }

}
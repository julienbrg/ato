// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Lottery is ERC721Holder {

    address public nft;
    address public owner;
    uint public random;
    address public auction;
    uint public seed;
    address public winner;
    uint public end;

    struct Slot
    {
        address addr;
    }
    uint public numSlots;
    mapping (uint => Slot) public slots;

    event Won(address indexed addr, uint date);

    constructor() public
    {
        owner = msg.sender;
        end = now + 15 days;
        seed = 888;
    }

    function run() external
    {
        require(
            end < now,
            "The auction is not over yet."
            );

        random = uint(keccak256(abi.encodePacked(block.difficulty, now, seed))) % (numSlots + 1);
        winner = slots[random].addr;
        emit Won(winner, now);
    }

    function addPlayer(address _addr, uint _vol, uint _userSeed) external
    {
        require(
            msg.sender == auction,
            "Only the auction contract can call this function."
            );
        seed = seed * _userSeed;
        uint vol = ((_vol /10) / 10**18); // Probleme dans le /100 --> pas possible d'acheter moins de 100parts
        uint j = vol + numSlots;

        for (uint id=numSlots; id<j; id++)
        {
            slots[id].addr = _addr;
            numSlots++;
        }
    }

    function withdraw() external
    {
        IERC721(nft).transferFrom(address(this), winner, 1);
    }

    function addNFT(address _nft) external
    {
        require(
            msg.sender == owner,
            "Only the owner can call this function."
            );
        nft = _nft;
    }

    function addAuction(address _auction) external
    {
        require(
            msg.sender == owner,
            "Only the owner can call this function."
            );
        auction = _auction;
    }

    // for tests only
    function hardStop() external
    {
        end = now;
    }

}

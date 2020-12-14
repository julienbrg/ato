// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lottery is ERC721Holder {

    address public nft;
    address public auction;
    address public owner;
    uint public random;
    uint public seed;
    address public winner;

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
        seed = 888;
    }

    function run() public
    {
        require(
            msg.sender == auction,
            "Only the auction contract can call this function."
            );

        random = uint(keccak256(abi.encodePacked(block.difficulty, now, seed))) % numSlots;
        winner = slots[random].addr;
        IERC721(nft).safeTransferFrom(address(this), winner, 1);
        emit Won(winner, now);
    }

    function addPlayer(address _addr, uint _vol, uint _userSeed) public
    {
        require(
            msg.sender == auction,
            "Only the auction contract can call this function."
            );

        seed = seed * _userSeed;
        uint vol = ((_vol /100) / 10**18);
        uint j = vol + numSlots;

        for (uint id=numSlots; id<j; id++)
        {
            slots[id].addr = _addr;
            numSlots++;
        }
    }

    function addNFT(address _nft) public
    {
        require(
            msg.sender == owner,
            "Only the owner can call this function."
            );
        nft = _nft;
    }

    function addAuction(address _auction) public
    {
        require(
            msg.sender == owner,
            "Only the owner can call this function."
            );
        auction = _auction;
    }
}

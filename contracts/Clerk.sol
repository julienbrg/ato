// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Clerk is Ownable {

    struct Artwork
    {
        address sharesInstance;
        uint256 date;
    }

    struct Creator
    {
        address creatorAddr;
        uint256 numArtworks;
        mapping (uint256 => Artwork) artworks;
    }

    uint256 public numCreators;
    mapping (uint256 => Creator) public creators;

    event Registered(address indexed _creator,address indexed _sharesInstance);

    constructor() public {
        numCreators++;
    }

    function registerArtwork(address _sharesInstance) public
    {
        uint256 creatorID = getMyCreatorID();
        if (creatorID == 0) {
            creatorID = numCreators++;
            creators[creatorID] = Creator(msg.sender, 0);
        }

        Creator storage a = creators[creatorID];
        a.artworks[a.numArtworks++] = Artwork({

            sharesInstance: _sharesInstance,
            date: now

        });
        emit Registered(msg.sender,_sharesInstance);
    }

    function newCreator() internal returns (uint256 creatorID)
    {
        creatorID = numCreators++;
        creators[creatorID] = Creator(msg.sender, 0);
    }

    function getArtworkAddr(uint256 creatorID, uint256 artworkID) public view returns (address sharesInstance)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].sharesInstance;
    }

    function howManyArtworksDoIHave() public view returns (uint256 num)
    {
        for (uint256 id=0;id<numCreators;id++) {
            address m=msg.sender;
            if (m == creators[id].creatorAddr) {
                num = creators[id].numArtworks;
                return num;
            }

        }

    }

    function getMyCreatorID() public view returns (uint256 _id)
    {
        for (uint256 id=0;id<numCreators;id++) {
            address m=msg.sender;
            if (m == creators[id].creatorAddr) {
                _id = id;
                return _id;
            }
        }
    }
}

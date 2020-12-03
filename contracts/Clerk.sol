// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Clerk is Ownable {

    struct Artwork
    {
        address sharesInstance;
        address nftInstance;
        address auctionInstance;
        uint256 date;
        bool verified;
    }

    struct Creator
    {
        address creatorAddr;
        uint256 numArtworks;
        mapping (uint256 => Artwork) artworks;
    }

    uint256 public numCreators;
    mapping (uint256 => Creator) public creators;

    event Registered(address indexed _creator, address indexed _sharesInstance);

    constructor() public {
        numCreators++;
    }

    function registerArtwork(address _sharesInstance, address _nftInstance, address _auctionInstance) public
    {
        uint256 creatorID = getMyCreatorID();
        if (creatorID == 0) {
            creatorID = numCreators++;
            creators[creatorID] = Creator(msg.sender, 0);
        }

        Creator storage a = creators[creatorID];
        a.artworks[a.numArtworks++] = Artwork({

            sharesInstance: _sharesInstance,
            nftInstance: _nftInstance,
            auctionInstance: _auctionInstance,
            date: now,

            verified: false

        });
        emit Registered(msg.sender,_sharesInstance);
    }

    function newCreator() internal returns (uint256 creatorID)
    {
        creatorID = numCreators++;
        creators[creatorID] = Creator(msg.sender, 0);
    }

    function getSharesInstance(uint256 creatorID, uint256 artworkID) public view returns (address sharesInstance)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].sharesInstance;
    }

    function getNFTInstance(uint256 creatorID, uint256 artworkID) public view returns (address nftInstance)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].nftInstance;
    }

    function getAuctionInstance(uint256 creatorID, uint256 artworkID) public view returns (address auctionInstance)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].auctionInstance;
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

    function verify(uint256 creatorID, uint256 artworkID) onlyOwner() public
    {
        Creator storage y = creators[creatorID];
        y.artworks[artworkID].verified = true;
    }

    function isThisArtworkVerified(uint256 creatorID, uint256 artworkID) public view returns(bool)
    {
        if (creators[creatorID].artworks[artworkID].verified == true) {
            return true;
        }
    }
}

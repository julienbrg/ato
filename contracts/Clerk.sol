// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Clerk is Ownable {

    struct Artwork
    {
        address shares;
        address nft;
        address auction;
        address lottery;
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

    event Registered(address indexed creator, address shares, address nft, address auction, uint date);

    constructor() public
    {
        numCreators++;
    }

    function registerArtwork(address _shares, address _nft, address _auction, address _lottery) public
    {
        uint256 creatorID = getMyCreatorID();
        if (creatorID == 0)
        {
            creatorID = numCreators++;
            creators[creatorID] = Creator(msg.sender, 0);
        }

        Creator storage a = creators[creatorID];
        a.artworks[a.numArtworks++] = Artwork({
            shares: _shares,
            nft: _nft,
            auction: _auction,
            lottery: _lottery,
            date: now,
            verified: false
        });

        emit Registered(msg.sender, _shares, _nft, _auction, now);
    }

    function newCreator() internal returns (uint256 creatorID)
    {
        creatorID = numCreators++;
        creators[creatorID] = Creator(msg.sender, 0);
    }

    function getShares(uint256 creatorID, uint256 artworkID) public view returns (address shares)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].shares;
    }

    function getNFT(uint256 creatorID, uint256 artworkID) public view returns (address nft)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].nft;
    }

    function getAuction(uint256 creatorID, uint256 artworkID) public view returns (address auction)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].auction;
    }

    function getLottery(uint256 creatorID, uint256 artworkID) public view returns (address lottery)
    {
        Creator storage y = creators[creatorID];
        return y.artworks[artworkID].lottery;
    }

    function howManyArtworksDoIHave() public view returns (uint256 num)
    {
        for (uint256 id=0; id<numCreators; id++) {
            address m = msg.sender;
            if (m == creators[id].creatorAddr) {
                num = creators[id].numArtworks;
                return num;
            }
        }
    }

    function getMyCreatorID() public view returns (uint256 _id)
    {
        for (uint256 id=0; id<numCreators; id++) {
            address m = msg.sender;
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

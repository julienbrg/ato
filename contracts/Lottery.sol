// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Lottery is ERC721Holder {

    address public nft;

    function giveMeMyNFT() public payable
    {
        IERC721(nft).safeTransferFrom(address(this), msg.sender, 1);
    }

    function addNFT(address _nft) public
    {
        nft = _nft;
    }
}

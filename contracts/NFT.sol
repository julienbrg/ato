// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721
{
  constructor(string memory _name, string memory _symbol, string memory _tokenURI)
  public ERC721(_name,_symbol)
  {
    // Replace `msg.sender` with `_auctionContract`
    _safeMint(msg.sender, 1);
    _setTokenURI(1, _tokenURI);
    // _registerInterface(_INTERFACE_ID_ERC721);
  }
}

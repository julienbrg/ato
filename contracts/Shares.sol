// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Shares is ERC20
// To add in the constructor: address _auctionContract
{
  constructor(string memory _tokenName, string memory _tokenTicker)
  public ERC20(_tokenName,_tokenTicker)
  {
    _mint(msg.sender, 5000*10**18);
    // _mint(_auctionContract, 5000*10**18);
  }
}

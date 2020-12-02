// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ATO is ERC20
{
  constructor() public ERC20("ATO", "ATO")
  {
    // We issue 10,000,000,000 ATO
    _mint(msg.sender, 10000000000*10**18);
  }
}

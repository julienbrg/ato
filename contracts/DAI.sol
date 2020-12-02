// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DAI is ERC20
{
  constructor() public ERC20("DAI Stablecoin", "DAI")
  {
    _mint(msg.sender, 10000*10**18);
    _approve(address(this), msg.sender, 10000*10**18);
  }
}

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DAI is ERC20
{
  constructor()
  public ERC20("Magic DAI for hackers", "DAI")
  {
    _mint(msg.sender, 1000000*10**18);
  }

  event Withdrawn(address user, uint amount );

  function withdraw()public
  {
    _mint(msg.sender, 50*10**18);
    emit Withdrawn (msg.sender, 50);
  }
}

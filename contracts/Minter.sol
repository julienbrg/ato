// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Minter {

  address public owner;
  uint public registrations;
  mapping(address => address) public registered;
  mapping(address => bool) whitelisted;

  constructor() public {
    owner = msg.sender;
  }

  function registerArtwork(address _contractAddress) public {
    // TO DO: check if he's whitelisted
    registered[msg.sender] = _contractAddress;
    ++registrations;
  }

  function getArtworkData() external view returns (uint256) {
    return registrations;
  }

  function getMyLatestRegistration(address _selectedAddress) external view returns (address) {
    return registered[_selectedAddress];
  }

  // TO DO: add a function that allows owner to whitelist an address

}

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Wonder {

    IERC20 public sharesInstance;

    address public owner;
    uint256 public amount;

    constructor(IERC20 _sharesInstance) public
    {
        sharesInstance = _sharesInstance;
        owner = msg.sender;
    }

    function give(uint256 _amount) public
    {
        sharesInstance.transferFrom(msg.sender,address(this),_amount);
        amount = _amount;
    }

    function take() public
    {
        sharesInstance.transferFrom(address(this),msg.sender,amount);
    }

    function checkAllowance() external view returns (uint256)
    {
        uint256 result = sharesInstance.allowance(owner, address(this));
        return result;
    }

    function checkBalance() external view returns (uint256)
    {
        uint256 result = sharesInstance.balanceOf(address(this));
        return result;
    }
}

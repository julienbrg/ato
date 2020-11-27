// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Auction {

    address public sharesInstance;
    address public nftInstance;
    uint256 public price;
    uint256 public endAuction;

    constructor() public
    {
        price = 1;
        endAuction = now + 7 days;
        log0(bytes32("Hello!"));
    }

    // To edit
    function buy(uint256 amount) public view returns (string memory receipt) {

        receipt = "Thank you!";
        uint256 toPay = amount * price;
        // sharesInstance.transferFrom(address(this), msg.sender, toPay);
        return receipt;
    }

    function addSharesInstance (address addr1) external returns (bool ok) {
        // require(msg.sender = sharesOwner);
        sharesInstance = addr1;
        return true;
    }

    function addNftInstance (address addr1) external returns (bool ok) {
        // require(msg.sender = nftOwner);
        nftInstance = addr1;
        return true;
    }
}

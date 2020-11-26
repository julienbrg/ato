// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

abstract contract Auction is IERC721Receiver, IERC20 {

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

    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

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

    // I still get "ERC721: transfer to non ERC721Receiver implementer" at deployment.
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) virtual external override returns (bytes4) {
        bytes4 rec = IERC721Receiver(operator).onERC721Received(msg.sender, from, tokenId, data);
        return rec;
    }
}

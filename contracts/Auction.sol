// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Lottery.sol";

// In this version (v0.1.3) Auction.sol is a sale contract.
contract Auction {

    address public shares;
    address public dai;
    address public lottery;
    address payable public beneficiary;
    uint public end;
    uint public rate;
    uint public supply;
    uint public total;

    struct Trade
    {
        address buyer;
        uint volume;
    }
    uint public numTrades;
    mapping (uint => Trade) public trades;

    enum Status {Created, Started, SoldOut, Stopped}
    Status public status;

    event Sold(uint indexed id, address indexed buyer, uint volume, uint date);

    constructor (address _dai, address _lottery, uint _rate) public
    {
        beneficiary = msg.sender;
        dai = _dai;
        status = Status.Created;
        rate = _rate;
        lottery = _lottery;
    }

    function buy(uint _volume, uint _seed) public payable
    {
        uint volume = _volume;

        require(
            status != Status.Created,
            "The auction hasn't started yet."
        );

        require(
            status != Status.SoldOut ,
            "Sold out!"
        );

        require(
            status != Status.Stopped,
            "The auction was stopped by the beneficiary."
        );

        require(
            volume <= supply,
            "You ask for too much: please check the current available supply."
        );

        total = rate * (volume / 10**18);
        IERC20(dai).transferFrom(msg.sender, beneficiary, total);

        uint id = numTrades;
        trades[id] = Trade(msg.sender, volume);
        numTrades++;
        emit Sold(id, msg.sender, volume, now);
        Lottery(lottery).addPlayer(msg.sender, volume, _seed);
        supply -= volume;
        if (supply == 0) {auctionEnd();}

        IERC20(shares).transferFrom(address(this), msg.sender, volume);
    }

    function addShares(address _shares) public
    {
        require(
            msg.sender == beneficiary,
            "Only the beneficiary can call this function."
        );
        shares = _shares;
    }

    function start() public payable
    {
        require(
            msg.sender == beneficiary,
            "Only the beneficiary can call this function."
        );
        supply = IERC20(shares).balanceOf(address(this));
        IERC20(shares).approve(address(this), supply);
        end = now + 15 days;
        //Lottery(lottery).addEndTime(end);
        //Lottery(lottery).addShares(shares);
        status = Status.Started;
    }

    function hardStop() public
    {
        require(
            msg.sender == beneficiary,
            "Only the beneficiary can call this function."
        );
        end = now;
        auctionEnd();
    }

    function auctionEnd() private
    {
        if (supply > 0)
        {
            status = Status.Stopped;
        }

        else
        {
            status = Status.SoldOut;
        }

        Lottery(lottery).run();
    }
}

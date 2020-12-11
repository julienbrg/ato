// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// When testing, we don't check auctionEndTime when auctionEnd is triggered.
contract Auction {

    address public shares;
    address public dai;
    address public lottery;

    address payable public beneficiary;
    uint public auctionEndTime;

    // Current state of the auction.
    address payable public highestBidder;
    uint public highestBid;

    // Allowed withdrawals of previous bids
    mapping(address => uint) pendingReturns;

    bool ended;

    // Events that will be emitted on changes.
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    /// Create a simple auction with `_biddingTime`
    /// seconds bidding time on behalf of the
    /// beneficiary address `_beneficiary`.
    constructor(
        address _dai,
        uint _endTime
    ) public {
        beneficiary = msg.sender;
        auctionEndTime = block.timestamp + _endTime;
        dai = _dai;
    }

    function bid() public payable
    {
        uint priceForAllShares = 2000000000000000000;
        require(
            block.timestamp <= auctionEndTime,
            "Auction already ended."
        );

        require(
            priceForAllShares > highestBid,
            "There already is a higher bid."
        );

        if (highestBid != 0) {

            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = priceForAllShares;
        IERC20(dai).transferFrom(msg.sender, address(this), highestBid);
        emit HighestBidIncreased(msg.sender, highestBid);
    }

    /// Withdraw a bid that was overbid.
    function withdraw() public payable returns (bool)
    {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            pendingReturns[msg.sender] = 0;

            if (!msg.sender.send(amount)) {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        IERC20(shares).transferFrom(address(this), highestBidder, 5000000000000000000000);
        return true;
    }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    function auctionEnd() payable public
    {

        // 1. Conditions
        //require(block.timestamp >= auctionEndTime, "Auction not yet ended.");
        //require(!ended, "auctionEnd has already been called.");

        // 2. Effects
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // 3. Interaction
        IERC20(dai).transferFrom(address(this), beneficiary, highestBid);
    }

    function addShares(address _shares) public
    {
        shares = _shares;
    }

    function addLottery(address _lottery) public
    {
        lottery = _lottery;
    }

    // approve 5000 (all)
    function approveShares() payable public
    {
        IERC20(shares).approve(address(this), 5000000000000000000000);
    }

    // // approve 4000000000000000000 DAIs
    function approveDAI() payable public
    {
        IERC20(dai).approve(address(this), 4000000000000000000);
    }
}

/*

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

// In v0.1.3 Auction is a sale contract.

contract Auction {

    address public shares;
    address public dai;
    address public lottery;

    address payable public beneficiary;
    uint public end;
    uint public rate;
    uint public supply;

    struct Trade
    {
        address buyer;
        uint volume;
    }
    uint public numTrades;
    mapping (uint => Trade) public trades;

    enum Status {Created, Started, SoldOut}
    Status status;

    constructor (address _dai) public
    {
        beneficiary = msg.sender;
        dai = _dai;
        status = Status.Created;
        rate = 10000000000000000;
    }

    function buy(uint _volume) public payable
    {
        uint volume = _volume;

        require(
            block.timestamp <= end,
            "The sale is over."
        );

        require(
            block.timestamp <= end,
            "Sold out."
        );

        require(
            volume <= supply,
            "Volume too high."
        );

        uint total = (rate / 10**18) * volume;
        IERC20(dai).transferFrom(msg.sender, beneficiary, total);

        supply -= volume;
        if (supply == 0) {
            status = Status.SoldOut;
        }
        uint id = numTrades++;
        trades[id] = Trade(msg.sender, volume);
        numTrades++;

        IERC20(shares).transferFrom(address(this), msg.sender, volume);
    }

    // to remove
    function stop() public
    {
        end = block.timestamp;
    }

    function addShares(address _shares) public
    {
        shares = _shares;
    }

    function addLottery(address _lottery) public
    {
        lottery = _lottery;
    }

    function approveShares() payable public
    {
        supply = IERC20(shares).balanceOf(address(this));
        IERC20(shares).approve(address(this), supply);
        status = Status.Started;
        end = block.timestamp + 15 days;
    }


}

// vol = 1000000000000000000000 (1000 DAI)
// rate = 10000000000000000 (0.01 DAI)

 */

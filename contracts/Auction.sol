// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Lottery.sol";
import "./Ato.sol";

// In this version (v0.1.3) Auction.sol is a sale contract.
contract Auction {

    address public ato;
    address public shares;
    address public dai;
    address public lottery;
    address payable public beneficiary;
    uint public end;
    uint public rate;
    uint public supply;
    uint public total;
    uint public snap;

    struct Trade
    {
        address buyer;
        uint volume;
    }

    uint public numTrades;
    mapping(uint => Trade) public trades;

    event Sold(uint indexed id, address indexed buyer, uint volume, uint date);

    constructor (address _dai, address _lottery, uint _rate, uint _end, address _ato) public
    {
        beneficiary = msg.sender;
        dai = _dai;
        rate = _rate;
        lottery = _lottery;
        ato = _ato;
        end = _end;
    }

    function buy(uint _volume, uint _seed) external payable
    {
        uint volume = _volume;

        require(
            end > now,
            "Sold out!"
        );

        require(
            volume <= supply,
            "You ask for too much: please check the current available supply."
        );

        require(
            volume >= 10 ** 18,
            "The minimum amount is 10 shares."
        );


        if (Ato(ato).balanceOfAt(msg.sender, snap) > 1000000000000000000) {
            total = rate * (volume / 10 ** 18);
            total = total / 2;
        } else {
            total = rate * (volume / 10 ** 18);
        }
        IERC20(dai).transferFrom(msg.sender, beneficiary, total);

        uint id = numTrades;
        trades[id] = Trade(msg.sender, volume);
        numTrades++;
        emit Sold(id, msg.sender, volume, now);
        Lottery(lottery).addPlayer(msg.sender, volume, _seed);
        supply -= volume;
        if (supply == 0)
        {
            Lottery(lottery).hardStop(1);
        }

        IERC20(shares).transferFrom(address(this), msg.sender, volume);
    }

    function addShares(address _shares) external
    {
        require(
            msg.sender == beneficiary,
            "Only the beneficiary can call this function."
        );
        shares = _shares;
    }

    function start() external
    {
        supply = IERC20(shares).balanceOf(address(this));
        IERC20(shares).approve(address(this), supply);
        snap = Ato(ato).getSnap();
        //snap = Ato(ato).snapID();

    }
}

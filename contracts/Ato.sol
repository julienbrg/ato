pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Snapshot.sol";

contract Ato is ERC20Snapshot
{
    constructor()
    public ERC20("Āto Network Token", "ATO")
    {
        _mint(msg.sender, 10000 * 10 ** 18);
    }
    bool shot = false;

    function getSnap() public returns (uint)
    {
        require(shot == false);
        uint snapID = _snapshot();
        shot = true;
        return snapID;
    }
}

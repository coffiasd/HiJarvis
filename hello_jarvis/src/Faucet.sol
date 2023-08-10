// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract Faucet is ERC20 {
    uint256 public constant tokenAmount = 10e18;
    uint256 public constant waitTime = 1 minutes;

    mapping(address => uint256) lastAccessTime;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {}

    function requestTokens() public {
        require(allowedToWithdraw(msg.sender));
        _mint(msg.sender, tokenAmount);
        lastAccessTime[msg.sender] = block.timestamp + waitTime;
    }

    function allowedToWithdraw(address _address) public view returns (bool) {
        if (lastAccessTime[_address] == 0) {
            return true;
        } else if (block.timestamp >= lastAccessTime[_address]) {
            return true;
        }
        return false;
    }
}
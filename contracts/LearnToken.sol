pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract LearnToken is ERC20 {
    string public name = "LearnToken";
    string public symbol = "LT";
    uint public decimals = 18;
    uint public initialSupply = 1000000 * (10 ** decimals);

    constructor() public {
        _mint(msg.sender, initialSupply);
    }
}
pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract LearnToken is ERC20, Ownable {
    string public name = "LearnToken";
    string public symbol = "LT";
    uint public decimals = 18;
    uint public initialSupply = 1000000 * (10 ** decimals);

    event BurnLog(address by, uint256 value);

    constructor() public {
        _mint(msg.sender, initialSupply);
    }
    
    function burn(uint256 _value) public {
        _burn(msg.sender, _value);
        emit BurnLog(msg.sender, _value);
    }

    function mint(address _to, uint256 _value) public {
        _mint(_to, _value);
    }
}
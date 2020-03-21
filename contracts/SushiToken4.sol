pragma solidity 0.6.3;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract SushiToken4 is ERC20, Ownable {
    string public name = "SushiToken";
    string public symbol = "SUSHTO";
    uint public decimals = 18;
    uint public initialSupply = 1000000 * (10 ** decimals);

    mapping(bytes32=>uint256) public totalSushiEaten;

    event BurnLog(address by, uint256 value);
    event MintLog(address by, address to, uint256 value);
    event SushiAdded(address by, bytes32 sushiType, uint256 totalSushi);

    constructor() public {
        _mint(msg.sender, initialSupply);
    }
    
    function burn(uint256 _value) public {
        _burn(msg.sender, _value);
        emit BurnLog(msg.sender, _value);
    }

    function mint(address _to, uint256 _value) public onlyOwner {
        _mint(_to, _value);
        emit MintLog(msg.sender, _to, _value);
    }

    function setTotalSushiEaten(bytes32 _sushiType, uint256 _totalSushi) public {
        totalSushiEaten[_sushiType] = totalSushiEaten[_sushiType].add(_totalSushi);
        emit SushiAdded(msg.sender, _sushiType, _totalSushi);
    }
}
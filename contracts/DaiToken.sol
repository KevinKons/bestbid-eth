//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title A Dai Token
/// @author Euler Giachini, Kevin Kons
/// @notice You can use this contract to mint new tokens to a user 
/// @dev All function calls are currently implemented without side effects
contract DaiToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("DaiToken", "DAI") {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Add new tokens to a user
    /// @dev  Call _mint function from openzeppelin/contracts/token/ERC20/ERC20.sol
    /// @param _to The address to mint new tokens
    /// @param _value The amount of tokens to be mint
    function mint(address _to, uint256 _value) public {
        _mint(_to, _value);
    }
}

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./DaiToken.sol";

/// @title A vault to deposits
/// @author Euler Giachini, Kevin Kons
/// @notice You can use this contract to a user add funds and to transfer funds between user
/// @dev All function calls are currently implemented without side effects
contract DepositsVault { 
  string public name = "Bestbid deposits vault";
  address public owner;
  address public tokenAddress;
  address public NFTMarketplace;

  event AddFundsEvent(address _sender, uint _amountAdded);
  event TransferFunds(address _sender, address _receiver, uint _amountReceived);

  mapping(address => uint) public fundsBalance;

  constructor(address _tokenAddress, address _NFTMarketplace) {
    tokenAddress = _tokenAddress;
    NFTMarketplace = _NFTMarketplace;
    owner = msg.sender;
  }

  /// @notice Add funds from a user wallet to the contract
  /// @dev Add msg.sender to the fundsBalance map and make a summation of the amount in the param with the current value of the user and AddFundsEvent event is emitted 
  /// @param _amount The amount of tokens to be add on the contract
  function addFunds(uint _amount) public {
    require(_amount > 0, "Amount cannot be 0");
    ERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
    fundsBalance[msg.sender] = fundsBalance[msg.sender] + _amount;
    emit AddFundsEvent(msg.sender, _amount);
  }

  /// @notice Transfer funds between two users
  /// @dev Transfer CTK to receiver and update fundsBalance map to sender user and TransferFunds event is emitted 
  /// @param _sender The address of the user who will transfer the tokens
  /// @param _receiver The address of the user who will receive the tokens
  /// @param _amount The amount of tokens to be transferred between the users
  function transferFunds(address _sender, address _receiver, uint _amount) public onlyNftMarketplace {
    require(_amount > 0, "Amount cannot be 0");
    ERC20(tokenAddress).transfer(_receiver, _amount);
    fundsBalance[_sender] = fundsBalance[_sender] - _amount;
    emit TransferFunds(_sender, _receiver, _amount);
  }

  modifier onlyNftMarketplace() {
    require(nftMarketplace() == msg.sender, "DepositsVault: caller is not the NFT Marketplace");
    _;
  }
  
  /// @notice Return the address of NFTMarketplace
  /// @dev Just return the address of NFTMarketplace contract 
  /// @return NFTMarketplace The address of NFTMarketplace contract
  function nftMarketplace() public view virtual returns (address) {
    return NFTMarketplace;
  }
}
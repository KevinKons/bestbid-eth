//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DepositsVault.sol";

/// @title A complete NFT Marketplace 
/// @author Euler Giachini, Kevin Kons
/// @notice You can use this contract to create a ERC721 NFT, create a market sale, and fetch market items from different sources 
/// @dev All function calls are currently implemented without side effects
contract NFTMarketplace is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  Counters.Counter private _itemsSold;

  address public tokenAddress;
  address public depositVaultAddress;

  mapping(uint256 => MarketItem) private idToMarketItem;

  struct MarketItem {
    uint256 tokenId;
    address seller;
    address owner;
    uint256 auctionEndDate;
    string category;
    uint256 price;
    bool sold;
  }

  event MarketItemCreated(
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 auctionEndDate,
    string category,
    string tokenURI,
    uint256 price,
    bool sold
  );

  constructor() ERC721("BestBidToken", "BBT") {}

  /// @notice Creates a new ERC721 NFT 
  /// @dev Initialize incrementing a NFT count, create the new NFT, set a NFT URI and calls createMarketItem function 
  /// @param _tokenURI The NFT URI
  /// @param _price The initial price of NFT
  /// @param _auctionEndDate The auction end date for the NFT
  /// @param _category The art category of the NFT
  /// @return newTokenId The id of the recent created NFT
  function createToken(string memory _tokenURI, uint256 _price, uint256 _auctionEndDate, string memory _category)
    public
    returns (uint256)
  {
    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();

    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);
    createMarketItem(newTokenId, _price, _auctionEndDate, _category, _tokenURI);
    return newTokenId;
  }

  /// @notice Creates a new Market Item 
  /// @dev Increase a new market item to idToMarketItem map, transfer the NFT from the user that creates to the contract, and MarketItemCreated event is emitted
  /// @param _tokenId The id of the recent created NFT
  /// @param _price The initial price of NFT
  /// @param _auctionEndDate The auction end date for the NFT
  /// @param _category The art category of the NFT
  /// @param _tokenURI The NFT URI
  function createMarketItem(uint256 _tokenId, uint256 _price, uint256 _auctionEndDate, string memory _category, string memory _tokenURI) public {
    idToMarketItem[_tokenId] = MarketItem(
      _tokenId,
      msg.sender,
      address(this),
      _auctionEndDate,
      _category,
      _price,
      false
    );

    _transfer(msg.sender, address(this), _tokenId);
    emit MarketItemCreated(_tokenId, msg.sender, address(this), _auctionEndDate, _category, _tokenURI, _price, false);
  }

  /// @notice Transfers ownership of the item and the funds between them 
  /// @dev Calls the transferFunds function from DepositsVault contract, updates the MarketItem struct in the idToMarketItem map,
  /// increases the count to _itemsSold, and transfers the ownership of the NFT
  /// @param _tokenId The id of the recent created NFT
  /// @param _buyer The buyer of the NFT
  /// @param _amount The amount of tokens that the NFT was sold
  function createMarketSale(uint256 _tokenId, address _buyer, uint256 _amount) public onlyOwner{
    require(depositVaultAddress != address(0),  "NFTMarketplace: Desposit Vault is null");

    DepositsVault(depositVaultAddress).transferFunds(_buyer, idToMarketItem[_tokenId].seller, _amount);

    idToMarketItem[_tokenId].seller = idToMarketItem[_tokenId].owner;
    idToMarketItem[_tokenId].price = _amount;
    idToMarketItem[_tokenId].owner = _buyer;
    idToMarketItem[_tokenId].sold = true;
    _itemsSold.increment();
    _transfer(address(this), _buyer, _tokenId);
  }

  /// @notice Return a list of unsold market items
  /// @dev Get the current NFT token, verify with the sold items, create an array, initiate a for loop, verify the owner of the NFT token, and save them in the array 
  /// @return items The list of unsold market items
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemCount = _tokenIds.current();
    uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
    uint256 currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(this)) {
        uint256 currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Return a list of all market items
  /// @dev Get the current NFT token, create an array, initiate a for loop, and save them in the array 
  /// @return items The list of all market items
  function fetchAllMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemCount = _tokenIds.current();
    uint256 currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < itemCount; i++) {
        uint256 currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
    }
    return items;
  }

  /// @notice Return a list of my NFTs
  /// @dev Get the current NFT token, initiate a for loop, verify the sender, get the total items of the sender, create an array, initiate a for loop, verify the owner, and save them in the array
  /// @return items The list of list of my NFTs
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _tokenIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint256 currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Returns only items a user has listed
  /// @dev Get the current NFT token, initiate a for loop, verify the sender, get the total items of the sender, create an array, initiate a for loop, verify the seller, and save them in the array
  /// @return items The list of all market items
  function fetchItemsListed() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _tokenIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint256 currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Set DepositVault contract address
  /// @param _depositVaultAddress The DepositVault contract address
  function setDepositsVault(address _depositVaultAddress) public onlyOwner{
    depositVaultAddress = _depositVaultAddress;
  } 
}

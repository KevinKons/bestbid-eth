const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');

describe('NFTMarketplace', function () {
  let nftMarketplace;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplaceFactory.deploy();
    await nftMarketplace.deployed();

    const DaiToken = await ethers.getContractFactory("DaiToken");
    daiToken = await DaiToken.deploy(BigNumber.from("1000000000000000000000000"));
    await daiToken.deployed();

    const DepositsVault = await ethers.getContractFactory("DepositsVault");
    depositsVault = await DepositsVault.deploy(daiToken.address, nftMarketplace.address);
    await depositsVault.deployed();
  })

  describe('Deployment', function () {
    it('NFTMarketplace has a name', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);
      const name = await nftMarketplace.name();
      expect(name).to.equal('BestBidToken');
    });

    it('NFTMarketplace has a symbol', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);
      const name = await nftMarketplace.symbol();
      expect(name).to.equal('BBT');
    });
  });

  describe('CreateToken', function() {
    it('Should create one token', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);

      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation.com", 15, 987874, "modern art");
      const marketItems = await nftMarketplace.fetchMarketItems();

      const tokenId = marketItems[0].tokenId;
      const seller = marketItems[0].seller;
      const owner = marketItems[0].owner;
      const auctionEndDate = marketItems[0].auctionEndDate;
      const category = marketItems[0].category;
      const price = marketItems[0].price;
      const sold = marketItems[0].sold;
      const tokenURI = await nftMarketplace.tokenURI(tokenId);

      expect(marketItems.length).to.equal(1);

      expect(tokenId).to.equal(1);
      expect(seller).to.equal(addr1.address);
      expect(owner).to.equal(nftMarketplace.address);
      expect(price).to.equal(15);
      expect(category).to.equal("modern art");
      expect(tokenURI).to.equal("https://www.mytokenlocation.com");
      expect(auctionEndDate).to.equal(987874);
      expect(sold).to.equal(false);
    });
   
    it('Should return the size and integrity of the data of market items list', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);
      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation.com", 15, 987874, "modern art");
      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation2.com", 20, 415115, "abstract art");
      const marketItems = await nftMarketplace.fetchMarketItems();

      const tokenId0 = marketItems[0].tokenId;
      const seller0 = marketItems[0].seller;
      const owner0 = marketItems[0].owner;
      const auctionEndDate0 = marketItems[0].auctionEndDate;
      const category0 = marketItems[0].category;
      const price0 = marketItems[0].price;
      const sold0 = marketItems[0].sold;
      const tokenURI0 = await nftMarketplace.tokenURI(tokenId0);

      const tokenId1 = marketItems[1].tokenId;
      const seller1 = marketItems[1].seller;
      const owner1 = marketItems[1].owner;
      const auctionEndDate1 = marketItems[1].auctionEndDate;
      const category1 = marketItems[1].category;
      const price1 = marketItems[1].price;
      const sold1 = marketItems[1].sold;
      const tokenURI1 = await nftMarketplace.tokenURI(tokenId1);

      expect(marketItems.length).to.equal(2);

      expect(tokenId0).to.equal(1);
      expect(seller0).to.equal(addr1.address);
      expect(owner0).to.equal(nftMarketplace.address);
      expect(category0).to.equal("modern art");
      expect(price0).to.equal(15);
      expect(tokenURI0).to.equal("https://www.mytokenlocation.com");
      expect(auctionEndDate0).to.equal(987874);
      expect(sold0).to.equal(false);

      expect(tokenId1).to.equal(2);
      expect(seller1).to.equal(addr1.address);
      expect(owner1).to.equal(nftMarketplace.address);
      expect(category1).to.equal("abstract art");
      expect(price1).to.equal(20);
      expect(tokenURI1).to.equal("https://www.mytokenlocation2.com");
      expect(auctionEndDate1).to.equal(415115);
      expect(sold1).to.equal(false);
    });
  });

  describe('Verify DespositsVault Contract Adrress', function() {
    it('Should return the addres of DespositVault Contract', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);

      expect(await nftMarketplace.depositVaultAddress()).to.equal(depositsVault.address);
    });
    
    it('Should be reverted when DepositsVault address was not set', async function () {
      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation.com", 15, 987874, "modern art");
      const marketItems = await nftMarketplace.fetchMarketItems();
      
      const tokenId = marketItems[0].tokenId;
      const amountFinal = BigNumber.from("20");
      
      await expect(nftMarketplace.createMarketSale(tokenId, addr2.address, amountFinal)).to.be.revertedWith('NFTMarketplace: Desposit Vault is null');
    });
  });

  describe('CreateMarketSale', function() {
    it('Should create one Market Sale', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);
      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation.com", 15, 987874, "modern art");
      const marketItems = await nftMarketplace.fetchMarketItems();
      
      const tokenId = marketItems[0].tokenId;
      const owner = marketItems[0].owner;
      const seller = marketItems[0].seller;
      
      const amountMint = BigNumber.from("500");
      const amountAddFunds = BigNumber.from("25");
      const amountFinal = BigNumber.from("20");
      
      await daiToken.connect(addr2).mint(addr2.address, amountMint);
      await daiToken.connect(addr2).approve(depositsVault.address, amountAddFunds);
      await depositsVault.connect(addr2).addFunds(amountAddFunds);

      const fundsAddr1Before = await depositsVault.fundsBalance(addr1.address);
      const fundsAddr2Before = await depositsVault.fundsBalance(addr2.address);
      
      await nftMarketplace.createMarketSale(tokenId, addr2.address, amountFinal);
      
      const fundsAddr2After = await depositsVault.fundsBalance(addr2.address);
      
      const marketItems1 = await nftMarketplace.fetchAllMarketItems();
      
      const tokenId1 = marketItems1[0].tokenId;
      const seller1 = marketItems1[0].seller;
      const owner1 = marketItems1[0].owner;

      expect(tokenId).to.equal(tokenId1);
      expect(seller).to.equal(addr1.address);
      expect(owner).to.equal(nftMarketplace.address);
      expect(seller1).to.equal(owner);
      expect(owner1).to.equal(addr2.address);
      expect(fundsAddr1Before).to.equal(0);
      expect(fundsAddr2Before).to.equal(amountAddFunds);
      expect(fundsAddr2After).to.equal(fundsAddr2Before-amountFinal);
    });
     
    it('Should be reverted when amount is 0', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);
      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation.com", 15, 987874, "modern art");
      const marketItems = await nftMarketplace.fetchMarketItems();
      
      const tokenId = marketItems[0].tokenId;
      
      const amountMint = BigNumber.from("500");
      const amountAddFunds = BigNumber.from("25");
      const amountFinal = BigNumber.from("0");
      
      await daiToken.connect(addr2).mint(addr2.address, amountMint);
      await daiToken.connect(addr2).approve(depositsVault.address, amountAddFunds);
      await depositsVault.connect(addr2).addFunds(amountAddFunds);
      
      await expect(nftMarketplace.createMarketSale(tokenId, addr2.address, amountFinal)).to.be.revertedWith('Amount cannot be 0');
    });

    it('Should return my NFTs', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);
      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation.com", 15, 987874, "modern art");
      const marketItems = await nftMarketplace.fetchMarketItems();
      
      const tokenId = marketItems[0].tokenId;
      
      const amountMint = BigNumber.from("500");
      const amountAddFunds = BigNumber.from("25");
      const amountFinal = BigNumber.from("20");
      
      await daiToken.connect(addr2).mint(addr2.address, amountMint);
      await daiToken.connect(addr2).approve(depositsVault.address, amountAddFunds);
      await depositsVault.connect(addr2).addFunds(amountAddFunds);
      
      await nftMarketplace.createMarketSale(tokenId, addr2.address, amountFinal);
      const myMarketItems = await nftMarketplace.connect(addr2).fetchMyNFTs();
   
      expect(myMarketItems.length).to.equal(1);
    });

    it('Should return my Listed NFTs', async function () {
      nftMarketplace.setDepositsVault(depositsVault.address);
      await nftMarketplace.connect(addr1).createToken("https://www.mytokenlocation.com", 15, 987874, "modern art");
      const listedMarketItems = await nftMarketplace.connect(addr1).fetchItemsListed();
      
      expect(listedMarketItems.length).to.equal(1);
    });
  });
});
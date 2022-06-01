const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');


describe('DepositsVault', function () {
  let daiToken;
  let depositsVault;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

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
    it('DepositsVault has a name', async function () {
      expect(await depositsVault.name()).to.equal('Bestbid deposits vault');
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      expect(await daiToken.balanceOf(owner.address)).to.equal(BigNumber.from('1000000000000000000000000'));
    });
  });

  describe('Adding tokens', function () {
    it('Should tranfer tokens to the contract', async function () {
      const amount = BigNumber.from("1");

      await daiToken.approve(depositsVault.address, amount);
      await depositsVault.addFunds(amount);

      expect(await depositsVault.fundsBalance(owner.address)).to.equal(amount);
    });

    it('Should be reverted when amount is 0', async function () {
      const amount = BigNumber.from("0");
      
      await expect(depositsVault.addFunds(amount)).to.be.revertedWith('Amount cannot be 0');
    });
  });
});
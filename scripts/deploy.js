const { BigNumber } = require('ethers');

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const initialSupply = BigNumber.from('15000000000000000000000'); 

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplaceContract = await NFTMarketplace.deploy();  
    const daiToken = await ethers.getContractFactory("DaiToken");
    const daiTokenContract = await daiToken.deploy(initialSupply);
    const depositsVault = await ethers.getContractFactory("DepositsVault");
    const depositsVaultContract = await depositsVault.deploy(daiTokenContract.address, nftMarketplaceContract.address);
    await nftMarketplaceContract.setDepositsVault(depositsVaultContract.address);
    
    console.log("NFTMarketplace address:", nftMarketplaceContract.address);
    console.log("DaiToken address:", daiTokenContract.address);
    console.log("DepositsVault address:", depositsVaultContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
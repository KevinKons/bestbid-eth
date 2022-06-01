<br />
<p align="center">
  <img src="https://bestbid.dev.pod-expand.becomeholonic.com/bestbid-logo.dd58f27.svg" alt="Corda" width="300">
</p>
<p align="center">
  <img src="https://duckduckgo.com/i/ddebb07e.png" alt="Corda" width="90">
</p>

## About The Project

This project contains the BestBid contracts. The DaiToken contract is a simple ERC20 token to be used on the platform. DepositsVault contract is used as a vault to store DaiToken's from the user, and transfer them when the auction ends. The NFTMarketplace is a contract to create NFT, and make sales on the platform. This project contains good test coverage.

## Running the project

### Pre-Requisites
This project require `Node.js`. 

### Building the project

```
npm install
npx hardhat clean
npx hardhat compile
```

### Running tests
```
npx hardhat test
```

### Running deploy scripts
```
npx hardhat run scripts/deploy.js
```

### Running contracts verifications

Obs.: The arguments.js depend on the constructor of the contract.
```
npx hardhat verify 
--contract contracts/DepositsVault.sol:DepositsVault 
--network bsc 
--constructor-args ./arguments.js 
--show-stack-traces 
<contract_address>
```

### Running test coverage
```
npx hardhat coverage --testfiles "test/*.js" 
```

### Another useful commands
```
npx hardhat accounts
npx hardhat node
npx hardhat help
```


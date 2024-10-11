# qQuest Protocol - Smart Contract Documentation

qQuest is a decentralized platform that facilitates zero-interest savings, community-driven lending circles, and reputation-based memberships using Ethereum smart contracts. This protocol enables users to create personalized savings pools, join peer-to-peer lending circles, and maintain their reputation based on contributions and repayments.

This documentation covers the contracts that form the core of qQuest, namely the ReputationManagment, QQuestP2PCircleMembership, and QQuestSavingPool contracts.

## Table of Contents

1. [Reputation Management Contract](#reputation-management-contract)
2. [Circle Membership Contract](#circle-membership-contract)
3. [Savings Pool Contract](#savings-pool-contract)
4. [Installation](#installation)
5. [License](#license)

## Reputation Management Contract

**Contract Name:** QQuestReputationManagment.sol

This contract manages the reputation system within the qQuest ecosystem. Reputation points are essential as they are used to determine a user's trustworthiness in the platform, especially when participating in lending circles.

### Key Features:

- **Reputation Calculation:** The user's reputation is computed based on two weighted factors:
  - Contributions (40% weight)
  - Repayments (60% weight)
- **Dynamic Slashing:** Users can have their reputation reduced (slashed) based on their tier within the circle membership:
  - Ally: 5% slashing
  - Confidant: 10% slashing
  - Guardian: 15% slashing

### Key Functions:

- `updateUserReputation()`:
  - Updates the reputation of a user based on the number of contributions and repayments.
  - Weights are applied accordingly to generate a score.
- `slashUserReputation()`:
  - Dynamically reduces (slashes) the user's reputation based on their membership tier.
  - Called when certain conditions (e.g., missed repayments) are met.
- `getUserReputation()`:
  - Returns the reputation score for a given user.

## Circle Membership Contract

**Contract Name:** QQuestP2PCircleMembership.sol

This contract handles the issuance and management of soul-bound NFTs that represent membership tiers in the qQuest lending circles. These NFTs are not transferable and represent the user's standing within the community.

### Key Features:

- **Membership Tiers:** Three tiers of membership exist within qQuest, represented by soul-bound NFTs:
  - Ally
  - Confidant
  - Guardian
- **Minimum Builder Score:** A minimum builder score (set to 25 by default) is required for users to be granted access to the system.
- **Soul-Bound Tokens:** These NFTs are non-transferable, meaning users cannot move them between wallets. Additionally, any attempt to interact with non-soul-bound features like approvals or transfers will revert the transaction.

### Key Functions:

- `createUserAccount()`:
  - Allows a user to create an account and mint an Ally NFT, provided they meet the minimum builder score.
  - Verifies the signature from a trusted entity to ensure the legitimacy of the account creation.
- `updateTierAndMintSoulBound()`:
  - Users can upgrade their membership by minting a higher-tier NFT (either Confidant or Guardian) based on the conditions provided.
  - Similar to account creation, a trusted entity's signature is required for tier upgrades.
- `burnNFT()`:
  - The contract admin can burn a user's membership NFT if required (e.g., account termination).
- **Reverts:**
  - Disallows any transfer-related functions (like `safeTransferFrom` or `setApprovalForAll`) since these NFTs are soul-bound.

## Savings Pool Contract

**Contract Name:** QQuestSavingPool.sol

The savings pool contract allows users to create and contribute to savings pools with customizable goals, intervals, and token types (both ETH and ERC20). Users can choose between daily, weekly, or monthly contribution intervals.

### Key Features:

- **Flexible Intervals:** Users can choose between daily, weekly, or monthly contribution schedules.
- **ETH and ERC20 Support:** Pools can be created using ETH or any ERC20 token.
- **Custom Goals:** Users define a savings goal, and the contract manages contributions until the goal is met.
- **Automated Withdrawals:** Upon reaching the goal or expiration of the savings pool, users can withdraw their savings.

### Key Functions:

- `initialiseSavingPoolAndSaving()`:
  - Creates a new savings pool and automatically makes the first contribution.
  - A unique savings ID is generated for each pool, and pool details are stored on-chain.
- `addSavingsContribution()`:
  - Adds a new contribution to an existing savings pool.
  - If the user is contributing ETH, the value must match the contribution requirement for that interval.
- `withdrawFromSavingPool()`:
  - Allows the pool owner to withdraw the balance from the pool once the goal has been met or the pool has expired.
- `calculateSavingTokenValue()` & `calculateSavintTokenAmountFromValue()`:
  - These helper functions calculate the value of the savings pool using Chainlink price feeds, allowing the contract to support both ETH and ERC20 tokens.

# qQuest Protocol - Smart Contract Documentation

## Installation

To deploy and interact with these contracts using Foundry, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd qQuestContracts
   ```

2. Install Foundry:
   If you haven't installed Foundry yet, you can do so by running:

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. Install dependencies:

   ```bash
   forge install
   ```

4. Compile the contracts:

   ```bash
   forge build
   ```

5. Run tests:

   ```bash
   forge test
   ```

6. Deploy the contracts (ensure your environment is configured with a supported Ethereum provider):

   ```bash
   forge create --rpc-url <your_rpc_url> --private-key <your_private_key> src/QQuestReputationManagment.sol:QQuestReputationManagment
   forge create --rpc-url <your_rpc_url> --private-key <your_private_key> src/QQuestP2PCircleMembership.sol:QQuestP2PCircleMembership
   forge create --rpc-url <your_rpc_url> --private-key <your_private_key> src/QQuestSavingPool.sol:QQuestSavingPool
   ```

   Replace `<your_rpc_url>` with your Ethereum node RPC URL and `<your_private_key>` with your deployment account's private key.

7. Interact with the contracts using `cast` (Foundry's command-line tool), ethers.js, or any Ethereum wallet provider.

## License

This repository is licensed under the MIT License. You are free to use, modify, and distribute the code under the terms of the license.

## Additional Notes

- **Trusted Entity:** The `trustedEntity` is a special address that holds the power to verify user accounts and issue upgrades in the membership contract. It should be a secure and reliable address, possibly controlled by the protocol administrators.
- **Reputation Slashing:** Reputation is essential in the lending circles and will be slashed based on negative actions or failures to contribute as promised.

## Future Improvements

- **Governance:** Potentially, introduce a DAO structure where users can participate in governance based on their reputation and membership tier.
- **Dynamic Interest Models:** Consider adding features that allow more complex financial models for advanced savings and lending mechanics.

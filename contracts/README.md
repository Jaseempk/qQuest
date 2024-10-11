# qQuest Protocol - Smart Contract Documentation

qQuest is a decentralized platform aimed at providing a socially trusted, reputation-based P2P funding and savings system. It includes several contracts for reputation management, membership, savings pools, and circle interactions.

## Overview of Contracts

### 1. Core Circle Contract (QQuestP2PCircle.sol)

This contract governs the core functionality of qQuest's peer-to-peer funding circles, which are formed based on social trust, reputation, and tiered memberships.

#### Key Features:

- Funding Circle Creation: Users can create a funding circle, setting rules on participation and contributions.
- Contribution and Repayment Mechanism: The circle members contribute and withdraw funds, while repayment is tracked to ensure proper circle health.
- Tier-Based Access: Users' roles and privileges are tied to their membership tier (Ally, Confidant, Guardian).
- Dynamic Participation: Participants can be added or removed, and contribution schedules are flexible to adapt to various use cases.

#### Core Methods:

- `createCircle()`: Initiates a new funding circle.
- `contributeToCircle()`: Allows members to contribute funds.
- `withdrawFromCircle()`: Facilitates withdrawals from the circle pool.
- `repayLoan()`: Records repayments for borrowed funds.
- `updateCircleStatus()`: Monitors the status of the circle, determining if it's healthy or needs adjustments.

### 2. Reputation Management Contract (QQuestReputationManagment.sol)

This contract is responsible for tracking and updating the reputation of each user, which influences their access to higher tiers and circle participation.

#### Key Features:

- Reputation Calculation: Reputation is calculated based on the user's contributions and repayments. A weighted formula (60% for repayments, 40% for contributions) is used to compute this.
- Slashing Mechanism: If a user defaults on their obligations, their reputation can be "slashed," reducing their ability to participate in certain circles or tiers.
- Tied to Membership Tiers: Users holding higher-tier memberships (Confidant, Guardian) experience different slashing thresholds.

#### Core Methods:

- `updateUserReputation(uint16 contributions, uint16 repayments)`: Updates the reputation score based on user activity.
- `slashUserReputation(address user)`: Decreases a user's reputation in case of default.
- `getUserReputation(address user)`: Returns the current reputation score of a user.

### 3. Membership Contract (QQuestP2PCircleMembership.sol)

The membership contract manages the issuance and control of tiered NFTs (Ally, Confidant, Guardian), which represent a user's standing and access level in the qQuest ecosystem. These NFTs are non-transferable (soulbound) and can only be upgraded or burned.

#### Key Features:

- Soulbound NFTs: Users are assigned a membership tier based on their Builder Score and reputation. The NFTs cannot be transferred between wallets, ensuring that reputation is bound to the individual.
- Tier Progression: Users can upgrade their tier from Ally to Confidant or Guardian by fulfilling certain criteria.
- Trusted Entity Verification: The contract leverages a trusted entity (off-chain service or DAO) to validate requests for minting and tier upgrades.

#### Core Methods:

- `createUserAccount(uint256 builderScore, bytes signature)`: Creates an account and assigns the Ally NFT.
- `updateTierAndMintSoulBound(uint256 newTokenId, bytes signature)`: Upgrades the user's tier to Confidant or Guardian based on validation.
- `burnNFT(address user, uint256 tokenId)`: Allows the admin to burn (invalidate) a user's membership NFT.

#### Events:

- `UserTierUpgraded()`: Triggered when a user's tier is upgraded.
- `UserAccoutCreated()`: Triggered when a new user account is created.

### 4. Savings Pool Contract (QQuestSavingPool.sol)

This contract allows users to set up savings pools with customizable intervals (daily, weekly, monthly) and track contributions toward their saving goals. The pools can accept ETH or ERC20 tokens and utilize Chainlink price oracles to track token value.

#### Key Features:

- Flexible Saving Goals: Users define their saving goals and make contributions over time based on the interval they select.
- Supports ETH and ERC20 Tokens: Pools can be denominated in ETH or any ERC20 token, with Chainlink oracles used for token price data.
- Contribution Schedules: Users contribute regularly based on the interval they choose (daily, weekly, monthly).
- Automated Withdrawals: Upon reaching the savings goal or expiry of the pool, users can withdraw their contributions.
- Precision Tracking: The contract ensures precise handling of contributions and balances through defined constants (e.g., contribution precision, pool value precision).

#### Core Methods:

- `initialiseSavingPoolAndSaving(uint256 goal, address token, SavingInterval interval, uint8 paymentCount, address priceFeed)`: Initializes a new savings pool.
- `addSavingsContribution(bytes32 savingsId)`: Adds a contribution to the savings pool.
- `calculateSavingTokenValue(bytes32 savingsId)`: Computes the current value of the tokens saved.
- `withdrawSavings(bytes32 savingsId)`: Allows the user to withdraw their savings upon completion of the goal or expiry of the pool.

#### Events:

- `GoalInitialised()`: Triggered when a savings goal is initialized.
- `ContributionMade()`: Triggered each time a contribution is made.
- `SavingPoolWithdrawn()`: Triggered when a user withdraws their savings.

## Access Control

Several of the contracts use AccessControl to enforce permission management, ensuring that only trusted entities (admin or authorized contracts) can perform certain actions such as minting NFTs, updating trusted entities, or burning tokens.

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd qquest-contracts
   ```

2. Install Foundry:
   If you haven't installed Foundry yet, you can do so by running:

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   ```

   Then, run `foundryup` to install the latest version.

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

6. Deploy the contracts (replace `<network>` with your desired network, e.g., `mainnet`, `goerli`):
   ```bash
   forge create --rpc-url <network> --private-key <your-private-key> src/QQuestP2PCircle.sol:QQuestP2PCircle
   ```
   Repeat this step for each contract you want to deploy.

## Usage

### Reputation Management:

- Update User Reputation: Call `updateUserReputation` after a user makes a repayment or contribution.
- Slash Reputation: If a user defaults, call `slashUserReputation` to penalize them.
- Get User Reputation: Retrieve the reputation of any user using `getUserReputation`.

### Membership:

- Create an Account: Users can call `createUserAccount` after meeting the minimum Builder Score requirement.
- Upgrade Tier: To move to a higher tier (e.g., from Ally to Confidant), users can call `updateTierAndMintSoulBound`.

### Savings Pool:

- Initialize a Pool: Call `initialiseSavingPoolAndSaving` with the desired goal, interval, and token.
- Contribute to the Pool: Periodically call `addSavingsContribution` to make payments.
- Withdraw Savings: Once the goal is met, call `withdrawSavings` to retrieve the funds.

## Events

The contracts emit several events that you can monitor to track user activity, tier upgrades, and savings pool interactions.

## Conclusion

The qQuest contracts provide a solid foundation for building a reputation-based P2P funding and savings ecosystem, leveraging reputation management, tiered memberships, and customizable savings pools.

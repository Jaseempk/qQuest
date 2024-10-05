# QQuestSavingPool Contract

### Overview

The `QQuestSavingPool` is a savings pool management contract allowing users to create customizable savings goals in both **ETH** and **ERC20 tokens**. It supports flexible saving intervals and integrates with Chainlink price feeds for accurate token valuations.

### Features

- **Customizable Savings Pools**: Users can set goals, contribution schedules (Daily, Weekly, Monthly), and save in ETH or any ERC20 token.
- **Dynamic Contribution Calculations**: Automatically calculates required token contributions based on goal and token price.
- **Chainlink Price Feeds**: Uses Chainlink oracles to convert token contributions to their USD value.
- **Safe Withdrawals**: Allows withdrawal after the pool expires or the goal is achieved.

### Errors

- `QQuest__InvalidSavingsId`: The savings pool ID provided is invalid.
- `QQuest__OnlyOwnerCanAccess`: Only the pool creator can modify or withdraw.
- `QQuest__EthWithdrawalFailed`: ETH withdrawal failed due to low-level call error.
- `QQuest__InvalidEthContribution`: Invalid ETH contribution amount.
- `QQuest__SavingsPoolAlreadyActive`: The savings pool is already active for the user.
- `QQuest__SavingsPoolNotExpiredYet`: Attempted to withdraw before pool expiry.

### Key Constants

- **`ETH_ADDRESS`**: Pseudo address for handling ETH as a token.
- **Durations**:
  - `DAILY_DURATIONS`: 24 hours.
  - `WEEKLY_DURATIONS`: 7 days.
  - `MONTHLY_DURATION`: 30 days.

### Contract Structure

#### Enums

- **`SavingInterval`**: Specifies saving interval types: `Daily`, `Weekly`, `Monthly`.

#### Structs

- **`SavingPoolDetails`**: Stores details of a savings pool, such as:
  - `isActive`: Status of the pool.
  - `isEth`: Whether saving in ETH or ERC20 token.
  - `goalForSaving`: Total saving goal.
  - `tokenToBeSaved`: Address of the token.
  - `intervalType`: The interval at which contributions are made.
  - `expiryTimeStamp`: Pool expiry timestamp.

### Key Functions

#### `initialiseSavingPoolAndSaving()`

Initializes a new savings pool and immediately makes the first contribution. It generates a unique savings ID and stores pool details.

#### `addSavingsContribution()`

Allows the pool owner to add a new contribution towards their saving goal. If the goal is reached, contributions are halted.

#### `withdraw()`

Withdraws the saved amount from the pool after it has expired or the saving goal is reached. Only the pool owner can call this function.

#### `calculateSavingTokenValue()`

Calculates the current value of the saving pool in USD using the Chainlink price feed. Returns value scaled by `POOL_VALUE_PRECISION`.

#### `calculateSavintTokenAmountFromValue()`

Calculates the token amount to contribute based on the current price using the Chainlink price feed. Returns the token amount to match the contribution value in USD.

### Events

- `GoalInitialised`: Emitted when a new saving pool is created.
- `ContributionMade`: Emitted on every new contribution to the pool.
- `SavingPoolWithdrawn`: Emitted when the savings pool is withdrawn.

---

### Example Usage

```solidity
// Initialize a new savings pool with a goal of 100 DAI, monthly contributions, over 10 months
initialiseSavingPoolAndSaving(100e18, DAI_TOKEN_ADDRESS, SavingInterval.Monthly, 10, DAI_PRICE_FEED);

// Add contribution to the pool
addSavingsContribution(savingsId);

// Withdraw savings after the expiry time
withdraw(savingsId);
```

# qQuest: P2P Socially Driven Interest-Free Funding Circle

## Overview

qQuest is a peer-to-peer platform that leverages social trust, reputation, and community participation to provide zero-interest lending circles for crypto holders. Our mission is to solve the liquidity dilemma faced by long-term crypto investors while fostering a supportive community ecosystem.

## Key Features

### 1. Zero-Interest Funding Circles

- Create or join funding circles with specific goals and timeframes
- Access liquidity without selling assets or incurring debt

### 2. Reputation System

- Tier Levels: Ally, Confidant, Guardian
- Dynamic reputation scoring (0-1000) based on platform activity
- Factors: successful repayments, lending participation, circle creation, community engagement

### 3. Collateralized Funding

- Use crypto assets as collateral
- Collateral ratios determined by reputation tier

### 4. Smart Contract Security

- Automated processes for collateral locking, fund distribution, and repayment tracking
- Transparent and tamper-proof agreements

### 5. Flexible Repayment Terms

- Set by circle creators to accommodate various needs

### 6. Personal Savings Pools

- Create pools with specific goals and timeframes

### 7. Onboarding and Platform Gating

- Utilizes Talent Protocol's builder score for initial access
- Minimum builder score required (e.g., 25)

### 8. User Incentives

- Platform fee revenue pool filled by borrower's fees upon successful debt repayment
- Quarterly distribution of a portion of the fee revenue pool to top two tier users (Confidants and Guardians)
- Encourages active participation and maintaining high reputation scores

## How It Works

1. **User Registration**: Sign up and complete the Talent Protocol builder score assessment
2. **Create or Join a Circle**:
   - To create: Set circle details, goal amount, duration, and lock collateral
   - To join: Browse open circles and contribute funds
3. **Circle Lifecycle**:
   - Funding period
   - Goal reached: Funds released to creator
   - Repayment period begins
4. **Repayment**:
   - Creator repays according to set terms
   - Successful repayment increases reputation
   - Late payments or defaults result in reputation slashing
5. **Circle Completion**:

   - Collateral released upon full repayment
   - Reputation scores updated for all participants

6. **Fee Collection and Distribution**:

   - borrowers pay a small platform fee upon successful debt repayment
   - Fees accumulate in the platform fee revenue pool
   - Quarterly distribution of a portion of the pool to Confidant and Guardian tier users
   - Distribution amount based on user's activity and reputation score

## Technical Stack

- Smart Contracts: Solidity
- Development Framework: Foundry
- Subgraphs:The graph
- Frontend: Next with Web3 integration
- Blockchain: Deployed on Base (Ethereum Layer 2)

## License

qQuest is released under the [MIT License](LICENSE).

## Disclaimer

qQuest is an experimental protocol. While we strive for security and reliability, users should be aware of the risks associated with DeFi platforms. Always do your own research and never invest more than you can afford to lose.

---

Join us in revolutionizing peer-to-peer lending in the crypto space! Together, we're building a more inclusive and supportive financial ecosystem.

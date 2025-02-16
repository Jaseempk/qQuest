-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

DEFAULT_KEY := 

help:
	@echo "Usage:"
	@echo "  make deploy [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""
	@echo ""
	@echo "  make fund [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""

all: clean remove install update build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install :; 

# Update Dependencies
update:; forge update

build:; forge build

test :; forge test 

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

NETWORK_ARGS := --rpc-url $(ALCHEMY_RPC_URL) --private-key $(METAMASK_PRIVATE_KEY) --broadcast

ifeq ($(findstring --network ethereum,$(ARGS)),--network ethereum)
	NETWORK_ARGS := --rpc-url $(ALCHEMY_RPC_URL) --private-key $(METAMASK_PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
endif

deploy:
	@forge script script/DeployeLockerFactory.s.sol:DeployeLockerFactory $(NETWORK_ARGS)
#@forge script script/DeploySocialDexDeployer.s.sol:DeploySocialDexDeployer $(NETWORK_ARGS)
#@forge script script/DeployQQuestMembership.s.sol:DeployQQuestMembership $(NETWORK_ARGS)
#@forge script script/Mock/DeployMockUSDC.s.sol:DeployMockUSDC $(NETWORK_ARGS)
#@forge script script/Mock/DeployMockUSDT.s.sol:DeployMockUSDT $(NETWORK_ARGS)



verify:
#@forge verify-contract --chain-id 84532 --watch --constructor-args `cast abi-encode "constructor(uint256,uint256,uint96,address)" "$(ALLY_THRESHOLD)" "$(GUARDIAN_THRESHOLD)" "$(FEEPERCENT_VALUE)" "$(MEMBERSHIP_ADDRESS)"` --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version 0.8.24 0x87B9a8CeFC5ff1411C380266Cb13967C30931c02 src/QQuestP2PCircle.sol:QQuestP2PCircle
#@forge verify-contract --chain-id 84532 --watch --constructor-args `cast abi-encode "constructor(string,string,string,address)" "$(NAME)" "$(VERSION)" "$(TOKEN_URI)" "$(TRUSTED_ENTITY)"` --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version 0.8.24 0x54CDf5787f7b5B585687Fe83cD1A460fe5b94c7f src/QQuestP2PCircleMembership.sol:QQuestP2PCircleMembership
#@forge verify-contract --chain-id 84532 --watch --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version 0.8.24 0xC129124eA2Fd4D63C1Fc64059456D8f231eBbed1 test/Mocks/MockUSDC.sol:MockUSDC
#@forge verify-contract --chain-id 8453 --watch --constructor-args `cast abi-encode "constructor(address,address,uint64, uint256,address)" "$(TOKEN)" "$(BENEFICIARY)" "$(DURATIONSECONDS)" "$(FEE)" "$(FEERECIPIENT)"` --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version v0.8.25 0xD6D7e8357792789bbe4478e0D4Ec42490e9e4cB1 src/LpLocker.sol:LpLocker
	@forge verify-contract --chain-id 8453 --watch --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version v0.8.27 0xAaA860Fe95C411B99e69d2c389A769452B7b5d8a src/LockerFactoory.sol:LockerFactoory
#@forge verify-contract --chain-id 8453 --watch --constructor-args `cast abi-encode "constructor(address,address,address,address,address,uint64,address)" "$(TAX_COLLECTOR)" "$(WETH)" "$(LOCKER)" "$(UNIV3)" "$(POSITION_MANAGER)" "$(DEFAULT_LOCKING)" "$(SWAP_ROUTER)"` --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version v0.8.27 0xA0ae602f31BBF85b5A105BAabe8719205B9eACC5 src/SocialDexDeplooyer.sol:SocialDexDeplooyer

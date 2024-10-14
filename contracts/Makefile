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
	@forge script script/DeployQQuestCircle.s.sol:DeployQQuestCircle $(NETWORK_ARGS)
	@forge script script/DeployQQuestMembership.s.sol:DeployQQuestMembership $(NETWORK_ARGS)



verify:
	@forge verify-contract --chain-id 84532 --watch --constructor-args `cast abi-encode "constructor(string,string,string,address)" "$(NAME)" "$(VERSION)" "$(TOKEN_URI)" "$(TRUSTED_ENTITY)"` --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version 0.8.24 0x99aE5Be5501b517cd6459198cf9B1D6e3911A286 src/QQuestP2PCircleMembership.sol:QQuestP2PCircleMembership
	@forge verify-contract --chain-id 84532 --watch --constructor-args `cast abi-encode "constructor(uint256,uint256,uint96,address)" "$(ALLY_THRESHOLD)" "$(GUARDIAN_THRESHOLD)" "$(FEEPERCENT_VALUE)" "$(MEMBERSHIP_ADDRESS)"` --etherscan-api-key $(ETHERSCAN_API_KEY) --compiler-version 0.8.24 0x5692A875EA2F769Bf20809Dd7DcFF14aefD82157 src/QQuestP2PCircle.sol:QQuestP2PCircle


//SPDX-License-Identifier:MIT

pragma solidity 0.2.24;

import {ERC721} from "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {EIP712} from "lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "lib/openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol";
import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";

contract QQuestP2PCircleMembership is ERC721, EIP712, AccessControl {
    using SignatureChecker for address;

    //Error
    error QQuest__InvalidSignature();
    error QQuest__NonSoulBoundOpNotAllowed();
    error QQuest__CantHaveNullTrustedEntity();

    uint256 private counter;
    string constant VERSION = "1.1";
    bytes32 public constant MINT_REQUEST_TYPE_HASH =
        keccak256("MintRequest(address userAddress,uint256 newTokenId)");

    bytes32 public constant TRUSTED_ENTITY = keccak256("TRUSTED_ENTITY");

    mapping(address => mapping(uint256 => TierLevels)) public userToTierId;

    enum TierLevels {
        Entry,
        Mid,
        Top
    }

    struct MintRequest {
        address userAddress;
        uint256 newTokenId;
    }

    struct UserDeets {
        uint256 numberOfContributions;
        uint256 numberOfRepayments;
    }

    event UserTierUpgraded(address user, uint256 tokenId);

    constructor(
        string name,
        string symbol,
        address trustedEntity
    ) ERC721(name, symbol) EIP712(name, VERSION) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRUSTED_ENTITY, trustedEntity);
    }

    function createUserAccount(uint256 builderScore) public {
        counter++;
        userToTierId[msg.sender][counter] = TierLevels.Entry;

        _mint(msg.sender, counter);
    }

    function updateTierAndMintSoulBound(
        uint256 newTokenId,
        bytes32 signature
    ) public {
        bytes32 digest = mintRequestHelper(msg.sender, newTokenId);
        if (!trustedEntity.isValidSignatureNow(digest, signature))
            revert QQuest__InvalidSignature();

        event UserTierUpgraded(address user,uint256 tokenId);
        _mint(msg.sender, counter);
    }

    function updateReputationScore() public {}

    /// @notice Helper function to generate the EIP-712 typed data hash for a mint request
    /// @param _toAddress The address to mint the NFT to
    /// @return The EIP-712 typed data hash for the mint request
    function mintRequestHelper(
        address _toAddress,
        uint256 newTokenId
    ) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(MINT_REQUEST_TYPE_HASH, _toAddress, newTokenId)
                )
            );
    }

    /// @notice Reverts when attempting a safe transfer from operation
    /// @dev This function is overridden to prevent transfers of soulbound NFTs
    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override(ERC721) {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Reverts when attempting a transfer from operation
    /// @dev This function is overridden to prevent transfers of soulbound NFTs
    function transferFrom(
        address,
        address,
        uint256
    ) public virtual override(ERC721) {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Reverts when attempting to check if an address is approved for all
    /// @dev This function is overridden to prevent approval operations on soulbound NFTs
    function isApprovedForAll(
        address,
        address
    ) public pure override(ERC721) returns (bool) {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Reverts when attempting to set approval for all
    /// @dev This function is overridden to prevent approval operations on soulbound NFTs
    function setApprovalForAll(address, bool) public pure override(ERC721) {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Reverts when attempting to get the approved address for a token ID
    /// @dev This function is overridden to prevent approval operations on soulbound NFTs
    function getApproved(
        uint256
    ) public pure override(ERC721) returns (address) {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Reverts when attempting to approve an address for a token ID
    /// @dev This function is overridden to prevent approval operations on soulbound NFTs
    function approve(address, uint256) public pure override(ERC721) {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }


        /// @notice Grants the TRUSTED_ENTITY role to a new address
    /// @param _newEntity The address to grant the TRUSTED_ENTITY role to
    /// @dev Only the contract admin (DEFAULT_ADMIN_ROLE) can call this function
    function updateTrustedIdentityRole(
        address _newEntity
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_newEntity == address(0)) revert QQuest__CantHaveNullTrustedEntity();
        trustedEntity = _newEntity;
        _grantRole(TRUSTED_ENTITY, _newEntity);
    }

    /// @notice Revokes the TRUSTED_ENTITY role from an address
    /// @param entity The address to revoke the TRUSTED_ENTITY role from
    /// @dev Only the contract admin (DEFAULT_ADMIN_ROLE) can call this function
    function revokeTrustedEntityRole(
        address newEntity
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newEntity == address(0)) revert QQuest__CantHaveNullTrustedEntity();

        trustedEntity = address(0);
        _revokeRole(TRUSTED_ENTITY, newEntity);
    }
}

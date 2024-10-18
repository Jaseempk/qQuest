//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {EIP712} from "lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import {ERC1155} from "lib/openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {SignatureChecker} from "lib/openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol";
import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";

/**
 * @title QQuestP2PCircleMembership
 * @dev This contract manages membership tiers for the QQuest P2P Circle platform.
 * @notice It implements a tiered membership system using ERC1155 tokens, with EIP712 for secure minting.
 *
 * @dev Key features:
 * - Utilizes ERC1155 for multi-token standard
 * - Implements EIP712 for secure, off-chain signature verification
 * - Incorporates AccessControl for role-based permissions
 * - Manages three membership tiers: Ally, Confidant, and Guardian
 * - Allows trusted entity to sign mint requests for new members
 * - Enforces a minimum builder score for account creation
 *
 * @dev This contract is central to the reputation and access control system of the QQuest platform,
 * enabling users to earn and upgrade their membership status based on their platform activity.
 */
contract QQuestP2PCircleMembership is ERC1155, EIP712, AccessControl {
    using SignatureChecker for address;

    //Error
    error QQuest__InvalidTokenId();
    error QQuest__InvalidSignature();
    error QQuest__NeedMinimumBuilderScore();
    error QQuest__NonSoulBoundOpNotAllowed();
    error QQuest__CantHaveNullTrustedEntity();

    address private trustedEntity; // Address of the trusted entity that can sign mint requests
    string constant VERSION = "1.11"; // Version of the contract
    uint8 public constant MIN_BUILDER_SCORE = 25; // Minimum builder score required for account creation
    uint256 public constant ALLY_TOKEN_ID = 65108108121; // Token ID for the Ally tier
    uint256 public constant CONFIDANT_TOKEN_ID = 6711111010210510097110116; // Token ID for the Confidant tier
    uint256 public constant GUARDIAN_TOKEN_ID = 711179711410010597110; // Token ID for the Guardian tier
    bytes32 public constant MINT_REQUEST_TYPE_HASH =
        keccak256("MintRequest(address userAddress,uint256 newTokenId)"); // EIP712 type hash for mint requests

    bytes32 public constant TRUSTED_ENTITY = keccak256("TRUSTED_ENTITY"); // Role identifier for the trusted entity

    struct MintRequest {
        address userAddress; // Address of the user requesting a mint
        uint256 newTokenId; // Token ID to be minted
    }

    struct UserDeets {
        uint256 numberOfContributions; // Number of contributions made by the user
        uint256 numberOfRepayments; // Number of repayments made by the user
    }

    event UserTierUpgraded(address user, uint256 tokenId);
    event UserAccoutCreated(address user, uint256 tokenId);

    /**
     * @notice Initializes the QQuestP2PCircleMembership contract
     * @dev Sets up the ERC1155 and EIP712 functionalities, and assigns roles
     * @param name The name of the contract for EIP712
     * @param version The version of the contract for EIP712
     * @param uri The URI for the ERC1155 token metadata
     * @param _trustedEntity The address of the trusted entity that can sign mint requests
     */
    constructor(
        string memory name,
        string memory version,
        string memory uri,
        address _trustedEntity
    ) ERC1155(uri) EIP712(name, version) {
        trustedEntity = _trustedEntity;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRUSTED_ENTITY, _trustedEntity);
    }

    /**
     * @notice Creates a new user account and mints an ALLY tier token
     * @dev Requires a minimum builder score and a valid signature from the trusted entity
     * @param builderScore The builder score of the user
     * @param signature The signature from the trusted entity to authorize the account creation
     */
    function createUserAccount(
        uint256 builderScore,
        bytes memory signature
    ) public {
        // Check if the builder score meets the minimum requirement
        if (builderScore < MIN_BUILDER_SCORE) {
            revert QQuest__NeedMinimumBuilderScore();
        }

        // Generate the digest for the mint request
        bytes32 digest = mintRequestHelper(msg.sender, ALLY_TOKEN_ID);

        // Verify the signature from the trusted entity
        if (!trustedEntity.isValidSignatureNow(digest, signature)) {
            revert QQuest__InvalidSignature();
        }

        // Emit an event for the user account creation
        emit UserAccoutCreated(msg.sender, ALLY_TOKEN_ID);

        // Mint the ALLY tier token to the user
        _mint(msg.sender, ALLY_TOKEN_ID, 1, "");
    }

    /**
     * @notice Updates the user's tier and mints a new soulbound token
     * @dev This function can only upgrade to CONFIDANT or GUARDIAN tier
     * @param newTokenId The ID of the new tier token to mint
     * @param signature The signature from the trusted entity to authorize the upgrade
     */
    function updateTierAndMintSoulBound(
        uint256 newTokenId,
        bytes memory signature
    ) public {
        // Generate the digest for the mint request
        bytes32 digest = mintRequestHelper(msg.sender, newTokenId);

        // Ensure the new token ID is valid (either CONFIDANT or GUARDIAN)
        if (
            newTokenId != CONFIDANT_TOKEN_ID && newTokenId != GUARDIAN_TOKEN_ID
        ) {
            revert QQuest__InvalidTokenId();
        }

        // Verify the signature from the trusted entity
        if (!trustedEntity.isValidSignatureNow(digest, signature)) {
            revert QQuest__InvalidSignature();
        }

        // Emit an event for the tier upgrade
        emit UserTierUpgraded(msg.sender, newTokenId);

        // Mint the new soulbound token to the user
        _mint(msg.sender, newTokenId, 1, "");
    }

    /// @notice Burns (destroys) a QQM NFT
    /// @param _tokenId The token ID of the QQM to burn
    /// @dev Only the contract owner can call this function
    function burnNFT(
        address user,
        uint256 _tokenId,
        uint8 count
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(user, _tokenId, count);
    }

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

    /// @notice Disallows safe transfer of tokens as they are soulbound
    /// @dev Overrides ERC1155 safeTransferFrom function
    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual override {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Disallows safe batch transfer of tokens as they are soulbound
    /// @dev Overrides ERC1155 safeBatchTransferFrom function
    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Disallows setting approval for all as tokens are soulbound
    /// @dev Overrides ERC1155 setApprovalForAll function
    function setApprovalForAll(address, bool) public virtual override {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    /// @notice Always returns false for approval status as tokens are soulbound
    /// @dev Overrides ERC1155 isApprovedForAll function
    /// @return Always returns false
    function isApprovedForAll(
        address,
        address
    ) public view virtual override returns (bool) {
        return false;
    }

    /// @notice Grants the TRUSTED_ENTITY role to a new address
    /// @param _newEntity The address to grant the TRUSTED_ENTITY role to
    /// @dev Only the contract admin (DEFAULT_ADMIN_ROLE) can call this function
    function updateTrustedIdentityRole(
        address _newEntity
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_newEntity == address(0)) {
            revert QQuest__CantHaveNullTrustedEntity();
        }
        trustedEntity = _newEntity;
        _grantRole(TRUSTED_ENTITY, _newEntity);
    }

    /// @notice Revokes the TRUSTED_ENTITY role from an address
    /// @param newEntity The address to revoke the TRUSTED_ENTITY role from
    /// @dev Only the contract admin (DEFAULT_ADMIN_ROLE) can call this function
    function revokeTrustedEntityRole(
        address newEntity
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newEntity == address(0)) revert QQuest__CantHaveNullTrustedEntity();

        trustedEntity = address(0);
        _revokeRole(TRUSTED_ENTITY, newEntity);
    }

    /// @notice Returns whether the contract supports a given interface ID
    /// @param interfaceId The interface ID to check for support
    /// @return A boolean indicating whether the interface is supported
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

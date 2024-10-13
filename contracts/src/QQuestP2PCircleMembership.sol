//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {EIP712} from "lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import {ERC1155} from "lib/openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {SignatureChecker} from "lib/openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol";
import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";

contract QQuestP2PCircleMembership is ERC1155, EIP712, AccessControl {
    using SignatureChecker for address;

    //Error
    error QQuest__InvalidTokenId();
    error QQuest__InvalidSignature();
    error QQuest__NeedMinimumBuilderScore();
    error QQuest__NonSoulBoundOpNotAllowed();
    error QQuest__CantHaveNullTrustedEntity();

    address private trustedEntity;
    string constant VERSION = "1.11";
    uint8 public constant MIN_BUILDER_SCORE = 25;
    uint256 public constant ALLY_TOKEN_ID = 65108108121;
    uint256 public constant CONFIDANT_TOKEN_ID = 6711111010210510097110116;
    uint256 public constant GUARDIAN_TOKEN_ID = 711179711410010597110;
    bytes32 public constant MINT_REQUEST_TYPE_HASH =
        keccak256("MintRequest(address userAddress,uint256 newTokenId)");

    bytes32 public constant TRUSTED_ENTITY = keccak256("TRUSTED_ENTITY");

    struct MintRequest {
        address userAddress;
        uint256 newTokenId;
    }

    struct UserDeets {
        uint256 numberOfContributions;
        uint256 numberOfRepayments;
    }

    event UserTierUpgraded(address user, uint256 tokenId);
    event UserAccoutCreated(address user, uint256 tokenId);

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

    function createUserAccount(
        uint256 builderScore,
        bytes memory signature
    ) public {
        if (builderScore < MIN_BUILDER_SCORE) {
            revert QQuest__NeedMinimumBuilderScore();
        }

        bytes32 digest = mintRequestHelper(msg.sender, ALLY_TOKEN_ID);

        if (!trustedEntity.isValidSignatureNow(digest, signature)) {
            revert QQuest__InvalidSignature();
        }

        _mint(msg.sender, ALLY_TOKEN_ID, 1, "");
    }

    function updateTierAndMintSoulBound(
        uint256 newTokenId,
        bytes memory signature
    ) public {
        bytes32 digest = mintRequestHelper(msg.sender, newTokenId);
        if (
            newTokenId != CONFIDANT_TOKEN_ID && newTokenId != GUARDIAN_TOKEN_ID
        ) {
            revert QQuest__InvalidTokenId();
        }
        if (!trustedEntity.isValidSignatureNow(digest, signature)) {
            revert QQuest__InvalidSignature();
        }

        emit UserTierUpgraded(msg.sender, newTokenId);
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

    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual override {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

    function setApprovalForAll(address, bool) public virtual override {
        revert QQuest__NonSoulBoundOpNotAllowed();
    }

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

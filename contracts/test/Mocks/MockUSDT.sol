// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor() ERC20("Tether USD", "USDT") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function approve(
        address spender,
        uint256 amount
    ) public virtual override returns (bool) {
        address owner = _msgSender();
        require(
            _allowances[owner][spender] == 0 || amount == 0,
            "USDT: Set allowance to 0 first"
        );
        _approve(owner, spender, amount);
        return true;
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}

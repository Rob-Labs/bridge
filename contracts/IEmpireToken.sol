// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IEmpireToken {
    function mint(address account, uint256 tAmount) external;

    function burn(address account, uint256 tAmount) external;
}

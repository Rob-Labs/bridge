// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEmpireToken {
    function mint(address account, uint256 tAmount) external;

    function burn(address account, uint256 tAmount) external;
}

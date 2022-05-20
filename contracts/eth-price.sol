// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/AggregatorV3Interface.sol";

contract ETHPrice {
    using SafeMath for uint;
    AggregatorV3Interface internal priceFeed;
    uint public fee;
    address public admin;
    /**
     * Network: Rinkeby
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    constructor(uint fee_) {
        priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        admin = msg.sender;
        fee = fee_;
    }
    
    event ChangeFee(uint oldFee, uint newFee, uint time);


    modifier onlyAdmin() {
        require(msg.sender == admin, "Can only be called by Amdin");
        _;
    }

    function setFee(uint fee_) public onlyAdmin {
        uint previousFee = fee;
        fee = fee_;
        emit ChangeFee(previousFee, fee, block.timestamp);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function calculateFee() public view returns (uint) {
        uint price = uint(getLatestPrice());
        uint dec = 1e18;
    //  usdprice = price / 1e8
    // 1e18 price = usdprice
    // 1 eth = 1900usd
    // 1 usd = 10e18 / 1900
    // 40 usd = 40 usd * 1 us
        // uint usdPrice = price.div(1,2);
        uint usdPrice = price.div(1e8, "division by zero");
        uint pricePerUsd = dec.div(usdPrice, "division by zero");
        uint feeToDeduct = pricePerUsd.mul(fee);
        return feeToDeduct;



    }


}

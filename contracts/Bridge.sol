// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IEmpireToken.sol";

contract Bridge {
    address public validator;
    uint256 public fee = 50;
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 private currentNonce = 0;
    address payable public feeRecevier;
    mapping(bytes32 => bool) public processedSwap;
    mapping(bytes32 => bool) public processedRedeem;
    mapping(string => address) public tickerToToken;
    mapping(uint256 => bool) public activeChainIds;

    event LogSwapInitialized(address indexed from, address indexed to, uint256 amount, string ticker, uint256 chainTo, uint256 chainFrom, uint256 nonce);
    event LogRedeemed(address indexed from, address indexed to, uint256 amount, string ticker, uint256 chainTo, uint256 chainFrom, uint256 nonce);
    event LogWithdrawalFee(address indexed account, uint256 amount);
    event LogFeeUpdated(uint256 oldFee, uint256 newFee);
    event LogValidatorUpdated(address oldValidator, address newValidator);
    event LogFeeRecevierUpdated(address oldFeeRecevier, address newFeeRecevier);
    event LogSupportedChain(uint256 chainId, bool status);
    event LogAddSupportedToken(string ticker, address tokenAddress);
    event LogRemooveSupportedToken(string ticker, address tokenAddress);

    bool internal locked;

    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "Can't set to the zero address");
        _;
    }

    modifier noReentrant() {
        require(!locked, "No Reentrant");
        locked = true;
        _;
        locked = false;
    }

    constructor(address payable _feeRecevier) nonZeroAddress(_feeRecevier) {
        validator = msg.sender;

        feeRecevier = _feeRecevier;
    }

    function swap(
        address to,
        uint256 amount,
        string memory ticker,
        uint256 chainTo,
        uint256 chainFrom
    ) external payable {
        uint256 _fee = calculateFee();
        require(msg.value >= _fee, "Swap fee is not fulfilled");
        require(getChainID() == chainFrom, "invalid chainFrom");
        require(activeChainIds[chainTo], "ChainTo is not Active");

        uint256 nonce = currentNonce;
        currentNonce++;

        require(!processedSwap[keccak256(abi.encodePacked(msg.sender, to, amount, chainFrom, chainTo, ticker, nonce))], "swap already processed");
        bytes32 hash_ = keccak256(abi.encodePacked(msg.sender, to, amount, chainFrom, chainTo, ticker, nonce));

        processedSwap[hash_] = true;

        emit LogSwapInitialized(msg.sender, to, amount, ticker, chainTo, chainFrom, nonce);

        address token = tickerToToken[ticker];
        IEmpireToken(token).burn(msg.sender, amount);
    }

    function redeem(
        address from,
        address to,
        uint256 amount,
        string memory ticker,
        uint256 chainFrom,
        uint256 chainTo,
        uint256 nonce,
        bytes calldata signature
    ) external {
        bytes32 hash_ = keccak256(abi.encodePacked(from, to, amount, ticker, chainFrom, chainTo, nonce));
        require(!processedRedeem[hash_], "Redeem already processed");
        processedRedeem[hash_] = true;

        require(getChainID() == chainTo, "invalid chainTo");
        require(recoverSigner(hashMessage(hash_), signature) == validator, "invalid sig");

        emit LogRedeemed(from, to, amount, ticker, chainTo, chainFrom, nonce);

        address token = tickerToToken[ticker];
        IEmpireToken(token).mint(to, amount);
    }

    /**
     * @dev Recover signer address from a message by using their signature
     * @param message bytes32 message, the hash is the signed message. What is recovered is the signer address.
     * @param sig bytes signature, the signature is generated using web3.eth.sign()
     */
    function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            uint8,
            bytes32,
            bytes32
        )
    {
        require(sig.length == 65, "Not Valid Sig Lenght");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function hashMessage(bytes32 message) private pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, message));
    }

    function isFeeRecevier() internal view returns (bool) {
        return (feeRecevier == msg.sender);
    }

    modifier onlyFeeRecevier() {
        require(isFeeRecevier(), "DENIED : Not FeeRecevier");
        _;
    }

    function isValidator() internal view returns (bool) {
        return (validator == msg.sender);
    }

    modifier onlyValidator() {
        require(isValidator(), "DENIED : Not Validator");
        _;
    }

    function getChainID() public view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    function updateChainById(uint256 chainId, bool isActive) external onlyValidator {
        emit LogSupportedChain(chainId, isActive);
        activeChainIds[chainId] = isActive;
    }

    function includeToken(string memory ticker, address addr) external onlyValidator {
        emit LogAddSupportedToken(ticker, addr);
        tickerToToken[ticker] = addr;
    }

    function excludeToken(string memory ticker) external onlyValidator {
        address tokenAddress = tickerToToken[ticker];
        emit LogRemooveSupportedToken(ticker, tokenAddress);
        delete tickerToToken[ticker];
    }

    function updateValidator(address newValidator) external onlyValidator nonZeroAddress(newValidator) {
        emit LogValidatorUpdated(validator, newValidator);
        validator = newValidator;
    }

    function updateFeeRecevier(address payable newFeeRecevier) external onlyValidator nonZeroAddress(newFeeRecevier) {
        emit LogFeeRecevierUpdated(feeRecevier, newFeeRecevier);
        feeRecevier = newFeeRecevier;
    }

    function updateFee(uint256 newFee) external onlyValidator {
        emit LogFeeUpdated(fee, newFee);
        fee = newFee;
    }

    function calculateFee() public view returns (uint256) {
        return (fee * (1e18)) / FEE_DENOMINATOR;
    }

    function withdrawFee() external onlyFeeRecevier noReentrant {
        uint256 amount = (address(this)).balance;
        emit LogWithdrawalFee(feeRecevier, amount);

        feeRecevier.transfer(amount);
    }

    receive() external payable {}
}

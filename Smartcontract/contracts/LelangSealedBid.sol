// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LelangSealedBid {
    struct Bid {
        bytes32 blindedBid;
        uint256 deposit;
    }

    address public seller;
    uint256 public biddingEnd;
    uint256 public revealEnd;
    bool public ended;

    address public highestBidder;
    uint256 public highestBid;

    mapping(address => Bid) private bids;
    mapping(address => uint256) private pendingReturns;

    enum AuctionState { Bidding, Revealing, Ended }

    event AuctionEnded(address winner, uint256 highestBid);

    modifier onlyBefore(uint256 _time) {
        require(block.timestamp < _time, "Terlalu lambat!");
        _;
    }

    modifier onlyAfter(uint256 _time) {
        require(block.timestamp > _time, "Terlalu cepat!");
        _;
    }

    constructor(uint256 _biddingTime, uint256 _revealTime) {
        seller = msg.sender;
        biddingEnd = block.timestamp + _biddingTime;
        revealEnd = biddingEnd + _revealTime;
    }

    function getAuctionState() public view returns (AuctionState) {
        if (block.timestamp < biddingEnd) return AuctionState.Bidding;
        if (block.timestamp < revealEnd) return AuctionState.Revealing;
        return AuctionState.Ended;
    }

    function bid(bytes32 _blindedBid) external payable onlyBefore(biddingEnd) {
        require(bids[msg.sender].blindedBid == 0, "Anda sudah mengajukan bid!");
        bids[msg.sender] = Bid({
            blindedBid: _blindedBid,
            deposit: msg.value
        });
    }

    function reveal(uint256 _value, string memory _secret) external onlyAfter(biddingEnd) onlyBefore(revealEnd) {
        Bid storage userBid = bids[msg.sender];
        require(userBid.blindedBid != 0, "Anda tidak memiliki bid untuk dibuka!");
        require(userBid.blindedBid == keccak256(abi.encodePacked(_value, _secret)), "Hash bid tidak cocok!");

        uint256 refund = userBid.deposit;
        if (userBid.deposit >= _value) {
            if (_value > highestBid) {
                if (highestBidder != address(0)) {
                    pendingReturns[highestBidder] += highestBid;
                }
                highestBid = _value;
                highestBidder = msg.sender;
                refund -= _value;
            }
        }
        
        userBid.blindedBid = 0;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }

    function withdraw() external {
        uint256 amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            payable(msg.sender).transfer(amount);
        }
    }

    function auctionEnd() external onlyAfter(revealEnd) {
        require(!ended, "Fungsi end lelang sudah pernah dijalankan!");
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        payable(seller).transfer(highestBid);
    }
}

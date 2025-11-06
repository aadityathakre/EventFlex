// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationSystem is Ownable {
    
    struct Review {
        address reviewer;
        address reviewee;
        uint8 rating;
        string reviewText;
        uint256 eventId;
        uint256 timestamp;
        string reviewType;
    }
    
    struct ReputationScore {
        uint256 totalRating;
        uint256 reviewCount;
        uint8 trustLevel;
        uint256 lastUpdated;
    }
    
    mapping(address => ReputationScore) public reputationScores;
    mapping(bytes32 => bool) public reviewExists;
    Review[] public reviews;
    
    event ReviewSubmitted(address indexed reviewer, address indexed reviewee, uint8 rating);
    
    constructor() Ownable(msg.sender) {}
    
    function submitReview(
        address _reviewee,
        uint8 _rating,
        string memory _reviewText,
        uint256 _eventId,
        string memory _reviewType
    ) external {
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        
        bytes32 reviewHash = keccak256(abi.encodePacked(msg.sender, _reviewee, _eventId));
        require(!reviewExists[reviewHash], "Review already exists");
        
        reviews.push(Review({
            reviewer: msg.sender,
            reviewee: _reviewee,
            rating: _rating,
            reviewText: _reviewText,
            eventId: _eventId,
            timestamp: block.timestamp,
            reviewType: _reviewType
        }));
        
        reviewExists[reviewHash] = true;
        _updateReputation(_reviewee, _rating);
        
        emit ReviewSubmitted(msg.sender, _reviewee, _rating);
    }
    
    function _updateReputation(address _user, uint8 _rating) internal {
        ReputationScore storage userRep = reputationScores[_user];
        userRep.totalRating += _rating;
        userRep.reviewCount += 1;
        userRep.lastUpdated = block.timestamp;
        
        uint256 avgRating = (userRep.totalRating * 10) / userRep.reviewCount;
        userRep.trustLevel = _calculateTrustLevel(avgRating, userRep.reviewCount);
    }
    
    function _calculateTrustLevel(uint256 _avgRating, uint256 _reviewCount) internal pure returns (uint8) {
        if (_reviewCount < 5) return 0;
        if (_avgRating >= 48 && _reviewCount >= 100) return 4;
        if (_avgRating >= 45 && _reviewCount >= 50) return 3;
        if (_avgRating >= 40 && _reviewCount >= 20) return 2;
        return 1;
    }
    
    function getReputation(address _user) external view returns (uint256, uint256, uint8) {
        ReputationScore memory userRep = reputationScores[_user];
        uint256 avgRating = userRep.reviewCount > 0 ? (userRep.totalRating * 10) / userRep.reviewCount : 0;
        return (avgRating, userRep.reviewCount, userRep.trustLevel);
    }
}

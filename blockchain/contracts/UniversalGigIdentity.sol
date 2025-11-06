// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract UniversalGigIdentity is Ownable, ReentrancyGuard {
    
    struct GigProfile {
        string universalId;
        string profileHash;
        uint256 reputationScore;
        bool isVerified;
        bool isActive;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    mapping(address => GigProfile) public gigProfiles;
    mapping(string => address) public universalIdToAddress;
    mapping(address => bool) public blacklisted;
    
    event ProfileCreated(address indexed user, string universalId, uint256 timestamp);
    event ProfileUpdated(address indexed user, string newProfileHash, uint256 timestamp);
    event ProfileVerified(address indexed user, uint256 timestamp);
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    modifier profileExists(address _user) {
        require(gigProfiles[_user].createdAt > 0, "Profile does not exist");
        _;
    }
    
    modifier notBlacklisted(address _user) {
        require(!blacklisted[_user], "User is blacklisted");
        _;
    }
    
    function createGigProfile(string memory _universalId, string memory _profileHash) 
        external 
        nonReentrant 
        notBlacklisted(msg.sender)
    {
        require(bytes(_universalId).length > 0, "Universal ID cannot be empty");
        require(gigProfiles[msg.sender].createdAt == 0, "Profile already exists");
        require(universalIdToAddress[_universalId] == address(0), "Universal ID taken");
        
        gigProfiles[msg.sender] = GigProfile({
            universalId: _universalId,
            profileHash: _profileHash,
            reputationScore: 500,
            isVerified: false,
            isActive: true,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        universalIdToAddress[_universalId] = msg.sender;
        emit ProfileCreated(msg.sender, _universalId, block.timestamp);
    }
    
    function updateProfile(string memory _profileHash) external profileExists(msg.sender) {
        gigProfiles[msg.sender].profileHash = _profileHash;
        gigProfiles[msg.sender].lastUpdated = block.timestamp;
        emit ProfileUpdated(msg.sender, _profileHash, block.timestamp);
    }
    
    function verifyProfile(address _user) external onlyOwner profileExists(_user) {
        gigProfiles[_user].isVerified = true;
        emit ProfileVerified(_user, block.timestamp);
    }
    
    function getProfile(address _user) external view returns (GigProfile memory) {
        return gigProfiles[_user];
    }
}

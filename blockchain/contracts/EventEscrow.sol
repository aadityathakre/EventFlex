// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventEscrow is ReentrancyGuard, Ownable {
    
    enum EscrowStatus { Created, Funded, InProgress, Completed, Disputed }
    
    struct Escrow {
        address host;
        address organizer;
        uint256 totalAmount;
        uint256 organizerPercentage;
        uint256 gigsPercentage;
        uint256 platformFeePercentage;
        EscrowStatus status;
        bool hostApproved;
        bool organizerApproved;
        uint256 createdAt;
        uint256 eventId;
    }
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => address[]) public eventGigs;
    uint256 public escrowCounter;
    address public platformWallet;
    
    event EscrowCreated(uint256 indexed escrowId, address indexed host, address indexed organizer);
    event EscrowReleased(uint256 indexed escrowId, uint256 amount);
    
    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }
    
    function createEscrow(
        address _organizer,
        uint256 _organizerPercentage,
        uint256 _gigsPercentage,
        uint256 _platformFeePercentage,
        uint256 _eventId
    ) external payable nonReentrant {
        require(_organizerPercentage + _gigsPercentage + _platformFeePercentage == 100, "Percentages must sum to 100");
        
        uint256 escrowId = escrowCounter++;
        
        escrows[escrowId] = Escrow({
            host: msg.sender,
            organizer: _organizer,
            totalAmount: msg.value,
            organizerPercentage: _organizerPercentage,
            gigsPercentage: _gigsPercentage,
            platformFeePercentage: _platformFeePercentage,
            status: EscrowStatus.Funded,
            hostApproved: false,
            organizerApproved: false,
            createdAt: block.timestamp,
            eventId: _eventId
        });
        
        emit EscrowCreated(escrowId, msg.sender, _organizer);
    }
    
    function addGigWorkers(uint256 _escrowId, address[] memory _gigs) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.organizer, "Only organizer");
        
        eventGigs[_escrowId] = _gigs;
        escrow.status = EscrowStatus.InProgress;
    }
    
    function approveCompletion(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.host || msg.sender == escrow.organizer, "Unauthorized");
        
        if (msg.sender == escrow.host) escrow.hostApproved = true;
        if (msg.sender == escrow.organizer) escrow.organizerApproved = true;
        
        if (escrow.hostApproved && escrow.organizerApproved) {
            _releaseFunds(_escrowId);
        }
    }
    
    function _releaseFunds(uint256 _escrowId) internal {
        Escrow storage escrow = escrows[_escrowId];
        
        uint256 organizerAmount = (escrow.totalAmount * escrow.organizerPercentage) / 100;
        uint256 gigsAmount = (escrow.totalAmount * escrow.gigsPercentage) / 100;
        uint256 platformAmount = (escrow.totalAmount * escrow.platformFeePercentage) / 100;
        
        payable(escrow.organizer).transfer(organizerAmount);
        payable(platformWallet).transfer(platformAmount);
        
        address[] memory gigs = eventGigs[_escrowId];
        if (gigs.length > 0) {
            uint256 perGigAmount = gigsAmount / gigs.length;
            for (uint i = 0; i < gigs.length; i++) {
                payable(gigs[i]).transfer(perGigAmount);
            }
        }
        
        escrow.status = EscrowStatus.Completed;
        emit EscrowReleased(_escrowId, escrow.totalAmount);
    }
    
    function getEscrow(uint256 _escrowId) external view returns (Escrow memory) {
        return escrows[_escrowId];
    }
}

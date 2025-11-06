// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillBadges is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    struct Badge {
        string skillName;
        string category;
        string metadataURI;
        uint256 issuedAt;
        bool isVerified;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    
    event BadgeMinted(address indexed to, uint256 indexed tokenId, string skillName);
    
    constructor() ERC721("EventFlex Skill Badges", "EFSB") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }
    
    function mintBadge(address to, string memory skillName, string memory category, string memory metadataURI) 
        public onlyOwner returns (uint256) 
    {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        badges[tokenId] = Badge({
            skillName: skillName,
            category: category,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            isVerified: false
        });
        
        userBadges[to].push(tokenId);
        _safeMint(to, tokenId);
        
        emit BadgeMinted(to, tokenId, skillName);
        return tokenId;
    }
    
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }
    
    function getBadgeDetails(uint256 tokenId) external view returns (Badge memory) {
        require(ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId];
    }
    
    function _update(address to, uint256 tokenId, address auth) 
        internal virtual override returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Badges are soul-bound");
        return super._update(to, tokenId, auth);
    }
}

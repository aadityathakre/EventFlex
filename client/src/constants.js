// Event Categories
export const EVENT_CATEGORIES = [
  { id: 'wedding', label: 'Wedding', value: 'wedding' },
  { id: 'birthday', label: 'Birthday', value: 'birthday' },
  { id: 'conference', label: 'Conference', value: 'conference' },
  { id: 'workshop', label: 'Workshop', value: 'workshop' },
  { id: 'networking', label: 'Networking', value: 'networking' },
  { id: 'outdoor', label: 'Outdoor', value: 'outdoor' },
];

// Browse Categories
export const BROWSE_CATEGORIES = [
  { id: 'multi-purpose', label: 'MULTI-PURPOSE', value: 'multi-purpose' },
  { id: 'wedding-celebration', label: 'WEDDING CELEBRATION', value: 'wedding-celebration' },
  { id: 'birthday-party', label: 'BIRTHDAY PARTY', value: 'birthday-party' },
  { id: 'dinner-house', label: 'DINNER HOUSE', value: 'dinner-house' },
  { id: 'nightout', label: 'NIGHTOUT', value: 'nightout' },
];

// Venues Data
export const VENUES_DATA = {
  'multi-purpose': [
    { id: 1, name: 'Resort Palace', price: '₹4000/hr', image: '', link: '/venue/1' },
    { id: 2, name: 'Grand Convention Center', price: '₹5500/hr', image: '', link: '/venue/2' },
    { id: 3, name: 'City Hall Venue', price: '₹3500/hr', image: '', link: '/venue/3' },
    { id: 4, name: 'Urban Event Space', price: '₹4500/hr', image: '', link: '/venue/4' },
  ],
  'wedding-celebration': [
    { id: 5, name: 'Wedding Palace', price: '₹8000/hr', image: '', link: '/venue/5' },
    { id: 6, name: 'Royal Banquet Hall', price: '₹9500/hr', image: '', link: '/venue/6' },
    { id: 7, name: 'Garden Wedding Venue', price: '₹7000/hr', image: '', link: '/venue/7' },
    { id: 8, name: 'Luxury Wedding Resort', price: '₹12000/hr', image: '', link: '/venue/8' },
  ],
  'birthday-party': [
    { id: 9, name: 'Party Central', price: '₹3000/hr', image: '', link: '/venue/9' },
    { id: 10, name: 'Fun Zone Venue', price: '₹2500/hr', image: '', link: '/venue/10' },
    { id: 11, name: 'Celebration Hall', price: '₹3500/hr', image: '', link: '/venue/11' },
    { id: 12, name: 'Kids Party Palace', price: '₹2800/hr', image: '', link: '/venue/12' },
  ],
  'dinner-house': [
    { id: 13, name: 'Fine Dining Hall', price: '₹5000/hr', image: '', link: '/venue/13' },
    { id: 14, name: 'Elegant Dinner Space', price: '₹4500/hr', image: '', link: '/venue/14' },
    { id: 15, name: 'Premium Restaurant Venue', price: '₹6000/hr', image: '', link: '/venue/15' },
    { id: 16, name: 'Gourmet Dinner Hall', price: '₹5500/hr', image: '', link: '/venue/16' },
  ],
  'nightout': [
    { id: 17, name: 'Night Club Venue', price: '₹7000/hr', image: '', link: '/venue/17' },
    { id: 18, name: 'Rooftop Party Space', price: '₹8000/hr', image: '', link: '/venue/18' },
    { id: 19, name: 'Night Event Hall', price: '₹6500/hr', image: '', link: '/venue/19' },
    { id: 20, name: 'Urban Night Spot', price: '₹7500/hr', image: '', link: '/venue/20' },
  ],
};

// Featured Activities
export const FEATURED_ACTIVITIES = [
  { id: 'networking', name: 'Networking', image: '', link: '/activities/networking' },
  { id: 'birthday', name: 'Birthday', image: '', link: '/activities/birthday' },
  { id: 'outdoor', name: 'Outdoor', image: '', link: '/activities/outdoor' },
  { id: 'workshop', name: 'Workshop', image: '', link: '/activities/workshop' },
  { id: 'conference', name: 'Conference', image: '', link: '/activities/conference' },
  { id: 'dinner-party', name: 'Dinner Party', image: '', link: '/activities/dinner-party' },
];

// How It Works Steps
export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Post Your Event',
    description: 'Hosts create events and invite experienced organizers to manage them.',
  },
  {
    number: '02',
    title: 'Build Your Team',
    description: 'Organizers create pools/teams and gig workers browse and apply to join.',
  },
  {
    number: '03',
    title: 'Collaborate & Deliver',
    description: 'Teams communicate via messages, deliver the event, and get paid from escrow.',
  },
  {
    number: '04',
    title: 'Get Paid Securely',
    description: 'Funds held in escrow are released upon successful event completion.',
  },
];

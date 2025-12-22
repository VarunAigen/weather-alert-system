import { DEFAULT_THRESHOLDS, getDefaultThresholds } from '../constants/thresholds';

console.log('=== THRESHOLD TEST ===');
console.log('Farmer:', getDefaultThresholds('farmer'));
console.log('Student:', getDefaultThresholds('student'));
console.log('Traveler:', getDefaultThresholds('traveler'));
console.log('Delivery Worker:', getDefaultThresholds('delivery_worker'));
console.log('General:', getDefaultThresholds('general'));

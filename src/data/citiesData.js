// Comprehensive US Cities & World Locations Dataset covering all 50 States

export const US_STATE_CENTROIDS = {
  AL: { name: "Alabama", lat: 32.806671, lng: -86.791130, tz: "America/Chicago" },
  AK: { name: "Alaska", lat: 61.370716, lng: -152.404419, tz: "America/Anchorage" },
  AZ: { name: "Arizona", lat: 33.729759, lng: -111.431221, tz: "America/Phoenix" },
  AR: { name: "Arkansas", lat: 34.969704, lng: -92.373123, tz: "America/Chicago" },
  CA: { name: "California", lat: 36.116203, lng: -119.681564, tz: "America/Los_Angeles" },
  CO: { name: "Colorado", lat: 39.059811, lng: -105.311104, tz: "America/Denver" },
  CT: { name: "Connecticut", lat: 41.597782, lng: -72.755371, tz: "America/New_York" },
  DE: { name: "Delaware", lat: 39.318523, lng: -75.507141, tz: "America/New_York" },
  FL: { name: "Florida", lat: 27.766279, lng: -81.686783, tz: "America/New_York" },
  GA: { name: "Georgia", lat: 33.040619, lng: -83.643074, tz: "America/New_York" },
  HI: { name: "Hawaii", lat: 21.094318, lng: -157.498337, tz: "Pacific/Honolulu" },
  ID: { name: "Idaho", lat: 44.240459, lng: -114.478828, tz: "America/Boise" },
  IL: { name: "Illinois", lat: 40.349457, lng: -88.986137, tz: "America/Chicago" },
  IN: { name: "Indiana", lat: 39.849426, lng: -86.258278, tz: "America/Indiana/Indianapolis" },
  IA: { name: "Iowa", lat: 42.011539, lng: -93.210526, tz: "America/Chicago" },
  KS: { name: "Kansas", lat: 38.526600, lng: -96.726486, tz: "America/Chicago" },
  KY: { name: "Kentucky", lat: 37.668140, lng: -84.670067, tz: "America/New_York" },
  LA: { name: "Louisiana", lat: 31.169546, lng: -91.867805, tz: "America/Chicago" },
  ME: { name: "Maine", lat: 44.693947, lng: -69.381927, tz: "America/New_York" },
  MD: { name: "Maryland", lat: 39.063946, lng: -76.802101, tz: "America/New_York" },
  MA: { name: "Massachusetts", lat: 42.230171, lng: -71.530106, tz: "America/New_York" },
  MI: { name: "Michigan", lat: 43.326618, lng: -84.536095, tz: "America/Detroit" },
  MN: { name: "Minnesota", lat: 45.694454, lng: -93.900192, tz: "America/Chicago" },
  MS: { name: "Mississippi", lat: 32.741646, lng: -89.678696, tz: "America/Chicago" },
  MO: { name: "Missouri", lat: 38.456085, lng: -92.288368, tz: "America/Chicago" },
  MT: { name: "Montana", lat: 46.921925, lng: -110.454353, tz: "America/Denver" },
  NE: { name: "Nebraska", lat: 41.125370, lng: -98.268082, tz: "America/Chicago" },
  NV: { name: "Nevada", lat: 38.313515, lng: -117.055374, tz: "America/Los_Angeles" },
  NH: { name: "New Hampshire", lat: 43.452492, lng: -71.563896, tz: "America/New_York" },
  NJ: { name: "New Jersey", lat: 40.298904, lng: -74.521011, tz: "America/New_York" },
  NM: { name: "New Mexico", lat: 34.840515, lng: -106.248482, tz: "America/Denver" },
  NY: { name: "New York", lat: 42.165726, lng: -74.948051, tz: "America/New_York" },
  NC: { name: "North Carolina", lat: 35.630066, lng: -79.806419, tz: "America/New_York" },
  ND: { name: "North Dakota", lat: 47.528912, lng: -99.784012, tz: "America/Chicago" },
  OH: { name: "Ohio", lat: 40.388783, lng: -82.764915, tz: "America/New_York" },
  OK: { name: "Oklahoma", lat: 35.565342, lng: -96.928917, tz: "America/Chicago" },
  OR: { name: "Oregon", lat: 44.572021, lng: -122.070938, tz: "America/Los_Angeles" },
  PA: { name: "Pennsylvania", lat: 40.590752, lng: -77.209755, tz: "America/New_York" },
  RI: { name: "Rhode Island", lat: 41.680893, lng: -71.511780, tz: "America/New_York" },
  SC: { name: "South Carolina", lat: 33.856892, lng: -80.945007, tz: "America/New_York" },
  SD: { name: "South Dakota", lat: 44.299782, lng: -99.438828, tz: "America/Chicago" },
  TN: { name: "Tennessee", lat: 35.747845, lng: -86.692345, tz: "America/Chicago" },
  TX: { name: "Texas", lat: 31.054487, lng: -97.563461, tz: "America/Chicago" },
  UT: { name: "Utah", lat: 40.150032, lng: -111.862434, tz: "America/Denver" },
  VT: { name: "Vermont", lat: 44.045876, lng: -72.710686, tz: "America/New_York" },
  VA: { name: "Virginia", lat: 37.769337, lng: -78.169968, tz: "America/New_York" },
  WA: { name: "Washington", lat: 47.400902, lng: -121.490494, tz: "America/Los_Angeles" },
  WV: { name: "West Virginia", lat: 38.491226, lng: -80.954453, tz: "America/New_York" },
  WI: { name: "Wisconsin", lat: 44.268543, lng: -89.616508, tz: "America/Chicago" },
  WY: { name: "Wyoming", lat: 42.755966, lng: -107.302490, tz: "America/Denver" }
};

export const WORLD_CITIES = [
  // --- NEW JERSEY CITIES & TOWNS ---
  { name: "Newton, NJ, USA", state: "NJ", lat: 41.0582, lng: -74.7529, tz: "America/New_York" },
  { name: "Sparta, NJ, USA", state: "NJ", lat: 41.0340, lng: -74.6535, tz: "America/New_York" },
  { name: "Andover, NJ, USA", state: "NJ", lat: 40.9845, lng: -74.7432, tz: "America/New_York" },
  { name: "Hopatcong, NJ, USA", state: "NJ", lat: 40.9412, lng: -74.6618, tz: "America/New_York" },
  { name: "Vernon, NJ, USA", state: "NJ", lat: 41.1965, lng: -74.4849, tz: "America/New_York" },
  { name: "Morristown, NJ, USA", state: "NJ", lat: 40.7968, lng: -74.4815, tz: "America/New_York" },
  { name: "Newark, NJ, USA", state: "NJ", lat: 40.7357, lng: -74.1724, tz: "America/New_York" },
  { name: "Jersey City, NJ, USA", state: "NJ", lat: 40.7178, lng: -74.0431, tz: "America/New_York" },
  { name: "Paterson, NJ, USA", state: "NJ", lat: 40.9168, lng: -74.1718, tz: "America/New_York" },
  { name: "Elizabeth, NJ, USA", state: "NJ", lat: 40.6640, lng: -74.2107, tz: "America/New_York" },
  { name: "Edison, NJ, USA", state: "NJ", lat: 40.5187, lng: -74.4121, tz: "America/New_York" },
  { name: "Trenton, NJ, USA", state: "NJ", lat: 40.2171, lng: -74.7429, tz: "America/New_York" },
  { name: "Hoboken, NJ, USA", state: "NJ", lat: 40.7440, lng: -74.0324, tz: "America/New_York" },
  { name: "Atlantic City, NJ, USA", state: "NJ", lat: 39.3643, lng: -74.4229, tz: "America/New_York" },
  { name: "Cherry Hill, NJ, USA", state: "NJ", lat: 39.9268, lng: -74.9982, tz: "America/New_York" },
  { name: "Clifton, NJ, USA", state: "NJ", lat: 40.8584, lng: -74.1638, tz: "America/New_York" },
  { name: "Passaic, NJ, USA", state: "NJ", lat: 40.8568, lng: -74.1285, tz: "America/New_York" },
  { name: "Montclair, NJ, USA", state: "NJ", lat: 40.8259, lng: -74.2090, tz: "America/New_York" },
  { name: "Hackensack, NJ, USA", state: "NJ", lat: 40.8859, lng: -74.0435, tz: "America/New_York" },
  { name: "Paramus, NJ, USA", state: "NJ", lat: 40.9445, lng: -74.0754, tz: "America/New_York" },
  { name: "Bridgewater, NJ, USA", state: "NJ", lat: 40.5937, lng: -74.6049, tz: "America/New_York" },
  { name: "Somerville, NJ, USA", state: "NJ", lat: 40.5743, lng: -74.6099, tz: "America/New_York" },
  { name: "Princeton, NJ, USA", state: "NJ", lat: 40.3573, lng: -74.6672, tz: "America/New_York" },
  { name: "Cape May, NJ, USA", state: "NJ", lat: 38.9351, lng: -74.9060, tz: "America/New_York" },
  { name: "Asbury Park, NJ, USA", state: "NJ", lat: 40.2204, lng: -74.0121, tz: "America/New_York" },
  { name: "Wayne, NJ, USA", state: "NJ", lat: 40.9253, lng: -74.2765, tz: "America/New_York" },
  { name: "Toms River, NJ, USA", state: "NJ", lat: 39.9537, lng: -74.1979, tz: "America/New_York" },
  { name: "Camden, NJ, USA", state: "NJ", lat: 39.9259, lng: -75.1196, tz: "America/New_York" },
  { name: "Bayonne, NJ, USA", state: "NJ", lat: 40.6687, lng: -74.1143, tz: "America/New_York" },
  { name: "Vineland, NJ, USA", state: "NJ", lat: 39.4863, lng: -75.0259, tz: "America/New_York" },
  { name: "New Brunswick, NJ, USA", state: "NJ", lat: 40.4862, lng: -74.4518, tz: "America/New_York" },
  { name: "Plainfield, NJ, USA", state: "NJ", lat: 40.6337, lng: -74.4073, tz: "America/New_York" },
  { name: "Red Bank, NJ, USA", state: "NJ", lat: 40.3470, lng: -74.0643, tz: "America/New_York" },
  { name: "Summit, NJ, USA", state: "NJ", lat: 40.7181, lng: -74.3568, tz: "America/New_York" },
  { name: "Sussex, NJ, USA", state: "NJ", lat: 41.2117, lng: -74.6087, tz: "America/New_York" },
  { name: "Franklin, NJ, USA", state: "NJ", lat: 41.1167, lng: -74.5873, tz: "America/New_York" },
  { name: "Branchville, NJ, USA", state: "NJ", lat: 41.1448, lng: -74.7507, tz: "America/New_York" },
  { name: "Hamburg, NJ, USA", state: "NJ", lat: 41.1473, lng: -74.5759, tz: "America/New_York" },
  { name: "Ogdensburg, NJ, USA", state: "NJ", lat: 41.0809, lng: -74.5962, tz: "America/New_York" },
  { name: "Stanhope, NJ, USA", state: "NJ", lat: 40.9023, lng: -74.7073, tz: "America/New_York" },
  { name: "Byram Township, NJ, USA", state: "NJ", lat: 40.9478, lng: -74.7366, tz: "America/New_York" },
  { name: "Jefferson Township, NJ, USA", state: "NJ", lat: 41.0543, lng: -74.5367, tz: "America/New_York" },

  // --- ALABAMA CITIES ---
  { name: "Birmingham, AL, USA", state: "AL", lat: 33.5186, lng: -86.8104, tz: "America/Chicago" },
  { name: "Montgomery, AL, USA", state: "AL", lat: 32.3792, lng: -86.3077, tz: "America/Chicago" },
  { name: "Mobile, AL, USA", state: "AL", lat: 30.6953, lng: -88.0398, tz: "America/Chicago" },
  { name: "Huntsville, AL, USA", state: "AL", lat: 34.7303, lng: -86.5861, tz: "America/Chicago" },
  { name: "Tuscaloosa, AL, USA", state: "AL", lat: 33.2098, lng: -87.5691, tz: "America/Chicago" },
  { name: "Hoover, AL, USA", state: "AL", lat: 33.4053, lng: -86.8113, tz: "America/Chicago" },

  // --- ALASKA CITIES ---
  { name: "Anchorage, AK, USA", state: "AK", lat: 61.2181, lng: -149.9003, tz: "America/Anchorage" },
  { name: "Juneau, AK, USA", state: "AK", lat: 58.3019, lng: -134.4197, tz: "America/Juneau" },
  { name: "Fairbanks, AK, USA", state: "AK", lat: 64.8378, lng: -147.7164, tz: "America/Anchorage" },
  { name: "Sitka, AK, USA", state: "AK", lat: 57.0530, lng: -135.3300, tz: "America/Anchorage" },
  { name: "Ketchikan, AK, USA", state: "AK", lat: 55.3422, lng: -131.6461, tz: "America/Anchorage" },

  // --- ARIZONA CITIES ---
  { name: "Phoenix, AZ, USA", state: "AZ", lat: 33.4484, lng: -112.0740, tz: "America/Phoenix" },
  { name: "Tucson, AZ, USA", state: "AZ", lat: 32.2226, lng: -110.9747, tz: "America/Phoenix" },
  { name: "Scottsdale, AZ, USA", state: "AZ", lat: 33.4942, lng: -111.9261, tz: "America/Phoenix" },
  { name: "Mesa, AZ, USA", state: "AZ", lat: 33.4151, lng: -111.8314, tz: "America/Phoenix" },
  { name: "Chandler, AZ, USA", state: "AZ", lat: 33.3061, lng: -111.8412, tz: "America/Phoenix" },
  { name: "Flagstaff, AZ, USA", state: "AZ", lat: 35.1982, lng: -111.6513, tz: "America/Phoenix" },
  { name: "Sedona, AZ, USA", state: "AZ", lat: 34.8697, lng: -111.7609, tz: "America/Phoenix" },
  { name: "Tempe, AZ, USA", state: "AZ", lat: 33.4255, lng: -111.9400, tz: "America/Phoenix" },

  // --- ARKANSAS CITIES ---
  { name: "Little Rock, AR, USA", state: "AR", lat: 34.7465, lng: -92.2896, tz: "America/Chicago" },
  { name: "Fayetteville, AR, USA", state: "AR", lat: 36.0821, lng: -94.1718, tz: "America/Chicago" },
  { name: "Fort Smith, AR, USA", state: "AR", lat: 35.3859, lng: -94.3985, tz: "America/Chicago" },
  { name: "Springdale, AR, USA", state: "AR", lat: 36.1867, lng: -94.1288, tz: "America/Chicago" },
  { name: "Jonesboro, AR, USA", state: "AR", lat: 35.8422, lng: -90.7042, tz: "America/Chicago" },

  // --- CALIFORNIA CITIES ---
  { name: "Los Angeles, CA, USA", state: "CA", lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles" },
  { name: "San Francisco, CA, USA", state: "CA", lat: 37.7749, lng: -122.4194, tz: "America/Los_Angeles" },
  { name: "San Diego, CA, USA", state: "CA", lat: 32.7157, lng: -117.1611, tz: "America/Los_Angeles" },
  { name: "San Jose, CA, USA", state: "CA", lat: 37.3382, lng: -121.8863, tz: "America/Los_Angeles" },
  { name: "Sacramento, CA, USA", state: "CA", lat: 38.5816, lng: -121.4944, tz: "America/Los_Angeles" },
  { name: "Oakland, CA, USA", state: "CA", lat: 37.8044, lng: -122.2712, tz: "America/Los_Angeles" },
  { name: "Long Beach, CA, USA", state: "CA", lat: 33.7701, lng: -118.1937, tz: "America/Los_Angeles" },
  { name: "Fresno, CA, USA", state: "CA", lat: 36.7468, lng: -119.7726, tz: "America/Los_Angeles" },
  { name: "Bakersfield, CA, USA", state: "CA", lat: 35.3732, lng: -119.0187, tz: "America/Los_Angeles" },
  { name: "Anaheim, CA, USA", state: "CA", lat: 33.8365, lng: -117.9143, tz: "America/Los_Angeles" },
  { name: "Santa Ana, CA, USA", state: "CA", lat: 33.7454, lng: -117.8676, tz: "America/Los_Angeles" },
  { name: "Riverside, CA, USA", state: "CA", lat: 33.9806, lng: -117.3754, tz: "America/Los_Angeles" },
  { name: "Stockton, CA, USA", state: "CA", lat: 37.9577, lng: -121.2907, tz: "America/Los_Angeles" },
  { name: "Irvine, CA, USA", state: "CA", lat: 33.6845, lng: -117.8265, tz: "America/Los_Angeles" },
  { name: "Santa Barbara, CA, USA", state: "CA", lat: 34.4208, lng: -119.6981, tz: "America/Los_Angeles" },
  { name: "Monterey, CA, USA", state: "CA", lat: 36.6002, lng: -121.8946, tz: "America/Los_Angeles" },
  { name: "Palm Springs, CA, USA", state: "CA", lat: 33.8302, lng: -116.5452, tz: "America/Los_Angeles" },
  { name: "Eureka, CA, USA", state: "CA", lat: 40.8020, lng: -124.1636, tz: "America/Los_Angeles" },
  { name: "Redding, CA, USA", state: "CA", lat: 40.5865, lng: -122.3916, tz: "America/Los_Angeles" },
  { name: "Santa Cruz, CA, USA", state: "CA", lat: 36.9741, lng: -122.0307, tz: "America/Los_Angeles" },

  // --- COLORADO CITIES ---
  { name: "Denver, CO, USA", state: "CO", lat: 39.7392, lng: -104.9903, tz: "America/Denver" },
  { name: "Colorado Springs, CO, USA", state: "CO", lat: 38.8339, lng: -104.8214, tz: "America/Denver" },
  { name: "Boulder, CO, USA", state: "CO", lat: 40.0150, lng: -105.2705, tz: "America/Denver" },
  { name: "Aurora, CO, USA", state: "CO", lat: 39.7294, lng: -104.8319, tz: "America/Denver" },
  { name: "Fort Collins, CO, USA", state: "CO", lat: 40.5852, lng: -105.0844, tz: "America/Denver" },
  { name: "Pueblo, CO, USA", state: "CO", lat: 38.2544, lng: -104.6091, tz: "America/Denver" },
  { name: "Grand Junction, CO, USA", state: "CO", lat: 39.0638, lng: -108.5506, tz: "America/Denver" },
  { name: "Aspen, CO, USA", state: "CO", lat: 39.1910, lng: -106.8175, tz: "America/Denver" },
  { name: "Steamboat Springs, CO, USA", state: "CO", lat: 40.4849, lng: -106.8317, tz: "America/Denver" },

  // --- CONNECTICUT CITIES ---
  { name: "Hartford, CT, USA", state: "CT", lat: 41.7658, lng: -72.6734, tz: "America/New_York" },
  { name: "New Haven, CT, USA", state: "CT", lat: 41.3083, lng: -72.9279, tz: "America/New_York" },
  { name: "Stamford, CT, USA", state: "CT", lat: 41.0534, lng: -73.5387, tz: "America/New_York" },
  { name: "Bridgeport, CT, USA", state: "CT", lat: 41.1792, lng: -73.1894, tz: "America/New_York" },
  { name: "Waterbury, CT, USA", state: "CT", lat: 41.5581, lng: -73.0514, tz: "America/New_York" },
  { name: "Norwalk, CT, USA", state: "CT", lat: 41.1177, lng: -73.4081, tz: "America/New_York" },
  { name: "Danbury, CT, USA", state: "CT", lat: 41.3948, lng: -73.4540, tz: "America/New_York" },
  { name: "Greenwich, CT, USA", state: "CT", lat: 41.0264, lng: -73.6284, tz: "America/New_York" },

  // --- DELAWARE CITIES ---
  { name: "Wilmington, DE, USA", state: "DE", lat: 39.7447, lng: -75.5484, tz: "America/New_York" },
  { name: "Dover, DE, USA", state: "DE", lat: 39.1582, lng: -75.5244, tz: "America/New_York" },
  { name: "Newark, DE, USA", state: "DE", lat: 39.6837, lng: -75.7496, tz: "America/New_York" },
  { name: "Middletown, DE, USA", state: "DE", lat: 39.4495, lng: -75.7163, tz: "America/New_York" },
  { name: "Smyrna, DE, USA", state: "DE", lat: 39.2998, lng: -75.6052, tz: "America/New_York" },

  // --- FLORIDA CITIES ---
  { name: "Miami, FL, USA", state: "FL", lat: 25.7617, lng: -80.1918, tz: "America/New_York" },
  { name: "Orlando, FL, USA", state: "FL", lat: 28.5383, lng: -81.3792, tz: "America/New_York" },
  { name: "Tampa, FL, USA", state: "FL", lat: 27.9506, lng: -82.4572, tz: "America/New_York" },
  { name: "Jacksonville, FL, USA", state: "FL", lat: 30.3322, lng: -81.6557, tz: "America/New_York" },
  { name: "Fort Lauderdale, FL, USA", state: "FL", lat: 26.1224, lng: -80.1373, tz: "America/New_York" },
  { name: "Tallahassee, FL, USA", state: "FL", lat: 30.4382, lng: -84.2807, tz: "America/New_York" },
  { name: "St. Petersburg, FL, USA", state: "FL", lat: 27.7676, lng: -82.6402, tz: "America/New_York" },
  { name: "Hialeah, FL, USA", state: "FL", lat: 25.8575, lng: -80.2781, tz: "America/New_York" },
  { name: "Port St. Lucie, FL, USA", state: "FL", lat: 27.2730, lng: -80.3582, tz: "America/New_York" },
  { name: "Cape Coral, FL, USA", state: "FL", lat: 26.5628, lng: -81.9495, tz: "America/New_York" },
  { name: "Key West, FL, USA", state: "FL", lat: 24.5550, lng: -81.7799, tz: "America/New_York" },
  { name: "Pensacola, FL, USA", state: "FL", lat: 30.4213, lng: -87.2169, tz: "America/Chicago" },
  { name: "Gainesville, FL, USA", state: "FL", lat: 29.6516, lng: -82.3248, tz: "America/New_York" },
  { name: "Naples, FL, USA", state: "FL", lat: 26.1420, lng: -81.7948, tz: "America/New_York" },
  { name: "West Palm Beach, FL, USA", state: "FL", lat: 26.7153, lng: -80.0533, tz: "America/New_York" },
  { name: "Sarasota, FL, USA", state: "FL", lat: 27.3364, lng: -82.5306, tz: "America/New_York" },

  // --- GEORGIA CITIES ---
  { name: "Atlanta, GA, USA", state: "GA", lat: 33.7490, lng: -84.3880, tz: "America/New_York" },
  { name: "Savannah, GA, USA", state: "GA", lat: 32.0809, lng: -81.0912, tz: "America/New_York" },
  { name: "Augusta, GA, USA", state: "GA", lat: 33.4735, lng: -81.9749, tz: "America/New_York" },
  { name: "Columbus, GA, USA", state: "GA", lat: 32.4609, lng: -84.9877, tz: "America/New_York" },
  { name: "Macon, GA, USA", state: "GA", lat: 32.8406, lng: -83.6324, tz: "America/New_York" },
  { name: "Athens, GA, USA", state: "GA", lat: 33.9519, lng: -83.3575, tz: "America/New_York" },
  { name: "Sandy Springs, GA, USA", state: "GA", lat: 33.9304, lng: -84.3733, tz: "America/New_York" },
  { name: "Roswell, GA, USA", state: "GA", lat: 34.0232, lng: -84.3615, tz: "America/New_York" },

  // --- HAWAII CITIES ---
  { name: "Honolulu, HI, USA", state: "HI", lat: 21.3069, lng: -157.8583, tz: "Pacific/Honolulu" },
  { name: "Hilo, HI, USA", state: "HI", lat: 19.7241, lng: -155.0868, tz: "Pacific/Honolulu" },
  { name: "Kailua, HI, USA", state: "HI", lat: 21.4022, lng: -157.7394, tz: "Pacific/Honolulu" },
  { name: "Kapolei, HI, USA", state: "HI", lat: 21.3323, lng: -158.0825, tz: "Pacific/Honolulu" },
  { name: "Lahaina, HI, USA", state: "HI", lat: 20.8783, lng: -156.6825, tz: "Pacific/Honolulu" },
  { name: "Lihue, HI, USA", state: "HI", lat: 21.9734, lng: -159.3621, tz: "Pacific/Honolulu" },

  // --- IDAHO CITIES ---
  { name: "Boise, ID, USA", state: "ID", lat: 43.6150, lng: -116.2023, tz: "America/Boise" },
  { name: "Meridian, ID, USA", state: "ID", lat: 43.6121, lng: -116.3915, tz: "America/Boise" },
  { name: "Nampa, ID, USA", state: "ID", lat: 43.5407, lng: -116.5634, tz: "America/Boise" },
  { name: "Idaho Falls, ID, USA", state: "ID", lat: 43.4926, lng: -112.0407, tz: "America/Boise" },
  { name: "Pocatello, ID, USA", state: "ID", lat: 42.8713, lng: -112.4455, tz: "America/Boise" },
  { name: "Coeur d'Alene, ID, USA", state: "ID", lat: 47.6776, lng: -116.7804, tz: "America/Los_Angeles" },
  { name: "Twin Falls, ID, USA", state: "ID", lat: 42.5627, lng: -114.4608, tz: "America/Boise" },

  // --- ILLINOIS CITIES ---
  { name: "Chicago, IL, USA", state: "IL", lat: 41.8781, lng: -87.6298, tz: "America/Chicago" },
  { name: "Springfield, IL, USA", state: "IL", lat: 39.7817, lng: -89.6501, tz: "America/Chicago" },
  { name: "Naperville, IL, USA", state: "IL", lat: 41.7508, lng: -88.1535, tz: "America/Chicago" },
  { name: "Aurora, IL, USA", state: "IL", lat: 41.7605, lng: -88.3200, tz: "America/Chicago" },
  { name: "Rockford, IL, USA", state: "IL", lat: 42.2711, lng: -89.0939, tz: "America/Chicago" },
  { name: "Joliet, IL, USA", state: "IL", lat: 41.5250, lng: -88.0817, tz: "America/Chicago" },
  { name: "Peoria, IL, USA", state: "IL", lat: 40.6936, lng: -89.5889, tz: "America/Chicago" },
  { name: "Elgin, IL, USA", state: "IL", lat: 42.0354, lng: -88.2825, tz: "America/Chicago" },
  { name: "Champaign, IL, USA", state: "IL", lat: 40.1164, lng: -88.2433, tz: "America/Chicago" },
  { name: "Evanston, IL, USA", state: "IL", lat: 42.0450, lng: -87.6876, tz: "America/Chicago" },

  // --- INDIANA CITIES ---
  { name: "Indianapolis, IN, USA", state: "IN", lat: 39.7684, lng: -86.1581, tz: "America/Indiana/Indianapolis" },
  { name: "Fort Wayne, IN, USA", state: "IN", lat: 41.0792, lng: -85.1393, tz: "America/Indiana/Indianapolis" },
  { name: "Evansville, IN, USA", state: "IN", lat: 37.9715, lng: -87.5710, tz: "America/Chicago" },
  { name: "South Bend, IN, USA", state: "IN", lat: 41.6833, lng: -86.2500, tz: "America/Indiana/Indianapolis" },
  { name: "Carmel, IN, USA", state: "IN", lat: 39.9783, lng: -86.1180, tz: "America/Indiana/Indianapolis" },
  { name: "Fishers, IN, USA", state: "IN", lat: 39.9555, lng: -86.0138, tz: "America/Indiana/Indianapolis" },
  { name: "Bloomington, IN, USA", state: "IN", lat: 39.1653, lng: -86.5263, tz: "America/Indiana/Indianapolis" },
  { name: "Gary, IN, USA", state: "IN", lat: 41.5933, lng: -87.3464, tz: "America/Chicago" },
  { name: "Lafayette, IN, USA", state: "IN", lat: 40.4167, lng: -86.8752, tz: "America/Indiana/Indianapolis" },

  // --- IOWA CITIES ---
  { name: "Des Moines, IA, USA", state: "IA", lat: 41.5868, lng: -93.6250, tz: "America/Chicago" },
  { name: "Cedar Rapids, IA, USA", state: "IA", lat: 41.9778, lng: -91.6656, tz: "America/Chicago" },
  { name: "Davenport, IA, USA", state: "IA", lat: 41.5236, lng: -90.5776, tz: "America/Chicago" },
  { name: "Sioux City, IA, USA", state: "IA", lat: 42.5000, lng: -96.4000, tz: "America/Chicago" },
  { name: "Iowa City, IA, USA", state: "IA", lat: 41.6611, lng: -91.5301, tz: "America/Chicago" },
  { name: "Waterloo, IA, USA", state: "IA", lat: 42.4927, lng: -92.3426, tz: "America/Chicago" },
  { name: "Ames, IA, USA", state: "IA", lat: 42.0307, lng: -93.6319, tz: "America/Chicago" },

  // --- KANSAS CITIES ---
  { name: "Wichita, KS, USA", state: "KS", lat: 37.6872, lng: -97.3301, tz: "America/Chicago" },
  { name: "Topeka, KS, USA", state: "KS", lat: 39.0558, lng: -95.6890, tz: "America/Chicago" },
  { name: "Overland Park, KS, USA", state: "KS", lat: 38.9822, lng: -94.6708, tz: "America/Chicago" },
  { name: "Kansas City, KS, USA", state: "KS", lat: 39.1155, lng: -94.6267, tz: "America/Chicago" },
  { name: "Olathe, KS, USA", state: "KS", lat: 38.8814, lng: -94.8191, tz: "America/Chicago" },
  { name: "Lawrence, KS, USA", state: "KS", lat: 38.9716, lng: -95.2352, tz: "America/Chicago" },
  { name: "Manhattan, KS, USA", state: "KS", lat: 39.1836, lng: -96.5716, tz: "America/Chicago" },

  // --- KENTUCKY CITIES ---
  { name: "Louisville, KY, USA", state: "KY", lat: 38.2527, lng: -85.7585, tz: "America/New_York" },
  { name: "Lexington, KY, USA", state: "KY", lat: 38.0406, lng: -84.5037, tz: "America/New_York" },
  { name: "Frankfort, KY, USA", state: "KY", lat: 38.2009, lng: -84.8732, tz: "America/New_York" },
  { name: "Bowling Green, KY, USA", state: "KY", lat: 36.9825, lng: -86.4444, tz: "America/Chicago" },
  { name: "Owensboro, KY, USA", state: "KY", lat: 37.7742, lng: -87.1133, tz: "America/Chicago" },
  { name: "Covington, KY, USA", state: "KY", lat: 39.0836, lng: -84.5085, tz: "America/New_York" },
  { name: "Richmond, KY, USA", state: "KY", lat: 37.7478, lng: -84.2946, tz: "America/New_York" },

  // --- LOUISIANA CITIES ---
  { name: "New Orleans, LA, USA", state: "LA", lat: 29.9511, lng: -90.0715, tz: "America/Chicago" },
  { name: "Baton Rouge, LA, USA", state: "LA", lat: 30.4515, lng: -91.1871, tz: "America/Chicago" },
  { name: "Shreveport, LA, USA", state: "LA", lat: 32.5251, lng: -93.7501, tz: "America/Chicago" },
  { name: "Lafayette, LA, USA", state: "LA", lat: 30.2240, lng: -92.0198, tz: "America/Chicago" },
  { name: "Lake Charles, LA, USA", state: "LA", lat: 30.2265, lng: -93.2173, tz: "America/Chicago" },
  { name: "Bossier City, LA, USA", state: "LA", lat: 32.5159, lng: -93.7321, tz: "America/Chicago" },
  { name: "Monroe, LA, USA", state: "LA", lat: 32.5093, lng: -92.1193, tz: "America/Chicago" },

  // --- MAINE CITIES ---
  { name: "Portland, ME, USA", state: "ME", lat: 43.6591, lng: -70.2568, tz: "America/New_York" },
  { name: "Augusta, ME, USA", state: "ME", lat: 44.3105, lng: -69.7794, tz: "America/New_York" },
  { name: "Bangor, ME, USA", state: "ME", lat: 44.8016, lng: -68.7712, tz: "America/New_York" },
  { name: "Lewiston, ME, USA", state: "ME", lat: 44.1003, lng: -70.2147, tz: "America/New_York" },
  { name: "Auburn, ME, USA", state: "ME", lat: 44.0978, lng: -70.2311, tz: "America/New_York" },
  { name: "Bar Harbor, ME, USA", state: "ME", lat: 44.3876, lng: -68.2039, tz: "America/New_York" },

  // --- MARYLAND CITIES ---
  { name: "Baltimore, MD, USA", state: "MD", lat: 39.2904, lng: -76.6122, tz: "America/New_York" },
  { name: "Annapolis, MD, USA", state: "MD", lat: 38.9784, lng: -76.4921, tz: "America/New_York" },
  { name: "Frederick, MD, USA", state: "MD", lat: 39.4142, lng: -77.4105, tz: "America/New_York" },
  { name: "Rockville, MD, USA", state: "MD", lat: 39.0839, lng: -77.1527, tz: "America/New_York" },
  { name: "Gaithersburg, MD, USA", state: "MD", lat: 39.1434, lng: -77.2013, tz: "America/New_York" },
  { name: "Bowie, MD, USA", state: "MD", lat: 39.0067, lng: -76.7791, tz: "America/New_York" },
  { name: "Hagerstown, MD, USA", state: "MD", lat: 39.6417, lng: -77.7199, tz: "America/New_York" },
  { name: "Bethesda, MD, USA", state: "MD", lat: 38.9846, lng: -77.0947, tz: "America/New_York" },

  // --- MASSACHUSETTS CITIES ---
  { name: "Boston, MA, USA", state: "MA", lat: 42.3601, lng: -71.0589, tz: "America/New_York" },
  { name: "Cambridge, MA, USA", state: "MA", lat: 42.3736, lng: -71.1097, tz: "America/New_York" },
  { name: "Worcester, MA, USA", state: "MA", lat: 42.2626, lng: -71.8023, tz: "America/New_York" },
  { name: "Springfield, MA, USA", state: "MA", lat: 42.1014, lng: -72.5898, tz: "America/New_York" },
  { name: "Lowell, MA, USA", state: "MA", lat: 42.6334, lng: -71.3161, tz: "America/New_York" },
  { name: "Brockton, MA, USA", state: "MA", lat: 42.0834, lng: -71.0183, tz: "America/New_York" },
  { name: "Quincy, MA, USA", state: "MA", lat: 42.2528, lng: -71.0022, tz: "America/New_York" },
  { name: "Lynn, MA, USA", state: "MA", lat: 42.4667, lng: -70.9494, tz: "America/New_York" },
  { name: "New Bedford, MA, USA", state: "MA", lat: 41.6362, lng: -70.9342, tz: "America/New_York" },
  { name: "Fall River, MA, USA", state: "MA", lat: 41.7014, lng: -71.1550, tz: "America/New_York" },
  { name: "Plymouth, MA, USA", state: "MA", lat: 41.9584, lng: -70.6672, tz: "America/New_York" },

  // --- MICHIGAN CITIES ---
  { name: "Detroit, MI, USA", state: "MI", lat: 42.3314, lng: -83.0458, tz: "America/Detroit" },
  { name: "Grand Rapids, MI, USA", state: "MI", lat: 42.9634, lng: -85.6681, tz: "America/Detroit" },
  { name: "Ann Arbor, MI, USA", state: "MI", lat: 42.2808, lng: -83.7430, tz: "America/Detroit" },
  { name: "Lansing, MI, USA", state: "MI", lat: 42.7325, lng: -84.5555, tz: "America/Detroit" },
  { name: "Warren, MI, USA", state: "MI", lat: 42.4929, lng: -83.0238, tz: "America/Detroit" },
  { name: "Sterling Heights, MI, USA", state: "MI", lat: 42.5803, lng: -83.0302, tz: "America/Detroit" },
  { name: "Flint, MI, USA", state: "MI", lat: 43.0125, lng: -83.6874, tz: "America/Detroit" },
  { name: "Dearborn, MI, USA", state: "MI", lat: 42.3222, lng: -83.1763, tz: "America/Detroit" },
  { name: "Kalamazoo, MI, USA", state: "MI", lat: 42.2917, lng: -85.5872, tz: "America/Detroit" },
  { name: "Traverse City, MI, USA", state: "MI", lat: 44.7630, lng: -85.6206, tz: "America/Detroit" },
  { name: "Marquette, MI, USA", state: "MI", lat: 46.5435, lng: -87.3954, tz: "America/Detroit" },

  // --- MINNESOTA CITIES ---
  { name: "Minneapolis, MN, USA", state: "MN", lat: 44.9778, lng: -93.2650, tz: "America/Chicago" },
  { name: "Saint Paul, MN, USA", state: "MN", lat: 44.9537, lng: -93.0900, tz: "America/Chicago" },
  { name: "Rochester, MN, USA", state: "MN", lat: 44.0121, lng: -92.4801, tz: "America/Chicago" },
  { name: "Duluth, MN, USA", state: "MN", lat: 46.7866, lng: -92.1004, tz: "America/Chicago" },
  { name: "Bloomington, MN, USA", state: "MN", lat: 44.8407, lng: -93.2982, tz: "America/Chicago" },
  { name: "Brooklyn Park, MN, USA", state: "MN", lat: 45.0941, lng: -93.3563, tz: "America/Chicago" },
  { name: "Plymouth, MN, USA", state: "MN", lat: 45.0105, lng: -93.4555, tz: "America/Chicago" },
  { name: "St. Cloud, MN, USA", state: "MN", lat: 45.5579, lng: -94.1632, tz: "America/Chicago" },

  // --- MISSISSIPPI CITIES ---
  { name: "Jackson, MS, USA", state: "MS", lat: 32.2988, lng: -90.1848, tz: "America/Chicago" },
  { name: "Gulfport, MS, USA", state: "MS", lat: 30.3674, lng: -89.0928, tz: "America/Chicago" },
  { name: "Southaven, MS, USA", state: "MS", lat: 34.9918, lng: -90.0023, tz: "America/Chicago" },
  { name: "Hattiesburg, MS, USA", state: "MS", lat: 31.3271, lng: -89.2903, tz: "America/Chicago" },
  { name: "Biloxi, MS, USA", state: "MS", lat: 30.3960, lng: -88.8853, tz: "America/Chicago" },
  { name: "Tupelo, MS, USA", state: "MS", lat: 34.2576, lng: -88.7033, tz: "America/Chicago" },

  // --- MISSOURI CITIES ---
  { name: "Kansas City, MO, USA", state: "MO", lat: 39.0997, lng: -94.5786, tz: "America/Chicago" },
  { name: "St. Louis, MO, USA", state: "MO", lat: 38.6270, lng: -90.1994, tz: "America/Chicago" },
  { name: "Springfield, MO, USA", state: "MO", lat: 37.2089, lng: -93.2922, tz: "America/Chicago" },
  { name: "Columbia, MO, USA", state: "MO", lat: 38.9517, lng: -92.3340, tz: "America/Chicago" },
  { name: "Independence, MO, USA", state: "MO", lat: 39.0911, lng: -94.4155, tz: "America/Chicago" },
  { name: "Lee's Summit, MO, USA", state: "MO", lat: 38.9108, lng: -94.3821, tz: "America/Chicago" },
  { name: "St. Joseph, MO, USA", state: "MO", lat: 39.7674, lng: -94.8466, tz: "America/Chicago" },
  { name: "Jefferson City, MO, USA", state: "MO", lat: 38.5767, lng: -92.1735, tz: "America/Chicago" },
  { name: "Branson, MO, USA", state: "MO", lat: 36.6436, lng: -93.2185, tz: "America/Chicago" },

  // --- MONTANA CITIES ---
  { name: "Billings, MT, USA", state: "MT", lat: 45.7833, lng: -108.5007, tz: "America/Denver" },
  { name: "Bozeman, MT, USA", state: "MT", lat: 45.6770, lng: -111.0429, tz: "America/Denver" },
  { name: "Missoula, MT, USA", state: "MT", lat: 46.8721, lng: -113.9940, tz: "America/Denver" },
  { name: "Great Falls, MT, USA", state: "MT", lat: 47.5053, lng: -111.3007, tz: "America/Denver" },
  { name: "Helena, MT, USA", state: "MT", lat: 46.5891, lng: -112.0391, tz: "America/Denver" },
  { name: "Kalispell, MT, USA", state: "MT", lat: 48.1927, lng: -114.3129, tz: "America/Denver" },
  { name: "Butte, MT, USA", state: "MT", lat: 46.0038, lng: -112.5347, tz: "America/Denver" },

  // --- NEBRASKA CITIES ---
  { name: "Omaha, NE, USA", state: "NE", lat: 41.2565, lng: -95.9345, tz: "America/Chicago" },
  { name: "Lincoln, NE, USA", state: "NE", lat: 40.8136, lng: -96.7026, tz: "America/Chicago" },
  { name: "Bellevue, NE, USA", state: "NE", lat: 41.1578, lng: -95.9189, tz: "America/Chicago" },
  { name: "Grand Island, NE, USA", state: "NE", lat: 40.9250, lng: -98.3420, tz: "America/Chicago" },
  { name: "Kearney, NE, USA", state: "NE", lat: 40.6994, lng: -99.0814, tz: "America/Chicago" },
  { name: "Fremont, NE, USA", state: "NE", lat: 41.4333, lng: -96.4980, tz: "America/Chicago" },

  // --- NEVADA CITIES ---
  { name: "Las Vegas, NV, USA", state: "NV", lat: 36.1699, lng: -115.1398, tz: "America/Los_Angeles" },
  { name: "Reno, NV, USA", state: "NV", lat: 39.5296, lng: -119.8138, tz: "America/Los_Angeles" },
  { name: "Henderson, NV, USA", state: "NV", lat: 36.0395, lng: -114.9817, tz: "America/Los_Angeles" },
  { name: "North Las Vegas, NV, USA", state: "NV", lat: 36.1988, lng: -115.1175, tz: "America/Los_Angeles" },
  { name: "Sparks, NV, USA", state: "NV", lat: 39.5349, lng: -119.7526, tz: "America/Los_Angeles" },
  { name: "Carson City, NV, USA", state: "NV", lat: 39.1637, lng: -119.7674, tz: "America/Los_Angeles" },
  { name: "Elko, NV, USA", state: "NV", lat: 40.8324, lng: -115.7631, tz: "America/Los_Angeles" },

  // --- NEW HAMPSHIRE CITIES ---
  { name: "Manchester, NH, USA", state: "NH", lat: 42.9956, lng: -71.4548, tz: "America/New_York" },
  { name: "Nashua, NH, USA", state: "NH", lat: 42.7653, lng: -71.4675, tz: "America/New_York" },
  { name: "Concord, NH, USA", state: "NH", lat: 43.2081, lng: -71.5375, tz: "America/New_York" },
  { name: "Derry, NH, USA", state: "NH", lat: 42.8806, lng: -71.3278, tz: "America/New_York" },
  { name: "Dover, NH, USA", state: "NH", lat: 43.1978, lng: -70.8736, tz: "America/New_York" },
  { name: "Rochester, NH, USA", state: "NH", lat: 43.3045, lng: -70.9756, tz: "America/New_York" },
  { name: "Keene, NH, USA", state: "NH", lat: 42.9336, lng: -72.2781, tz: "America/New_York" },
  { name: "Portsmouth, NH, USA", state: "NH", lat: 43.0717, lng: -70.7625, tz: "America/New_York" },

  // --- NEW MEXICO CITIES ---
  { name: "Albuquerque, NM, USA", state: "NM", lat: 35.0844, lng: -106.6504, tz: "America/Denver" },
  { name: "Santa Fe, NM, USA", state: "NM", lat: 35.6870, lng: -105.9378, tz: "America/Denver" },
  { name: "Las Cruces, NM, USA", state: "NM", lat: 32.3199, lng: -106.7636, tz: "America/Denver" },
  { name: "Rio Rancho, NM, USA", state: "NM", lat: 35.2327, lng: -106.6630, tz: "America/Denver" },
  { name: "Roswell, NM, USA", state: "NM", lat: 33.3942, lng: -104.5230, tz: "America/Denver" },
  { name: "Farmington, NM, USA", state: "NM", lat: 36.7280, lng: -108.2186, tz: "America/Denver" },
  { name: "Taos, NM, USA", state: "NM", lat: 36.4072, lng: -105.5730, tz: "America/Denver" },
  { name: "Carlsbad, NM, USA", state: "NM", lat: 32.4206, lng: -104.2288, tz: "America/Denver" },

  // --- NEW YORK CITIES ---
  { name: "New York City, NY, USA", state: "NY", lat: 40.7128, lng: -74.0060, tz: "America/New_York" },
  { name: "Brooklyn, NY, USA", state: "NY", lat: 40.6782, lng: -73.9442, tz: "America/New_York" },
  { name: "Queens, NY, USA", state: "NY", lat: 40.7282, lng: -73.7949, tz: "America/New_York" },
  { name: "Manhattan, NY, USA", state: "NY", lat: 40.7831, lng: -73.9712, tz: "America/New_York" },
  { name: "Bronx, NY, USA", state: "NY", lat: 40.8448, lng: -73.8648, tz: "America/New_York" },
  { name: "Staten Island, NY, USA", state: "NY", lat: 40.5795, lng: -74.1502, tz: "America/New_York" },
  { name: "Buffalo, NY, USA", state: "NY", lat: 42.8864, lng: -78.8784, tz: "America/New_York" },
  { name: "Rochester, NY, USA", state: "NY", lat: 43.1566, lng: -77.6088, tz: "America/New_York" },
  { name: "Albany, NY, USA", state: "NY", lat: 42.6526, lng: -73.7562, tz: "America/New_York" },
  { name: "Syracuse, NY, USA", state: "NY", lat: 43.0481, lng: -76.1474, tz: "America/New_York" },
  { name: "Yonkers, NY, USA", state: "NY", lat: 40.9312, lng: -73.8987, tz: "America/New_York" },
  { name: "Binghamton, NY, USA", state: "NY", lat: 42.0986, lng: -75.9179, tz: "America/New_York" },
  { name: "Ithaca, NY, USA", state: "NY", lat: 42.4439, lng: -76.5018, tz: "America/New_York" },
  { name: "Poughkeepsie, NY, USA", state: "NY", lat: 41.7003, lng: -73.9209, tz: "America/New_York" },
  { name: "White Plains, NY, USA", state: "NY", lat: 41.0339, lng: -73.7629, tz: "America/New_York" },
  { name: "Newburgh, NY, USA", state: "NY", lat: 41.5034, lng: -74.0104, tz: "America/New_York" },
  { name: "Saratoga Springs, NY, USA", state: "NY", lat: 43.0831, lng: -73.7845, tz: "America/New_York" },
  { name: "Utica, NY, USA", state: "NY", lat: 43.1009, lng: -75.2326, tz: "America/New_York" },
  { name: "Schenectady, NY, USA", state: "NY", lat: 42.8142, lng: -73.9395, tz: "America/New_York" },
  { name: "Troy, NY, USA", state: "NY", lat: 42.7284, lng: -73.6917, tz: "America/New_York" },
  { name: "Niagara Falls, NY, USA", state: "NY", lat: 43.0962, lng: -79.0377, tz: "America/New_York" },

  // --- NORTH CAROLINA CITIES ---
  { name: "Charlotte, NC, USA", state: "NC", lat: 35.2271, lng: -80.8431, tz: "America/New_York" },
  { name: "Raleigh, NC, USA", state: "NC", lat: 35.7796, lng: -78.6382, tz: "America/New_York" },
  { name: "Asheville, NC, USA", state: "NC", lat: 35.5951, lng: -82.5515, tz: "America/New_York" },
  { name: "Greensboro, NC, USA", state: "NC", lat: 36.0726, lng: -79.7919, tz: "America/New_York" },
  { name: "Durham, NC, USA", state: "NC", lat: 35.9940, lng: -78.8986, tz: "America/New_York" },
  { name: "Winston-Salem, NC, USA", state: "NC", lat: 36.0998, lng: -80.2442, tz: "America/New_York" },
  { name: "Fayetteville, NC, USA", state: "NC", lat: 35.0526, lng: -78.8783, tz: "America/New_York" },
  { name: "Cary, NC, USA", state: "NC", lat: 35.7915, lng: -78.7811, tz: "America/New_York" },
  { name: "Wilmington, NC, USA", state: "NC", lat: 34.2257, lng: -77.9447, tz: "America/New_York" },
  { name: "High Point, NC, USA", state: "NC", lat: 35.9556, lng: -80.0053, tz: "America/New_York" },
  { name: "Chapel Hill, NC, USA", state: "NC", lat: 35.9132, lng: -79.0558, tz: "America/New_York" },
  { name: "Greenville, NC, USA", state: "NC", lat: 35.6126, lng: -77.3663, tz: "America/New_York" },

  // --- NORTH DAKOTA CITIES ---
  { name: "Fargo, ND, USA", state: "ND", lat: 46.8772, lng: -96.7898, tz: "America/Chicago" },
  { name: "Bismarck, ND, USA", state: "ND", lat: 46.8083, lng: -100.7837, tz: "America/Chicago" },
  { name: "Grand Forks, ND, USA", state: "ND", lat: 47.9252, lng: -97.0328, tz: "America/Chicago" },
  { name: "Minot, ND, USA", state: "ND", lat: 48.2329, lng: -101.2922, tz: "America/Chicago" },
  { name: "West Fargo, ND, USA", state: "ND", lat: 46.8749, lng: -96.9003, tz: "America/Chicago" },
  { name: "Dickinson, ND, USA", state: "ND", lat: 46.8791, lng: -102.7896, tz: "America/Denver" },

  // --- OHIO CITIES ---
  { name: "Columbus, OH, USA", state: "OH", lat: 39.9612, lng: -82.9988, tz: "America/New_York" },
  { name: "Cleveland, OH, USA", state: "OH", lat: 41.4993, lng: -81.6944, tz: "America/New_York" },
  { name: "Cincinnati, OH, USA", state: "OH", lat: 39.1031, lng: -84.5120, tz: "America/New_York" },
  { name: "Toledo, OH, USA", state: "OH", lat: 41.6528, lng: -83.5378, tz: "America/New_York" },
  { name: "Akron, OH, USA", state: "OH", lat: 41.0814, lng: -81.5190, tz: "America/New_York" },
  { name: "Dayton, OH, USA", state: "OH", lat: 39.7589, lng: -84.1916, tz: "America/New_York" },
  { name: "Parma, OH, USA", state: "OH", lat: 41.4047, lng: -81.7229, tz: "America/New_York" },
  { name: "Canton, OH, USA", state: "OH", lat: 40.7989, lng: -81.3784, tz: "America/New_York" },
  { name: "Youngstown, OH, USA", state: "OH", lat: 41.0997, lng: -80.6495, tz: "America/New_York" },
  { name: "Lorain, OH, USA", state: "OH", lat: 41.4528, lng: -82.1824, tz: "America/New_York" },
  { name: "Athens, OH, USA", state: "OH", lat: 39.3292, lng: -82.1012, tz: "America/New_York" },

  // --- OKLAHOMA CITIES ---
  { name: "Oklahoma City, OK, USA", state: "OK", lat: 35.4676, lng: -97.5164, tz: "America/Chicago" },
  { name: "Tulsa, OK, USA", state: "OK", lat: 36.1540, lng: -95.9928, tz: "America/Chicago" },
  { name: "Norman, OK, USA", state: "OK", lat: 35.2225, lng: -97.4394, tz: "America/Chicago" },
  { name: "Broken Arrow, OK, USA", state: "OK", lat: 36.0365, lng: -95.7937, tz: "America/Chicago" },
  { name: "Edmond, OK, USA", state: "OK", lat: 35.6528, lng: -97.4781, tz: "America/Chicago" },
  { name: "Lawton, OK, USA", state: "OK", lat: 34.6086, lng: -98.3903, tz: "America/Chicago" },
  { name: "Moore, OK, USA", state: "OK", lat: 35.3395, lng: -97.4867, tz: "America/Chicago" },
  { name: "Stillwater, OK, USA", state: "OK", lat: 36.1156, lng: -97.0583, tz: "America/Chicago" },
  { name: "Enid, OK, USA", state: "OK", lat: 36.3955, lng: -97.8783, tz: "America/Chicago" },

  // --- OREGON CITIES ---
  { name: "Portland, OR, USA", state: "OR", lat: 45.5152, lng: -122.6784, tz: "America/Los_Angeles" },
  { name: "Eugene, OR, USA", state: "OR", lat: 44.0521, lng: -123.0868, tz: "America/Los_Angeles" },
  { name: "Salem, OR, USA", state: "OR", lat: 44.9428, lng: -123.0350, tz: "America/Los_Angeles" },
  { name: "Gresham, OR, USA", state: "OR", lat: 45.4997, lng: -122.4310, tz: "America/Los_Angeles" },
  { name: "Hillsboro, OR, USA", state: "OR", lat: 45.5228, lng: -122.9898, tz: "America/Los_Angeles" },
  { name: "Bend, OR, USA", state: "OR", lat: 44.0581, lng: -121.3153, tz: "America/Los_Angeles" },
  { name: "Beaverton, OR, USA", state: "OR", lat: 45.4870, lng: -122.8037, tz: "America/Los_Angeles" },
  { name: "Medford, OR, USA", state: "OR", lat: 42.3265, lng: -122.8755, tz: "America/Los_Angeles" },
  { name: "Corvallis, OR, USA", state: "OR", lat: 44.5645, lng: -123.2620, tz: "America/Los_Angeles" },
  { name: "Astoria, OR, USA", state: "OR", lat: 46.1878, lng: -123.8312, tz: "America/Los_Angeles" },

  // --- PENNSYLVANIA CITIES ---
  { name: "Philadelphia, PA, USA", state: "PA", lat: 39.9526, lng: -75.1652, tz: "America/New_York" },
  { name: "Pittsburgh, PA, USA", state: "PA", lat: 40.4406, lng: -79.9959, tz: "America/New_York" },
  { name: "Allentown, PA, USA", state: "PA", lat: 40.6084, lng: -75.4902, tz: "America/New_York" },
  { name: "Scranton, PA, USA", state: "PA", lat: 41.4090, lng: -75.6624, tz: "America/New_York" },
  { name: "Harrisburg, PA, USA", state: "PA", lat: 40.2732, lng: -76.8867, tz: "America/New_York" },
  { name: "Erie, PA, USA", state: "PA", lat: 42.1292, lng: -80.0850, tz: "America/New_York" },
  { name: "Reading, PA, USA", state: "PA", lat: 40.3356, lng: -75.9268, tz: "America/New_York" },
  { name: "Bethlehem, PA, USA", state: "PA", lat: 40.6259, lng: -75.3704, tz: "America/New_York" },
  { name: "Lancaster, PA, USA", state: "PA", lat: 40.0378, lng: -76.3055, tz: "America/New_York" },
  { name: "State College, PA, USA", state: "PA", lat: 40.7933, lng: -77.8600, tz: "America/New_York" },
  { name: "York, PA, USA", state: "PA", lat: 39.9625, lng: -76.7277, tz: "America/New_York" },
  { name: "Wilkes-Barre, PA, USA", state: "PA", lat: 41.2459, lng: -75.8813, tz: "America/New_York" },
  { name: "Hershey, PA, USA", state: "PA", lat: 40.2859, lng: -76.6502, tz: "America/New_York" },
  { name: "Gettysburg, PA, USA", state: "PA", lat: 39.8309, lng: -77.2310, tz: "America/New_York" },

  // --- RHODE ISLAND CITIES ---
  { name: "Providence, RI, USA", state: "RI", lat: 41.8240, lng: -71.4128, tz: "America/New_York" },
  { name: "Warwick, RI, USA", state: "RI", lat: 41.7001, lng: -71.4161, tz: "America/New_York" },
  { name: "Cranston, RI, USA", state: "RI", lat: 41.7798, lng: -71.4372, tz: "America/New_York" },
  { name: "Pawtucket, RI, USA", state: "RI", lat: 41.8787, lng: -71.3828, tz: "America/New_York" },
  { name: "East Providence, RI, USA", state: "RI", lat: 41.8137, lng: -71.3700, tz: "America/New_York" },
  { name: "Woonsocket, RI, USA", state: "RI", lat: 42.0028, lng: -71.5147, tz: "America/New_York" },
  { name: "Newport, RI, USA", state: "RI", lat: 41.4901, lng: -71.3128, tz: "America/New_York" },

  // --- SOUTH CAROLINA CITIES ---
  { name: "Columbia, SC, USA", state: "SC", lat: 34.0007, lng: -81.0348, tz: "America/New_York" },
  { name: "Charleston, SC, USA", state: "SC", lat: 32.7765, lng: -79.9311, tz: "America/New_York" },
  { name: "North Charleston, SC, USA", state: "SC", lat: 32.8546, lng: -79.9748, tz: "America/New_York" },
  { name: "Mount Pleasant, SC, USA", state: "SC", lat: 32.7940, lng: -79.8625, tz: "America/New_York" },
  { name: "Rock Hill, SC, USA", state: "SC", lat: 34.9248, lng: -81.0250, tz: "America/New_York" },
  { name: "Greenville, SC, USA", state: "SC", lat: 34.8526, lng: -82.3940, tz: "America/New_York" },
  { name: "Summerville, SC, USA", state: "SC", lat: 33.0185, lng: -80.1756, tz: "America/New_York" },
  { name: "Sumter, SC, USA", state: "SC", lat: 33.9204, lng: -80.3414, tz: "America/New_York" },
  { name: "Hilton Head Island, SC, USA", state: "SC", lat: 32.2163, lng: -80.7526, tz: "America/New_York" },
  { name: "Myrtle Beach, SC, USA", state: "SC", lat: 33.6890, lng: -78.8866, tz: "America/New_York" },

  // --- SOUTH DAKOTA CITIES ---
  { name: "Sioux Falls, SD, USA", state: "SD", lat: 43.5460, lng: -96.7313, tz: "America/Chicago" },
  { name: "Rapid City, SD, USA", state: "SD", lat: 44.0805, lng: -103.2310, tz: "America/Denver" },
  { name: "Aberdeen, SD, USA", state: "SD", lat: 45.4649, lng: -98.4864, tz: "America/Chicago" },
  { name: "Brookings, SD, USA", state: "SD", lat: 44.3113, lng: -96.7983, tz: "America/Chicago" },
  { name: "Watertown, SD, USA", state: "SD", lat: 44.9000, lng: -97.1145, tz: "America/Chicago" },
  { name: "Mitchell, SD, USA", state: "SD", lat: 43.7091, lng: -98.0298, tz: "America/Chicago" },
  { name: "Pierre, SD, USA", state: "SD", lat: 44.3683, lng: -100.3509, tz: "America/Chicago" },

  // --- TENNESSEE CITIES ---
  { name: "Nashville, TN, USA", state: "TN", lat: 36.1627, lng: -86.7816, tz: "America/Chicago" },
  { name: "Memphis, TN, USA", state: "TN", lat: 35.1495, lng: -90.0490, tz: "America/Chicago" },
  { name: "Knoxville, TN, USA", state: "TN", lat: 35.9606, lng: -83.9207, tz: "America/New_York" },
  { name: "Chattanooga, TN, USA", state: "TN", lat: 35.0456, lng: -85.3096, tz: "America/New_York" },
  { name: "Clarksville, TN, USA", state: "TN", lat: 36.5297, lng: -87.3594, tz: "America/Chicago" },
  { name: "Murfreesboro, TN, USA", state: "TN", lat: 35.8456, lng: -86.3902, tz: "America/Chicago" },
  { name: "Franklin, TN, USA", state: "TN", lat: 35.9250, lng: -86.8688, tz: "America/Chicago" },
  { name: "Jackson, TN, USA", state: "TN", lat: 35.6145, lng: -88.8139, tz: "America/Chicago" },
  { name: "Johnson City, TN, USA", state: "TN", lat: 36.3134, lng: -82.3534, tz: "America/New_York" },
  { name: "Gatlinburg, TN, USA", state: "TN", lat: 35.7142, lng: -83.5101, tz: "America/New_York" },

  // --- TEXAS CITIES ---
  { name: "Houston, TX, USA", state: "TX", lat: 29.7604, lng: -95.3698, tz: "America/Chicago" },
  { name: "Dallas, TX, USA", state: "TX", lat: 32.7767, lng: -96.7970, tz: "America/Chicago" },
  { name: "Austin, TX, USA", state: "TX", lat: 30.2672, lng: -97.7431, tz: "America/Chicago" },
  { name: "San Antonio, TX, USA", state: "TX", lat: 29.4241, lng: -98.4936, tz: "America/Chicago" },
  { name: "Fort Worth, TX, USA", state: "TX", lat: 32.7555, lng: -97.3308, tz: "America/Chicago" },
  { name: "El Paso, TX, USA", state: "TX", lat: 31.7619, lng: -106.4850, tz: "America/Denver" },
  { name: "Arlington, TX, USA", state: "TX", lat: 32.7356, lng: -97.1080, tz: "America/Chicago" },
  { name: "Corpus Christi, TX, USA", state: "TX", lat: 27.8005, lng: -97.3963, tz: "America/Chicago" },
  { name: "Plano, TX, USA", state: "TX", lat: 33.0198, lng: -96.6988, tz: "America/Chicago" },
  { name: "Laredo, TX, USA", state: "TX", lat: 27.5305, lng: -99.4803, tz: "America/Chicago" },
  { name: "Lubbock, TX, USA", state: "TX", lat: 33.5778, lng: -101.8551, tz: "America/Chicago" },
  { name: "Garland, TX, USA", state: "TX", lat: 32.9126, lng: -96.6388, tz: "America/Chicago" },
  { name: "Irving, TX, USA", state: "TX", lat: 32.8140, lng: -96.9488, tz: "America/Chicago" },
  { name: "Amarillo, TX, USA", state: "TX", lat: 35.2219, lng: -101.8312, tz: "America/Chicago" },
  { name: "Grand Prairie, TX, USA", state: "TX", lat: 32.7459, lng: -97.0225, tz: "America/Chicago" },
  { name: "Brownsville, TX, USA", state: "TX", lat: 25.9017, lng: -97.4974, tz: "America/Chicago" },
  { name: "McKinney, TX, USA", state: "TX", lat: 33.1976, lng: -96.6154, tz: "America/Chicago" },
  { name: "Frisco, TX, USA", state: "TX", lat: 33.1506, lng: -96.8236, tz: "America/Chicago" },
  { name: "Pasadena, TX, USA", state: "TX", lat: 29.6910, lng: -95.2091, tz: "America/Chicago" },
  { name: "Mesquite, TX, USA", state: "TX", lat: 32.7667, lng: -96.5991, tz: "America/Chicago" },
  { name: "Killeen, TX, USA", state: "TX", lat: 31.1171, lng: -97.7277, tz: "America/Chicago" },
  { name: "McAllen, TX, USA", state: "TX", lat: 26.2034, lng: -98.2300, tz: "America/Chicago" },
  { name: "Waco, TX, USA", state: "TX", lat: 31.5493, lng: -97.1466, tz: "America/Chicago" },
  { name: "Carrollton, TX, USA", state: "TX", lat: 32.9537, lng: -96.8902, tz: "America/Chicago" },
  { name: "Midland, TX, USA", state: "TX", lat: 31.9973, lng: -102.0779, tz: "America/Chicago" },
  { name: "Denton, TX, USA", state: "TX", lat: 33.2148, lng: -97.1330, tz: "America/Chicago" },
  { name: "Abilene, TX, USA", state: "TX", lat: 32.4487, lng: -99.7331, tz: "America/Chicago" },
  { name: "Odessa, TX, USA", state: "TX", lat: 31.8456, lng: -102.3676, tz: "America/Chicago" },
  { name: "Beaumont, TX, USA", state: "TX", lat: 30.0801, lng: -94.1265, tz: "America/Chicago" },
  { name: "Round Rock, TX, USA", state: "TX", lat: 30.5082, lng: -97.6788, tz: "America/Chicago" },
  { name: "The Woodlands, TX, USA", state: "TX", lat: 30.1658, lng: -95.4612, tz: "America/Chicago" },
  { name: "Richardson, TX, USA", state: "TX", lat: 32.9483, lng: -96.7298, tz: "America/Chicago" },

  // --- UTAH CITIES ---
  { name: "Salt Lake City, UT, USA", state: "UT", lat: 40.7608, lng: -111.8910, tz: "America/Denver" },
  { name: "West Valley City, UT, USA", state: "UT", lat: 40.6916, lng: -111.9804, tz: "America/Denver" },
  { name: "Provo, UT, USA", state: "UT", lat: 40.2338, lng: -111.6585, tz: "America/Denver" },
  { name: "West Jordan, UT, USA", state: "UT", lat: 40.6096, lng: -111.9391, tz: "America/Denver" },
  { name: "Orem, UT, USA", state: "UT", lat: 40.2968, lng: -111.6946, tz: "America/Denver" },
  { name: "Sandy, UT, USA", state: "UT", lat: 40.5720, lng: -111.8605, tz: "America/Denver" },
  { name: "Ogden, UT, USA", state: "UT", lat: 41.2230, lng: -111.9738, tz: "America/Denver" },
  { name: "St. George, UT, USA", state: "UT", lat: 37.0965, lng: -113.5684, tz: "America/Denver" },
  { name: "Layton, UT, USA", state: "UT", lat: 41.0602, lng: -111.9710, tz: "America/Denver" },
  { name: "Park City, UT, USA", state: "UT", lat: 40.6460, lng: -111.4979, tz: "America/Denver" },
  { name: "Moab, UT, USA", state: "UT", lat: 38.5733, lng: -109.5498, tz: "America/Denver" },

  // --- VERMONT CITIES ---
  { name: "Burlington, VT, USA", state: "VT", lat: 44.4759, lng: -73.2121, tz: "America/New_York" },
  { name: "South Burlington, VT, USA", state: "VT", lat: 44.4669, lng: -73.1709, tz: "America/New_York" },
  { name: "Rutland, VT, USA", state: "VT", lat: 43.6106, lng: -72.9726, tz: "America/New_York" },
  { name: "Barre, VT, USA", state: "VT", lat: 44.1970, lng: -72.5020, tz: "America/New_York" },
  { name: "Montpelier, VT, USA", state: "VT", lat: 44.2600, lng: -72.5753, tz: "America/New_York" },
  { name: "Winooski, VT, USA", state: "VT", lat: 44.4967, lng: -73.1848, tz: "America/New_York" },
  { name: "St. Albans, VT, USA", state: "VT", lat: 44.8108, lng: -73.0831, tz: "America/New_York" },

  // --- VIRGINIA CITIES ---
  { name: "Richmond, VA, USA", state: "VA", lat: 37.5407, lng: -77.4360, tz: "America/New_York" },
  { name: "Virginia Beach, VA, USA", state: "VA", lat: 36.8529, lng: -75.9780, tz: "America/New_York" },
  { name: "Norfolk, VA, USA", state: "VA", lat: 36.8507, lng: -76.2858, tz: "America/New_York" },
  { name: "Chesapeake, VA, USA", state: "VA", lat: 36.7188, lng: -76.2467, tz: "America/New_York" },
  { name: "Arlington, VA, USA", state: "VA", lat: 38.8799, lng: -77.1067, tz: "America/New_York" },
  { name: "Newport News, VA, USA", state: "VA", lat: 37.0870, lng: -76.4730, tz: "America/New_York" },
  { name: "Alexandria, VA, USA", state: "VA", lat: 38.8048, lng: -77.0469, tz: "America/New_York" },
  { name: "Hampton, VA, USA", state: "VA", lat: 37.0298, lng: -76.3452, tz: "America/New_York" },
  { name: "Roanoke, VA, USA", state: "VA", lat: 37.2709, lng: -79.9414, tz: "America/New_York" },
  { name: "Portsmouth, VA, USA", state: "VA", lat: 36.8354, lng: -76.2982, tz: "America/New_York" },
  { name: "Suffolk, VA, USA", state: "VA", lat: 36.7283, lng: -76.5835, tz: "America/New_York" },
  { name: "Lynchburg, VA, USA", state: "VA", lat: 37.4137, lng: -79.1422, tz: "America/New_York" },
  { name: "Charlottesville, VA, USA", state: "VA", lat: 38.0293, lng: -78.4766, tz: "America/New_York" },
  { name: "Williamsburg, VA, USA", state: "VA", lat: 37.2707, lng: -76.7074, tz: "America/New_York" },

  // --- WASHINGTON CITIES ---
  { name: "Seattle, WA, USA", state: "WA", lat: 47.6062, lng: -122.3321, tz: "America/Los_Angeles" },
  { name: "Spokane, WA, USA", state: "WA", lat: 47.6588, lng: -117.4260, tz: "America/Los_Angeles" },
  { name: "Tacoma, WA, USA", state: "WA", lat: 47.2529, lng: -122.4443, tz: "America/Los_Angeles" },
  { name: "Vancouver, WA, USA", state: "WA", lat: 45.6257, lng: -122.6706, tz: "America/Los_Angeles" },
  { name: "Bellevue, WA, USA", state: "WA", lat: 47.6101, lng: -122.2015, tz: "America/Los_Angeles" },
  { name: "Kent, WA, USA", state: "WA", lat: 47.3809, lng: -122.2348, tz: "America/Los_Angeles" },
  { name: "Everett, WA, USA", state: "WA", lat: 47.9789, lng: -122.2020, tz: "America/Los_Angeles" },
  { name: "Renton, WA, USA", state: "WA", lat: 47.4797, lng: -122.2079, tz: "America/Los_Angeles" },
  { name: "Yakima, WA, USA", state: "WA", lat: 46.6020, lng: -120.5058, tz: "America/Los_Angeles" },
  { name: "Bellingham, WA, USA", state: "WA", lat: 48.7519, lng: -122.4786, tz: "America/Los_Angeles" },
  { name: "Olympia, WA, USA", state: "WA", lat: 47.0378, lng: -122.9006, tz: "America/Los_Angeles" },

  // --- WEST VIRGINIA CITIES ---
  { name: "Charleston, WV, USA", state: "WV", lat: 38.3498, lng: -81.6326, tz: "America/New_York" },
  { name: "Huntington, WV, USA", state: "WV", lat: 38.4192, lng: -82.4451, tz: "America/New_York" },
  { name: "Morgantown, WV, USA", state: "WV", lat: 39.6295, lng: -79.9558, tz: "America/New_York" },
  { name: "Parkersburg, WV, USA", state: "WV", lat: 39.2667, lng: -81.5615, tz: "America/New_York" },
  { name: "Wheeling, WV, USA", state: "WV", lat: 40.0639, lng: -80.7209, tz: "America/New_York" },
  { name: "Weirton, WV, USA", state: "WV", lat: 40.4189, lng: -80.5895, tz: "America/New_York" },
  { name: "Fairmont, WV, USA", state: "WV", lat: 39.4850, lng: -80.1425, tz: "America/New_York" },
  { name: "Beckley, WV, USA", state: "WV", lat: 37.7781, lng: -81.1881, tz: "America/New_York" },
  { name: "Martinsburg, WV, USA", state: "WV", lat: 39.4562, lng: -77.9638, tz: "America/New_York" },

  // --- WISCONSIN CITIES ---
  { name: "Milwaukee, WI, USA", state: "WI", lat: 43.0389, lng: -87.9065, tz: "America/Chicago" },
  { name: "Madison, WI, USA", state: "WI", lat: 43.0731, lng: -89.4012, tz: "America/Chicago" },
  { name: "Green Bay, WI, USA", state: "WI", lat: 44.5191, lng: -88.0198, tz: "America/Chicago" },
  { name: "Kenosha, WI, USA", state: "WI", lat: 42.5847, lng: -87.8211, tz: "America/Chicago" },
  { name: "Racine, WI, USA", state: "WI", lat: 42.7261, lng: -87.7828, tz: "America/Chicago" },
  { name: "Appleton, WI, USA", state: "WI", lat: 44.2619, lng: -88.4153, tz: "America/Chicago" },
  { name: "Waukesha, WI, USA", state: "WI", lat: 43.0116, lng: -88.2314, tz: "America/Chicago" },
  { name: "Oshkosh, WI, USA", state: "WI", lat: 44.0247, lng: -88.5426, tz: "America/Chicago" },
  { name: "Eau Claire, WI, USA", state: "WI", lat: 44.8113, lng: -91.4984, tz: "America/Chicago" },
  { name: "Janesville, WI, USA", state: "WI", lat: 42.6827, lng: -89.0187, tz: "America/Chicago" },
  { name: "La Crosse, WI, USA", state: "WI", lat: 43.8013, lng: -91.2395, tz: "America/Chicago" },

  // --- WYOMING CITIES ---
  { name: "Cheyenne, WY, USA", state: "WY", lat: 41.1400, lng: -104.8202, tz: "America/Denver" },
  { name: "Casper, WY, USA", state: "WY", lat: 42.8666, lng: -106.3130, tz: "America/Denver" },
  { name: "Laramie, WY, USA", state: "WY", lat: 41.3113, lng: -105.5911, tz: "America/Denver" },
  { name: "Gillette, WY, USA", state: "WY", lat: 44.2911, lng: -105.5022, tz: "America/Denver" },
  { name: "Rock Springs, WY, USA", state: "WY", lat: 41.5874, lng: -109.2029, tz: "America/Denver" },
  { name: "Sheridan, WY, USA", state: "WY", lat: 44.7971, lng: -106.9561, tz: "America/Denver" },
  { name: "Green River, WY, USA", state: "WY", lat: 41.5285, lng: -109.4661, tz: "America/Denver" },
  { name: "Evanston, WY, USA", state: "WY", lat: 41.2682, lng: -110.9632, tz: "America/Denver" },
  { name: "Jackson, WY, USA", state: "WY", lat: 43.4799, lng: -110.7624, tz: "America/Denver" },

  // --- MARYLAND & DC ---
  { name: "Washington, DC, USA", state: "DC", lat: 38.9072, lng: -77.0369, tz: "America/New_York" },

  // --- INTERNATIONAL CAPITALS ---
  { name: "London, UK", lat: 51.5074, lng: -0.1278, tz: "Europe/London" },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522, tz: "Europe/Paris" },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo" },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, tz: "Australia/Sydney" },
  { name: "Toronto, Canada", lat: 43.6532, lng: -79.3832, tz: "America/Toronto" },
  { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050, tz: "Europe/Berlin" },
  { name: "Rome, Italy", lat: 41.9028, lng: 12.4964, tz: "Europe/Rome" },
  { name: "Madrid, Spain", lat: 40.4168, lng: -3.7038, tz: "Europe/Madrid" }
];

// Lazy‑load a full US cities dataset (if provided) and fall back to the built‑in list.
export async function getAllCities() {
  try {
    const response = await fetch('/data/us_cities_full.json');
    if (response.ok) {
      const data = await response.json();
      // Expect an array of city objects matching the shape of WORLD_CITIES.
      return data;
    }
  } catch (e) {
    // Silently ignore errors – fallback to bundled list.
  }
  return WORLD_CITIES;
}

// Helper to look up or resolve any city in the USA
export function resolveLocation(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct city match
  const exact = WORLD_CITIES.find(c => c.name.toLowerCase() === clean);
  if (exact) return exact;

  // 2. Partial match
  const partial = WORLD_CITIES.find(c => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase().split(',')[0]));
  if (partial) return partial;

  // 3. Check for 2-letter state code (e.g., "NJ", "CA", "TX", "Austin TX")
  const stateMatch = clean.match(/\b([a-z]{2})\b/);
  if (stateMatch) {
    const code = stateMatch[1].toUpperCase();
    if (US_STATE_CENTROIDS[code]) {
      return {
        name: `${query.trim()}, USA`,
        lat: US_STATE_CENTROIDS[code].lat,
        lng: US_STATE_CENTROIDS[code].lng,
        tz: US_STATE_CENTROIDS[code].tz
      };
    }
  }

  // 4. Default fallback to USA centroid
  return {
    name: query.trim(),
    lat: 39.8283,
    lng: -98.5795,
    tz: "America/New_York"
  };
}

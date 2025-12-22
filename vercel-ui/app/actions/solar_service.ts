// /**
//  * Fetches the closest building insights information from the Google Solar API.
//  * Docs: https://developers.google.com/maps/documentation/solar/building-insights
//  *
//  * @param location - LatLng object from Google Maps API
//  * @param apiKey - Google Cloud API key
//  * @returns BuildingInsightsResponse
//  */
// export async function findClosestBuilding(
//   location: { lat: number; lng: number },
//   apiKey: string
// ): Promise<any> {
//   // Build query parameters as per official docs
//   const args = {
//     'location.latitude': location.lat.toFixed(5),
//     'location.longitude': location.lng.toFixed(5),
//     required_quality: 'BASE', // or 'HIGH' / 'MEDIUM'
//   };

//   const params = new URLSearchParams({ ...args, key: apiKey });

//   const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`;
//   console.log('GET buildingInsights URL:', url);

//   const response = await fetch(url);

//   const content = await response.json();

//   if (!response.ok) {
//     console.error('findClosestBuilding Error:', content);
//     throw new Error(JSON.stringify(content));
//   }

//   console.log('buildingInsightsResponse', content);
//   return content;
// }

// /**
//  * Fetches the data layers information from the Solar API.
//  * Docs: https://developers.google.com/maps/documentation/solar/data-layers
//  *
//  * @param location - LatLng object { lat, lng }
//  * @param radiusMeters - Radius of the data layer size in meters.
//  * @param apiKey - Google Cloud API key.
//  * @returns DataLayersResponse
//  */
// export async function getDataLayerUrls(
//   location: { lat: number; lng: number },
//   radiusMeters: number,
//   apiKey: string,
// ): Promise<any> {
//   const args = {
//     'location.latitude': location.lat.toFixed(5),
//     'location.longitude': location.lng.toFixed(5),
//     radius_meters: radiusMeters.toString(),
//     required_quality: 'BASE',
//   };

//   const params = new URLSearchParams({ ...args, key: apiKey });
//   const url = `https://solar.googleapis.com/v1/dataLayers:get?${params}`;
  
//   console.log('GET dataLayers URL:', url);

//   const response = await fetch(url);
//   const content = await response.json();

//   if (!response.ok) {
//     console.error('getDataLayerUrls Error:', content);
//     throw new Error(JSON.stringify(content));
//   }

//   console.log('dataLayersResponse', content);
//   return content;
// }

const axios = require('axios');

const API_KEY = 'AIzaSyBnCdCIEJnOuMY_MtQGOz2m7SAv849sCeg';

async function test() {
  try {
    const response = await axios.post('https://places.googleapis.com/v1/places:searchText', {
      textQuery: 'restaurants en Barcelona, España',
      maxResultCount: 5,
      languageCode: 'es',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
      }
    });
    
    console.log('✅ Google API werkt!');
    console.log('Restaurants gevonden:', response.data.places?.length || 0);
    if (response.data.places && response.data.places.length > 0) {
      console.log('Eerste restaurant:', response.data.places[0].displayName);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();



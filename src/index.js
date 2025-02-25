import Resolver from '@forge/resolver';
import { storage, fetch } from '@forge/api'; 

const resolver = new Resolver();


resolver.define('getStoredConfig', async () => {
  const config = await storage.get('dashboardConfig');
  return config || {};
});


resolver.define('setStoredConfig', async ({ payload }) => {
  await storage.set('dashboardConfig', payload);
  return { success: true };
});

resolver.define('getCountries', async () => {
  try {
    const response = await fetch('https://api.first.org/data/v1/countries');
    //console.log(response);
    
    const text = await response.text(); 
    // console.log("text");
    
    // console.log(text);
    const data = JSON.parse(text); 

    
    const countries = Object.entries(data.data).map(([code, country]) => ({
      label: country.country,
      value: country.country,
    }));

    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
});

export const handler = resolver.getDefinitions();

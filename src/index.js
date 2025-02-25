import Resolver from '@forge/resolver';
import { storage, fetch } from '@forge/api'; // ✅ Import 'fetch' instead of 'api'

const resolver = new Resolver();

// Fetch stored config
resolver.define('getStoredConfig', async () => {
  const config = await storage.get('dashboardConfig');
  return config || {};
});

// Store config
resolver.define('setStoredConfig', async ({ payload }) => {
  await storage.set('dashboardConfig', payload);
  return { success: true };
});

resolver.define('getCountries', async () => {
  try {
    const response = await fetch('https://api.first.org/data/v1/countries');
    const text = await response.text(); // Read raw text response first

    console.log("Raw API Response:", text); // Log it

    const data = JSON.parse(text); // Parse only if it's valid JSON

    if (!data || !data.data) {
      console.error("Invalid API response structure:", data);
      return [];
    }

    const countries = Object.entries(data.data).map(([code, country]) => ({
      label: country.country,
      value: country.country,
    }));

    console.log("Processed Country List:", countries);
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
});

export const handler = resolver.getDefinitions();

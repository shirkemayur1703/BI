import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();


resolver.define('getStoredConfig', async () => {
  const config = await storage.get('dashboardConfig');
  return config || {};
});


resolver.define('setStoredConfig', async ({ payload }) => {
  await storage.set('dashboardConfig', payload);
  return { success: true };
});

export const handler = resolver.getDefinitions();

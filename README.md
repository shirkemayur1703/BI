resolver.define('getConfigurations', async ({ payload }) => {
  const { gadgetId } = payload;
  const config = await storage.entity('gadgetConfigs').get(gadgetId);
  return config || {};
});

resolver.define('setConfigurations', async ({ payload }) => {
  const { gadgetId, baseUrl, config } = payload;

  const existingConfig = await storage.entity('gadgetConfigs').get(gadgetId) || {};
  existingConfig[baseUrl] = config;

  await storage.entity('gadgetConfigs').set(gadgetId, existingConfig);

  return { success: true };
});


const config = await invoke('getConfigurations', { gadgetId });
const configForBaseUrl = config?.[baseUrl];



await invoke('setConfigurations', {
  gadgetId,
  baseUrl,
  config: {
    authToken: 'your-token',
    selectedReport: 'sales-overview',
    selectedProject: 'Project A'
  }
});


resolver.define('setSecureConfigurations', async ({ payload }) => {
  const { gadgetId, currentUrl, authToken } = payload;

  // Create an object with both values
  const configObject = {
    currentUrl,
    authToken
  };

  // Store the object in secureStorage
  await storage.secure.set(`gadget-${gadgetId}-config`, configObject);

  return { success: true };
});



resolver.define('getSecureConfigurations', async ({ payload }) => {
  const { gadgetId } = payload;

  // Retrieve the object from secureStorage
  const configObject = await storage.secure.get(`gadget-${gadgetId}-config`);

  if (!configObject) {
    return { error: 'Configuration not found' };
  }

  return configObject; // This will return { currentUrl, authToken }
});


await invoke('setSecureConfigurations', {
  gadgetId,
  currentUrl: 'https://bi.mycompany.com',
  authToken: 'xyz123'
});

const { currentUrl, authToken } = await invoke('getSecureConfigurations', { gadgetId });

// Use currentUrl and authToken as needed


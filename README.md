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






// Get the configurations for a given gadgetId
resolver.define('getConfigurations', async ({ payload }) => {
  const { gadgetId } = payload;
  const config = await storage.entity('gadgetConfigs').get(gadgetId);
  return config || {}; // Return empty object if no config is found
});

// Set the configurations for a given gadgetId and baseUrl
resolver.define('setConfigurations', async ({ payload }) => {
  const { gadgetId, baseUrl, config } = payload;

  // Fetch the existing configurations for the gadgetId, or initialize an empty object
  const existingConfig = await storage.entity('gadgetConfigs').get(gadgetId) || {};

  // Store the new config under the specific baseUrl
  existingConfig[baseUrl] = config;

  // Save the updated configurations for the gadgetId
  await storage.entity('gadgetConfigs').set(gadgetId, existingConfig);

  return { success: true }; // Return success status
});





await invoke('setConfigurations', {
  gadgetId,
  baseUrl: 'https://bi.mycompany.com', // Example baseUrl
  config: {
    report: { label: 'Sales Report', value: 'sales-report-id' }, // Report as an object with label and value
    project: 'Project A', // Project as a single value
    height: 600 // Height as a single value
  }
});

const config = await invoke('getConfigurations', { gadgetId });
const configForBaseUrl = config?.[baseUrl];

// Now you can access configForBaseUrl which will contain:
// { report, project, height }

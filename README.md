const existingConfig = await storage.get(gadgetId) || {};
existingConfig[baseUrl] = {
  report: {
    label: 'New Report',
    value: 'report-2'
  },
  project: 'Project B',
  height: 500
};

await storage.set(gadgetId, existingConfig);

const config = await storage.get(gadgetId);
const configForBaseUrl = config?.[baseUrl];

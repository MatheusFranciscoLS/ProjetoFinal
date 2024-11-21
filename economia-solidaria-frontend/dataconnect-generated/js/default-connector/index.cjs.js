const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'economia-solidaria-frontend',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;


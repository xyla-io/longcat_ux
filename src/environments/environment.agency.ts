export const environment = {
  production: true,
  siteName: location.hostname.split('.').shift(),
  apiBaseURL: 'API_BASE_URL',
  rulesAPIBaseURL: 'RULES_API_BASE_URL',
  rulesAPIKey: 'RULES_API_KEY',
  companySwitchingEnabled: true,
  debugOptions: {
    routeLogging: false,
  },
  agGridLicenseKey: 'LICENSE_KEY_STRING',
};

export const environment = {
  production: true,
  siteName: location.hostname.split('.').shift(),
  apiBaseURL: 'API_BASE_URL',
  rulesAPIKey: 'RULES_API_KEY',
  rulesAPIBaseURL: 'RULES_API_BASE_URL',
  companySwitchingEnabled: false,
  debugOptions: {
    routeLogging: false,
  },
  agGridLicenseKey: 'LICENSE_KEY_STRING',
};

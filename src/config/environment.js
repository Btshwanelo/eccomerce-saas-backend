// Environment configuration
const config = {
  // Environment type (development, staging, production)
  environment: process.env.NODE_ENV || 'development',
  
  // Application environment (main or vibe)
  appEnvironment: process.env.APP_ENVIRONMENT || 'vibe',
  
  // Port configuration - using 8080 consistently
  port: process.env.PORT || 8080,
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'dev'
  },

  // PayFast configuration
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
    passphrase: process.env.PAYFAST_PASSPHRASE || '',
    returnUrl: process.env.PAYFAST_RETURN_URL || '',
    cancelUrl: process.env.PAYFAST_CANCEL_URL || '',
    notifyUrl: process.env.PAYFAST_NOTIFY_URL || ''
  }
};

// Get the current port
const getPort = () => {
  return config.port;
};

module.exports = {
  config,
  getPort,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
}; 
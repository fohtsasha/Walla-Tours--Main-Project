require('dotenv').config();

const environment = process.env.ENVIRONMENT || 'test';

const baseUrls = {
  production: {
    mobile: 'https://m.wallatours.co.il/',
    desktop: 'https://www.wallatours.co.il/',
    nofy: 'https://www.nofy.co.il/',

  },
  test: {
    mobile: 'http://m-test.wallatours.co.il/',
    desktop: 'https://dev-www.wallatours.co.il/',
    nofy: 'http://nofy-test.co.il/',

  },
};

module.exports = {
  environment,
  getBaseUrl: (deviceType = 'desktop') => baseUrls[environment][deviceType],
};

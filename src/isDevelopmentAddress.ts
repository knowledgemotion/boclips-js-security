export function isDevelopmentAddress(url) {
  const developmentAddresses = ['0.0.0.0', '127.0.0.1', 'localhost'];
  return developmentAddresses.indexOf(url) >= 0;
}

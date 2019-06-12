export function extractEndpoint(url: string, subdomain: string): string {
  const parts = url.split('.');
  const domain = !isDevelopmentAddress(url) && isDomainName(parts)
    ? buildEndpoint(parts)
    : 'staging-boclips.com';

  return `https://${subdomain}.${domain}`;
}

function isDevelopmentAddress(url) {
  const developmentAddresses = [
    '0.0.0.0',
    '127.0.0.1',
    'localhost',
  ];
  return developmentAddresses.indexOf(url) >= 0
}

function buildEndpoint(parts: ReadonlyArray<string>): string {
  return [parts[parts.length - 2], parts[parts.length - 1]].join('.');
}

function isDomainName(parts: ReadonlyArray<string>): boolean {
  return parts.length > 1;
}

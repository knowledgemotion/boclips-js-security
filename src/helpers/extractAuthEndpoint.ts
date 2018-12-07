export default function extractAuthEndpoint(url) {
  const parts = url.split(".");
  const domain = (isDomainName(parts)) ? buildEndpoint(parts) : "staging-boclips.com";

  return `https://login.${domain}/auth`;
}

function buildEndpoint(parts) {
  return [parts[parts.length - 2], parts[parts.length - 1]].join(".");
}

function isDomainName(parts) {
  return parts.length > 1;
}
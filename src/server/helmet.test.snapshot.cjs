exports[`helmet > {\"corp\":\"cross-origin\",\"embed\":false} 1`] = `
{
  "content-security-policy": "connect-src 'self' https://c.bing.com https://*.clarity.ms https://storage.googleapis.com/image-mojimage-development/;frame-ancestors 'self';img-src 'self' https://storage.googleapis.com/image-mojimage-development/;script-src 'self' https://c.bing.com https://*.clarity.ms;default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';object-src 'none';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "cross-origin",
  "origin-agent-cluster": "?1",
  "referrer-policy": "no-referrer",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-dns-prefetch-control": "off",
  "x-download-options": "noopen",
  "x-frame-options": "SAMEORIGIN",
  "x-permitted-cross-domain-policies": "none",
  "x-xss-protection": "0"
}
`;

exports[`helmet > {\"corp\":\"same-origin\",\"embed\":false} 1`] = `
{
  "content-security-policy": "connect-src 'self' https://c.bing.com https://*.clarity.ms https://storage.googleapis.com/image-mojimage-development/;frame-ancestors 'self';img-src 'self' https://storage.googleapis.com/image-mojimage-development/;script-src 'self' https://c.bing.com https://*.clarity.ms;default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';object-src 'none';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "origin-agent-cluster": "?1",
  "referrer-policy": "no-referrer",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-dns-prefetch-control": "off",
  "x-download-options": "noopen",
  "x-frame-options": "SAMEORIGIN",
  "x-permitted-cross-domain-policies": "none",
  "x-xss-protection": "0"
}
`;

exports[`helmet > {\"corp\":\"same-origin\",\"embed\":true} 1`] = `
{
  "content-security-policy": "connect-src 'self' https://c.bing.com https://*.clarity.ms https://storage.googleapis.com/image-mojimage-development/;frame-ancestors *;img-src 'self' https://storage.googleapis.com/image-mojimage-development/;script-src 'self' https://c.bing.com https://*.clarity.ms;default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';object-src 'none';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "origin-agent-cluster": "?1",
  "referrer-policy": "no-referrer",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-dns-prefetch-control": "off",
  "x-download-options": "noopen",
  "x-frame-options": "SAMEORIGIN",
  "x-permitted-cross-domain-policies": "none",
  "x-xss-protection": "0"
}
`;

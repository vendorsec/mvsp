function handler(event) {
  var response = event.response
  var headers = response.headers
  headers['strict-transport-security'] = {
    value: 'max-age=31536000; includeSubdomains; preload',
  }
  headers['permissions-policy'] = {
    value:
      'fullscreen=(), geolocation=(), microphone=(), usb=(), encrypted-media=(), payment=(), midi=()',
  }

  headers['x-content-type-options'] = {
    value: 'nosniff',
  }
  headers['x-frame-options'] = {
    value: 'DENY',
  }
  headers['x-xss-protection'] = {
    value: '1; mode=block',
  }
  headers['referrer-policy'] = {
    value: 'same-origin',
  }
  headers['content-security-policy'] = {
    value: "default-src 'self'; style-src 'self' 'unsafe-inline';",
  }
  return response
}

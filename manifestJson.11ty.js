exports.data = {
  permalink: "manifest.json",
};

exports.render = (data) => `{
  "name": "jameshfisher.com",
  "short_name": "Jameshfisher",
  "start_url": "/",
  "icons": [
    {
      "src": "/assets/jim_144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/assets/jim_512.jpg",
      "sizes": "512x512",
      "type": "image/jpeg"
    }
  ],
  "background_color": "white",
  "theme_color": "white",
  "display": "standalone",
  "gcm_sender_id": "432193615425"
}`;

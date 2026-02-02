(function() {
  'use strict';

  var config = window.LEADCOD_CONFIG;
  var pixelData = window.LEADCOD_PIXEL_DATA;
  if (!config || !config.API_BASE_URL) return;

  var shopUrl = pixelData && pixelData.shopUrl ? pixelData.shopUrl : '';
  var productData = pixelData && pixelData.productData ? pixelData.productData : null;

  function initFbq() {
    var f = window;
    var b = document;
    var e = 'script';
    var v = 'https://connect.facebook.net/en_US/fbevents.js';
    if (f.fbq) return;
    var n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    var t = b.createElement(e);
    t.async = !0;
    t.src = v;
    var r = b.getElementsByTagName(e)[0];
    r.parentNode.insertBefore(t, r);
  }

  initFbq();

  fetch(config.API_BASE_URL + '/pixels?shop=' + encodeURIComponent(shopUrl))
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (!result.success || !result.data) return;
      var facebookPixels = result.data.filter(function(p) { return p.provider === 'facebook' && p.pixelId; });
      if (facebookPixels.length === 0) return;

      facebookPixels.forEach(function(p) {
        window.fbq('init', p.pixelId);
      });

      if (productData && productData.variant_id) {
        window.fbq('track', 'ViewContent', {
          content_ids: [String(productData.variant_id)],
          content_type: 'product',
          content_name: productData.title,
          value: productData.price ? (productData.price / 100) : undefined,
          currency: productData.currency
        });
      }

      window.LeadcodTrackPurchase = function(value, currency, contentIds) {
        if (typeof window.fbq !== 'function') return;
        window.fbq('track', 'Purchase', {
          value: value,
          currency: currency || 'DZD',
          content_ids: contentIds || [],
          content_type: 'product'
        });
      };
    })
    .catch(function() {});
})();

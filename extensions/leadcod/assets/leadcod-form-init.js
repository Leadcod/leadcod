(function() {
  'use strict';

  var initData = window.LEADCOD_FORM_INIT_DATA || {};
  var blockId = initData.blockId || '';
  var shopUrl = initData.shopUrl || '';
  var variants = initData.productVariants || [];
  var defaultVariantId = initData.defaultVariantId || null;
  var product = initData.product || {};

  const container = document.getElementById('leadcod-form-' + blockId);
  if (!container) return;

  const config = window.LEADCOD_CONFIG || {};
  const apiUrl = config.getApiUrl ? config.getApiUrl('form') : (config.API_BASE_URL || '') + '/form';
  fetch(apiUrl + '?shop=' + encodeURIComponent(shopUrl))
    .then(function(response) { return response.json(); })
    .then(function(result) {
      if (!result.success || !result.data) {
        container.innerHTML = '<div class="leadcod-form-error">النموذج غير موجود. يرجى تكوين النموذج في التطبيق.' + (result.error ? ' (' + result.error + ')' : '') + '</div>';
        return;
      }

      var fields = result.data.fields;
      var settings = result.data.settings;
      var shippingSettings = result.data.shippingSettings;
      renderForm(container, fields, settings, shippingSettings);
    })
    .catch(function(error) {
      container.innerHTML = '<div class="leadcod-form-error">خطأ في تحميل النموذج: ' + error.message + '. يرجى التحقق من إعدادات رابط الواجهة.</div>';
    });

  function escapeHtml(s) {
    if (s == null || s === '') return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function showThankYouPopup(primaryColor, thankYouPopup, orderSummary) {
    var popup = thankYouPopup || {};
    var title = escapeHtml(popup.title || 'شكراً لك!');
    var message = escapeHtml(popup.message || 'تم تقديم طلبك بنجاح. سنتواصل معك قريباً.');
    var buttonText = escapeHtml(popup.buttonText || 'موافق');
    var overlay = document.createElement('div');
    overlay.className = 'leadcod-modal-overlay';
    var hex = primaryColor || '#15803d';
    var summaryHtml = '';
    if (orderSummary && (orderSummary.productName || orderSummary.total !== undefined)) {
      var productName = escapeHtml(orderSummary.productName || '-');
      var quantity = orderSummary.quantity || 1;
      var productPrice = orderSummary.productPrice != null ? orderSummary.productPrice : 0;
      var shippingPrice = orderSummary.shippingPrice != null ? orderSummary.shippingPrice : 0;
      var total = orderSummary.total != null ? orderSummary.total : 0;
      var currency = escapeHtml(orderSummary.currency || 'DZD');
      var shippingLabel = escapeHtml(orderSummary.shippingLabel || 'الشحن');
      var totalLabel = escapeHtml(orderSummary.totalLabel || 'المجموع');
      var freeLabel = escapeHtml(orderSummary.freeShippingLabel || 'مجاني');
      var hasShipping = orderSummary.hasShipping !== false;
      summaryHtml = '<div class="leadcod-order-summary">' +
        '<div class="leadcod-order-summary-row leadcod-order-summary-product">' +
        '<span class="leadcod-order-summary-name">' + productName + '</span>' +
        '<span class="leadcod-order-summary-qty">×' + quantity + '</span>' +
        '<span class="leadcod-order-summary-price">' + productPrice + ' ' + currency + '</span>' +
        '</div>' +
        (hasShipping ? '<div class="leadcod-order-summary-row">' +
          '<span class="leadcod-order-summary-label">' + shippingLabel + '</span>' +
          '<span class="leadcod-order-summary-price">' + (shippingPrice > 0 ? shippingPrice + ' ' + currency : freeLabel) + '</span>' +
          '</div>' : '') +
        '<div class="leadcod-order-summary-divider"></div>' +
        '<div class="leadcod-order-summary-row leadcod-order-summary-total">' +
        '<span class="leadcod-order-summary-label">' + totalLabel + '</span>' +
        '<span class="leadcod-order-summary-total-price" style="color: ' + hex + ';">' + total + ' ' + currency + '</span>' +
        '</div></div>';
    }
    overlay.innerHTML = '<div class="leadcod-modal-box">' +
      '<div class="leadcod-modal-icon-wrap success" style="background: ' + hex + '22; color: ' + hex + ';">' +
      '<span aria-hidden="true">✓</span></div>' +
      '<h3 class="leadcod-modal-title">' + title + '</h3>' +
      '<p class="leadcod-modal-message">' + message + '</p>' +
      summaryHtml +
      '<button type="button" class="leadcod-modal-btn" style="background: ' + hex + '; color: #fff;">' + buttonText + '</button>' +
      '</div>';
    var btn = overlay.querySelector('.leadcod-modal-btn');
    var close = function() {
      overlay.style.animation = 'leadcod-fadeIn 0.15s ease reverse';
      setTimeout(function() { overlay.remove(); }, 150);
    };
    btn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
  }

  function showErrorPopup(message) {
    var overlay = document.createElement('div');
    overlay.className = 'leadcod-modal-overlay';
    overlay.innerHTML = '<div class="leadcod-modal-box">' +
      '<div class="leadcod-modal-icon-wrap error"><span aria-hidden="true">!</span></div>' +
      '<h3 class="leadcod-modal-title">حدث خطأ</h3>' +
      '<p class="leadcod-modal-message">' + (message || 'خطأ غير معروف').replace(/</g, '&lt;').replace(/"/g, '&quot;') + '</p>' +
      '<button type="button" class="leadcod-modal-btn" style="background: #dc2626; color: #fff;">موافق</button>' +
      '</div>';
    var btn = overlay.querySelector('.leadcod-modal-btn');
    var close = function() {
      overlay.style.animation = 'leadcod-fadeIn 0.15s ease reverse';
      setTimeout(function() { overlay.remove(); }, 150);
    };
    btn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
  }

  function renderForm(container, fields, settings, shippingSettings) {
    var Utils = window.LeadcodFormUtils;
    var Fields = window.LeadcodFormFields;

    var validatePhone = function(phone, field) {
      if (!phone) return null;
      var trimmed = phone.trim();
      var errorNumbersOnly = (field && field.phoneErrorNumbersOnly) ? field.phoneErrorNumbersOnly : 'يجب أن يحتوي رقم الهاتف على أرقام فقط';
      var errorInvalidPrefix = (field && field.phoneErrorInvalidPrefix) ? field.phoneErrorInvalidPrefix : 'يجب أن يبدأ رقم الهاتف بـ 05، 06، 07، 5، 6، أو 7';
      var errorWrongLength10 = (field && field.phoneErrorWrongLength10) ? field.phoneErrorWrongLength10 : 'يجب أن يكون رقم الهاتف 10 أرقام بالضبط عند البدء بـ 0';
      var errorWrongLength9 = (field && field.phoneErrorWrongLength9) ? field.phoneErrorWrongLength9 : 'يجب أن يكون رقم الهاتف 9 أرقام بالضبط عند البدء بـ 5، 6، أو 7';
      if (!/^\d+$/.test(trimmed)) return errorNumbersOnly;
      if (!/^(05|06|07|5|6|7)/.test(trimmed)) return errorInvalidPrefix;
      if (trimmed.startsWith('0')) {
        if (trimmed.length !== 10) return errorWrongLength10;
      } else {
        if (trimmed.length !== 9) return errorWrongLength9;
      }
      return null;
    };

    var buyButton = fields.find(function(f) { return f.type === 'buyButton'; });
    var buyButtonOrder = buyButton ? (buyButton.order || 11) : 11;
    var quantityField = fields.find(function(f) { return f.type === 'quantity' && f.visible; });
    var quantityFieldOrder = quantityField ? (quantityField.order || 10) : null;
    var hasStandaloneQuantityBeforeButton = quantityFieldOrder !== null && quantityFieldOrder < buyButtonOrder;

    var visibleFields = fields.filter(function(f) { return f.visible; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });

    var formHTML = '<form class="leadcod-form" style="max-width: 100%;">';

    if (settings) {
      var primaryColor = Utils.getPrimaryColor(settings);
      formHTML += '<div class="leadcod-form-header">';
      if (settings.headline && settings.headline.enabled) {
        var headlineText = settings.headline.text || 'أضف معلوماتك في الأسفل للطلب';
        var headlineAlign = Utils.getTextAlign(settings.headline.alignment || 'center');
        formHTML += '<h2 style="font-family: ' + Utils.getFontFamily(settings) + ' !important; font-size: ' + Utils.getGlobalFontSize(settings) + '; font-weight: ' + Utils.getGlobalFontWeight(settings) + '; font-style: ' + Utils.getGlobalFontStyle(settings) + '; text-align: ' + headlineAlign + '; color: ' + primaryColor + '; margin: 0 0 6px 0;">' + headlineText + '</h2>';
      }
      if (settings.subtitle && settings.subtitle.enabled) {
        var subtitleText = settings.subtitle.text || 'يرجى ملء النموذج أدناه';
        var subtitleAlign = Utils.getTextAlign(settings.subtitle.alignment || 'center');
        formHTML += '<p style="font-family: ' + Utils.getFontFamily(settings) + ' !important; font-size: ' + Utils.getGlobalFontSize(settings) + '; font-weight: ' + Utils.getGlobalFontWeight(settings) + '; font-style: ' + Utils.getGlobalFontStyle(settings) + '; text-align: ' + subtitleAlign + '; color: ' + primaryColor + '; opacity: 0.7; margin: 0 0 0 0;">' + subtitleText + '</p>';
      }
      formHTML += '</div>';
    }

    if (visibleFields.length === 0) {
      formHTML += '<div style="text-align: center; padding: 32px; color: #6b7280;">No visible fields</div>';
    } else {
      var currentGridGroup = [];
      var inGridSection = false;
      visibleFields.forEach(function(field) {
        var isFullWidth = field.type === 'summary' || field.type === 'buyButton' || field.type === 'whatsappButton' || field.type === 'shippingOption';
        if (isFullWidth) {
          if (inGridSection && currentGridGroup.length > 0) {
            currentGridGroup.forEach(function(gridField) {
              formHTML += Fields.renderField(gridField, settings, shippingSettings);
            });
            formHTML += '</div></div>';
            currentGridGroup = [];
            inGridSection = false;
          }
          if (field.type === 'buyButton' && hasStandaloneQuantityBeforeButton) {
            var fieldCopy = Object.assign({}, field, { showQuantity: false });
            formHTML += Fields.renderField(fieldCopy, settings, shippingSettings);
          } else if (field.type === 'shippingOption') {
            formHTML += '<div class="leadcod-form-section" style="display: none;">';
            formHTML += Fields.renderField(field, settings, shippingSettings);
            formHTML += '</div>';
          } else if (field.type === 'summary') {
            formHTML += '<div class="leadcod-form-section">';
            formHTML += Fields.renderField(field, settings, shippingSettings);
            formHTML += '</div>';
          } else {
            formHTML += Fields.renderField(field, settings, shippingSettings);
          }
        } else {
          if (!inGridSection) {
            formHTML += '<div class="leadcod-form-section"><div class="leadcod-fields-grid">';
            inGridSection = true;
          }
          currentGridGroup.push(field);
        }
      });
      if (inGridSection && currentGridGroup.length > 0) {
        currentGridGroup.forEach(function(gridField) {
          formHTML += Fields.renderField(gridField, settings, shippingSettings);
        });
        formHTML += '</div></div>';
      }
    }

    var allQuantityField = fields.find(function(f) { return f.type === 'quantity'; });
    if (allQuantityField && !allQuantityField.visible) {
      formHTML += '<input type="hidden" name="' + allQuantityField.id + '" value="1">';
    }

    formHTML += '</form>';
    container.innerHTML = formHTML;

    initializeQuantitySelector(container);
    initializePhoneValidation(container, validatePhone, fields);

    container._shippingSettings = shippingSettings;
    container._settings = settings;
    container._fields = fields;

    loadStatesAndCities(container, apiUrl);
    initializeSummary(container);

    var form = container.querySelector('.leadcod-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        var phoneInputs = container.querySelectorAll('.leadcod-phone-input');
        var hasPhoneError = false;
        phoneInputs.forEach(function(input) {
          var value = input.value;
          var fieldId = input.getAttribute('data-field-id');
          var phoneField = fields ? fields.find(function(f) { return f.id === fieldId && f.type === 'phone'; }) : null;
          var err = validatePhone(value, phoneField);
          if (err && value.length > 0) {
            hasPhoneError = true;
            var errorElement = container.querySelector('#error-' + fieldId);
            if (errorElement) {
              errorElement.textContent = err;
              errorElement.style.display = 'block';
            }
            input.style.borderColor = '#ef4444';
            input.style.borderWidth = '2px';
          }
        });
        if (hasPhoneError) return;

        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(v, k) { data[k] = v; });

        var provinceSelect = container.querySelector('.leadcod-province-select');
        var citySelect = container.querySelector('.leadcod-city-select');
        var provinceId = provinceSelect ? provinceSelect.value : '';
        var cityId = citySelect ? citySelect.value : '';

        var urlVariantId = new URLSearchParams(window.location.search).get('variant');
        var themeVariantInput = document.querySelector('input[name="id"]');
        var variantIdFromTheme = themeVariantInput ? themeVariantInput.value : null;
        var productOrVariantId = urlVariantId || variantIdFromTheme || defaultVariantId;
        var productData = variants.find(function(v) { return String(v.id) === String(productOrVariantId); }) || variants[0];
        if (!productData) {
          showErrorPopup('لم يتم العثور على المنتج. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
          return;
        }
        data.productId = productData.id;

        var shippingSection = container.querySelector('.leadcod-shipping-section');
        var selectedShippingOption = shippingSection ? shippingSection.querySelector('input[type="radio"]:checked') : null;
        var shippingType = selectedShippingOption ? selectedShippingOption.value : null;

        var submitButton = form.querySelector('button[type="submit"]');
        var originalButtonText = submitButton ? submitButton.innerHTML : '';
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = 'جاري المعالجة...';
        }

        var baseApiUrl = config.API_BASE_URL || apiUrl.replace('/form', '');
        var orderPayload = {
          shopUrl: shopUrl,
          name: data.name || '',
          phone: data.phone || '',
          cityId: cityId,
          provinceId: provinceId,
          productId: String(data.productId)
        };
        if (shippingType) orderPayload.shippingType = shippingType;

        fetch(baseApiUrl + '/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        })
          .then(function(response) { return response.json(); })
          .then(function(result) {
            if (result.success) {
              var quantityInput = form.querySelector('input[name="quantity"], input#field-quantity, .leadcod-quantity-selector input[type="number"]');
              var quantity = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;
              var shippingPrice = 0;
              if (shippingSection && selectedShippingOption) {
                var priceEl = shippingSection.querySelector(selectedShippingOption.value === 'cod' ? '.leadcod-shipping-price-cod' : '.leadcod-shipping-price-stopdesk');
                if (priceEl) shippingPrice = parseInt(priceEl.getAttribute('data-price'), 10) || 0;
              }
              var productPriceCents = (productData && productData.price) ? productData.price * quantity : 0;
              var productPriceDzd = productPriceCents / 100;
              var totalValue = productPriceDzd + shippingPrice;
              var currency = (Utils && Utils.getCurrency && settings) ? Utils.getCurrency(settings) : 'DZD';
              if (typeof window.LeadcodTrackPurchase === 'function') {
                window.LeadcodTrackPurchase(totalValue, currency, productData ? [String(productData.id)] : []);
              }
              var prod = container._product || {};
              var summaryField = container._fields ? container._fields.find(function(f) { return f.type === 'summary'; }) : null;
              var orderSummary = {
                productName: prod.title || productData.title || productData.name || '-',
                quantity: quantity,
                productPrice: Math.round(productPriceDzd),
                shippingPrice: shippingPrice,
                total: Math.round(totalValue),
                currency: currency,
                shippingLabel: summaryField && summaryField.shippingLabel ? summaryField.shippingLabel : 'الشحن',
                totalLabel: summaryField && summaryField.totalLabel ? summaryField.totalLabel : 'المجموع',
                freeShippingLabel: (container._shippingSettings && container._shippingSettings.freeShippingLabel) || 'مجاني',
                hasShipping: !!(shippingSection && selectedShippingOption)
              };
              form.reset();
              var primaryColor = (container._settings && window.LeadcodFormUtils && window.LeadcodFormUtils.getPrimaryColor) ? window.LeadcodFormUtils.getPrimaryColor(container._settings) : null;
              var thankYouPopup = (container._settings && container._settings.thankYouPopup) ? container._settings.thankYouPopup : null;
              showThankYouPopup(primaryColor, thankYouPopup, orderSummary);
            } else {
              showErrorPopup('خطأ في إنشاء الطلب: ' + (result.error || 'خطأ غير معروف'));
            }
          })
          .catch(function(error) {
            showErrorPopup('خطأ في إرسال الطلب: ' + error.message);
          })
          .finally(function() {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.innerHTML = originalButtonText;
            }
          });
      });
    }
  }

  function initializeQuantitySelector(container) {
    var quantitySelectors = container.querySelectorAll('.leadcod-quantity-selector');
    quantitySelectors.forEach(function(selector) {
      var decreaseBtn = selector.querySelector('[data-action="decrease"]');
      var increaseBtn = selector.querySelector('[data-action="increase"]');
      var quantityInput = selector.querySelector('input[type="number"]');
      if (decreaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
          var currentValue = parseInt(quantityInput.value) || 1;
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
      if (increaseBtn && quantityInput) {
        increaseBtn.addEventListener('click', function() {
          var currentValue = parseInt(quantityInput.value) || 1;
          quantityInput.value = currentValue + 1;
          quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
          quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    });
  }

  function initializePhoneValidation(container, validatePhone, fields) {
    var phoneInputs = container.querySelectorAll('.leadcod-phone-input');
    phoneInputs.forEach(function(input) {
      var fieldId = input.getAttribute('data-field-id');
      var errorElement = container.querySelector('#error-' + fieldId);
      var phoneField = fields ? fields.find(function(f) { return f.id === fieldId && f.type === 'phone'; }) : null;
      var restrictToNumbers = function() {
        var value = input.value;
        var numericValue = value.replace(/\D/g, '');
        var maxLength = 10;
        if (numericValue.length > 0 && !numericValue.startsWith('0')) maxLength = 9;
        var limitedValue = numericValue.slice(0, maxLength);
        input.setAttribute('maxlength', maxLength.toString());
        if (limitedValue !== value) input.value = limitedValue;
      };
      input.addEventListener('keydown', function(e) {
        var allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowedKeys.indexOf(e.key) === -1 && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
      });
      input.addEventListener('input', restrictToNumbers);
      var validateAndShowError = function() {
        var value = input.value;
        var err = validatePhone(value, phoneField);
        if (err && value.length > 0) {
          if (errorElement) { errorElement.textContent = err; errorElement.style.display = 'block'; }
          input.style.borderColor = '#ef4444';
          input.style.borderWidth = '2px';
        } else {
          if (errorElement) errorElement.style.display = 'none';
          input.style.borderColor = '#e5e7eb';
          input.style.borderWidth = '1px';
        }
      };
      input.addEventListener('change', validateAndShowError);
      input.addEventListener('blur', validateAndShowError);
    });
  }

  function initializeSummary(container) {
    var productOrVariantId = new URLSearchParams(window.location.search).get('variant') || defaultVariantId;
    var fields = container._fields;
    var settings = container._settings;
    var summaryField = fields ? fields.find(function(f) { return f.type === 'summary'; }) : null;
    var summaryPlaceholder = summaryField && summaryField.summaryPlaceholder ? summaryField.summaryPlaceholder : '-';
    var totalLabel = summaryField && summaryField.totalLabel ? summaryField.totalLabel : 'المجموع';
    var shippingLabel = summaryField && summaryField.shippingLabel ? summaryField.shippingLabel : 'سعر الشحن';
    var chooseProvinceHint = summaryField && summaryField.chooseProvinceHint ? summaryField.chooseProvinceHint : 'اختر الولاية';
    var selectShippingOptionHint = summaryField && summaryField.selectShippingOptionHint ? summaryField.selectShippingOptionHint : 'اختر خيار الشحن';
    var summaryAlignment = summaryField && summaryField.summaryAlignment ? summaryField.summaryAlignment : 'right';

    var cityField = fields ? fields.find(function(f) { return f.type === 'city'; }) : null;
    var provinceField = fields ? fields.find(function(f) { return f.type === 'province'; }) : null;
    var shippingOptionField = fields ? fields.find(function(f) { return f.type === 'shippingOption'; }) : null;
    var cityPlaceholder = cityField && cityField.showPlaceholder && cityField.placeholder ? cityField.placeholder : (cityField && cityField.label ? cityField.label : '-');
    var provincePlaceholder = provinceField && provinceField.showPlaceholder && provinceField.placeholder ? provinceField.placeholder : (provinceField && provinceField.label ? provinceField.label : '-');
    var shippingOptionLabel = shippingOptionField && shippingOptionField.label ? shippingOptionField.label : summaryPlaceholder;

    var currentVariant = variants.find(function(v) { return String(v.id) === String(productOrVariantId); }) || variants[0];
    var currentQuantity = 1;
    var shippingPrice = 0;
    var selectedShippingMethodLabel = '';
    var shippingType = '';

    container._product = product;

    var summaryContentEl = container.querySelector('.leadcod-summary-content');
    var summaryItems = container.querySelectorAll('.leadcod-summary-item');
    var summaryTotal = container.querySelector('.leadcod-summary-total');
    var productNameEl = container.querySelector('.leadcod-product-name');
    var productPriceEl = container.querySelector('.leadcod-product-price');
    var shippingLabelEl = container.querySelector('.leadcod-shipping-label');
    var shippingHintEl = container.querySelector('.leadcod-shipping-hint');
    var shippingHintTextEl = container.querySelector('.leadcod-shipping-hint-text');
    var shippingPriceEl = container.querySelector('.leadcod-shipping-price');
    var totalLabelEl = container.querySelector('.leadcod-summary-total-label');
    var totalPriceEl = container.querySelector('.leadcod-total-price');

    if (summaryContentEl) summaryContentEl.style.textAlign = summaryAlignment;
    summaryItems.forEach(function(item) { item.style.textAlign = summaryAlignment; });
    if (summaryTotal) summaryTotal.style.textAlign = summaryAlignment;
    if (totalLabelEl) totalLabelEl.textContent = totalLabel;

    function formatPrice(price) {
      var s = container._settings;
      var U = window.LeadcodFormUtils;
      var currency = U.getCurrency(s) || 'DZD';
      return (price / 100).toFixed(0) + ' ' + currency;
    }

    function updateSummary() {
      if (productNameEl && currentVariant) {
        productNameEl.textContent = product.title || currentVariant.title || summaryPlaceholder;
      } else if (productNameEl) {
        productNameEl.textContent = summaryPlaceholder;
      }
      if (productPriceEl && currentVariant) {
        var price = currentVariant.price || 0;
        productPriceEl.textContent = formatPrice(price) + ' x' + currentQuantity;
      } else if (productPriceEl) {
        productPriceEl.textContent = summaryPlaceholder;
      }

      var provinceSelect = container.querySelector('.leadcod-province-select');
      var citySelect = container.querySelector('.leadcod-city-select');
      var shippingSection = container.querySelector('.leadcod-shipping-section');
      var selectedShippingOption = shippingSection ? shippingSection.querySelector('input[type="radio"]:checked') : null;

      if (!provinceSelect || !provinceSelect.value) {
        if (productNameEl && currentVariant) productNameEl.textContent = product.title || currentVariant.title || summaryPlaceholder;
        else if (productNameEl) productNameEl.textContent = summaryPlaceholder;
        if (productPriceEl && currentVariant) productPriceEl.textContent = formatPrice(currentVariant.price || 0) + ' x' + currentQuantity;
        else if (productPriceEl) productPriceEl.textContent = summaryPlaceholder;
        if (shippingLabelEl) shippingLabelEl.textContent = shippingLabel;
        if (shippingHintEl) shippingHintEl.style.display = 'flex';
        if (shippingHintTextEl) shippingHintTextEl.textContent = chooseProvinceHint;
        if (shippingPriceEl) shippingPriceEl.textContent = summaryPlaceholder;
        if (totalPriceEl && currentVariant) {
          var productPriceInCents = (currentVariant.price || 0) * currentQuantity;
          var productPriceInDZD = productPriceInCents / 100;
          var U = window.LeadcodFormUtils;
          var currency = U.getCurrency(container._settings) || 'DZD';
          totalPriceEl.textContent = productPriceInDZD.toFixed(0) + ' ' + currency;
        } else if (totalPriceEl) totalPriceEl.textContent = summaryPlaceholder;
        shippingPrice = 0;
        selectedShippingMethodLabel = '';
        shippingType = '';
      } else if (!selectedShippingOption) {
        if (productNameEl && currentVariant) productNameEl.textContent = product.title || currentVariant.title || summaryPlaceholder;
        if (productPriceEl && currentVariant) productPriceEl.textContent = formatPrice(currentVariant.price || 0) + ' x' + currentQuantity;
        if (shippingLabelEl) shippingLabelEl.textContent = shippingLabel;
        if (shippingHintEl) shippingHintEl.style.display = 'flex';
        if (shippingHintTextEl) shippingHintTextEl.textContent = selectShippingOptionHint;
        if (shippingPriceEl) shippingPriceEl.textContent = summaryPlaceholder;
        if (totalPriceEl && currentVariant) {
          var productPriceInCents = (currentVariant.price || 0) * currentQuantity;
          var productPriceInDZD = productPriceInCents / 100;
          var U = window.LeadcodFormUtils;
          var currency = U.getCurrency(container._settings) || 'DZD';
          totalPriceEl.textContent = productPriceInDZD.toFixed(0) + ' ' + currency;
        }
        shippingPrice = 0;
        selectedShippingMethodLabel = '';
        shippingType = '';
      } else {
        shippingType = selectedShippingOption.value;
        var priceSelector = shippingType === 'cod' ? '.leadcod-shipping-price-cod' : '.leadcod-shipping-price-stopdesk';
        var priceElement = shippingSection.querySelector(priceSelector);
        if (priceElement) {
          var priceAttr = priceElement.getAttribute('data-price');
          if (priceAttr !== null) shippingPrice = parseInt(priceAttr, 10);
          var labelSpan = selectedShippingOption.closest('label') ? selectedShippingOption.closest('label').querySelector('div span') : null;
          if (labelSpan) selectedShippingMethodLabel = labelSpan.textContent.trim();
        }
        if (shippingLabelEl) shippingLabelEl.textContent = shippingLabel;
        if (shippingHintEl) shippingHintEl.style.display = 'none';
        if (shippingPriceEl) {
          var shippingSettings = container._shippingSettings;
          var U = window.LeadcodFormUtils;
          var freeShippingLabel = shippingSettings && shippingSettings.freeShippingLabel ? shippingSettings.freeShippingLabel : 'مجاني';
          var currency = U.getCurrency(container._settings) || 'DZD';
          shippingPriceEl.textContent = shippingPrice > 0 ? shippingPrice + ' ' + currency : freeShippingLabel;
        }
      }

      if (totalPriceEl && currentVariant) {
        var productPriceInCents = (currentVariant.price || 0) * currentQuantity;
        var productPriceInDZD = productPriceInCents / 100;
        var total = productPriceInDZD + shippingPrice;
        var U = window.LeadcodFormUtils;
        var currency = U.getCurrency(container._settings) || 'DZD';
        totalPriceEl.textContent = total.toFixed(0) + ' ' + currency;
      }
    }

    var variantSelect = container.querySelector('select[name*="variant"], select.leadcod-variant-select');
    if (variantSelect) {
      variantSelect.addEventListener('change', function() {
        var selectedVariantId = this.value;
        currentVariant = variants.find(function(v) { return String(v.id) === String(selectedVariantId); }) || currentVariant;
        updateSummary();
      });
    }

    function checkVariantFromURL() {
      var urlVariantId = new URLSearchParams(window.location.search).get('variant');
      if (urlVariantId) {
        var urlVariant = variants.find(function(v) { return String(v.id) === String(urlVariantId); });
        if (urlVariant) {
          currentVariant = urlVariant;
          updateSummary();
        }
      }
    }
    checkVariantFromURL();
    window.addEventListener('popstate', checkVariantFromURL);

    var lastVariantId = productOrVariantId;
    setInterval(function() {
      var currentVariantId = new URLSearchParams(window.location.search).get('variant') || defaultVariantId;
      if (String(currentVariantId) !== String(lastVariantId)) {
        lastVariantId = currentVariantId;
        var urlVariant = variants.find(function(v) { return String(v.id) === String(currentVariantId); });
        if (urlVariant) {
          currentVariant = urlVariant;
          updateSummary();
        }
      }
    }, 500);

    var quantityInput = container.querySelector('input[name="quantity"], input#field-quantity');
    if (quantityInput) {
      quantityInput.addEventListener('change', function() {
        currentQuantity = parseInt(this.value) || 1;
        updateSummary();
      });
      quantityInput.addEventListener('input', function() {
        currentQuantity = parseInt(this.value) || 1;
        updateSummary();
      });
    }

    var shippingSection = container.querySelector('.leadcod-shipping-section');
    if (shippingSection) {
      var shippingRadios = shippingSection.querySelectorAll('input[type="radio"]');
      shippingRadios.forEach(function(radio) {
        radio.addEventListener('change', function() { updateSummary(); });
      });
    }

    var provinceSelect = container.querySelector('.leadcod-province-select');
    var citySelect = container.querySelector('.leadcod-city-select');
    if (provinceSelect) {
      provinceSelect.addEventListener('change', function() { setTimeout(updateSummary, 100); });
    }
    if (citySelect) {
      citySelect.addEventListener('change', function() { setTimeout(updateSummary, 100); });
    }

    container._updateSummary = updateSummary;
    updateSummary();
  }

  function loadStatesAndCities(container, apiUrl) {
    var config = window.LEADCOD_CONFIG || {};
    var baseApiUrl = config.API_BASE_URL || (config.getApiUrl ? config.getApiUrl('') : apiUrl.replace('/form', ''));
    var provinceSelect = container.querySelector('.leadcod-province-select');
    var cityField = container.querySelector('.leadcod-city-select');
    var shippingSection = container.querySelector('.leadcod-shipping-section');
    var shippingFormSection = shippingSection ? shippingSection.closest('.leadcod-form-section') : null;

    if (!provinceSelect) return;

    var fields = container._fields;
    var cityFieldConfig = fields ? fields.find(function(f) { return f.type === 'city'; }) : null;
    var provinceFieldConfig = fields ? fields.find(function(f) { return f.type === 'province'; }) : null;
    var cityPlaceholder = cityFieldConfig && cityFieldConfig.showPlaceholder && cityFieldConfig.placeholder ? cityFieldConfig.placeholder : (cityFieldConfig && cityFieldConfig.label ? cityFieldConfig.label : '-');
    var citySelectProvinceFirstHint = cityFieldConfig && cityFieldConfig.selectProvinceFirstHint ? cityFieldConfig.selectProvinceFirstHint : 'اختر الولاية أولاً';
    var provincePlaceholder = provinceFieldConfig && provinceFieldConfig.showPlaceholder && provinceFieldConfig.placeholder ? provinceFieldConfig.placeholder : (provinceFieldConfig && provinceFieldConfig.label ? provinceFieldConfig.label : '-');

    var isInitialRender = true;

    function updateShippingSectionVisibility() {
      if (!shippingSection) return;
      var shouldShow = provinceSelect.value;
      if (shouldShow) {
        if (shippingFormSection) shippingFormSection.style.display = 'block';
        shippingSection.style.display = 'block';
        if (isInitialRender) {
          shippingSection.style.opacity = '0';
          shippingSection.style.transform = 'translateY(-10px)';
          shippingSection.style.maxHeight = '0';
          shippingSection.style.marginBottom = '0';
          void shippingSection.offsetWidth;
          shippingSection.classList.remove('show');
          void shippingSection.offsetWidth;
          shippingSection.classList.add('show');
          isInitialRender = false;
        } else {
          shippingSection.style.opacity = '1';
          shippingSection.style.transform = 'translateY(0)';
          shippingSection.style.maxHeight = '';
          shippingSection.style.marginBottom = '';
          shippingSection.classList.add('show');
        }
      } else {
        shippingSection.classList.remove('show');
        if (shippingFormSection) shippingFormSection.style.display = 'none';
        setTimeout(function() {
          if (!shippingSection.classList.contains('show')) {
            shippingSection.style.display = 'none';
            shippingSection.style.opacity = '';
            shippingSection.style.transform = '';
            shippingSection.style.maxHeight = '';
            shippingSection.style.marginBottom = '';
          }
        }, 400);
      }
    }

    function removeLoaders() {
      if (shippingSection) shippingSection.querySelectorAll('.leadcod-price-loader').forEach(function(loader) { loader.remove(); });
    }

    function createLoader(className) {
      var loader = document.createElement('span');
      loader.className = 'leadcod-price-loader ' + className;
      loader.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-left: 4px;"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="8 4" opacity="0.6"><animateTransform attributeName="transform" type="rotate" from="0 6 6" to="360 6 6" dur="0.8s" repeatCount="indefinite"/></circle></svg>';
      loader.style.cssText = 'display: inline-block; vertical-align: middle; margin-left: 4px; color: #6b7280;';
      return loader;
    }

    function updateShippingPrices(stateId, showLoader) {
      if (!shippingSection || !stateId) return;

      var codPriceElement = shippingSection.querySelector('.leadcod-shipping-price-cod');
      var stopDeskPriceElement = shippingSection.querySelector('.leadcod-shipping-price-stopdesk');

      removeLoaders();

      var shippingSettings = container._shippingSettings;
      var settings = container._settings;
      var Utils = window.LeadcodFormUtils;

      if (shippingSettings && shippingSettings.method === 'free') {
        var freeShippingLabel = shippingSettings.freeShippingLabel || 'مجاني';
        var currency = Utils.getCurrency(settings) || 'DZD';
        function updatePriceElement(element, price) {
          if (!element) return;
          if (price !== null && price !== undefined && price !== 0) {
            element.textContent = price + ' ' + currency;
            element.setAttribute('data-price', price.toString());
          } else {
            element.textContent = freeShippingLabel;
            element.setAttribute('data-price', '0');
          }
        }
        updatePriceElement(codPriceElement, 0);
        updatePriceElement(stopDeskPriceElement, 0);
        if (container._updateSummary) setTimeout(function() { container._updateSummary(); }, 100);
        return;
      }

      if (showLoader) {
        if (codPriceElement) codPriceElement.appendChild(createLoader('leadcod-price-loader-cod'));
        if (stopDeskPriceElement) stopDeskPriceElement.appendChild(createLoader('leadcod-price-loader-stopdesk'));
      }

      function updatePriceElement(el, price) {
        if (!el) return;
        var ss = container._shippingSettings;
        var s = container._settings;
        var U = window.LeadcodFormUtils;
        var freeLabel = ss && ss.freeShippingLabel ? ss.freeShippingLabel : 'مجاني';
        var curr = U.getCurrency(s) || 'DZD';
        if (price !== null && price !== undefined) {
          el.textContent = price + ' ' + curr;
          el.setAttribute('data-price', price.toString());
        } else {
          el.textContent = freeLabel;
          el.setAttribute('data-price', '0');
        }
      }

      function setErrorPrice(el) {
        if (el) {
          el.textContent = '-';
          el.setAttribute('data-price', '0');
        }
      }

      fetch(baseApiUrl + '/shipping-fees?shopUrl=' + encodeURIComponent(shopUrl) + '&stateId=' + encodeURIComponent(stateId))
        .then(function(r) { return r.json(); })
        .then(function(result) {
          removeLoaders();
          if (result.success && result.data) {
            updatePriceElement(codPriceElement, result.data.cashOnDelivery);
            updatePriceElement(stopDeskPriceElement, result.data.stopDesk);
          } else {
            setErrorPrice(codPriceElement);
            setErrorPrice(stopDeskPriceElement);
          }
          if (container._updateSummary) setTimeout(function() { container._updateSummary(); }, 100);
        })
        .catch(function() {
          removeLoaders();
          setErrorPrice(codPriceElement);
          setErrorPrice(stopDeskPriceElement);
          if (container._updateSummary) setTimeout(function() { container._updateSummary(); }, 100);
        });
    }

    function setFieldState(field, disabled, placeholder, isCityField) {
      field.disabled = disabled;
      field.style.opacity = disabled ? '0.6' : '1';
      field.style.cursor = disabled ? 'not-allowed' : 'pointer';
      field.style.backgroundColor = disabled ? '#f9fafb' : '';
      if (disabled && placeholder) {
        var displayPlaceholder = (isCityField && disabled && citySelectProvinceFirstHint) ? citySelectProvinceFirstHint : placeholder;
        field.innerHTML = '<option value="">' + displayPlaceholder + '</option>';
      }
    }

    fetch(baseApiUrl + '/states')
      .then(function(r) { return r.json(); })
      .then(function(result) {
        if (result.success && result.data) {
          provinceSelect.innerHTML = '<option value="">' + provincePlaceholder + '</option>';
          result.data.forEach(function(state) {
            var option = document.createElement('option');
            option.value = state.id;
            option.textContent = state.name + ' - ' + state.nameAr + ' (' + state.code + ')';
            option.setAttribute('data-name', state.name);
            provinceSelect.appendChild(option);
          });
          setFieldState(provinceSelect, false);

          provinceSelect.addEventListener('change', function() {
            var selectedStateId = this.value;
            if (cityField) {
              cityField.value = '';
              if (selectedStateId) {
                setFieldState(cityField, true, cityPlaceholder, true);
                updateShippingPrices(selectedStateId, true);
                fetch(baseApiUrl + '/cities?stateId=' + selectedStateId)
                  .then(function(r) { return r.json(); })
                  .then(function(result) {
                    if (result.success && result.data) {
                      cityField.innerHTML = '<option value="">' + cityPlaceholder + '</option>';
                      result.data.forEach(function(city) {
                        var opt = document.createElement('option');
                        opt.value = city.id;
                        opt.textContent = city.name + ' - ' + city.nameAr;
                        opt.setAttribute('data-name', city.name);
                        cityField.appendChild(opt);
                      });
                      setFieldState(cityField, false, cityPlaceholder, true);
                    } else {
                      cityField.innerHTML = '<option value="">' + cityPlaceholder + '</option>';
                      cityField.style.opacity = '0.6';
                    }
                    updateShippingSectionVisibility();
                  })
                  .catch(function() {
                    cityField.innerHTML = '<option value="">' + cityPlaceholder + '</option>';
                    cityField.style.opacity = '0.6';
                    updateShippingSectionVisibility();
                  });
              } else {
                setFieldState(cityField, true, cityPlaceholder, true);
                updateShippingSectionVisibility();
              }
            } else {
              updateShippingSectionVisibility();
            }
          });

          if (cityField) cityField.addEventListener('change', updateShippingSectionVisibility);
          updateShippingSectionVisibility();
        } else {
          provinceSelect.innerHTML = '<option value="">' + provincePlaceholder + '</option>';
        }
      })
      .catch(function() {
        provinceSelect.innerHTML = '<option value="">' + provincePlaceholder + '</option>';
      });
  }
})();

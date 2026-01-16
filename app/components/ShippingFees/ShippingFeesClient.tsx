'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProvinces, getShippingSettings, saveShippingSettings } from '@/app/actions/shipping';
import { useAppBridge } from '@shopify/app-bridge-react';
import { FullPageLoader } from '@/components/ui/loader';

interface ShippingFeesClientProps {
  shopUrl: string;
}

interface Province {
  id: string;
  code: string;
  name: string;
  nameAr: string;
}

interface ProvinceFees {
  cashOnDelivery: string;
  stopDesk: string;
}

export default function ShippingFeesClient({ shopUrl }: ShippingFeesClientProps) {
  const t = useTranslations('shippingFees');
  const shopify = useAppBridge();
  const [stopDeskEnabled, setStopDeskEnabled] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceFees, setProvinceFees] = useState<Record<string, ProvinceFees>>({});
  const [loading, setLoading] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [allCOD, setAllCOD] = useState<string>('');
  const [allStopDesk, setAllStopDesk] = useState<string>('');
  const [codLabel, setCodLabel] = useState<string>(t('cashOnDelivery'));
  const [stopDeskLabel, setStopDeskLabel] = useState<string>(t('stopDesk'));
  const [freeShippingLabel, setFreeShippingLabel] = useState<string>('مجاني');

  // Track last saved state
  const lastSavedStopDeskEnabledRef = useRef(false);
  const lastSavedFeesRef = useRef<Record<string, ProvinceFees>>({});
  const lastSavedCodLabelRef = useRef<string>('الدفع عند الاستلام');
  const lastSavedStopDeskLabelRef = useRef<string>('Stop Desk');
  const lastSavedFreeShippingLabelRef = useRef<string>('مجاني');

  useEffect(() => {
    async function fetchData() {
      const [provincesResult, settingsResult] = await Promise.all([
        getProvinces(),
        getShippingSettings(shopUrl)
      ]);

      if (provincesResult.success && provincesResult.data) {
        setProvinces(provincesResult.data);
        
        // Initialize fees for all provinces with 0 by default
        const initialFees: Record<string, ProvinceFees> = {};
        provincesResult.data.forEach((province) => {
          initialFees[province.id] = {
            cashOnDelivery: '0',
            stopDesk: '0'
          };
        });

        // Load saved settings if available
        if (settingsResult.success && settingsResult.data) {
          setStopDeskEnabled(settingsResult.data.stopDeskEnabled);
          setCodLabel(settingsResult.data.codLabel || t('cashOnDelivery'));
          setStopDeskLabel(settingsResult.data.stopDeskLabel || t('stopDesk'));
          setFreeShippingLabel(settingsResult.data.freeShippingLabel || 'مجاني');
          
          // Merge saved fees with initial fees (use saved values if available, otherwise keep 0)
          Object.keys(initialFees).forEach(stateId => {
            if (settingsResult.data.fees[stateId]) {
              const savedFee = settingsResult.data.fees[stateId];
              initialFees[stateId] = {
                cashOnDelivery: savedFee.cashOnDelivery || '0',
                stopDesk: savedFee.stopDesk || '0'
              };
            }
          });

          // Update refs with loaded data
          lastSavedStopDeskEnabledRef.current = settingsResult.data.stopDeskEnabled;
          lastSavedCodLabelRef.current = settingsResult.data.codLabel || t('cashOnDelivery');
          lastSavedStopDeskLabelRef.current = settingsResult.data.stopDeskLabel || t('stopDesk');
          lastSavedFreeShippingLabelRef.current = settingsResult.data.freeShippingLabel || 'مجاني';
          lastSavedFeesRef.current = JSON.parse(JSON.stringify(initialFees));
        } else {
          // No saved data, use defaults (all 0)
          lastSavedStopDeskEnabledRef.current = false;
          lastSavedCodLabelRef.current = t('cashOnDelivery');
          lastSavedStopDeskLabelRef.current = t('stopDesk');
          lastSavedFreeShippingLabelRef.current = 'مجاني';
          lastSavedFeesRef.current = JSON.parse(JSON.stringify(initialFees));
        }

        setProvinceFees(initialFees);
      }
      setLoading(false);
    }
    fetchData();
  }, [shopUrl]);

  const showSaveBar = () => {
    shopify.saveBar.show('shipping-fees-save-bar');
  };

  const handleStopDeskToggle = (enabled: boolean) => {
    setStopDeskEnabled(enabled);
    showSaveBar();
  };

  const handleCodLabelChange = (value: string) => {
    setCodLabel(value);
    showSaveBar();
  };

  const handleStopDeskLabelChange = (value: string) => {
    setStopDeskLabel(value);
    showSaveBar();
  };

  const handleFreeShippingLabelChange = (value: string) => {
    setFreeShippingLabel(value);
    showSaveBar();
  };

  const handleFeeChange = (provinceId: string, field: 'cashOnDelivery' | 'stopDesk', value: string) => {
    // Remove all non-numeric characters (only integers allowed)
    const numericValue = value.replace(/[^\d]/g, '');
    
    setProvinceFees(prev => ({
      ...prev,
      [provinceId]: {
        ...prev[provinceId],
        [field]: numericValue
      }
    }));
    showSaveBar();
  };

  const handleAllCODChange = (value: string) => {
    // Remove all non-numeric characters (only integers allowed)
    const numericValue = value.replace(/[^\d]/g, '');
    
    setAllCOD(numericValue);
    
    // Update all provinces with the same COD value
    setProvinceFees(prev => {
      const updated: Record<string, ProvinceFees> = {};
      Object.keys(prev).forEach(provinceId => {
        updated[provinceId] = {
          ...prev[provinceId],
          cashOnDelivery: numericValue
        };
      });
      return updated;
    });
    showSaveBar();
  };

  const handleAllStopDeskChange = (value: string) => {
    // Remove all non-numeric characters (only integers allowed)
    const numericValue = value.replace(/[^\d]/g, '');
    
    setAllStopDesk(numericValue);
    
    // Update all provinces with the same Stop Desk value
    setProvinceFees(prev => {
      const updated: Record<string, ProvinceFees> = {};
      Object.keys(prev).forEach(provinceId => {
        updated[provinceId] = {
          ...prev[provinceId],
          stopDesk: numericValue
        };
      });
      return updated;
    });
    showSaveBar();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    shopify.saveBar.hide('shipping-fees-save-bar');

    try {
      // Always use 'per-province' method
      const result = await saveShippingSettings(shopUrl, 'per-province', stopDeskEnabled, provinceFees, codLabel, stopDeskLabel, freeShippingLabel);
      
      if (result.success) {
        lastSavedStopDeskEnabledRef.current = stopDeskEnabled;
        lastSavedCodLabelRef.current = codLabel;
        lastSavedStopDeskLabelRef.current = stopDeskLabel;
        lastSavedFreeShippingLabelRef.current = freeShippingLabel;
        lastSavedFeesRef.current = JSON.parse(JSON.stringify(provinceFees));
        shopify.toast.show(t('shippingSettingsSaved'));
      } else {
        shopify.toast.show(result.error || t('shippingSettingsSaveFailed'), { isError: true });
      }
    } catch (error) {
      shopify.toast.show(t('shippingSettingsSaveError'), { isError: true });
    }
  };

  const handleDiscard = () => {
    setStopDeskEnabled(lastSavedStopDeskEnabledRef.current);
    setCodLabel(lastSavedCodLabelRef.current);
    setStopDeskLabel(lastSavedStopDeskLabelRef.current);
    setFreeShippingLabel(lastSavedFreeShippingLabelRef.current);
    setProvinceFees(JSON.parse(JSON.stringify(lastSavedFeesRef.current)));
    // Reset "all" inputs
    setAllCOD('');
    setAllStopDesk('');
    shopify.saveBar.hide('shipping-fees-save-bar');
  };

  const formatCurrencyDisplay = (value: string, inputId: string) => {
    if (!value) return '';
    // Show raw value while focused for easier editing
    if (focusedInput === inputId) {
      return value;
    }
    // Format with commas when not focused (integers only)
    const numValue = parseInt(value.replace(/[^\d]/g, ''), 10);
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('en-US');
  };

  if (loading) {
    return <FullPageLoader message="Loading shipping fees..." />;
  }

  return (
    <form>
      <ui-save-bar id="shipping-fees-save-bar">
        <button variant="primary" id="save-button" onClick={handleSave}>{t('save')}</button>
        <button type="button" onClick={handleDiscard} id="discard-button">{t('discard')}</button>
      </ui-save-bar>

      <s-box padding="large">
        <s-stack gap="large">
          <s-box
            padding="base"
            background="base"
            border="base"
            borderRadius="base"
          >
            <s-stack gap="large">
              <s-box>
                <s-text >{t('provinceShippingFees')}</s-text>
                <s-text>
                  {t('provinceShippingFeesDescription')}
                </s-text>
              </s-box>

              <s-box>
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                  <s-text>{t('enableStopDesk')}</s-text>
                  <s-switch
                    checked={stopDeskEnabled}
                    onInput={(e: any) => handleStopDeskToggle(e.target?.checked ?? e.detail?.checked ?? !stopDeskEnabled)}
                  />
                </s-stack>
              </s-box>

              <s-box
                padding="base"
                background="subdued"
                border="base"
                borderRadius="base"
              >
                <s-stack gap="base">
                  <s-text>{t('shippingMethodLabels')}</s-text>
                  <s-text>
                    {t('shippingMethodLabelsDescription')}
                  </s-text>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cod-label">
                        {t('cashOnDeliveryLabel')}
                      </Label>
                      <Input
                        id="cod-label"
                        type="text"
                        value={codLabel}
                        onChange={(e) => handleCodLabelChange(e.target.value)}
                        placeholder={t('cashOnDelivery')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stopdesk-label">
                        {t('stopDeskLabel')}
                      </Label>
                      <Input
                        id="stopdesk-label"
                        type="text"
                        value={stopDeskLabel}
                        onChange={(e) => handleStopDeskLabelChange(e.target.value)}
                        placeholder={t('stopDesk')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeshipping-label">
                        {t('freeShippingText')}
                      </Label>
                      <Input
                        id="freeshipping-label"
                        type="text"
                        value={freeShippingLabel}
                        onChange={(e) => handleFreeShippingLabelChange(e.target.value)}
                        placeholder="مجاني"
                      />
                    </div>
                  </div>
                </s-stack>
              </s-box>

              <s-box
                padding="base"
                background="subdued"
                border="base"
                borderRadius="base"
              >
                <s-stack gap="base">
                  <s-text>{t('applyToAllProvinces')}</s-text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="all-cod">
                        {t('allCashOnDelivery', { label: codLabel })}
                      </Label>
                      <div className="relative">
                        <Input
                          id="all-cod"
                          type="text"
                          value={formatCurrencyDisplay(allCOD, 'all-cod')}
                          onChange={(e) => handleAllCODChange(e.target.value)}
                          onFocus={() => setFocusedInput('all-cod')}
                          onBlur={() => setFocusedInput(null)}
                          placeholder="0"
                          className="pl-12"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                          DZD
                        </span>
                      </div>
                    </div>
                    {stopDeskEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="all-stopdesk">
                          {t('allStopDesk', { label: stopDeskLabel })}
                        </Label>
                        <div className="relative">
                          <Input
                            id="all-stopdesk"
                            type="text"
                            value={formatCurrencyDisplay(allStopDesk, 'all-stopdesk')}
                            onChange={(e) => handleAllStopDeskChange(e.target.value)}
                            onFocus={() => setFocusedInput('all-stopdesk')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="0"
                            className="pl-12"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                            DZD
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </s-stack>
              </s-box>

              {loading ? (
                <s-text>{t('loadingProvinces')}</s-text>
              ) : (
                <div className="space-y-4">
                  {provinces.map((province) => (
                    <s-box
                      key={province.id}
                      padding="base"
                      background="subdued"
                      border="base"
                      borderRadius="base"
                    >
                      <s-stack gap="base">
                        <s-text>{province.name}</s-text>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`cash-${province.id}`}>
                              {codLabel} (DZD)
                            </Label>
                            <div className="relative">
                              <Input
                                id={`cash-${province.id}`}
                                type="text"
                                value={formatCurrencyDisplay(provinceFees[province.id]?.cashOnDelivery || '0', `cash-${province.id}`)}
                                onChange={(e) => handleFeeChange(province.id, 'cashOnDelivery', e.target.value)}
                                onFocus={() => setFocusedInput(`cash-${province.id}`)}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="0"
                                className="pl-12"
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                                DZD
                              </span>
                            </div>
                          </div>
                          {stopDeskEnabled && (
                            <div className="space-y-2">
                              <Label htmlFor={`stopdesk-${province.id}`}>
                                {stopDeskLabel} (DZD)
                              </Label>
                              <div className="relative">
                                <Input
                                  id={`stopdesk-${province.id}`}
                                  type="text"
                                  value={formatCurrencyDisplay(provinceFees[province.id]?.stopDesk || '0', `stopdesk-${province.id}`)}
                                  onChange={(e) => handleFeeChange(province.id, 'stopDesk', e.target.value)}
                                  onFocus={() => setFocusedInput(`stopdesk-${province.id}`)}
                                  onBlur={() => setFocusedInput(null)}
                                  placeholder="0"
                                  className="pl-12"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                                  DZD
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </s-stack>
                    </s-box>
                  ))}
                </div>
              )}
            </s-stack>
          </s-box>
        </s-stack>
      </s-box>
    </form>
  );
}


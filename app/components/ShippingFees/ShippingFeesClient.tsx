'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getProvinces, getShippingSettings, saveShippingSettings } from '@/app/actions/shipping';
import { useAppBridge } from '@shopify/app-bridge-react';

interface ShippingFeesClientProps {
  shopUrl: string;
}

type ShippingMethod = 'free' | 'per-province';

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
  const shopify = useAppBridge();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('free');
  const [stopDeskEnabled, setStopDeskEnabled] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceFees, setProvinceFees] = useState<Record<string, ProvinceFees>>({});
  const [loading, setLoading] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [allCOD, setAllCOD] = useState<string>('');
  const [allStopDesk, setAllStopDesk] = useState<string>('');

  // Track last saved state
  const lastSavedMethodRef = useRef<ShippingMethod>('free');
  const lastSavedStopDeskEnabledRef = useRef(false);
  const lastSavedFeesRef = useRef<Record<string, ProvinceFees>>({});

  useEffect(() => {
    async function fetchData() {
      const [provincesResult, settingsResult] = await Promise.all([
        getProvinces(),
        getShippingSettings(shopUrl)
      ]);

      if (provincesResult.success && provincesResult.data) {
        setProvinces(provincesResult.data);
        
        // Initialize fees for all provinces
        const initialFees: Record<string, ProvinceFees> = {};
        provincesResult.data.forEach((province) => {
          initialFees[province.id] = {
            cashOnDelivery: '',
            stopDesk: ''
          };
        });

        // Load saved settings if available
        if (settingsResult.success && settingsResult.data) {
          setShippingMethod(settingsResult.data.method as ShippingMethod);
          setStopDeskEnabled(settingsResult.data.stopDeskEnabled);
          
          // Merge saved fees with initial fees
          Object.keys(initialFees).forEach(stateId => {
            if (settingsResult.data.fees[stateId]) {
              initialFees[stateId] = settingsResult.data.fees[stateId];
            }
          });

          // Update refs with loaded data
          lastSavedMethodRef.current = settingsResult.data.method as ShippingMethod;
          lastSavedStopDeskEnabledRef.current = settingsResult.data.stopDeskEnabled;
          lastSavedFeesRef.current = JSON.parse(JSON.stringify(initialFees));
        } else {
          // No saved data, use defaults
          lastSavedMethodRef.current = 'free';
          lastSavedStopDeskEnabledRef.current = false;
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

  const handleMethodChange = (method: ShippingMethod) => {
    setShippingMethod(method);
    showSaveBar();
  };

  const handleStopDeskToggle = (enabled: boolean) => {
    setStopDeskEnabled(enabled);
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
      const result = await saveShippingSettings(shopUrl, shippingMethod, stopDeskEnabled, provinceFees);
      
      if (result.success) {
        lastSavedMethodRef.current = shippingMethod;
        lastSavedStopDeskEnabledRef.current = stopDeskEnabled;
        lastSavedFeesRef.current = JSON.parse(JSON.stringify(provinceFees));
        shopify.toast.show('Shipping settings saved successfully!');
      } else {
        shopify.toast.show(result.error || 'Failed to save shipping settings', { isError: true });
      }
    } catch (error) {
      shopify.toast.show('An error occurred while saving', { isError: true });
    }
  };

  const handleDiscard = () => {
    setShippingMethod(lastSavedMethodRef.current);
    setStopDeskEnabled(lastSavedStopDeskEnabledRef.current);
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

  return (
    <form>
      <ui-save-bar id="shipping-fees-save-bar">
        <button variant="primary" id="save-button" onClick={handleSave}>Save</button>
        <button type="button" onClick={handleDiscard} id="discard-button">Discard</button>
      </ui-save-bar>

      <s-box padding="large">
        <s-stack gap="large">
          <s-box>
            <s-text variant="headingMd" as="h2">Shipping Method</s-text>
            <s-text variant="bodyMd" tone="subdued">
              Choose how shipping fees are calculated for your orders
            </s-text>
          </s-box>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                shippingMethod === 'free' && "ring-2 ring-primary"
              )}
              onClick={() => handleMethodChange('free')}
            >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Free shipping</CardTitle>
                {shippingMethod === 'free' && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All orders will have free shipping regardless of location
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              shippingMethod === 'per-province' && "ring-2 ring-primary"
            )}
            onClick={() => handleMethodChange('per-province')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipping Per province</CardTitle>
                {shippingMethod === 'per-province' && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set different shipping fees for each province
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {shippingMethod === 'per-province' && (
          <s-box
            padding="base"
            background="base"
            border="base"
            borderRadius="base"
          >
            <s-stack gap="large">
              <s-box>
                <s-text variant="headingSm" as="h3">Province Shipping Fees</s-text>
                <s-text variant="bodyMd" tone="subdued">
                  Configure shipping fees for each province
                </s-text>
              </s-box>

              <s-box>
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                  <s-text>Enable Stop Desk</s-text>
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
                  <s-text variant="headingSm" as="h4">Apply to All Provinces</s-text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="all-cod">
                        All Cash on Delivery (DZD)
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
                          All Stop Desk (DZD)
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
                <s-text>Loading provinces...</s-text>
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
                        <s-text variant="headingSm" as="h4">{province.name}</s-text>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`cash-${province.id}`}>
                              Cash on Delivery (DZD)
                            </Label>
                            <div className="relative">
                              <Input
                                id={`cash-${province.id}`}
                                type="text"
                                value={formatCurrencyDisplay(provinceFees[province.id]?.cashOnDelivery || '', `cash-${province.id}`)}
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
                                Stop Desk (DZD)
                              </Label>
                              <div className="relative">
                                <Input
                                  id={`stopdesk-${province.id}`}
                                  type="text"
                                  value={formatCurrencyDisplay(provinceFees[province.id]?.stopDesk || '', `stopdesk-${province.id}`)}
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
        )}
        </s-stack>
      </s-box>
    </form>
  );
}


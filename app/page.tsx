"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { createApp } from "@shopify/app-bridge/client";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import { initializeShopWithToken } from "@/app/actions/shopify-auth";

export default function Home() {
  const shopify = useAppBridge();
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean | null;
  }>({
    loading: false,
    success: null,
  });

  useEffect(() => {
    const initializeShop = async () => {
      try {
        const app = createApp({
          apiKey: shopify.config.apiKey || '',
          host: shopify.config.host || '',
        });

        const shopUrl =shopify.config.shop || '';
        if (!shopUrl) {
          setStatus({
            loading: false,
            success: false,
          });
          return;
        }
        setStatus({ loading: true, success: null });
        const sessionToken = await getSessionToken(app);


        const result = await initializeShopWithToken(
          sessionToken,
          shopUrl
        );

        if (result.success) {
          setStatus({
            loading: false,
            success: true,
          });
        } else {
          setStatus({
            loading: false,
            success: false,
          });
        }
      } catch (error) {
        console.error("Error initializing shop:", error);
        setStatus({
          loading: false,
          success: false,
        });
      }
    };

    if (shopify.config.host) {
      initializeShop();
    }
  }, []);

  return (
    <s-page heading="Home">
      <s-box slot="content">
        <s-section>
          <h1>Hello World</h1>
          {status.loading && <p>Loading...</p>}
          {status.success !== null && (
            <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: status.success ? "#d4edda" : "#f8d7da", borderRadius: "4px" }}>
              <p style={{ color: status.success ? "#155724" : "#721c24", margin: 0 }}>
                {status.success ? "Shop initialized successfully" : "Failed to initialize shop"}
              </p>
            </div>
          )}
        </s-section>
      </s-box>
    </s-page>
  );
}

"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const shopify = useAppBridge();
  const [token, setToken] = useState("");
  useEffect(() => {
    if (shopify) {
      setToken(shopify.config.shop || 'ss')
    }
  }, [shopify]);

  return (
    <s-page>
      <s-section>
      {token}
      </s-section>
    </s-page>
  );
}

"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {

  return (
    <s-page heading="Home">
      <s-box slot="content">
        <s-section>
          <h1>Hello World</h1>
        </s-section>
      </s-box>
    </s-page>
  );
}

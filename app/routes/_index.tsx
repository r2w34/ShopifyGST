import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const embedded = url.searchParams.get("embedded");
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  
  console.log("Root index loader - URL:", url.toString());
  console.log("Root index loader - Shop:", shop);
  console.log("Root index loader - Embedded:", embedded);
  console.log("Root index loader - Host:", host);
  
  // If this is an embedded request from Shopify, redirect to the app
  if (shop) {
    console.log("Redirecting to app with shop:", shop);
    return redirect(`/app?${url.searchParams.toString()}`);
  }
  
  // Check if this is coming from Shopify admin
  const referer = request.headers.get("referer");
  if (referer && referer.includes(".myshopify.com")) {
    const shopFromReferer = referer.match(/https?:\/\/([^.]+)\.myshopify\.com/)?.[1];
    if (shopFromReferer) {
      console.log("Shop extracted from referer, redirecting:", shopFromReferer);
      return redirect(`/app?shop=${shopFromReferer}.myshopify.com`);
    }
  }
  
  return json({
    appName: "GST Invoice & Shipping Manager",
    version: "1.0.0",
    status: "running",
    domain: process.env.SHOPIFY_APP_URL || "localhost",
    timestamp: new Date().toISOString(),
  });
};

export default function Index() {
  const { appName, version, status, domain, timestamp } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h1" variant="headingLg">
                  🧾 {appName}
                </Text>
                <Badge tone="success">{status}</Badge>
              </InlineStack>
              
              <Text as="p" variant="bodyMd">
                A comprehensive GST-compliant invoicing and shipping management solution for Indian Shopify merchants.
              </Text>

              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  <strong>Version:</strong> {version}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Domain:</strong> {domain}
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Status:</strong> Application is running successfully
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Last Updated:</strong> {new Date(timestamp).toLocaleString()}
                </Text>
              </BlockStack>

              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  🇮🇳 GST Compliance Features
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    ✅ CGST/SGST/IGST calculations based on place of supply
                  </Text>
                  <Text as="p" variant="bodyMd">
                    ✅ HSN/SAC code support for product classification
                  </Text>
                  <Text as="p" variant="bodyMd">
                    ✅ Sequential invoice numbering system
                  </Text>
                  <Text as="p" variant="bodyMd">
                    ✅ GSTIN validation and state-wise tax logic
                  </Text>
                  <Text as="p" variant="bodyMd">
                    ✅ Reverse charge mechanism support
                  </Text>
                </BlockStack>
              </BlockStack>

              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  📦 Key Features
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    📄 GST-compliant invoice generation
                  </Text>
                  <Text as="p" variant="bodyMd">
                    👥 Customer management with GSTIN support
                  </Text>
                  <Text as="p" variant="bodyMd">
                    🏷️ Shipping label generation with tracking
                  </Text>
                  <Text as="p" variant="bodyMd">
                    📊 Analytics and reporting dashboard
                  </Text>
                  <Text as="p" variant="bodyMd">
                    🔄 Real-time Shopify order synchronization
                  </Text>
                </BlockStack>
              </BlockStack>

              <Card background="bg-surface-info">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    🔐 Shopify App Access
                  </Text>
                  <Text as="p" variant="bodyMd">
                    This application is designed to be embedded within Shopify Admin. 
                    To access the full functionality, install this app in your Shopify store.
                  </Text>
                  <InlineStack gap="300">
                    <Button url="/app" variant="primary">
                      Access App Dashboard
                    </Button>
                    <Button url="/health" variant="secondary">
                      Health Check
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
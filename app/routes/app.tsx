import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await authenticate.admin(request);

    return json({
      apiKey: process.env.SHOPIFY_API_KEY || "",
    });
  } catch (error) {
    console.log("Authentication failed in app route, preserving shop parameter");
    
    // Extract shop parameter from the request URL
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    
    if (shop) {
      console.log("Redirecting to auth/login with shop:", shop);
      throw new Response(null, {
        status: 302,
        headers: {
          Location: `/auth/login?shop=${encodeURIComponent(shop)}`,
        },
      });
    }
    
    // Try to extract shop from referer
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const shopFromReferer = refererUrl.searchParams.get("shop");
        
        if (shopFromReferer) {
          console.log("Redirecting to auth/login with shop from referer:", shopFromReferer);
          throw new Response(null, {
            status: 302,
            headers: {
              Location: `/auth/login?shop=${encodeURIComponent(shopFromReferer)}`,
            },
          });
        }
        
        // Try to extract from host parameter
        const hostParam = refererUrl.searchParams.get("host");
        if (hostParam) {
          try {
            const decodedHost = atob(hostParam);
            const hostMatch = decodedHost.match(/admin\.shopify\.com\/store\/([^\/]+)/);
            if (hostMatch && hostMatch[1]) {
              const shopFromHost = hostMatch[1];
              console.log("Redirecting to auth/login with shop from host:", shopFromHost);
              throw new Response(null, {
                status: 302,
                headers: {
                  Location: `/auth/login?shop=${encodeURIComponent(shopFromHost)}.myshopify.com`,
                },
              });
            }
          } catch (decodeError) {
            console.log("Error decoding host parameter:", decodeError);
          }
        }
      } catch (refererError) {
        console.log("Error parsing referer URL:", refererError);
      }
    }
    
    // If we can't determine the shop, re-throw the original error
    throw error;
  }
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <a href="/app" rel="home">
          🏠 Dashboard
        </a>
        <a href="/app/invoices">🧾 Invoices</a>
        <a href="/app/customers">👥 Customers</a>
        <a href="/app/labels">📦 Shipping Labels</a>
        <a href="/app/bulk-operations">🔄 Bulk Operations</a>
        <a href="/app/tracking">🚚 Tracking</a>
        <a href="/app/reports">📊 Reports</a>
        <a href="/app/settings">⚙️ Settings</a>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify embedded app error boundary
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}
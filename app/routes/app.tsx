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
  await authenticate.admin(request);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
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
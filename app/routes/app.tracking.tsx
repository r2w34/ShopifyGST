import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
  DataTable,
  EmptyState,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const trackingData = await prisma.shippingLabel.findMany({
    where: {
      trackingId: { not: null },
    },
    include: {
      customer: { select: { name: true } },
      order: { select: { orderNumber: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return json({ trackingData });
};

export default function Tracking() {
  const { trackingData } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = trackingData.filter(item =>
    item.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.order?.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusTone = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "success";
      case "shipped": return "info";
      case "in_transit": return "warning";
      case "generated": return "subdued";
      default: return "subdued";
    }
  };

  const tableRows = filteredData.map((item) => [
    item.order?.orderNumber || "-",
    item.trackingId || "-",
    item.customer.name,
    item.courierService || "-",
    <Badge key={item.id} tone={getStatusTone(item.status)}>
      {item.status}
    </Badge>,
    new Date(item.updatedAt).toLocaleDateString("en-IN"),
    <InlineStack key={`actions-${item.id}`} gap="200">
      <Button size="slim" url={`https://track.${item.courierService}.com/${item.trackingId}`} external>
        Track
      </Button>
      <Button size="slim">
        Update
      </Button>
    </InlineStack>,
  ]);

  return (
    <Page>
      <TitleBar title="Parcel Tracking" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Header */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h1" variant="headingLg">
                    🚚 Parcel Tracking
                  </Text>
                  <InlineStack gap="300">
                    <Button>Sync All</Button>
                    <Button variant="primary" url="/app/bulk-operations">
                      Upload Tracking IDs
                    </Button>
                  </InlineStack>
                </InlineStack>
                <Text as="p" variant="bodyMd">
                  Track and manage all your shipments in one place.
                </Text>
              </BlockStack>
            </Card>

            {/* Search */}
            <Card>
              <TextField
                label="Search"
                labelHidden
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by order number, tracking ID, or customer name..."
                clearButton
                onClearButtonClick={() => setSearchQuery("")}
              />
            </Card>

            {/* Tracking Table */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    📦 Active Shipments ({filteredData.length})
                  </Text>
                </InlineStack>

                {filteredData.length > 0 ? (
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "text",
                      "text",
                      "text",
                      "text",
                    ]}
                    headings={[
                      "Order #",
                      "Tracking ID",
                      "Customer",
                      "Courier",
                      "Status",
                      "Last Updated",
                      "Actions",
                    ]}
                    rows={tableRows}
                  />
                ) : (
                  <EmptyState
                    heading="No tracking data found"
                    action={{
                      content: "Upload Tracking IDs",
                      url: "/app/bulk-operations",
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Upload tracking IDs to start monitoring your shipments.</p>
                  </EmptyState>
                )}
              </BlockStack>
            </Card>

            {/* Quick Stats */}
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      In Transit
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {trackingData.filter(item => item.status === "SHIPPED").length}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Delivered
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {trackingData.filter(item => item.status === "DELIVERED").length}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Total Tracked
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {trackingData.length}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
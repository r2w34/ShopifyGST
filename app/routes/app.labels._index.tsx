import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
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
  Filters,
  Select,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const courier = url.searchParams.get("courier");
  const search = url.searchParams.get("search");

  const where: any = {};
  
  if (status && status !== "all") {
    where.status = status.toUpperCase();
  }
  
  if (courier && courier !== "all") {
    where.courierService = courier;
  }
  
  if (search) {
    where.OR = [
      { labelNumber: { contains: search, mode: "insensitive" } },
      { trackingId: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const labels = await prisma.shippingLabel.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: { name: true, phone: true },
      },
    },
  });

  return json({ labels });
};

export default function LabelsIndex() {
  const { labels } = useLoaderData<typeof loader>();
  
  const [queryValue, setQueryValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courierFilter, setCourierFilter] = useState("all");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleStatusFilterChange = useCallback(
    (value: string) => setStatusFilter(value),
    []
  );

  const handleCourierFilterChange = useCallback(
    (value: string) => setCourierFilter(value),
    []
  );

  const handleSelectionChange = useCallback((selection: string[]) => {
    setSelectedLabels(selection);
  }, []);

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    setQueryValue("");
    setStatusFilter("all");
    setCourierFilter("all");
  }, []);

  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <Select
          label="Status"
          labelHidden
          options={[
            { label: "All", value: "all" },
            { label: "Generated", value: "generated" },
            { label: "Printed", value: "printed" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
          ]}
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      ),
      shortcut: true,
    },
    {
      key: "courier",
      label: "Courier",
      filter: (
        <Select
          label="Courier"
          labelHidden
          options={[
            { label: "All Couriers", value: "all" },
            { label: "Blue Dart", value: "bluedart" },
            { label: "DTDC", value: "dtdc" },
            { label: "Delhivery", value: "delhivery" },
            { label: "Ecom Express", value: "ecom" },
            { label: "India Post", value: "indiapost" },
          ]}
          value={courierFilter}
          onChange={handleCourierFilterChange}
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (statusFilter !== "all") {
    appliedFilters.push({
      key: "status",
      label: `Status: ${statusFilter}`,
      onRemove: () => setStatusFilter("all"),
    });
  }
  if (courierFilter !== "all") {
    appliedFilters.push({
      key: "courier",
      label: `Courier: ${courierFilter}`,
      onRemove: () => setCourierFilter("all"),
    });
  }

  const getStatusTone = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "success";
      case "shipped": return "info";
      case "printed": return "warning";
      case "generated": return "subdued";
      default: return "subdued";
    }
  };

  const tableRows = labels.map((label) => [
    <Link key={label.id} to={`/app/labels/${label.id}`}>
      {label.labelNumber}
    </Link>,
    label.trackingId || "-",
    label.customer.name,
    label.courierService || "-",
    label.labelSize || "4x6",
    <Badge key={label.id} tone={getStatusTone(label.status)}>
      {label.status}
    </Badge>,
    new Date(label.createdAt).toLocaleDateString("en-IN"),
    <InlineStack key={`actions-${label.id}`} gap="200">
      <Button size="slim" url={`/app/labels/${label.id}`}>
        View
      </Button>
      <Button size="slim" url={`/app/labels/${label.id}/download`}>
        Download
      </Button>
      <Button size="slim" url={`/app/labels/${label.id}/print`}>
        Print
      </Button>
    </InlineStack>,
  ]);

  return (
    <Page>
      <TitleBar
        title="Shipping Labels"
        primaryAction={{
          content: "Generate Label",
          url: "/app/labels/new",
        }}
      />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  📦 Shipping Labels ({labels.length})
                </Text>
                <InlineStack gap="300">
                  <Button url="/app/bulk-operations">
                    Bulk Operations
                  </Button>
                  <Button variant="primary" url="/app/labels/new">
                    Generate Label
                  </Button>
                </InlineStack>
              </InlineStack>

              {selectedLabels.length > 0 && (
                <Card background="bg-surface-info">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      {selectedLabels.length} label(s) selected
                    </Text>
                    <InlineStack gap="200">
                      <Button size="slim">
                        📄 Download ZIP
                      </Button>
                      <Button size="slim">
                        🖨️ Print All
                      </Button>
                      <Button size="slim">
                        📊 Export CSV
                      </Button>
                    </InlineStack>
                  </InlineStack>
                </Card>
              )}

              <Filters
                queryValue={queryValue}
                filters={filters}
                appliedFilters={appliedFilters}
                onQueryChange={handleQueryValueChange}
                onQueryClear={handleQueryValueRemove}
                onClearAll={handleFiltersClearAll}
                queryPlaceholder="Search labels, tracking IDs..."
              />

              {labels.length > 0 ? (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                  ]}
                  headings={[
                    "Label #",
                    "Tracking ID",
                    "Customer",
                    "Courier",
                    "Size",
                    "Status",
                    "Date",
                    "Actions",
                  ]}
                  rows={tableRows}
                  selectable
                  selectedRows={selectedLabels}
                  onSelectionChange={handleSelectionChange}
                />
              ) : (
                <EmptyState
                  heading="No shipping labels found"
                  action={{
                    content: "Generate Label",
                    url: "/app/labels/new",
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Generate your first shipping label to get started.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
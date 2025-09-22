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
  DataTable,
  EmptyState,
  Filters,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { WhatsAppShare } from "../components/WhatsAppShare";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const search = url.searchParams.get("search");

  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { gstin: { contains: search, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { invoices: true },
      },
    },
  });

  return json({ customers });
};

export default function CustomersIndex() {
  const { customers } = useLoaderData<typeof loader>();
  
  const [queryValue, setQueryValue] = useState("");

  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [gstinFilter, setGstinFilter] = useState("all");

  const handleSelectionChange = useCallback((selection: string[]) => {
    setSelectedCustomers(selection);
  }, []);

  const handleGstinFilterChange = useCallback((value: string) => {
    setGstinFilter(value);
  }, []);

  // Calculate outstanding balance for each customer
  const getOutstandingBalance = (customer: any) => {
    // This would be calculated from unpaid invoices
    return Math.random() * 10000; // Mock data for now
  };

  const tableRows = customers.map((customer) => [
    <Link key={customer.id} to={`/app/customers/${customer.id}`}>
      {customer.name}
    </Link>,
    customer.gstin ? (
      <InlineStack key={`gstin-${customer.id}`} gap="200">
        <Text as="span" variant="bodyMd">{customer.gstin}</Text>
        <Badge tone="success">Verified</Badge>
      </InlineStack>
    ) : (
      <InlineStack key={`no-gstin-${customer.id}`} gap="200">
        <Text as="span" variant="bodyMd">-</Text>
        <Badge tone="warning">Missing</Badge>
      </InlineStack>
    ),
    customer.email || "-",
    customer.phone || "-",
    customer._count.invoices,
    `₹${getOutstandingBalance(customer).toFixed(2)}`,
    <InlineStack key={`actions-${customer.id}`} gap="200">
      <Button size="slim" url={`/app/customers/${customer.id}`}>
        View
      </Button>
      <Button size="slim" url={`/app/invoices/new?customer=${customer.id}`}>
        Invoice
      </Button>
      {customer.phone && (
        <WhatsAppShare
          message={`Hello ${customer.name}, this is regarding your account with us.`}
          phoneNumber={customer.phone}
          variant="plain"
          size="slim"
        />
      )}
    </InlineStack>,
  ]);

  return (
    <Page>
      <TitleBar
        title="Customers"
        primaryAction={{
          content: "Add Customer",
          url: "/app/customers/new",
        }}
      />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  👥 Customer Management ({customers.length})
                </Text>
                <InlineStack gap="300">
                  <Button url="/app/bulk-operations">
                    Bulk Operations
                  </Button>
                  <Button variant="primary" url="/app/customers/new">
                    Add Customer
                  </Button>
                </InlineStack>
              </InlineStack>

              {selectedCustomers.length > 0 && (
                <Card background="bg-surface-info">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      {selectedCustomers.length} customer(s) selected
                    </Text>
                    <InlineStack gap="200">
                      <Button size="slim">
                        📧 Email Selected
                      </Button>
                      <Button size="slim">
                        📱 WhatsApp Selected
                      </Button>
                      <Button size="slim">
                        📊 Export Selected
                      </Button>
                    </InlineStack>
                  </InlineStack>
                </Card>
              )}

              <Filters
                queryValue={queryValue}
                filters={[
                  {
                    key: "gstin",
                    label: "GSTIN Status",
                    filter: (
                      <Select
                        label="GSTIN Status"
                        labelHidden
                        options={[
                          { label: "All", value: "all" },
                          { label: "GSTIN Present", value: "present" },
                          { label: "GSTIN Missing", value: "missing" },
                        ]}
                        value={gstinFilter}
                        onChange={handleGstinFilterChange}
                      />
                    ),
                    shortcut: true,
                  },
                ]}
                appliedFilters={gstinFilter !== "all" ? [{
                  key: "gstin",
                  label: `GSTIN: ${gstinFilter}`,
                  onRemove: () => setGstinFilter("all"),
                }] : []}
                onQueryChange={handleQueryValueChange}
                onQueryClear={handleQueryValueRemove}
                onClearAll={() => {
                  setQueryValue("");
                  setGstinFilter("all");
                }}
                queryPlaceholder="Search customers..."
              />

              {customers.length > 0 ? (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text", 
                    "text",
                    "text",
                    "numeric",
                    "text",
                    "text",
                  ]}
                  headings={[
                    "Name",
                    "GSTIN",
                    "Email",
                    "Phone",
                    "Orders",
                    "Balance",
                    "Actions",
                  ]}
                  rows={tableRows}
                  selectable
                  selectedRows={selectedCustomers}
                  onSelectionChange={handleSelectionChange}
                />
              ) : (
                <EmptyState
                  heading="No customers found"
                  action={{
                    content: "Add Customer",
                    url: "/app/customers/new",
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Add your first customer to start creating invoices.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
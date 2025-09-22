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
  TextField,
  Select,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { WhatsAppShare } from "../components/WhatsAppShare";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  const where: any = {};
  
  if (status && status !== "all") {
    where.status = status.toUpperCase();
  }
  
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: { name: true, email: true },
      },
    },
  });

  return json({ invoices });
};

export default function InvoicesIndex() {
  const { invoices } = useLoaderData<typeof loader>();
  
  const [queryValue, setQueryValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleStatusFilterChange = useCallback(
    (value: string) => setStatusFilter(value),
    []
  );

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    setQueryValue("");
    setStatusFilter("all");
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
            { label: "Draft", value: "draft" },
            { label: "Sent", value: "sent" },
            { label: "Paid", value: "paid" },
            { label: "Overdue", value: "overdue" },
          ]}
          value={statusFilter}
          onChange={handleStatusFilterChange}
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

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const handleSelectionChange = useCallback((selection: string[]) => {
    setSelectedInvoices(selection);
  }, []);

  const tableRows = invoices.map((invoice) => [
    <Link key={invoice.id} to={`/app/invoices/${invoice.id}`}>
      {invoice.invoiceNumber}
    </Link>,
    invoice.customer.name,
    invoice.customerEmail || "-",
    `₹${invoice.totalAmount.toFixed(2)}`,
    <Badge key={invoice.id} tone={getStatusTone(invoice.status)}>
      {invoice.status}
    </Badge>,
    new Date(invoice.createdAt).toLocaleDateString("en-IN"),
    <InlineStack key={`actions-${invoice.id}`} gap="200">
      <Button size="slim" url={`/app/invoices/${invoice.id}`}>
        View
      </Button>
      <Button size="slim" url={`/app/invoices/${invoice.id}/download`}>
        Download
      </Button>
      <WhatsAppShare
        message={`Invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmount.toFixed(2)} is ready. View: ${process.env.SHOPIFY_APP_URL}/invoices/${invoice.id}`}
        phoneNumber={invoice.customer.phone}
        variant="plain"
        size="slim"
      />
    </InlineStack>,
  ]);

  return (
    <Page>
      <TitleBar
        title="Invoices"
        primaryAction={{
          content: "Create Invoice",
          url: "/app/invoices/new",
        }}
      />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  🧾 GST Invoices ({invoices.length})
                </Text>
                <InlineStack gap="300">
                  <Button url="/app/bulk-operations">
                    Bulk Operations
                  </Button>
                  <Button variant="primary" url="/app/invoices/new">
                    Create Invoice
                  </Button>
                </InlineStack>
              </InlineStack>

              {selectedInvoices.length > 0 && (
                <Card background="bg-surface-info">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      {selectedInvoices.length} invoice(s) selected
                    </Text>
                    <InlineStack gap="200">
                      <Button size="slim">
                        📧 Email Selected
                      </Button>
                      <Button size="slim">
                        📱 WhatsApp Selected
                      </Button>
                      <Button size="slim">
                        📄 Download ZIP
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
                queryPlaceholder="Search invoices..."
              />

              {invoices.length > 0 ? (
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
                    "Invoice #",
                    "Customer",
                    "Email",
                    "Amount",
                    "Status",
                    "Date",
                    "Actions",
                  ]}
                  rows={tableRows}
                  selectable
                  selectedRows={selectedInvoices}
                  onSelectionChange={handleSelectionChange}
                />
              ) : (
                <EmptyState
                  heading="No invoices found"
                  action={{
                    content: "Create Invoice",
                    url: "/app/invoices/new",
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Create your first GST-compliant invoice to get started.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function getStatusTone(status: string) {
  switch (status) {
    case "PAID":
      return "success";
    case "SENT":
      return "info";
    case "OVERDUE":
      return "critical";
    case "DRAFT":
      return "subdued";
    default:
      return "subdued";
  }
}
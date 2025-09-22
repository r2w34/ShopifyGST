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
  Select,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get current month data
  const currentMonth = new Date();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // Get invoice statistics
  const [
    totalInvoices,
    monthlyInvoices,
    totalSales,
    monthlySales,
    gstCollected,
    monthlyGST,
  ] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID" },
    }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "PAID",
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { cgst: true, sgst: true, igst: true },
      where: { status: "PAID" },
    }),
    prisma.invoice.aggregate({
      _sum: { cgst: true, sgst: true, igst: true },
      where: {
        status: "PAID",
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }),
  ]);

  // Get top customers
  const topCustomers = await prisma.customer.findMany({
    include: {
      invoices: {
        where: { status: "PAID" },
        select: { totalAmount: true },
      },
      _count: { select: { invoices: true } },
    },
    take: 10,
  });

  const customersWithTotals = topCustomers
    .map(customer => ({
      ...customer,
      totalSpent: customer.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Get GST summary by state
  const gstByState = await prisma.invoice.groupBy({
    by: ['placeOfSupply'],
    where: { status: "PAID" },
    _sum: {
      cgst: true,
      sgst: true,
      igst: true,
      totalAmount: true,
    },
    _count: true,
  });

  return json({
    stats: {
      totalInvoices,
      monthlyInvoices,
      totalSales: totalSales._sum.totalAmount || 0,
      monthlySales: monthlySales._sum.totalAmount || 0,
      gstCollected: (gstCollected._sum.cgst || 0) + (gstCollected._sum.sgst || 0) + (gstCollected._sum.igst || 0),
      monthlyGST: (monthlyGST._sum.cgst || 0) + (monthlyGST._sum.sgst || 0) + (monthlyGST._sum.igst || 0),
    },
    topCustomers: customersWithTotals,
    gstByState,
    currentMonth: currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
  });
};

export default function Reports() {
  const { stats, topCustomers, gstByState, currentMonth } = useLoaderData<typeof loader>();
  const [selectedPeriod, setSelectedPeriod] = useState("current_month");

  const periodOptions = [
    { label: "Current Month", value: "current_month" },
    { label: "Last Month", value: "last_month" },
    { label: "Current Quarter", value: "current_quarter" },
    { label: "Current Year", value: "current_year" },
  ];

  const topCustomerRows = topCustomers.map((customer) => [
    customer.name,
    customer.email || "-",
    customer.gstin || "-",
    customer._count.invoices,
    `₹${customer.totalSpent.toFixed(2)}`,
  ]);

  const gstStateRows = gstByState.map((state) => [
    state.placeOfSupply || "Unknown",
    state._count,
    `₹${(state._sum.totalAmount || 0).toFixed(2)}`,
    `₹${((state._sum.cgst || 0) + (state._sum.sgst || 0)).toFixed(2)}`,
    `₹${(state._sum.igst || 0).toFixed(2)}`,
    `₹${((state._sum.cgst || 0) + (state._sum.sgst || 0) + (state._sum.igst || 0)).toFixed(2)}`,
  ]);

  return (
    <Page>
      <TitleBar title="Reports & Analytics" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Header */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h1" variant="headingLg">
                    📊 Reports & Analytics
                  </Text>
                  <InlineStack gap="300">
                    <Select
                      label="Period"
                      labelHidden
                      options={periodOptions}
                      value={selectedPeriod}
                      onChange={setSelectedPeriod}
                    />
                    <Button>Export GSTR</Button>
                    <Button variant="primary">Download Report</Button>
                  </InlineStack>
                </InlineStack>
                <Text as="p" variant="bodyMd">
                  Comprehensive GST and sales analytics for {currentMonth}
                </Text>
              </BlockStack>
            </Card>

            {/* Key Metrics */}
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Total Sales
                    </Text>
                    <Text as="p" variant="heading2xl">
                      ₹{stats.totalSales.toFixed(2)}
                    </Text>
                    <Badge tone="success">
                      This Month: ₹{stats.monthlySales.toFixed(2)}
                    </Badge>
                  </BlockStack>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      GST Collected
                    </Text>
                    <Text as="p" variant="heading2xl">
                      ₹{stats.gstCollected.toFixed(2)}
                    </Text>
                    <Badge tone="info">
                      This Month: ₹{stats.monthlyGST.toFixed(2)}
                    </Badge>
                  </BlockStack>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Total Invoices
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {stats.totalInvoices}
                    </Text>
                    <Badge tone="warning">
                      This Month: {stats.monthlyInvoices}
                    </Badge>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>

            {/* GST Summary by State */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    🇮🇳 GST Summary by State
                  </Text>
                  <Button>Export CSV</Button>
                </InlineStack>

                {gstStateRows.length > 0 ? (
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "numeric",
                      "text",
                      "text",
                      "text",
                      "text",
                    ]}
                    headings={[
                      "State",
                      "Invoices",
                      "Total Sales",
                      "CGST + SGST",
                      "IGST",
                      "Total GST",
                    ]}
                    rows={gstStateRows}
                  />
                ) : (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No GST data available for the selected period.
                  </Text>
                )}
              </BlockStack>
            </Card>

            {/* Top Customers */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    👥 Top Customers
                  </Text>
                  <Button url="/app/customers">View All</Button>
                </InlineStack>

                {topCustomerRows.length > 0 ? (
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "numeric",
                      "text",
                    ]}
                    headings={[
                      "Customer",
                      "Email",
                      "GSTIN",
                      "Invoices",
                      "Total Spent",
                    ]}
                    rows={topCustomerRows}
                  />
                ) : (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No customer data available.
                  </Text>
                )}
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  📋 Quick Actions
                </Text>
                <InlineStack gap="300" wrap>
                  <Button>Generate GSTR-1</Button>
                  <Button>Generate GSTR-3B</Button>
                  <Button>Export Sales Report</Button>
                  <Button>Export Customer Report</Button>
                  <Button>Tax Summary Report</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
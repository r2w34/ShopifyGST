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
  DataTable,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { DashboardStats } from "../components/DashboardStats";
import { RecentActivity } from "../components/RecentActivity";
import { QuickActions } from "../components/QuickActions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("App index loader - URL:", request.url);
  
  const { session } = await authenticate.admin(request);

  // Check if onboarding is completed
  const settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  // If no settings or incomplete onboarding, redirect to onboarding with shop parameter
  if (!settings || !settings.companyName || !settings.companyGSTIN) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    searchParams.set('shop', session.shop);
    
    console.log("Redirecting to onboarding with shop parameter:", session.shop);
    return redirect(`/app/onboarding?${searchParams.toString()}`);
  }

  // Get dashboard statistics
  const [
    totalInvoices,
    pendingInvoices,
    paidInvoices,
    overdueInvoices,
    customerCount,
    labelCount,
    todayLabels,
  ] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "SENT" } }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.customer.count(),
    prisma.shippingLabel.count(),
    prisma.shippingLabel.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  // Calculate outstanding payments
  const outstandingInvoices = await prisma.invoice.findMany({
    where: { status: { in: ["SENT", "OVERDUE"] } },
    select: { totalAmount: true },
  });
  const outstandingAmount = outstandingInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  // Calculate this month's sales
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonthSales = await prisma.invoice.aggregate({
    where: {
      status: "PAID",
      createdAt: { gte: thisMonthStart },
    },
    _sum: { totalAmount: true },
  });

  // Get recent activity (invoices and labels)
  const recentInvoices = await prisma.invoice.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  const recentLabels = await prisma.shippingLabel.findMany({
    take: 2,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  // Format recent activity
  const recentActivity = [
    ...recentInvoices.map((invoice) => ({
      id: invoice.id,
      type: "invoice" as const,
      title: `Invoice ${invoice.invoiceNumber}`,
      description: `Created for ${invoice.customer.name}`,
      timestamp: new Date(invoice.createdAt).toLocaleDateString("en-IN"),
      status: invoice.status,
      amount: `₹${invoice.totalAmount.toFixed(2)}`,
    })),
    ...recentLabels.map((label) => ({
      id: label.id,
      type: "label" as const,
      title: `Shipping Label ${label.labelNumber}`,
      description: `Generated for ${label.customer.name}`,
      timestamp: new Date(label.createdAt).toLocaleDateString("en-IN"),
      status: label.status,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return json({
    stats: {
      pendingInvoices,
      labelsToday: todayLabels,
      outstandingPayments: `₹${outstandingAmount.toFixed(2)}`,
      salesThisMonth: `₹${(thisMonthSales._sum.totalAmount || 0).toFixed(2)}`,
    },
    recentActivity,
    shop: session.shop,
    settings,
  });
};

export default function Index() {
  const { stats, recentActivity, shop, settings } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="GST Invoice & Shipping Manager" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Welcome Header */}
            <Card>
              <BlockStack gap="300">
                <Text as="h1" variant="headingLg">
                  Welcome back, {settings.companyName}! 🇮🇳
                </Text>
                <Text as="p" variant="bodyMd">
                  Manage your GST-compliant invoices and shipping labels for{" "}
                  <Text as="span" fontWeight="semibold">
                    {shop}
                  </Text>
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  GSTIN: {settings.companyGSTIN} • Next Invoice: {settings.invoicePrefix}{settings.invoiceCounter.toString().padStart(4, '0')}
                </Text>
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <QuickActions />

            {/* Dashboard Statistics */}
            <DashboardStats stats={stats} />

            {/* Main Content Area */}
            <Layout>
              <Layout.Section variant="oneThird">
                {/* Recent Activity */}
                <RecentActivity activities={recentActivity} />
              </Layout.Section>
              
              <Layout.Section>
                {/* Additional Dashboard Content */}
                <BlockStack gap="400">
                  {/* GST Compliance Status */}
                  <Card>
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd">
                        🇮🇳 GST Compliance Status
                      </Text>
                      <InlineStack gap="300" wrap>
                        <Badge tone="success">GSTIN Verified</Badge>
                        <Badge tone="success">Tax Calculations Active</Badge>
                        <Badge tone="info">HSN Codes Configured</Badge>
                        <Badge tone="warning">Quarterly Filing Due</Badge>
                      </InlineStack>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Your GST setup is compliant and ready for invoice generation.
                      </Text>
                    </BlockStack>
                  </Card>

                  {/* Upcoming Tasks */}
                  <Card>
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd">
                        📋 Upcoming Tasks
                      </Text>
                      <BlockStack gap="200">
                        <InlineStack align="space-between">
                          <Text as="p" variant="bodyMd">
                            Follow up on overdue invoices
                          </Text>
                          <Badge tone="critical">3 pending</Badge>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="p" variant="bodyMd">
                            Generate shipping labels
                          </Text>
                          <Badge tone="warning">5 orders</Badge>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="p" variant="bodyMd">
                            Update customer GSTIN details
                          </Text>
                          <Badge tone="info">2 customers</Badge>
                        </InlineStack>
                      </BlockStack>
                      <Button variant="plain" url="/app/tasks">
                        View all tasks
                      </Button>
                    </BlockStack>
                  </Card>
                </BlockStack>
              </Layout.Section>
            </Layout>
          </BlockStack>
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
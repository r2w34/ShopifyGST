import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
} from "@shopify/polaris";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: string;
}

function StatsCard({ title, value, trend, icon }: StatsCardProps) {
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "up": return "success";
      case "down": return "critical";
      default: return "subdued";
    }
  };

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between">
          <Text as="h3" variant="headingSm" tone="subdued">
            {title}
          </Text>
          {icon && <Text as="span" variant="headingLg">{icon}</Text>}
        </InlineStack>
        <Text as="p" variant="heading2xl">
          {value}
        </Text>
        {trend && (
          <Badge tone={getTrendColor(trend.direction)}>
            {trend.value}
          </Badge>
        )}
      </BlockStack>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    pendingInvoices: number;
    labelsToday: number;
    outstandingPayments: string;
    salesThisMonth: string;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <InlineStack gap="400">
      <StatsCard
        title="Pending Invoices"
        value={stats.pendingInvoices}
        icon="🧾"
        trend={{ value: "+12% from last week", direction: "up" }}
      />
      <StatsCard
        title="Labels Generated Today"
        value={stats.labelsToday}
        icon="📦"
        trend={{ value: "+5 from yesterday", direction: "up" }}
      />
      <StatsCard
        title="Outstanding Payments"
        value={stats.outstandingPayments}
        icon="💰"
        trend={{ value: "-8% from last month", direction: "down" }}
      />
      <StatsCard
        title="Sales This Month"
        value={stats.salesThisMonth}
        icon="📈"
        trend={{ value: "+23% from last month", direction: "up" }}
      />
    </InlineStack>
  );
}
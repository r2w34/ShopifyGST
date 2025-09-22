import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Avatar,
  Badge,
  Button,
} from "@shopify/polaris";

interface ActivityItem {
  id: string;
  type: "invoice" | "label" | "payment" | "order";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "invoice": return "🧾";
      case "label": return "📦";
      case "payment": return "💰";
      case "order": return "🛒";
      default: return "📄";
    }
  };

  const getStatusTone = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "success";
      case "pending": return "warning";
      case "overdue": return "critical";
      case "shipped": return "info";
      default: return "subdued";
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text as="h2" variant="headingMd">
            Recent Activity
          </Text>
          <Button variant="plain" url="/app/activity">
            View all
          </Button>
        </InlineStack>

        <BlockStack gap="300">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <Card key={activity.id} background="bg-surface-secondary">
                <InlineStack align="space-between" blockAlign="start">
                  <InlineStack gap="300">
                    <Avatar
                      source={getActivityIcon(activity.type)}
                      size="small"
                    />
                    <BlockStack gap="100">
                      <Text as="h3" variant="bodyMd" fontWeight="semibold">
                        {activity.title}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {activity.description}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {activity.timestamp}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  
                  <BlockStack gap="100" align="end">
                    {activity.status && (
                      <Badge tone={getStatusTone(activity.status)}>
                        {activity.status}
                      </Badge>
                    )}
                    {activity.amount && (
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {activity.amount}
                      </Text>
                    )}
                  </BlockStack>
                </InlineStack>
              </Card>
            ))
          ) : (
            <Card background="bg-surface-secondary">
              <BlockStack gap="200" align="center">
                <Text as="p" variant="bodyMd" tone="subdued">
                  No recent activity
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Your recent invoices, labels, and orders will appear here
                </Text>
              </BlockStack>
            </Card>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
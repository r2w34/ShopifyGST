import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
} from "@shopify/polaris";

export function QuickActions() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Quick Actions
        </Text>
        
        <InlineStack gap="300" wrap={false}>
          <Button
            variant="primary"
            size="large"
            url="/app/invoices/new"
            fullWidth
          >
            🧾 Create Invoice
          </Button>
          
          <Button
            variant="secondary"
            size="large"
            url="/app/labels/new"
            fullWidth
          >
            📦 Generate Label
          </Button>
          
          <Button
            variant="secondary"
            size="large"
            url="/app/customers/new"
            fullWidth
          >
            👥 Add Customer
          </Button>
          
          <Button
            variant="secondary"
            size="large"
            url="/app/tracking"
            fullWidth
          >
            🚚 Track Orders
          </Button>
        </InlineStack>

        <InlineStack gap="200" wrap>
          <Button variant="plain" url="/app/bulk-operations">
            Bulk Operations
          </Button>
          <Button variant="plain" url="/app/reports">
            View Reports
          </Button>
          <Button variant="plain" url="/app/settings">
            Settings
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
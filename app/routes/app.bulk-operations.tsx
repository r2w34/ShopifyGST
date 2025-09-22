import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Select,
  Banner,
  Divider,
  Badge,
  ProgressBar,
  Tabs,
  DropZone,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const formData = await request.formData();

  try {
    const operation = formData.get("operation") as string;
    const file = formData.get("file") as File;

    if (!file) {
      return json({
        success: false,
        message: "Please select a CSV file to upload",
      });
    }

    // Process CSV file based on operation type
    const csvContent = await file.text();
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });

    let results = { processed: 0, errors: 0, success: 0 };

    switch (operation) {
      case "bulk-invoices":
        // Process bulk invoice creation
        for (const row of data) {
          try {
            // Validate required fields
            if (!row.customerEmail || !row.amount) {
              results.errors++;
              continue;
            }

            // Find or create customer
            let customer = await prisma.customer.findUnique({
              where: { email: row.customerEmail },
            });

            if (!customer) {
              customer = await prisma.customer.create({
                data: {
                  name: row.customerName || row.customerEmail,
                  email: row.customerEmail,
                  phone: row.customerPhone || null,
                  gstin: row.customerGSTIN || null,
                  billingAddress: {},
                  shippingAddress: {},
                },
              });
            }

            // Create invoice
            await prisma.invoice.create({
              data: {
                invoiceNumber: `INV${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
                customerId: customer.id,
                items: [{
                  description: row.itemDescription || "Bulk Import Item",
                  quantity: parseInt(row.quantity) || 1,
                  rate: parseFloat(row.rate) || parseFloat(row.amount),
                  amount: parseFloat(row.amount),
                }],
                subtotal: parseFloat(row.amount),
                totalAmount: parseFloat(row.amount) * 1.18, // Assuming 18% GST
                cgst: parseFloat(row.amount) * 0.09,
                sgst: parseFloat(row.amount) * 0.09,
                igst: 0,
                status: "DRAFT",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            results.success++;
          } catch (error) {
            results.errors++;
          }
          results.processed++;
        }
        break;

      case "bulk-labels":
        // Process bulk label generation
        for (const row of data) {
          try {
            if (!row.orderNumber) {
              results.errors++;
              continue;
            }

            const order = await prisma.order.findFirst({
              where: { orderNumber: row.orderNumber },
            });

            if (!order) {
              results.errors++;
              continue;
            }

            await prisma.shippingLabel.create({
              data: {
                labelNumber: `LBL${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
                orderId: order.id,
                customerId: order.customerId,
                trackingId: row.trackingId || "",
                courierService: row.courierService || "manual",
                labelSize: row.labelSize || "4x6",
                status: "GENERATED",
                labelData: {
                  orderNumber: row.orderNumber,
                  trackingId: row.trackingId,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            results.success++;
          } catch (error) {
            results.errors++;
          }
          results.processed++;
        }
        break;

      case "bulk-tracking":
        // Process bulk tracking ID updates
        for (const row of data) {
          try {
            if (!row.orderNumber || !row.trackingId) {
              results.errors++;
              continue;
            }

            await prisma.shippingLabel.updateMany({
              where: {
                order: { orderNumber: row.orderNumber },
              },
              data: {
                trackingId: row.trackingId,
                courierService: row.courierService || undefined,
                status: "SHIPPED",
                updatedAt: new Date(),
              },
            });

            results.success++;
          } catch (error) {
            results.errors++;
          }
          results.processed++;
        }
        break;

      default:
        return json({
          success: false,
          message: "Invalid operation type",
        });
    }

    return json({
      success: true,
      message: `Processed ${results.processed} records. ${results.success} successful, ${results.errors} errors.`,
      results,
    });
  } catch (error) {
    console.error("Bulk operation error:", error);
    return json({
      success: false,
      message: "Failed to process bulk operation. Please check your CSV format.",
    });
  }
};

export default function BulkOperations() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [selectedTab, setSelectedTab] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [operation, setOperation] = useState("bulk-invoices");

  const isLoading = navigation.state === "submitting";

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
    const operations = ["bulk-invoices", "bulk-labels", "bulk-tracking"];
    setOperation(operations[selectedTabIndex]);
  }, []);

  const handleDropZoneDrop = useCallback(
    (dropFiles: File[]) => {
      setFiles(dropFiles);
    },
    []
  );

  const tabs = [
    {
      id: "bulk-invoices",
      content: "Bulk Invoices",
      panelID: "bulk-invoices-panel",
    },
    {
      id: "bulk-labels",
      content: "Bulk Labels",
      panelID: "bulk-labels-panel",
    },
    {
      id: "bulk-tracking",
      content: "Bulk Tracking IDs",
      panelID: "bulk-tracking-panel",
    },
  ];

  const getCSVTemplate = (type: string) => {
    switch (type) {
      case "bulk-invoices":
        return "customerName,customerEmail,customerPhone,customerGSTIN,itemDescription,quantity,rate,amount\nJohn Doe,john@example.com,9876543210,27AABCU9603R1ZX,Product Name,1,1000,1000";
      case "bulk-labels":
        return "orderNumber,trackingId,courierService,labelSize\nORD001,1234567890,bluedart,4x6";
      case "bulk-tracking":
        return "orderNumber,trackingId,courierService\nORD001,1234567890,bluedart";
      default:
        return "";
    }
  };

  const downloadTemplate = (type: string) => {
    const template = getCSVTemplate(type);
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    const tabInfo = {
      "bulk-invoices": {
        title: "📄 Bulk Invoice Creation",
        description: "Create multiple invoices at once by uploading a CSV file with customer and item details.",
        fields: ["customerName", "customerEmail", "customerPhone", "customerGSTIN", "itemDescription", "quantity", "rate", "amount"],
        example: "Upload customer details with item information to generate GST-compliant invoices automatically.",
      },
      "bulk-labels": {
        title: "📦 Bulk Label Generation",
        description: "Generate shipping labels for multiple orders by uploading order numbers and tracking details.",
        fields: ["orderNumber", "trackingId", "courierService", "labelSize"],
        example: "Upload order numbers with tracking IDs to generate shipping labels in bulk.",
      },
      "bulk-tracking": {
        title: "🚚 Bulk Tracking ID Updates",
        description: "Update tracking IDs for multiple orders at once.",
        fields: ["orderNumber", "trackingId", "courierService"],
        example: "Upload order numbers with their corresponding tracking IDs to update shipment status.",
      },
    };

    const currentTab = tabs[selectedTab].id;
    const info = tabInfo[currentTab as keyof typeof tabInfo];

    return (
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          {info.title}
        </Text>
        
        <Text as="p" variant="bodyMd">
          {info.description}
        </Text>

        <Card background="bg-surface-info">
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              Required CSV Columns:
            </Text>
            <InlineStack gap="200" wrap>
              {info.fields.map(field => (
                <Badge key={field} tone="info">{field}</Badge>
              ))}
            </InlineStack>
            <Text as="p" variant="bodySm">
              {info.example}
            </Text>
            <Button
              variant="plain"
              onClick={() => downloadTemplate(currentTab)}
            >
              📥 Download CSV Template
            </Button>
          </BlockStack>
        </Card>

        <Form method="post" encType="multipart/form-data">
          <input type="hidden" name="operation" value={operation} />
          <BlockStack gap="400">
            <DropZone onDrop={handleDropZoneDrop} accept=".csv">
              {files.length > 0 ? (
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Selected file: {files[0].name}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Size: {(files[0].size / 1024).toFixed(2)} KB
                  </Text>
                </BlockStack>
              ) : (
                <BlockStack gap="200" align="center">
                  <Text as="p" variant="bodyMd">
                    Drop your CSV file here or click to browse
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Accepts .csv files only
                  </Text>
                </BlockStack>
              )}
            </DropZone>

            {files.length > 0 && (
              <input
                type="file"
                name="file"
                style={{ display: 'none' }}
                ref={(input) => {
                  if (input && files[0]) {
                    const dt = new DataTransfer();
                    dt.items.add(files[0]);
                    input.files = dt.files;
                  }
                }}
              />
            )}

            <InlineStack gap="300">
              <Button
                variant="primary"
                submit
                loading={isLoading}
                disabled={files.length === 0}
              >
                Process CSV File
              </Button>
              <Button onClick={() => setFiles([])}>
                Clear File
              </Button>
            </InlineStack>
          </BlockStack>
        </Form>
      </BlockStack>
    );
  };

  return (
    <Page>
      <TitleBar title="Bulk Operations" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Header */}
            <Card>
              <BlockStack gap="300">
                <Text as="h1" variant="headingLg">
                  🔄 Bulk Operations
                </Text>
                <Text as="p" variant="bodyMd">
                  Process multiple records at once using CSV file uploads. 
                  Save time by creating invoices, generating labels, or updating tracking IDs in bulk.
                </Text>
              </BlockStack>
            </Card>

            {/* Success/Error Messages */}
            {actionData?.message && (
              <Banner
                title={actionData.success ? "Success" : "Error"}
                tone={actionData.success ? "success" : "critical"}
              >
                {actionData.message}
                {actionData.results && (
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm">
                      Processed: {actionData.results.processed} records
                    </Text>
                    <Text as="p" variant="bodySm">
                      Successful: {actionData.results.success} records
                    </Text>
                    {actionData.results.errors > 0 && (
                      <Text as="p" variant="bodySm" tone="critical">
                        Errors: {actionData.results.errors} records
                      </Text>
                    )}
                  </BlockStack>
                )}
              </Banner>
            )}

            {/* Tabs */}
            <Card>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                <Card.Section>
                  {renderTabContent()}
                </Card.Section>
              </Tabs>
            </Card>

            {/* Help Section */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  💡 Tips for Bulk Operations
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    • Always download and use the provided CSV templates
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Ensure all required fields are filled correctly
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Test with a small batch first before processing large files
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • GSTIN format: 15 characters (2 digits + 10 alphanumeric + 1 digit + 1 letter + 1 letter + 1 alphanumeric)
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Phone numbers should include country code (+91 for India)
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
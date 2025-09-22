import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
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
  Checkbox,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get orders that don't have shipping labels yet
  const orders = await prisma.order.findMany({
    where: {
      shippingLabels: {
        none: {},
      },
    },
    include: {
      customer: {
        select: { name: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get customers for manual label creation
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      shippingAddress: true,
    },
    orderBy: { name: "asc" },
  });

  return json({
    orders: orders.map(order => ({
      ...order,
      selected: false,
    })),
    customers: customers.map(customer => ({
      label: customer.name,
      value: customer.id,
      ...customer,
    })),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  try {
    const step = parseInt(formData.get("step") as string);
    const selectedOrders = JSON.parse(formData.get("selectedOrders") as string || "[]");
    const trackingIds = JSON.parse(formData.get("trackingIds") as string || "{}");
    const labelSize = formData.get("labelSize") as string;
    const courierService = formData.get("courierService") as string;

    if (step === 4) {
      // Final step - generate labels
      const labels = [];

      for (const orderId of selectedOrders) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { customer: true },
        });

        if (!order) continue;

        // Get app settings for label numbering
        const settings = await prisma.appSettings.findUnique({
          where: { shop: session.shop },
        });

        if (!settings) continue;

        const labelNumber = `LBL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const label = await prisma.shippingLabel.create({
          data: {
            labelNumber,
            orderId: order.id,
            customerId: order.customerId,
            trackingId: trackingIds[orderId] || "",
            courierService: courierService || "manual",
            labelSize: labelSize || "4x6",
            status: "GENERATED",
            labelData: {
              customerName: order.customer.name,
              customerPhone: order.customer.phone,
              shippingAddress: order.customer.shippingAddress,
              orderNumber: order.orderNumber,
              weight: order.totalWeight || 0.5,
              dimensions: order.dimensions || { length: 10, width: 10, height: 5 },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        labels.push(label);
      }

      return json({
        success: true,
        message: `Successfully generated ${labels.length} shipping labels`,
        labels,
      });
    }

    return json({ success: true, step: step + 1 });
  } catch (error) {
    console.error("Label generation error:", error);
    return json({
      success: false,
      message: "Failed to generate labels. Please try again.",
    });
  }
};

export default function NewLabel() {
  const { orders, customers } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [trackingIds, setTrackingIds] = useState<Record<string, string>>({});
  const [labelSize, setLabelSize] = useState("4x6");
  const [courierService, setCourierService] = useState("bluedart");

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success && actionData?.step) {
      setStep(actionData.step);
    } else if (actionData?.success && actionData?.labels) {
      // Redirect to labels list after successful generation
      window.location.href = "/app/labels";
    }
  }, [actionData]);

  const handleOrderSelection = useCallback((orderId: string, selected: boolean) => {
    if (selected) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
      // Remove tracking ID if order is deselected
      const newTrackingIds = { ...trackingIds };
      delete newTrackingIds[orderId];
      setTrackingIds(newTrackingIds);
    }
  }, [selectedOrders, trackingIds]);

  const handleTrackingIdChange = useCallback((orderId: string, trackingId: string) => {
    setTrackingIds({
      ...trackingIds,
      [orderId]: trackingId,
    });
  }, [trackingIds]);

  const progressPercentage = (step / 4) * 100;

  const labelSizeOptions = [
    { label: "4x6 inches (Standard)", value: "4x6" },
    { label: "A5 (148x210mm)", value: "a5" },
    { label: "A4 Single Label", value: "a4-single" },
    { label: "A4 Multi-Label", value: "a4-multi" },
  ];

  const courierOptions = [
    { label: "Blue Dart", value: "bluedart" },
    { label: "DTDC", value: "dtdc" },
    { label: "Delhivery", value: "delhivery" },
    { label: "Ecom Express", value: "ecom" },
    { label: "India Post", value: "indiapost" },
    { label: "Manual/Other", value: "manual" },
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                📦 Step 1: Select Orders
              </Text>
              
              <Text as="p" variant="bodyMd">
                Choose the orders for which you want to generate shipping labels:
              </Text>

              {orders.length > 0 ? (
                <BlockStack gap="300">
                  {orders.map((order) => (
                    <Card key={order.id} background="bg-surface-secondary">
                      <InlineStack align="space-between">
                        <InlineStack gap="300">
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onChange={(checked) => handleOrderSelection(order.id, checked)}
                          />
                          <BlockStack gap="100">
                            <Text as="h3" variant="bodyMd" fontWeight="semibold">
                              Order #{order.orderNumber}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Customer: {order.customer.name}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Amount: ₹{order.totalAmount.toFixed(2)}
                            </Text>
                          </BlockStack>
                        </InlineStack>
                        <Badge tone="info">Ready for Shipping</Badge>
                      </InlineStack>
                    </Card>
                  ))}
                </BlockStack>
              ) : (
                <Card background="bg-surface-secondary">
                  <BlockStack gap="200" align="center">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No orders available for shipping labels
                    </Text>
                    <Button url="/app/orders">
                      View All Orders
                    </Button>
                  </BlockStack>
                </Card>
              )}

              <Text as="p" variant="bodySm" tone="subdued">
                Selected: {selectedOrders.length} orders
              </Text>
            </BlockStack>
          </Card>
        );

      case 2:
        return (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                🏷️ Step 2: Add Tracking IDs
              </Text>
              
              <Text as="p" variant="bodyMd">
                Enter tracking IDs for the selected orders (optional):
              </Text>

              <BlockStack gap="300">
                {selectedOrders.map((orderId) => {
                  const order = orders.find(o => o.id === orderId);
                  if (!order) return null;

                  return (
                    <InlineStack key={orderId} gap="400" align="center">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        #{order.orderNumber}
                      </Text>
                      <TextField
                        label=""
                        labelHidden
                        value={trackingIds[orderId] || ""}
                        onChange={(value) => handleTrackingIdChange(orderId, value)}
                        placeholder="Enter tracking ID (optional)"
                        autoComplete="off"
                      />
                    </InlineStack>
                  );
                })}
              </BlockStack>

              <Banner tone="info">
                <p>
                  Tracking IDs can be added later. You can also upload them in bulk via CSV.
                </p>
              </Banner>
            </BlockStack>
          </Card>
        );

      case 3:
        return (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                ⚙️ Step 3: Label Settings
              </Text>
              
              <InlineStack gap="400">
                <Select
                  label="Label Size"
                  options={labelSizeOptions}
                  value={labelSize}
                  onChange={setLabelSize}
                  helpText="Choose the label size for printing"
                />
                <Select
                  label="Courier Service"
                  options={courierOptions}
                  value={courierService}
                  onChange={setCourierService}
                  helpText="Select your courier partner"
                />
              </InlineStack>

              <Card background="bg-surface-info">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Label Preview Settings
                  </Text>
                  <Text as="p" variant="bodySm">
                    Size: {labelSizeOptions.find(opt => opt.value === labelSize)?.label}
                  </Text>
                  <Text as="p" variant="bodySm">
                    Courier: {courierOptions.find(opt => opt.value === courierService)?.label}
                  </Text>
                  <Text as="p" variant="bodySm">
                    Labels to generate: {selectedOrders.length}
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Card>
        );

      case 4:
        return (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                ✅ Step 4: Review & Generate
              </Text>
              
              <Text as="p" variant="bodyMd">
                Review your settings and generate the shipping labels:
              </Text>

              <Card background="bg-surface-secondary">
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    Summary
                  </Text>
                  <InlineStack gap="400">
                    <Text as="p" variant="bodySm">
                      <strong>Orders:</strong> {selectedOrders.length}
                    </Text>
                    <Text as="p" variant="bodySm">
                      <strong>Size:</strong> {labelSizeOptions.find(opt => opt.value === labelSize)?.label}
                    </Text>
                    <Text as="p" variant="bodySm">
                      <strong>Courier:</strong> {courierOptions.find(opt => opt.value === courierService)?.label}
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodySm">
                    <strong>Tracking IDs:</strong> {Object.keys(trackingIds).length} provided
                  </Text>
                </BlockStack>
              </Card>

              <Banner tone="success">
                <p>
                  Ready to generate {selectedOrders.length} shipping labels. 
                  You can download and print them after generation.
                </p>
              </Banner>
            </BlockStack>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Page>
      <TitleBar title="Generate Shipping Labels" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Progress Header */}
            <Card>
              <BlockStack gap="300">
                <Text as="h1" variant="headingLg">
                  📦 Shipping Label Generator
                </Text>
                <ProgressBar progress={progressPercentage} size="small" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  Step {step} of 4: {
                    step === 1 ? "Select Orders" :
                    step === 2 ? "Add Tracking IDs" :
                    step === 3 ? "Label Settings" :
                    "Review & Generate"
                  }
                </Text>
              </BlockStack>
            </Card>

            {/* Error/Success Messages */}
            {actionData?.message && (
              <Banner
                title={actionData.success ? "Success" : "Error"}
                tone={actionData.success ? "success" : "critical"}
              >
                {actionData.message}
              </Banner>
            )}

            {/* Step Content */}
            <Form method="post">
              <input type="hidden" name="step" value={step} />
              <input type="hidden" name="selectedOrders" value={JSON.stringify(selectedOrders)} />
              <input type="hidden" name="trackingIds" value={JSON.stringify(trackingIds)} />
              <input type="hidden" name="labelSize" value={labelSize} />
              <input type="hidden" name="courierService" value={courierService} />
              
              <BlockStack gap="400">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <InlineStack align="space-between">
                  <Button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    submit
                    loading={isLoading}
                    disabled={step === 1 && selectedOrders.length === 0}
                  >
                    {step === 4 ? "Generate Labels" : "Next Step"}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Form>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
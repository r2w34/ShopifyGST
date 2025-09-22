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
  DataTable,
  Badge,
  Banner,
  Divider,
  Checkbox,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { calculateGST } from "../utils/gst.server";
import { WhatsAppShare } from "../components/WhatsAppShare";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get customers for dropdown
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gstin: true,
      billingAddress: true,
    },
    orderBy: { name: "asc" },
  });

  // Get app settings for invoice numbering
  const settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    return redirect("/app/onboarding");
  }

  return json({
    customers: customers.map(customer => ({
      label: `${customer.name} ${customer.gstin ? `(${customer.gstin})` : ''}`,
      value: customer.id,
      ...customer,
    })),
    settings,
    nextInvoiceNumber: `${settings.invoicePrefix}${settings.invoiceCounter.toString().padStart(4, '0')}`,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  try {
    const customerId = formData.get("customerId") as string;
    const items = JSON.parse(formData.get("items") as string);
    const notes = formData.get("notes") as string;
    const reverseCharge = formData.get("reverseCharge") === "on";

    if (!customerId || !items || items.length === 0) {
      return json({
        success: false,
        message: "Customer and items are required",
      });
    }

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return json({
        success: false,
        message: "Customer not found",
      });
    }

    // Get app settings
    const settings = await prisma.appSettings.findUnique({
      where: { shop: session.shop },
    });

    if (!settings) {
      return json({
        success: false,
        message: "App settings not found. Please complete onboarding.",
      });
    }

    // Calculate totals and GST
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      return {
        ...item,
        amount,
      };
    });

    const gstCalculation = calculateGST(
      subtotal,
      settings.companyAddress?.state || "",
      customer.billingAddress?.state || "",
      reverseCharge
    );

    const totalAmount = subtotal + gstCalculation.totalGST;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `${settings.invoicePrefix}${settings.invoiceCounter.toString().padStart(4, '0')}`,
        customerId,
        items: processedItems,
        subtotal,
        cgst: gstCalculation.cgst,
        sgst: gstCalculation.sgst,
        igst: gstCalculation.igst,
        totalAmount,
        status: "DRAFT",
        notes: notes || "",
        reverseCharge,
        placeOfSupply: customer.billingAddress?.state || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update invoice counter
    await prisma.appSettings.update({
      where: { shop: session.shop },
      data: { invoiceCounter: settings.invoiceCounter + 1 },
    });

    return redirect(`/app/invoices/${invoice.id}`);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return json({
      success: false,
      message: "Failed to create invoice. Please try again.",
    });
  }
};

export default function NewInvoice() {
  const { customers, settings, nextInvoiceNumber } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([
    {
      id: 1,
      description: "",
      hsnCode: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      amount: 0,
    },
  ]);
  const [notes, setNotes] = useState("");
  const [reverseCharge, setReverseCharge] = useState(false);

  const isLoading = navigation.state === "submitting";

  const addItem = useCallback(() => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        description: "",
        hsnCode: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        amount: 0,
      },
    ]);
  }, [items]);

  const removeItem = useCallback((id: number) => {
    setItems(items.filter(item => item.id !== id));
  }, [items]);

  const updateItem = useCallback((id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate amount
        if (field === 'quantity' || field === 'rate' || field === 'discount') {
          const subtotal = updatedItem.quantity * updatedItem.rate;
          updatedItem.amount = subtotal - (subtotal * updatedItem.discount / 100);
        }
        return updatedItem;
      }
      return item;
    }));
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const selectedCustomerData = customers.find(c => c.value === selectedCustomer);

  // Mock GST calculation for preview
  const mockGST = {
    cgst: subtotal * 0.09, // 9% CGST
    sgst: subtotal * 0.09, // 9% SGST
    igst: 0,
    totalGST: subtotal * 0.18,
  };
  const totalAmount = subtotal + mockGST.totalGST;

  const itemRows = items.map((item) => [
    <TextField
      key={`desc-${item.id}`}
      value={item.description}
      onChange={(value) => updateItem(item.id, 'description', value)}
      placeholder="Item description"
      autoComplete="off"
    />,
    <TextField
      key={`hsn-${item.id}`}
      value={item.hsnCode}
      onChange={(value) => updateItem(item.id, 'hsnCode', value)}
      placeholder="HSN/SAC"
      autoComplete="off"
    />,
    <TextField
      key={`qty-${item.id}`}
      type="number"
      value={item.quantity.toString()}
      onChange={(value) => updateItem(item.id, 'quantity', parseInt(value) || 0)}
      autoComplete="off"
    />,
    <TextField
      key={`rate-${item.id}`}
      type="number"
      value={item.rate.toString()}
      onChange={(value) => updateItem(item.id, 'rate', parseFloat(value) || 0)}
      prefix="₹"
      autoComplete="off"
    />,
    <TextField
      key={`discount-${item.id}`}
      type="number"
      value={item.discount.toString()}
      onChange={(value) => updateItem(item.id, 'discount', parseFloat(value) || 0)}
      suffix="%"
      autoComplete="off"
    />,
    <Text key={`amount-${item.id}`} as="p" variant="bodyMd" fontWeight="semibold">
      ₹{item.amount.toFixed(2)}
    </Text>,
    <Button
      key={`remove-${item.id}`}
      variant="plain"
      tone="critical"
      onClick={() => removeItem(item.id)}
      disabled={items.length === 1}
    >
      Remove
    </Button>,
  ]);

  return (
    <Page>
      <TitleBar title="Create New Invoice" />
      <Layout>
        <Layout.Section variant="twoThirds">
          <Form method="post">
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            <BlockStack gap="500">
              {/* Error/Success Messages */}
              {actionData?.message && (
                <Banner
                  title={actionData.success ? "Success" : "Error"}
                  tone={actionData.success ? "success" : "critical"}
                >
                  {actionData.message}
                </Banner>
              )}

              {/* Invoice Header */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    🧾 Invoice Details
                  </Text>
                  
                  <InlineStack gap="400">
                    <TextField
                      label="Invoice Number"
                      value={nextInvoiceNumber}
                      disabled
                      helpText="Auto-generated based on your settings"
                    />
                    <TextField
                      label="Invoice Date"
                      type="date"
                      value={new Date().toISOString().split('T')[0]}
                      disabled
                    />
                  </InlineStack>

                  <Select
                    label="Select Customer"
                    options={[
                      { label: "Choose a customer", value: "" },
                      ...customers,
                    ]}
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    name="customerId"
                    requiredIndicator
                  />

                  {selectedCustomerData && (
                    <Card background="bg-surface-secondary">
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingSm">
                          Customer Details
                        </Text>
                        <Text as="p" variant="bodyMd">
                          <strong>Name:</strong> {selectedCustomerData.name}
                        </Text>
                        {selectedCustomerData.email && (
                          <Text as="p" variant="bodyMd">
                            <strong>Email:</strong> {selectedCustomerData.email}
                          </Text>
                        )}
                        {selectedCustomerData.phone && (
                          <Text as="p" variant="bodyMd">
                            <strong>Phone:</strong> {selectedCustomerData.phone}
                          </Text>
                        )}
                        {selectedCustomerData.gstin && (
                          <Text as="p" variant="bodyMd">
                            <strong>GSTIN:</strong> {selectedCustomerData.gstin}
                          </Text>
                        )}
                      </BlockStack>
                    </Card>
                  )}
                </BlockStack>
              </Card>

              {/* Items Table */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">
                      📦 Invoice Items
                    </Text>
                    <Button onClick={addItem}>
                      Add Item
                    </Button>
                  </InlineStack>

                  <DataTable
                    columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "numeric", "text"]}
                    headings={[
                      "Description",
                      "HSN/SAC",
                      "Qty",
                      "Rate",
                      "Discount",
                      "Amount",
                      "Action",
                    ]}
                    rows={itemRows}
                  />

                  <InlineStack align="end">
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd">
                        <strong>Subtotal: ₹{subtotal.toFixed(2)}</strong>
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </BlockStack>
              </Card>

              {/* Additional Settings */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    ⚙️ Additional Settings
                  </Text>

                  <Checkbox
                    label="Reverse Charge Applicable"
                    checked={reverseCharge}
                    onChange={setReverseCharge}
                    name="reverseCharge"
                    helpText="Check if reverse charge mechanism applies"
                  />

                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={setNotes}
                    name="notes"
                    multiline={3}
                    placeholder="Add any additional notes or terms..."
                  />
                </BlockStack>
              </Card>

              {/* Action Buttons */}
              <InlineStack gap="300">
                <Button
                  variant="primary"
                  submit
                  loading={isLoading}
                  disabled={!selectedCustomer || items.length === 0}
                >
                  Create Invoice
                </Button>
                <Button url="/app/invoices">
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Form>
        </Layout.Section>

        {/* Live Preview Sidebar */}
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  📄 Live Preview
                </Text>
                
                <Divider />
                
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    {settings.companyName}
                  </Text>
                  <Text as="p" variant="bodySm">
                    GSTIN: {settings.companyGSTIN}
                  </Text>
                </BlockStack>

                <Divider />

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Invoice: {nextInvoiceNumber}
                  </Text>
                  <Text as="p" variant="bodySm">
                    Date: {new Date().toLocaleDateString("en-IN")}
                  </Text>
                </BlockStack>

                {selectedCustomerData && (
                  <>
                    <Divider />
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Bill To:
                      </Text>
                      <Text as="p" variant="bodySm">
                        {selectedCustomerData.name}
                      </Text>
                      {selectedCustomerData.gstin && (
                        <Text as="p" variant="bodySm">
                          GSTIN: {selectedCustomerData.gstin}
                        </Text>
                      )}
                    </BlockStack>
                  </>
                )}

                <Divider />

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Amount Breakdown
                  </Text>
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodySm">Subtotal:</Text>
                    <Text as="p" variant="bodySm">₹{subtotal.toFixed(2)}</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodySm">CGST (9%):</Text>
                    <Text as="p" variant="bodySm">₹{mockGST.cgst.toFixed(2)}</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodySm">SGST (9%):</Text>
                    <Text as="p" variant="bodySm">₹{mockGST.sgst.toFixed(2)}</Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">Total:</Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">₹{totalAmount.toFixed(2)}</Text>
                  </InlineStack>
                </BlockStack>

                {reverseCharge && (
                  <Badge tone="warning">Reverse Charge Applicable</Badge>
                )}
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  Quick Actions
                </Text>
                <Button url="/app/customers/new" fullWidth>
                  + Add New Customer
                </Button>
                <Button url="/app/invoices" variant="plain" fullWidth>
                  View All Invoices
                </Button>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { validateGSTIN } from "../utils/gst.server";
import { INDIAN_STATES } from "../utils/gst.client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const formData = await request.formData();

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const businessName = formData.get("businessName") as string;
    const gstin = formData.get("gstin") as string;
    
    // Address fields
    const addressLine1 = formData.get("addressLine1") as string;
    const addressLine2 = formData.get("addressLine2") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const pincode = formData.get("pincode") as string;
    const country = "India";

    if (!name || !email) {
      return json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Validate GSTIN if provided
    if (gstin && !validateGSTIN(gstin)) {
      return json({
        success: false,
        message: "Invalid GSTIN format. Please enter a valid 15-digit GSTIN",
      });
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email },
          ...(gstin ? [{ gstin }] : []),
        ],
      },
    });

    if (existingCustomer) {
      return json({
        success: false,
        message: "Customer with this email or GSTIN already exists",
      });
    }

    const billingAddress = {
      line1: addressLine1 || "",
      line2: addressLine2 || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      country,
    };

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone: phone || null,
        businessName: businessName || null,
        gstin: gstin || null,
        billingAddress,
        shippingAddress: billingAddress, // Same as billing for now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return redirect(`/app/customers/${customer.id}`);
  } catch (error) {
    console.error("Customer creation error:", error);
    return json({
      success: false,
      message: "Failed to create customer. Please try again.",
    });
  }
};

export default function NewCustomer() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const isLoading = navigation.state === "submitting";

  const stateOptions = [
    { label: "Select State", value: "" },
    ...Object.keys(INDIAN_STATES).map(state => ({
      label: state,
      value: state,
    })),
  ];

  const validateGSTINFormat = (gstin: string) => {
    if (!gstin) return true; // Optional field
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
  };

  const isGSTINValid = validateGSTINFormat(gstin);

  return (
    <Page>
      <TitleBar title="Add New Customer" />
      <Layout>
        <Layout.Section variant="twoThirds">
          <Form method="post">
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

              {/* Basic Information */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    👤 Basic Information
                  </Text>
                  
                  <InlineStack gap="400">
                    <TextField
                      label="Full Name"
                      value={name}
                      onChange={setName}
                      name="name"
                      placeholder="Enter customer's full name"
                      autoComplete="name"
                      requiredIndicator
                    />
                    <TextField
                      label="Business Name"
                      value={businessName}
                      onChange={setBusinessName}
                      name="businessName"
                      placeholder="Company or business name (optional)"
                      autoComplete="organization"
                    />
                  </InlineStack>

                  <InlineStack gap="400">
                    <TextField
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      name="email"
                      placeholder="customer@example.com"
                      autoComplete="email"
                      requiredIndicator
                    />
                    <TextField
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      name="phone"
                      placeholder="+91 9876543210"
                      autoComplete="tel"
                    />
                  </InlineStack>
                </BlockStack>
              </Card>

              {/* GST Information */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    🇮🇳 GST Information
                  </Text>
                  
                  <TextField
                    label="GSTIN"
                    value={gstin}
                    onChange={setGstin}
                    name="gstin"
                    placeholder="27AABCU9603R1ZX"
                    helpText="15-digit GST Identification Number (optional)"
                    maxLength={15}
                    error={gstin && !isGSTINValid ? "Invalid GSTIN format" : undefined}
                    suffix={
                      gstin && isGSTINValid ? (
                        <Badge tone="success">Valid Format</Badge>
                      ) : undefined
                    }
                  />

                  <Text as="p" variant="bodyMd" tone="subdued">
                    GSTIN is required for B2B transactions and GST compliance. 
                    Leave empty for B2C customers.
                  </Text>
                </BlockStack>
              </Card>

              {/* Address Information */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    📍 Billing Address
                  </Text>

                  <TextField
                    label="Address Line 1"
                    value={addressLine1}
                    onChange={setAddressLine1}
                    name="addressLine1"
                    placeholder="Building number, street name"
                  />

                  <TextField
                    label="Address Line 2"
                    value={addressLine2}
                    onChange={setAddressLine2}
                    name="addressLine2"
                    placeholder="Area, landmark (optional)"
                  />

                  <InlineStack gap="400">
                    <TextField
                      label="City"
                      value={city}
                      onChange={setCity}
                      name="city"
                      placeholder="City"
                    />
                    <Select
                      label="State"
                      options={stateOptions}
                      value={state}
                      onChange={setState}
                      name="state"
                    />
                  </InlineStack>

                  <TextField
                    label="PIN Code"
                    value={pincode}
                    onChange={setPincode}
                    name="pincode"
                    placeholder="400001"
                    type="text"
                    maxLength={6}
                  />
                </BlockStack>
              </Card>

              {/* Action Buttons */}
              <InlineStack gap="300">
                <Button
                  variant="primary"
                  submit
                  loading={isLoading}
                  disabled={!name || !email || (gstin && !isGSTINValid)}
                >
                  Add Customer
                </Button>
                <Button url="/app/customers">
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Form>
        </Layout.Section>

        {/* Preview Sidebar */}
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  👁️ Customer Preview
                </Text>
                
                <Divider />
                
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    {name || "Customer Name"}
                  </Text>
                  {businessName && (
                    <Text as="p" variant="bodySm" tone="subdued">
                      {businessName}
                    </Text>
                  )}
                </BlockStack>

                <Divider />

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Contact Information
                  </Text>
                  <Text as="p" variant="bodySm">
                    📧 {email || "email@example.com"}
                  </Text>
                  {phone && (
                    <Text as="p" variant="bodySm">
                      📱 {phone}
                    </Text>
                  )}
                </BlockStack>

                {gstin && (
                  <>
                    <Divider />
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        GST Information
                      </Text>
                      <InlineStack gap="200">
                        <Text as="p" variant="bodySm">
                          GSTIN: {gstin}
                        </Text>
                        {isGSTINValid && (
                          <Badge tone="success">Valid</Badge>
                        )}
                      </InlineStack>
                    </BlockStack>
                  </>
                )}

                {(addressLine1 || city || state) && (
                  <>
                    <Divider />
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Address
                      </Text>
                      {addressLine1 && (
                        <Text as="p" variant="bodySm">
                          {addressLine1}
                        </Text>
                      )}
                      {addressLine2 && (
                        <Text as="p" variant="bodySm">
                          {addressLine2}
                        </Text>
                      )}
                      {(city || state || pincode) && (
                        <Text as="p" variant="bodySm">
                          {[city, state, pincode].filter(Boolean).join(", ")}
                        </Text>
                      )}
                    </BlockStack>
                  </>
                )}
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  Quick Actions
                </Text>
                <Button url="/app/customers" fullWidth>
                  View All Customers
                </Button>
                <Button url="/app/invoices/new" variant="plain" fullWidth>
                  Create Invoice After Adding
                </Button>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
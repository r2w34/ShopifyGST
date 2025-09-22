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
  Checkbox,
  Banner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  let settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    // Create default settings
    settings = await prisma.appSettings.create({
      data: {
        shop: session.shop,
        companyName: "Your Company Name",
        companyGSTIN: "27AABCU9603R1ZX",
        companyAddress: {
          line1: "123 Business Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        invoicePrefix: "INV",
        invoiceCounter: 1,
        defaultGSTRate: 18,
      },
    });
  }

  return json({ settings, shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const companyName = formData.get("companyName") as string;
  const companyGSTIN = formData.get("companyGSTIN") as string;
  const invoicePrefix = formData.get("invoicePrefix") as string;
  const defaultGSTRate = parseFloat(formData.get("defaultGSTRate") as string);

  const companyAddress = {
    line1: formData.get("addressLine1") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    pincode: formData.get("pincode") as string,
    country: "India",
  };

  try {
    await prisma.appSettings.upsert({
      where: { shop: session.shop },
      update: {
        companyName,
        companyGSTIN,
        companyAddress,
        invoicePrefix,
        defaultGSTRate,
      },
      create: {
        shop: session.shop,
        companyName,
        companyGSTIN,
        companyAddress,
        invoicePrefix,
        defaultGSTRate,
        invoiceCounter: 1,
      },
    });

    return json({ success: true, message: "Settings saved successfully!" });
  } catch (error) {
    return json({ success: false, message: "Failed to save settings" });
  }
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyGSTIN, setCompanyGSTIN] = useState(settings.companyGSTIN);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [defaultGSTRate, setDefaultGSTRate] = useState(settings.defaultGSTRate.toString());
  
  const address = settings.companyAddress as any;
  const [addressLine1, setAddressLine1] = useState(address.line1 || "");
  const [city, setCity] = useState(address.city || "");
  const [state, setState] = useState(address.state || "");
  const [pincode, setPincode] = useState(address.pincode || "");

  const isLoading = navigation.state === "submitting";

  const stateOptions = [
    { label: "Select State", value: "" },
    { label: "Andhra Pradesh", value: "Andhra Pradesh" },
    { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
    { label: "Assam", value: "Assam" },
    { label: "Bihar", value: "Bihar" },
    { label: "Chhattisgarh", value: "Chhattisgarh" },
    { label: "Delhi", value: "Delhi" },
    { label: "Goa", value: "Goa" },
    { label: "Gujarat", value: "Gujarat" },
    { label: "Haryana", value: "Haryana" },
    { label: "Himachal Pradesh", value: "Himachal Pradesh" },
    { label: "Jharkhand", value: "Jharkhand" },
    { label: "Karnataka", value: "Karnataka" },
    { label: "Kerala", value: "Kerala" },
    { label: "Madhya Pradesh", value: "Madhya Pradesh" },
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Manipur", value: "Manipur" },
    { label: "Meghalaya", value: "Meghalaya" },
    { label: "Mizoram", value: "Mizoram" },
    { label: "Nagaland", value: "Nagaland" },
    { label: "Odisha", value: "Odisha" },
    { label: "Punjab", value: "Punjab" },
    { label: "Rajasthan", value: "Rajasthan" },
    { label: "Sikkim", value: "Sikkim" },
    { label: "Tamil Nadu", value: "Tamil Nadu" },
    { label: "Telangana", value: "Telangana" },
    { label: "Tripura", value: "Tripura" },
    { label: "Uttar Pradesh", value: "Uttar Pradesh" },
    { label: "Uttarakhand", value: "Uttarakhand" },
    { label: "West Bengal", value: "West Bengal" },
  ];

  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <Form method="post">
            <BlockStack gap="500">
              {actionData?.message && (
                <Banner
                  title={actionData.success ? "Success" : "Error"}
                  tone={actionData.success ? "success" : "critical"}
                >
                  {actionData.message}
                </Banner>
              )}

              {/* Company Information */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Company Information
                  </Text>
                  <TextField
                    label="Company Name"
                    value={companyName}
                    onChange={setCompanyName}
                    name="companyName"
                    autoComplete="organization"
                  />
                  <TextField
                    label="Company GSTIN"
                    value={companyGSTIN}
                    onChange={setCompanyGSTIN}
                    name="companyGSTIN"
                    helpText="15-digit GST Identification Number"
                  />
                </BlockStack>
              </Card>

              {/* Company Address */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Company Address
                  </Text>
                  <TextField
                    label="Address Line 1"
                    value={addressLine1}
                    onChange={setAddressLine1}
                    name="addressLine1"
                  />
                  <InlineStack gap="400">
                    <TextField
                      label="City"
                      value={city}
                      onChange={setCity}
                      name="city"
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
                    type="text"
                  />
                </BlockStack>
              </Card>

              {/* Invoice Settings */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Invoice Settings
                  </Text>
                  <InlineStack gap="400">
                    <TextField
                      label="Invoice Prefix"
                      value={invoicePrefix}
                      onChange={setInvoicePrefix}
                      name="invoicePrefix"
                      helpText="Prefix for invoice numbers (e.g., INV)"
                    />
                    <TextField
                      label="Default GST Rate (%)"
                      value={defaultGSTRate}
                      onChange={setDefaultGSTRate}
                      name="defaultGSTRate"
                      type="number"
                      min="0"
                      max="28"
                      step="0.01"
                    />
                  </InlineStack>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Next invoice number: {settings.invoicePrefix}{settings.invoiceCounter.toString().padStart(4, '0')}
                  </Text>
                </BlockStack>
              </Card>

              {/* GST Information */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    GST Compliance Information
                  </Text>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      ✅ CGST/SGST calculation for intra-state transactions
                    </Text>
                    <Text as="p" variant="bodyMd">
                      ✅ IGST calculation for inter-state transactions
                    </Text>
                    <Text as="p" variant="bodyMd">
                      ✅ HSN/SAC code support for products
                    </Text>
                    <Text as="p" variant="bodyMd">
                      ✅ Place of supply determination
                    </Text>
                    <Text as="p" variant="bodyMd">
                      ✅ Reverse charge mechanism support
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>

              <InlineStack align="end">
                <Button
                  variant="primary"
                  submit
                  loading={isLoading}
                >
                  Save Settings
                </Button>
              </InlineStack>
            </BlockStack>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
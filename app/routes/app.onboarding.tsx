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
  Checkbox,
  Banner,
  ProgressBar,
  Divider,
  Icon,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import {
  CheckIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";

import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { validateGSTIN } from "../utils/gst.server";
import { INDIAN_STATES, validateGSTINFormat } from "../utils/gst.client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Check if onboarding is already completed
  const settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  if (settings && settings.companyName && settings.companyGSTIN) {
    // Onboarding already completed, redirect to dashboard
    return redirect("/app");
  }

  const url = new URL(request.url);
  const step = parseInt(url.searchParams.get("step") || "1");

  return json({
    shop: session.shop,
    currentStep: Math.max(1, Math.min(4, step)),
    settings: settings || null,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const step = parseInt(formData.get("step") as string);

  try {
    let settings = await prisma.appSettings.findUnique({
      where: { shop: session.shop },
    });

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          shop: session.shop,
          companyName: "",
          companyGSTIN: "",
          companyAddress: {},
          invoicePrefix: "INV",
          invoiceCounter: 1,
          defaultGSTRate: 18,
        },
      });
    }

    switch (step) {
      case 1: {
        // Business Information Step
        const companyName = formData.get("companyName") as string;
        const businessType = formData.get("businessType") as string;
        const companyGSTIN = formData.get("companyGSTIN") as string;

        if (!companyName || !companyGSTIN) {
          return json({ 
            success: false, 
            message: "Company name and GSTIN are required",
            step: 1 
          });
        }

        if (!validateGSTIN(companyGSTIN)) {
          return json({ 
            success: false, 
            message: "Invalid GSTIN format. Please enter a valid 15-digit GSTIN",
            step: 1 
          });
        }

        await prisma.appSettings.update({
          where: { shop: session.shop },
          data: {
            companyName,
            companyGSTIN,
          },
        });

        return json({ success: true, nextStep: 2 });
      }

      case 2: {
        // Address Information Step
        const addressLine1 = formData.get("addressLine1") as string;
        const addressLine2 = formData.get("addressLine2") as string;
        const city = formData.get("city") as string;
        const state = formData.get("state") as string;
        const pincode = formData.get("pincode") as string;
        const country = "India";

        if (!addressLine1 || !city || !state || !pincode) {
          return json({ 
            success: false, 
            message: "All address fields are required",
            step: 2 
          });
        }

        const companyAddress = {
          line1: addressLine1,
          line2: addressLine2 || "",
          city,
          state,
          pincode,
          country,
        };

        await prisma.appSettings.update({
          where: { shop: session.shop },
          data: { companyAddress },
        });

        return json({ success: true, nextStep: 3 });
      }

      case 3: {
        // Invoice Settings Step
        const invoicePrefix = formData.get("invoicePrefix") as string;
        const defaultGSTRate = parseFloat(formData.get("defaultGSTRate") as string);
        const startingNumber = parseInt(formData.get("startingNumber") as string);

        if (!invoicePrefix || isNaN(defaultGSTRate) || isNaN(startingNumber)) {
          return json({ 
            success: false, 
            message: "All invoice settings are required",
            step: 3 
          });
        }

        await prisma.appSettings.update({
          where: { shop: session.shop },
          data: {
            invoicePrefix,
            defaultGSTRate,
            invoiceCounter: startingNumber,
          },
        });

        return json({ success: true, nextStep: 4 });
      }

      case 4: {
        // Final Setup Step
        const emailEnabled = formData.get("emailEnabled") === "on";
        const whatsappEnabled = formData.get("whatsappEnabled") === "on";

        await prisma.appSettings.update({
          where: { shop: session.shop },
          data: {
            emailEnabled,
            whatsappEnabled,
          },
        });

        return json({ success: true, completed: true });
      }

      default:
        return json({ success: false, message: "Invalid step" });
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return json({ 
      success: false, 
      message: "An error occurred. Please try again.",
      step 
    });
  }
};

export default function Onboarding() {
  const { shop, currentStep, settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  const [step, setStep] = useState(currentStep);
  const isLoading = navigation.state === "submitting";

  // Step 1 - Business Information
  const [companyName, setCompanyName] = useState(settings?.companyName || "");
  const [businessType, setBusinessType] = useState("private_limited");
  const [companyGSTIN, setCompanyGSTIN] = useState(settings?.companyGSTIN || "");

  // Step 2 - Address Information
  const address = settings?.companyAddress as any || {};
  const [addressLine1, setAddressLine1] = useState(address.line1 || "");
  const [addressLine2, setAddressLine2] = useState(address.line2 || "");
  const [city, setCity] = useState(address.city || "");
  const [state, setState] = useState(address.state || "");
  const [pincode, setPincode] = useState(address.pincode || "");

  // Step 3 - Invoice Settings
  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoicePrefix || "INV");
  const [defaultGSTRate, setDefaultGSTRate] = useState(settings?.defaultGSTRate?.toString() || "18");
  const [startingNumber, setStartingNumber] = useState(settings?.invoiceCounter?.toString() || "1");

  // Step 4 - Additional Features
  const [emailEnabled, setEmailEnabled] = useState(settings?.emailEnabled || false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings?.whatsappEnabled || false);

  useEffect(() => {
    if (actionData?.success && actionData?.nextStep) {
      setStep(actionData.nextStep);
    } else if (actionData?.success && actionData?.completed) {
      window.location.href = "/app";
    }
  }, [actionData]);

  const businessTypeOptions = [
    { label: "Private Limited Company", value: "private_limited" },
    { label: "Public Limited Company", value: "public_limited" },
    { label: "Partnership Firm", value: "partnership" },
    { label: "Limited Liability Partnership", value: "llp" },
    { label: "Sole Proprietorship", value: "sole_proprietorship" },
    { label: "Hindu Undivided Family", value: "huf" },
    { label: "Trust", value: "trust" },
    { label: "Society", value: "society" },
    { label: "Others", value: "others" },
  ];

  const stateOptions = [
    { label: "Select State", value: "" },
    ...Object.keys(INDIAN_STATES).map(state => ({
      label: state,
      value: state,
    })),
  ];

  const gstRateOptions = [
    { label: "0%", value: "0" },
    { label: "5%", value: "5" },
    { label: "12%", value: "12" },
    { label: "18%", value: "18" },
    { label: "28%", value: "28" },
  ];

  const progressPercentage = (step / 4) * 100;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  🏢 Business Information
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Step 1 of 4
                </Text>
              </InlineStack>
              
              <TextField
                label="Company Name"
                value={companyName}
                onChange={setCompanyName}
                name="companyName"
                placeholder="Enter your registered company name"
                autoComplete="organization"
                requiredIndicator
              />

              <Select
                label="Business Type"
                options={businessTypeOptions}
                value={businessType}
                onChange={setBusinessType}
                name="businessType"
              />

              <TextField
                label="Company GSTIN"
                value={companyGSTIN}
                onChange={setCompanyGSTIN}
                name="companyGSTIN"
                placeholder="27AABCU9603R1ZX"
                helpText="Enter your 15-digit GST Identification Number"
                maxLength={15}
                requiredIndicator
              />

              <Text as="p" variant="bodyMd" tone="subdued">
                This information will be used on all your GST invoices and must match your GST registration details.
              </Text>
            </BlockStack>
          </Card>
        );

      case 2:
        return (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  📍 Business Address
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Step 2 of 4
                </Text>
              </InlineStack>

              <TextField
                label="Address Line 1"
                value={addressLine1}
                onChange={setAddressLine1}
                name="addressLine1"
                placeholder="Building number, street name"
                requiredIndicator
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
                  requiredIndicator
                />
                <Select
                  label="State"
                  options={stateOptions}
                  value={state}
                  onChange={setState}
                  name="state"
                  requiredIndicator
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
                requiredIndicator
              />

              <Text as="p" variant="bodyMd" tone="subdued">
                This address will appear on your invoices and shipping labels.
              </Text>
            </BlockStack>
          </Card>
        );

      case 3:
        return (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  🧾 Invoice Settings
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Step 3 of 4
                </Text>
              </InlineStack>

              <InlineStack gap="400">
                <TextField
                  label="Invoice Prefix"
                  value={invoicePrefix}
                  onChange={setInvoicePrefix}
                  name="invoicePrefix"
                  placeholder="INV"
                  helpText="Prefix for invoice numbers"
                  maxLength={5}
                  requiredIndicator
                />
                <TextField
                  label="Starting Number"
                  value={startingNumber}
                  onChange={setStartingNumber}
                  name="startingNumber"
                  type="number"
                  min="1"
                  placeholder="1"
                  helpText="First invoice number"
                  requiredIndicator
                />
              </InlineStack>

              <Select
                label="Default GST Rate"
                options={gstRateOptions}
                value={defaultGSTRate}
                onChange={setDefaultGSTRate}
                name="defaultGSTRate"
                helpText="Most common GST rate for your products"
                requiredIndicator
              />

              <Card background="bg-surface-info">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Preview
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Your next invoice will be: <strong>{invoicePrefix}{startingNumber.padStart(4, '0')}</strong>
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Default GST rate: <strong>{defaultGSTRate}%</strong>
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
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  ⚙️ Additional Features
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Step 4 of 4
                </Text>
              </InlineStack>

              <Text as="p" variant="bodyMd">
                Enable additional features to enhance your invoice management experience:
              </Text>

              <BlockStack gap="300">
                <Checkbox
                  label="Email Notifications"
                  checked={emailEnabled}
                  onChange={setEmailEnabled}
                  name="emailEnabled"
                  helpText="Send invoice notifications to customers via email"
                />

                <Checkbox
                  label="WhatsApp Notifications"
                  checked={whatsappEnabled}
                  onChange={setWhatsappEnabled}
                  name="whatsappEnabled"
                  helpText="Send invoice notifications to customers via WhatsApp"
                />
              </BlockStack>

              <Card background="bg-surface-success">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    <Icon source={CheckIcon} /> Almost Done!
                  </Text>
                  <Text as="p" variant="bodyMd">
                    You're all set to start creating GST-compliant invoices and managing your shipping labels.
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Page>
      <TitleBar title="Welcome to GST Invoice & Shipping Manager" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Welcome Header */}
            <Card>
              <BlockStack gap="300">
                <Text as="h1" variant="headingLg">
                  🎉 Welcome to GST Invoice & Shipping Manager!
                </Text>
                <Text as="p" variant="bodyMd">
                  Let's set up your account to start creating GST-compliant invoices for your Shopify store: <strong>{shop}</strong>
                </Text>
                <ProgressBar progress={progressPercentage} size="small" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  Progress: {step} of 4 steps completed
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
                  >
                    {step === 4 ? "Complete Setup" : "Next Step"}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Form>

            {/* Help Section */}
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Need Help?
                </Text>
                <Text as="p" variant="bodyMd">
                  If you need assistance with GST registration or have questions about the setup process, 
                  please contact our support team.
                </Text>
                <InlineStack gap="300">
                  <Button url="mailto:support@indigenservices.com" external>
                    Contact Support
                  </Button>
                  <Button url="https://docs.indigenservices.com/gst-guide" external>
                    GST Guide
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
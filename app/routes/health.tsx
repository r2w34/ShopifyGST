import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    app: "GST Invoice & Shipping Manager",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    domain: process.env.SHOPIFY_APP_URL || "localhost",
  });
};
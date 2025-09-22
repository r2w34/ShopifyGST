import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(
    request
  );

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "ORDERS_CREATE":
      console.log("Order created:", payload.id);
      
      // Log the webhook for debugging
      await prisma.webhookLog.create({
        data: {
          shop,
          topic,
          payload: payload as any,
          processed: false,
        },
      });

      // Here you can add logic to:
      // 1. Create a customer record if it doesn't exist
      // 2. Prepare invoice data from the order
      // 3. Send notifications
      
      try {
        // Extract customer information
        const customer = payload.customer;
        if (customer) {
          await prisma.customer.upsert({
            where: { shopifyId: customer.id.toString() },
            update: {
              name: `${customer.first_name} ${customer.last_name}`.trim(),
              email: customer.email,
              phone: customer.phone,
            },
            create: {
              shopifyId: customer.id.toString(),
              name: `${customer.first_name} ${customer.last_name}`.trim(),
              email: customer.email,
              phone: customer.phone,
              addresses: [payload.billing_address, payload.shipping_address].filter(Boolean),
            },
          });
        }

        // Mark webhook as processed
        await prisma.webhookLog.updateMany({
          where: {
            shop,
            topic,
            payload: { path: ["id"], equals: payload.id },
            processed: false,
          },
          data: { processed: true },
        });

      } catch (error) {
        console.error("Error processing order webhook:", error);
        
        // Update webhook log with error
        await prisma.webhookLog.updateMany({
          where: {
            shop,
            topic,
            payload: { path: ["id"], equals: payload.id },
          },
          data: { 
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
      
      break;
    case "APP_UNINSTALLED":
      if (session) {
        await prisma.session.deleteMany({ where: { shop } });
      }
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
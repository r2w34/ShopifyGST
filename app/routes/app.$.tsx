import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  console.log("App catch-all - URL:", request.url);
  console.log("App catch-all - Shop:", shop);
  
  // If no shop parameter, try to extract from host
  if (!shop) {
    const host = url.searchParams.get("host");
    if (host) {
      try {
        const decodedHost = Buffer.from(host, 'base64').toString();
        const shopMatch = decodedHost.match(/admin\.shopify\.com\/store\/(.+)/);
        if (shopMatch) {
          const extractedShop = `${shopMatch[1]}.myshopify.com`;
          console.log("App catch-all - Extracted shop from host:", extractedShop);
          url.searchParams.set("shop", extractedShop);
          return redirect(`/app?${url.searchParams.toString()}`);
        }
      } catch (error) {
        console.log("App catch-all - Error decoding host:", error);
      }
    }
    
    // Redirect to auth login to handle shop extraction
    return redirect(`/auth/login?${url.searchParams.toString()}`);
  }
  
  // Redirect to main app with shop parameter
  return redirect(`/app?${url.searchParams.toString()}`);
};
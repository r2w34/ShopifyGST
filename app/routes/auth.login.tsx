import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { login } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  
  console.log("Auth login - URL:", url.toString());
  console.log("Auth login - All params:", Object.fromEntries(url.searchParams));
  
  // Check if shop parameter is missing
  const shop = url.searchParams.get("shop");
  if (!shop) {
    console.log("No shop parameter found, attempting to extract from referer");
    
    // Try to extract shop from referer or other sources
    const referer = request.headers.get("referer");
    console.log("No shop parameter, referer:", referer);
    
    if (referer) {
      try {
        // Try to extract shop from referer URL parameters
        const refererUrl = new URL(referer);
        const shopFromReferer = refererUrl.searchParams.get("shop");
        
        if (shopFromReferer) {
          console.log("Found shop in referer params, redirecting with shop:", shopFromReferer);
          return redirect(`/auth/login?shop=${encodeURIComponent(shopFromReferer)}`);
        }
        
        // Try to extract from referer domain (for myshopify.com domains)
        const shopFromDomain = referer.match(/https?:\/\/([^.]+)\.myshopify\.com/)?.[1];
        if (shopFromDomain) {
          console.log("Found shop in referer domain, redirecting:", shopFromDomain);
          return redirect(`/auth/login?shop=${encodeURIComponent(shopFromDomain)}.myshopify.com`);
        }
        
        // Try to extract from embedded app context (admin.shopify.com)
        const adminMatch = referer.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
        if (adminMatch && adminMatch[1]) {
          const shopFromAdmin = adminMatch[1];
          console.log("Found shop in admin URL, redirecting:", shopFromAdmin);
          return redirect(`/auth/login?shop=${encodeURIComponent(shopFromAdmin)}.myshopify.com`);
        }
        
        // Try to extract from host parameter in referer
        const hostParam = refererUrl.searchParams.get("host");
        if (hostParam) {
          try {
            const decodedHost = atob(hostParam);
            const hostMatch = decodedHost.match(/admin\.shopify\.com\/store\/([^\/]+)/);
            if (hostMatch && hostMatch[1]) {
              const shopFromHost = hostMatch[1];
              console.log("Found shop in host parameter, redirecting:", shopFromHost);
              return redirect(`/auth/login?shop=${encodeURIComponent(shopFromHost)}.myshopify.com`);
            }
          } catch (error) {
            console.log("Error decoding host parameter:", error);
          }
        }
      } catch (error) {
        console.log("Error parsing referer URL:", error);
      }
    }
    
    // Check for shop in cookies as fallback
    const cookies = request.headers.get("cookie");
    if (cookies) {
      const shopCookie = cookies.match(/shop=([^;]+)/);
      if (shopCookie && shopCookie[1]) {
        const shopFromCookie = decodeURIComponent(shopCookie[1]);
        console.log("Found shop in cookie, redirecting:", shopFromCookie);
        return redirect(`/auth/login?shop=${encodeURIComponent(shopFromCookie)}`);
      }
    }
    
    // If we still can't find the shop, return a helpful error
    console.log("Could not determine shop from any source");
    throw new Response(
      "Shop parameter is required for authentication. Please access this app through your Shopify admin panel.", 
      { 
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );
  }
  
  console.log("Shop parameter found:", shop);
  // The login function will handle shop parameter extraction and validation
  throw await login(request);
};
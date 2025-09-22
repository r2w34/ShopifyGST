import type { LoaderFunctionArgs } from "@remix-run/node";
import { login } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  
  console.log("Auth login - URL:", url.toString());
  console.log("Auth login - All params:", Object.fromEntries(url.searchParams));
  
  // The login function will handle shop parameter extraction and validation
  throw await login(request);
};
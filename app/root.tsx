import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com/" },
  {
    rel: "stylesheet",
    href: "https://cdn.shopify.com/static/fonts/inter/v2/styles.css",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v2/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider
          i18n={{
            Polaris: {
              Avatar: {
                label: "Avatar",
                labelWithInitials: "Avatar with initials {initials}",
              },
              ContextualSaveBar: {
                save: "Save",
                discard: "Discard",
              },
              TextField: {
                characterCount: "{count} characters",
              },
              TopBar: {
                toggleMenuLabel: "Toggle menu",
                SearchField: {
                  clearButtonLabel: "Clear",
                  search: "Search",
                },
              },
              Modal: {
                iFrameTitle: "body markup",
              },
              Frame: {
                skipToContent: "Skip to content",
                navigationLabel: "Navigation",
                Navigation: {
                  closeMobileNavigationLabel: "Close navigation",
                },
              },
            },
          }}
        >
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
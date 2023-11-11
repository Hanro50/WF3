import { Toolbar, Button, ThemeProvider } from "@mui/material";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "@remix-run/react";
import { SWRConfig } from "swr";
import { theme } from "./theme";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  const navigate = useNavigate();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 0 }}>
        <ThemeProvider theme={theme}>
          <SWRConfig
            value={{
              fetcher: (resource, init) =>
                fetch(resource, init).then((res) => res.json()),
            }}
          >
            <Toolbar sx={{ backgroundColor: "blue" }}>
              <Button
                variant="contained"
                style={{ marginRight: 8, width: 100 }}
                onClick={() => {
                  navigate("/proxy");
                }}
              >
                Proxy
              </Button>
              <Button
                variant="contained"
                style={{ marginRight: 8, width: 100 }}
                onClick={() => {
                  navigate("/script");
                }}
              >
                Scripts
              </Button>
              <Button
                variant="contained"
                style={{ marginRight: 8, width: 100 }}
                onClick={() => {
                  navigate("/stats");
                }}
              >
                Stats
              </Button>
            </Toolbar>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
          </SWRConfig>
        </ThemeProvider>

        <LiveReload />
      </body>
    </html>
  );
}

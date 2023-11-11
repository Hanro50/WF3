/* eslint-disable react/jsx-pascal-case */
import { Button, ThemeProvider, SwipeableDrawer, IconButton } from "@mui/material";
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
import { useState } from "react";
import BurgerMenuIcon from "@mui/icons-material/Menu.js";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
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

            <IconButton sx={{ position: "absolute", top: 5, left: 5 }} onClick={() => setOpen(true)}>
              {/**@ts-ignore */}
              <BurgerMenuIcon.default />
            </IconButton>

            <SwipeableDrawer
              sx={{ width: 400,"& button":{
                margin:0.5
              } }}
              open={open} onClose={() => setOpen(false)} onOpen={() => setOpen(true)}
            >
              <Button
                variant="contained"

                onClick={() => {
                  setOpen(false);
                }}
              >
                Close Menu
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/proxy");
                }}
              >
                Proxy
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/script");
                }}
              >
                Scripts
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/stats");
                }}
              >
                Stats
              </Button>


            </SwipeableDrawer>
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

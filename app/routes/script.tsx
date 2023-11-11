import { Container, Typography } from "@mui/material";
import { Outlet } from "@remix-run/react";

export default function Script() {
  return (
    <Container
      sx={{
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography sx={{ color: "black", my: 2 }} variant="h4">
        Scripts
      </Typography>
      <Outlet />
    </Container>
  );
}

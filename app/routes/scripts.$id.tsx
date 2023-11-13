import { Box, Grid } from "@mui/material";
import { Outlet } from "@remix-run/react";

export default function Script() {
  return (
    <Box>
      <Grid container>
        <Grid item xs={4}></Grid>
        <Grid item xs={8}>
          <Outlet />
        </Grid>
      </Grid>
    </Box>
  );
}

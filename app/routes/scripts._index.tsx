import { Box } from "@mui/material";
import useSWR from "swr";

export default function Script() {
  const { data } = useSWR("/api/scripts");

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    ></Box>
  );
}

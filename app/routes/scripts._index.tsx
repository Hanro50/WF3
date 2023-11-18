import { Box, Button } from "@mui/material";
import { useNavigate } from "@remix-run/react";
import useSWR from "swr";
interface scriptData {
  id: string;
  name: string;
  runner: string;
  autoStart: boolean;
  cwd: string;
}
export default function Script() {
  const { data } = useSWR<{ [key: string]: scriptData }>("/api/scripts");
  const navigate = useNavigate();
  if (!data) return <>Loading</>;
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {Object.values(data).map((script) => (
        <Button key={script.id} onClick={() => navigate(`./${script.id}`)}>
          {script.name}
        </Button>
      ))}
      <Button onClick={() => navigate("./new")}>New Script</Button>
    </Box>
  );
}

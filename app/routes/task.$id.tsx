import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useOutletContext, useParams, useRevalidator } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import useSWRImmutable from "swr/immutable";
import Terminal, { TerminalOutput } from "react-terminal-ui";
import Convert from "ansi-to-html";
var convert = new Convert();

type message = "log" | "error" | "system" | "exit";
//@ts-ignore
function HTMLRender(props: { text: string }) {
  return (
    <span dangerouslySetInnerHTML={{ __html: convert.toHtml(props.text) }} />
  );
}

export default function TaskId() {
  const testFunc = useOutletContext();
  const { id } = useParams();
  const { data, mutate } = useSWRImmutable(`/api/activities/${id}`);
  const revalidator = useRevalidator();
  const logInfo = useRef<{ logs: Array<{ data: string; type: message }> }>({
    logs: [],
  });
  let [socket, setSocket] = useState<Socket<any, any>>();

  useEffect(() => {
    if (!data || !revalidator) return;
    logInfo.current.logs = data;
    logInfo.current.logs.push({
      data: "[system]: Connected to server",
      type: "system",
    });
    window.requestAnimationFrame(revalidator.revalidate);
  }, [data, revalidator]);

  useEffect(() => {
    console.log("connecting...");
    let socket = io();
    setSocket(socket);
    mutate();
    return () => {
      console.log("disconnecting...");
      socket.disconnect();
    };
  }, [id, mutate]);

  useEffect(() => {
    if (!socket) return;
    socket.on(
      "log",
      ({ _id, data, type }: { _id: string; data: string; type: message }) => {
        console.log("log", _id, data, type);
        if (_id !== id) return;
        logInfo.current.logs.push({ data, type });
        window.requestAnimationFrame(revalidator.revalidate);

        return;
      },
    );
    return () => {
      if (!socket) return;
      socket.off("log");
    };
  }, [socket, id, revalidator]);
  const [isReady, setReady] = useState(false);
  useEffect(() => {
    setReady(typeof Terminal !== "object");
  }, [id]);
  if (typeof document !== "undefined") {
    const infdata = document.getElementsByClassName(
      "react-terminal-window-buttons",
    );
    for (let i = 0; i < infdata.length; i++) {
      infdata[i].remove();
    }
  }
  function handleTerminate(input: string) {
    console.log(input);
  }
  try {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "100%",
          width: "100%",
        }}
      >
        <Typography variant="h6">{id}</Typography>
        <Box
          sx={{
            margin: 0.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "stretch",
            "& button": { width: "100px", mx: 0.5 },
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              console.log(testFunc);
              if (typeof testFunc == "function") testFunc();
            }}
          >
            Scripts
          </Button>
          <Button variant="outlined">Terminate</Button>
          <Button variant="outlined">Clear</Button>
        </Box>
        {isReady ? (
          <Terminal onInput={handleTerminate} name={`${id}`}>
            {logInfo.current?.logs &&
              logInfo.current.logs.map((log, index) => (
                <TerminalOutput key={index}>
                  <HTMLRender text={log.data} />
                </TerminalOutput>
              ))}
          </Terminal>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    );
  } catch (e) {
    console.log(e);
    return <div>error</div>;
  }
}
/* <Box
       sx={{
         textAlign: "left",
         backgroundColor: "black",
         width: "calc(100% - 32px)",
         padding: 2,
         borderRadius: 5,
         fontFamily: "monospace",
         overflow: "auto",
         flexGrow: 1,
       }}
     >
       
        {logInfo.current.logs.map((log, index) => {
         switch (log.type) {
           case "log":
             return (
               <Box sx={{ color: "white" }} key={index}>
                 {log.data}
               </Box>
             );
           case "error":
             return (
               <Box sx={{ color: "red" }} key={index}>
                 {log.data}
               </Box>
             );
           case "system":
             return (
               <Box sx={{ color: "green", fontWeight: 600 }} key={index}>
                 {log.data}
               </Box>
             );
           case "exit":
             return (
               <Box sx={{ color: "red", fontWeight: 600 }} key={index}>
                 {log.data}
               </Box>
             );
           default:
             return <Box key={index}><pre>{log.data}</pre></Box>;
         }
       })} 
     </Box> */

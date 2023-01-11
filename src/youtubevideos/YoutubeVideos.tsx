import { useCallback, useEffect, useMemo, useState } from "react";
import { getYoutubeTranscript, TranscriptItem } from "../api";
import Button from "../Button";
import Header from "../Header";
import LongformPromptAnswering from "../LongformPromptAnswering";
import Youtube from "react-youtube";
import DefaultLayout from "../DefaultLayout";

function numberToTimestamp(number: number) {
  const hours = Math.floor(number / 3600);
  const minutes = Math.floor((number - hours * 3600) / 60);
  const seconds = Math.floor(number - hours * 3600 - minutes * 60);
  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = seconds.toString().padStart(2, "0");
  return `${hoursString}:${minutesString}:${secondsString}`;
}

function getVideoIDFromURL(url: string) {
  const result =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/im.exec(
      url
    );
  if (!result) {
    return null;
  }
  return result[1];
}

export default function YoutubeVideos() {
  const [url, setUrl] = useState("");
  const [display, setDisplay] = useState(false);
  const id = useMemo(() => getVideoIDFromURL(url), [url]);
  const [status, setStatus] = useState("Ready");
  const [transcript, setTranscript] = useState<TranscriptItem[] | null>(null);
  const transcriptString = useMemo(() => {
    if (transcript) {
      return transcript
        .map((item) => `${numberToTimestamp(item.start)}: ${item.text.trim()}`)
        .join("\n\n");
    } else {
      return null;
    }
  }, [transcript]);
  const load = useCallback(async () => {
    setDisplay(false);
    try {
      setTranscript(await getYoutubeTranscript(url));
      setDisplay(true);
      setStatus("Ready");
    } catch (e) {
      const s = `${e}`;
      console.error(s);
      if (s.toLowerCase().includes("could not retrieve a transcript")) {
        setStatus(
          `Error: Could not retrieve a transcript for this video. Perhaps subtitles are not enabled.`
        );
      } else {
        setStatus(`Error: ${s}`);
      }
    }
  }, [url]);
  useEffect(() => {
    setDisplay(false);
    setStatus("Ready");
    setTranscript(null);
  }, [url]);

  return (
    <DefaultLayout>
      <h1>Youtube Analyzer</h1>
      <div style={{ display: "flex", width: "100%" }}>
        <input
          type="text"
          onChange={(e) => setUrl(e.target.value)}
          value={url}
          style={{ flexGrow: 1 }}
        />
        <Button
          onClick={load}
          background="black"
          foreground="white"
          margin="0 0 0 0.5rem"
        >
          Load
        </Button>
      </div>
      {display &&
        (id == null ? (
          <p>Invalid URL</p>
        ) : (
          <>
            <Youtube videoId={id} style={{ margin: "1rem auto" }} />
            <p>{status}</p>
            {transcriptString && (
              <LongformPromptAnswering
                markdown={transcriptString}
                title="YouTube video"
                independentSectionCompletionPromptId="63b0b33434d618952bdb606e"
                compileCompletionsPromptId="63b0b4ad34d618952bdb606f"
              />
            )}
          </>
        ))}
    </DefaultLayout>
  );
}

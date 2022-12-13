import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Header from "../Header";
import usePrompt from "../usePrompt";

class Rapper {
  private stopped = false;
  private flattenedLines = [] as string[];
  public voice: SpeechSynthesisVoice = speechSynthesis.getVoices()[0];
  constructor(public readonly verses: { name: string; lines: string[] }[]) {
    for (const verse of this.verses) {
      this.flattenedLines.push(...verse.lines);
    }
  }

  rap() {
    this.stopped = false;
    const _this = this;

    function speakUtterance(index: number) {
      if (index === _this.flattenedLines.length) {
        return;
      }
      const utterance = new SpeechSynthesisUtterance(
        _this.flattenedLines[index]
      );
      utterance.voice = _this.voice;
      utterance.rate = 0.8;
      utterance.addEventListener("end", () => {
        if (!_this.stopped) {
          speakUtterance(index + 1);
        }
      });
      speechSynthesis.speak(utterance);
    }

    speakUtterance(0);
  }

  cancel() {
    this.stopped = true;
    speechSynthesis.cancel();
  }
}

export default function Rap() {
  const [topic, setTopic] = useState("");

  const { completion: rap, retry } = usePrompt(
    "6398036a24d924a971052877",
    topic.length > 0 ? { topic } : null
  );

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => setTopic(e.target.value),
    []
  );
  const verses = useMemo(() => {
    if (!rap) {
      return null;
    }

    const lines = ("Verse 1:\n" + rap).split("\n");
    const verses = [];
    let verse = { name: "<start>", lines: [] as string[] };

    for (const line of lines) {
      if (line.endsWith(":")) {
        if (verse.name !== "<start>") {
          verses.push(verse);
        }
        verse = {
          name: line.slice(0, line.length - 1),
          lines: [],
        };
      } else {
        if (line.trim()) {
          verse.lines.push(line);
        }
      }
    }

    verses.push(verse);

    return verses;
  }, [rap]);

  const rapperRef = useRef<Rapper | null>();
  const [rapping, setRapping] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVoices(speechSynthesis.getVoices());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Any time the verses change, we are no longer rapping
    setRapping(false);
    rapperRef.current?.cancel();
    if (verses) {
      rapperRef.current = new Rapper(verses);
    } else {
      rapperRef.current = null;
    }
  }, [verses]);

  const [voiceIndex, setVoiceIndex] = useState(0);

  const selectedVoice = voices[voiceIndex];
  useEffect(() => {
    if (rapperRef.current) {
      rapperRef.current.voice = selectedVoice;
    }
  }, [selectedVoice]);

  const startRapping = useCallback(() => {
    if (rapperRef.current) {
      rapperRef.current.rap();
      rapperRef.current.voice = selectedVoice;
      setRapping(true);
    }
  }, [selectedVoice]);

  const stopRapping = useCallback(() => {
    if (rapperRef.current) {
      rapperRef.current.cancel();
      setRapping(false);
    }
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        width: "calc(min(100vw, max(60vw, 40rem)))",
        margin: "0 auto",
      }}
    >
      <Header>Generate a Hip-Hop Rap</Header>
      <p>Write a hip-hop rap about...</p>
      <input type="text" onChange={onChange} value={topic} />
      {verses !== null ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "0.5rem",
            }}
          >
            <button onClick={retry}>Retry</button>
            <select
              onChange={(e) => setVoiceIndex(Number(e.target.value))}
              value={voiceIndex}
              style={{ margin: "0 0.5rem" }}
            >
              {voices.map((voice, index) => (
                <option key={voice.name} value={index}>
                  {voice.name}
                </option>
              ))}
            </select>
            {!rapping ? (
              <button onClick={startRapping}>Listen</button>
            ) : (
              <button onClick={stopRapping}>Cancel</button>
            )}
          </div>
          {/* <div style={{ width: "fit-content", marginTop: "0.5rem" }}></div> */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {verses.map((verse, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "1rem",
                }}
              >
                <h2>{verse.name}</h2>
                {verse.lines.map((line, index) => (
                  <p style={{ marginTop: 0 }} key={index}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : topic ? (
        <p>Generating...</p>
      ) : (
        <p>Type a topic above and the rap will show up here.</p>
      )}
    </div>
  );
}

import { createContext, ReactNode, useCallback, useState } from "react";

export type RWEvent =
  | {
      type: "search";
      query: string;
      content: string;
    }
  | {
      type: "completion";
      content: string;
      cursor: number;
      completion: string;
    }
  | {
      type: "drag";
      url: string;
      title: string;
      snippet: string;
      content: string;
      cursor: number;
    }
  | {
      type: "error";
      error: string;
      data: any;
    };

export type DatedRWEvent = RWEvent & { ts: number };

export const EventLoggingContext = createContext({
  history: [] as DatedRWEvent[],
  logEvent: (event: RWEvent) => {
    console.warn("logEvent called, but no logEvent function was provided.");
  },
  logError: (error: Error | any) => {
    console.warn("logError called, but no logError function was provided.");
  },
});

export default function EventLoggingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [history, setHistory] = useState<DatedRWEvent[]>([]);
  const logEvent = useCallback((event: RWEvent) => {
    setHistory((history) => [...history, { ...event, ts: Date.now() }]);
  }, []);
  const logError = useCallback(
    (error: Error | any) => {
      console.error(error);
      try {
        if (error instanceof Error) {
          logEvent({
            type: "error",
            error: error.message,
            data: {
              name: error.name,
              stack: error.stack,
              message: error.message,
              cause: error.cause,
            },
          });
        } else {
          if (error.constructor) {
            logEvent({
              type: "error",
              error: `Unanticipated error of type ${error.constructor.name}`,
              data: error,
            });
            return;
          } else {
            logEvent({
              type: "error",
              error: "Unanticipated error of unknown type.",
              data: error,
            });
            return;
          }
        }
      } catch (e) {
        console.error("Error when logging error:", e);
      }
    },
    [logEvent]
  );

  return (
    <EventLoggingContext.Provider value={{ history, logEvent, logError }}>
      {children}
    </EventLoggingContext.Provider>
  );
}

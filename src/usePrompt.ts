import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

/*
Use this as a hook. If you're not ready to make the request, then pass null for
the variables. Otherwise, pass an object with the variables you want to use.
*/
export default function usePrompt(promptId: string, variables: any) {
  const [completion, setCompletion] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const mostRecentRequestTimestamp = useRef(0);
  const [forceRetryCounter, setForceRetryCounter] = useState(0);

  // Use this because a new "variables" object will probably be created every
  // time the component renders, and we don't want to treat those as changes.
  const variablesSerialized = variables ? JSON.stringify(variables) : null;

  useEffect(() => {
    setCompletion(null);
    const timestamp = Date.now();
    mostRecentRequestTimestamp.current = timestamp;

    if (variablesSerialized === null) {
      return;
    }

    const variables = JSON.parse(variablesSerialized);

    setPending(true);
    const timeout = setTimeout(() => {
      api("generate_for_prompt", {
        prompt_id: promptId,
        variables,
      })
        .then(({ completion }) => {
          if (mostRecentRequestTimestamp.current === timestamp) {
            setCompletion(completion);
            setPending(false);
          } else {
            console.warn("Ignoring response for old request");
          }
        })
        .catch((e) => {
          console.error(e);
          setPending(false);
        });
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [promptId, variablesSerialized, forceRetryCounter]);

  // This will cause the effect to run again, which will cause a new request to
  // be made.
  const retry = useCallback(() => setForceRetryCounter((c) => c + 1), []);

  return { completion, pending, retry };
}

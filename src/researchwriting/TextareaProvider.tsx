import { createContext, ReactNode, useState } from "react";

export const TextareaContext = createContext({
  content: "",
  cursor: 0,
  setContent: (content: string) => {},
  setCursor: (cursor: number) => {},
});

/**
 * This is used to publish the content of the textarea to the rest of the app.
 */
export default function TextareaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [content, setContent] = useState("");
  const [cursor, setCursor] = useState(0);

  return (
    <TextareaContext.Provider
      value={{ content, cursor, setContent, setCursor }}
    >
      {children}
    </TextareaContext.Provider>
  );
}

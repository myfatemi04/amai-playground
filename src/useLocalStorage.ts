import { useEffect, useState } from "react";

export default function useLocalStorage(key: string) {
  const [value, setValue] = useState<string | null>(localStorage.getItem(key));

  useEffect(() => {
    window.addEventListener("storage", (e) => {
      if (e.key === key) {
        setValue(e.newValue);
      }
    });
  }, [key]);

  return value;
}

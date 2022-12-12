import { useEffect, useState } from "react";

export default function useScrollHeight(textarea: HTMLTextAreaElement | null) {
  const [scrollHeight, setScrollHeight] = useState(0);
  useEffect(() => {
    if (!textarea) {
      return;
    }

    const onScroll = () => {
      setScrollHeight(textarea.scrollTop);
    };

    textarea.addEventListener("scroll", onScroll);
    textarea.addEventListener("change", onScroll);

    return () => {
      textarea.removeEventListener("scroll", onScroll);
      textarea.removeEventListener("change", onScroll);
    };
  }, [textarea]);

  return scrollHeight;
}

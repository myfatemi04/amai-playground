function nextChunk(
  text: string,
  minChunkSize: number,
  maxChunkSize: number,
  breakWordIfLongerThan = maxChunkSize
) {
  let chunk: string;

  if (text.length <= maxChunkSize) {
    return [text, ""];
  }

  // maxChunkSize + minChunkSize > text.length > maxChunkSize
  if (text.length - maxChunkSize < minChunkSize) {
    // Distribute remaining text evently between last 2 chunks
    chunk = text.slice(0, maxChunkSize / 2);
  } else {
    chunk = text.slice(0, maxChunkSize);
  }

  // Avoid breaking words
  let lastWordEnd = chunk.lastIndexOf(" ");
  if (lastWordEnd === -1) {
    return [chunk, text.slice(chunk.length)];
  }

  let currentWordLength = chunk.length - lastWordEnd;
  if (currentWordLength < breakWordIfLongerThan) {
    chunk = chunk.slice(0, lastWordEnd + 1);
  }

  console.assert(chunk.length > 0);

  return [chunk, text.slice(chunk.length)];
}

export default function chunkText(
  text: string,
  minChunkSize: number,
  maxChunkSize: number,
  breakWordIfLongerThan = maxChunkSize
) {
  // Avoid breaking words
  let chunks: string[] = [];
  while (text) {
    const [chunk, remaining] = nextChunk(
      text,
      minChunkSize,
      maxChunkSize,
      breakWordIfLongerThan
    );
    chunks.push(chunk);
    text = remaining;
  }
  return chunks;
}

function nextChunk(
  text: string,
  chunkSize: number,
  breakWordIfLongerThan = chunkSize
) {
  let chunk = text.slice(0, chunkSize);

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
  chunkSize: number,
  breakWordIfLongerThan = chunkSize
) {
  // Avoid breaking words
  let chunks: string[] = [];
  while (text) {
    const [chunk, remaining] = nextChunk(
      text,
      chunkSize,
      breakWordIfLongerThan
    );
    chunks.push(chunk);
    text = remaining;
  }
  return chunks;
}

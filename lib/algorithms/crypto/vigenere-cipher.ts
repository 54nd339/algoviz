import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { CipherStep } from "./types";

export const vigenereMeta: AlgorithmMeta = {
  id: "vigenere",
  name: "Vigenere Cipher",
  category: "crypto",
  description:
    "A polyalphabetic substitution cipher using a keyword. Each letter of the keyword determines the shift for the corresponding plaintext letter, making simple frequency analysis ineffective.",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `for each char c in plaintext:
  if c is letter:
    keyChar = keyword[i % keyword.length]
    shift = keyChar - 'A'
    cipher += (c + shift) mod 26
    i++
  else:
    cipher += c`,
  presets: [
    {
      name: "Classic (key=LEMON)",
      generator: () => ({
        plaintext: "ATTACK AT DAWN",
        keyword: "LEMON",
        mode: "encrypt" as const,
      }),
      expectedCase: "average",
    },
    {
      name: "Short key (KEY)",
      generator: () => ({
        plaintext: "HELLO WORLD",
        keyword: "KEY",
        mode: "encrypt" as const,
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(vigenereMeta);

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function* vigenereCipher(input: {
  plaintext: string;
  keyword: string;
  mode: "encrypt" | "decrypt";
}): AlgorithmGenerator<CipherStep> {
  const { plaintext, keyword, mode } = input;
  const text = plaintext.toUpperCase();
  const key = keyword.toUpperCase();
  const decrypt = mode === "decrypt";
  let result = "";
  let keyIdx = 0;

  const mapping = ALPHA.split("").map((c) => ({ plain: c, cipher: c }));

  yield {
    type: "init",
    data: {
      plaintext: text,
      ciphertext: "",
      currentIndex: -1,
      key: keyword,
      alphabetMapping: mapping,
      mode,
      algorithm: "vigenere",
    },
    description: `Vigenere cipher: ${mode}, keyword="${keyword}"`,
    codeLine: 1,
    variables: { keyword, mode, length: text.length },
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const ci = ALPHA.indexOf(c);

    if (ci === -1) {
      result += c;
      yield {
        type: "shift",
        data: {
          plaintext: text,
          ciphertext: result,
          currentIndex: i,
          key: keyword,
          alphabetMapping: mapping,
          mode,
          algorithm: "vigenere",
          currentKeyChar: "—",
        },
        description: `'${c}' (non-alpha) → kept`,
        codeLine: 7,
        variables: { char: c, index: i },
      };
      continue;
    }

    const keyChar = key[keyIdx % key.length];
    const shift = ALPHA.indexOf(keyChar);
    const newIdx = decrypt
      ? (((ci - shift) % 26) + 26) % 26
      : (ci + shift) % 26;
    const shifted = ALPHA[newIdx];
    result += shifted;
    keyIdx++;

    const currentMapping = ALPHA.split("").map((ch) => {
      const idx = ALPHA.indexOf(ch);
      const mappedIdx = decrypt
        ? (((idx - shift) % 26) + 26) % 26
        : (idx + shift) % 26;
      return { plain: ch, cipher: ALPHA[mappedIdx] };
    });

    yield {
      type: "shift",
      data: {
        plaintext: text,
        ciphertext: result,
        currentIndex: i,
        key: keyword,
        alphabetMapping: currentMapping,
        mode,
        algorithm: "vigenere",
        currentKeyChar: keyChar,
      },
      description: `'${c}' + key '${keyChar}' (shift=${shift}) → '${shifted}'`,
      codeLine: 4,
      variables: { char: c, keyChar, shift, shifted, keyIndex: keyIdx - 1 },
    };
  }

  yield {
    type: "done",
    data: {
      plaintext: text,
      ciphertext: result,
      currentIndex: text.length,
      key: keyword,
      alphabetMapping: mapping,
      mode,
      algorithm: "vigenere",
    },
    description: `Vigenere ${mode} complete: "${result}"`,
    codeLine: 8,
    variables: { result },
  };
}

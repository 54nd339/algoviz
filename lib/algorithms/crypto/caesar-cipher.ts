import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { CipherStep } from "./types";

export const caesarMeta: AlgorithmMeta = {
  id: "caesar",
  name: "Caesar Cipher",
  category: "crypto",
  description:
    "One of the simplest substitution ciphers: each letter is shifted by a fixed amount in the alphabet. Named after Julius Caesar who used a shift of 3.",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `for each char c in plaintext:
  if c is letter:
    shifted = (c - 'A' + key) mod 26
    cipher += chr(shifted + 'A')
  else:
    cipher += c`,
  presets: [
    {
      name: "Classic (shift=3)",
      generator: () => ({
        plaintext: "HELLO WORLD",
        key: 3,
        mode: "encrypt" as const,
      }),
      expectedCase: "average",
    },
    {
      name: "ROT13 (shift=13)",
      generator: () => ({
        plaintext: "THE QUICK BROWN FOX",
        key: 13,
        mode: "encrypt" as const,
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(caesarMeta);

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shiftChar(c: string, shift: number, decrypt: boolean): string {
  const upper = c.toUpperCase();
  const idx = ALPHA.indexOf(upper);
  if (idx === -1) return c;
  const s = decrypt ? -shift : shift;
  const newIdx = (((idx + s) % 26) + 26) % 26;
  return c === upper ? ALPHA[newIdx] : ALPHA[newIdx].toLowerCase();
}

export function* caesarCipher(input: {
  plaintext: string;
  key: number;
  mode: "encrypt" | "decrypt";
}): AlgorithmGenerator<CipherStep> {
  const { plaintext, key, mode } = input;
  const text = plaintext.toUpperCase();
  let result = "";
  const decrypt = mode === "decrypt";

  const mapping = ALPHA.split("").map((c) => ({
    plain: c,
    cipher: shiftChar(c, key, false),
  }));

  yield {
    type: "init",
    data: {
      plaintext: text,
      ciphertext: "",
      currentIndex: -1,
      key,
      alphabetMapping: mapping,
      mode,
      algorithm: "caesar",
    },
    description: `Caesar cipher: ${mode}, shift=${key}`,
    codeLine: 1,
    variables: { key, mode, length: text.length },
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const shifted = shiftChar(c, key, decrypt);
    result += shifted;

    yield {
      type: "shift",
      data: {
        plaintext: text,
        ciphertext: result,
        currentIndex: i,
        key,
        alphabetMapping: mapping,
        mode,
        algorithm: "caesar",
      },
      description: ALPHA.includes(c)
        ? `'${c}' → shift ${decrypt ? "back" : ""} by ${key} → '${shifted}'`
        : `'${c}' (non-alpha) → '${shifted}'`,
      codeLine: 3,
      variables: { char: c, shifted, index: i },
    };
  }

  yield {
    type: "done",
    data: {
      plaintext: text,
      ciphertext: result,
      currentIndex: text.length,
      key,
      alphabetMapping: mapping,
      mode,
      algorithm: "caesar",
    },
    description: `Caesar ${mode} complete: "${result}"`,
    codeLine: 6,
    variables: { result },
  };
}

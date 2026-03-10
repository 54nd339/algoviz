export { caesarCipher, caesarMeta } from "./caesar-cipher";
export { diffieHellman, diffieHellmanMeta } from "./diffie-hellman";
export { hashAvalanche, hashAvalancheMeta } from "./hash-avalanche";
export type {
  CipherStep,
  CryptoType,
  DiffieHellmanStep,
  HashStep,
} from "./types";
export { vigenereCipher, vigenereMeta } from "./vigenere-cipher";

import type { AlgorithmStep } from "@/types";

import { caesarCipher } from "./caesar-cipher";
import { diffieHellman } from "./diffie-hellman";
import { hashAvalanche } from "./hash-avalanche";
import type { CipherStep, DiffieHellmanStep, HashStep } from "./types";
import { vigenereCipher } from "./vigenere-cipher";

type CryptoStep = DiffieHellmanStep | CipherStep | HashStep;

export const CRYPTO_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<CryptoStep>, void, undefined>
> = {
  "diffie-hellman": (input) =>
    diffieHellman(input as Parameters<typeof diffieHellman>[0]),
  caesar: (input) => caesarCipher(input as Parameters<typeof caesarCipher>[0]),
  vigenere: (input) =>
    vigenereCipher(input as Parameters<typeof vigenereCipher>[0]),
  "hash-avalanche": (input) =>
    hashAvalanche(input as Parameters<typeof hashAvalanche>[0]),
};

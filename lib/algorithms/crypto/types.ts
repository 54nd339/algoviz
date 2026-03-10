export interface DiffieHellmanStep {
  phase: "setup" | "private" | "public" | "exchange" | "shared" | "done";
  p: number;
  g: number;
  alice: { private?: number; public?: number; shared?: number };
  bob: { private?: number; public?: number; shared?: number };
  message: string;
  formula?: string;
}

export interface CipherStep {
  plaintext: string;
  ciphertext: string;
  currentIndex: number;
  key: number | string;
  alphabetMapping: { plain: string; cipher: string }[];
  mode: "encrypt" | "decrypt";
  algorithm: "caesar" | "vigenere";
  currentKeyChar?: string;
}

export interface HashStep {
  inputA: string;
  inputB: string;
  hashA: string;
  hashB: string;
  binaryA: string;
  binaryB: string;
  differingBits: number[];
  totalBits: number;
  changePercentage: number;
  currentChar: number;
  changedChar: string;
}

export type CryptoType =
  | "diffie-hellman"
  | "caesar"
  | "vigenere"
  | "hash-avalanche";

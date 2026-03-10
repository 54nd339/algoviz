import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DiffieHellmanStep } from "./types";

export const diffieHellmanMeta: AlgorithmMeta = {
  id: "diffie-hellman",
  name: "Diffie-Hellman Key Exchange",
  category: "crypto",
  description:
    "Allows two parties to establish a shared secret over an insecure channel. Each party generates a private key, computes a public key, and exchanges it. Both arrive at the same shared secret without ever transmitting it.",
  timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)" },
  spaceComplexity: "O(1)",
  pseudocode: `Public: p (prime), g (generator)
Alice: a (private), A = g^a mod p
Bob:   b (private), B = g^b mod p
Exchange: Alice sends A, Bob sends B
Alice: s = B^a mod p
Bob:   s = A^b mod p
Both compute same secret s!`,
  presets: [
    {
      name: "Small (p=23, g=5)",
      generator: () => ({ p: 23, g: 5, a: 6, b: 15 }),
      expectedCase: "average",
    },
    {
      name: "Larger (p=97, g=5)",
      generator: () => ({ p: 97, g: 5, a: 36, b: 58 }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(diffieHellmanMeta);

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

export function* diffieHellman(input: {
  p: number;
  g: number;
  a: number;
  b: number;
}): AlgorithmGenerator<DiffieHellmanStep> {
  const { p, g, a, b } = input;

  yield {
    type: "setup",
    data: {
      phase: "setup",
      p,
      g,
      alice: {},
      bob: {},
      message: `Agree on public parameters: p=${p} (prime), g=${g} (generator)`,
      formula: `Public: p=${p}, g=${g}`,
    },
    description: `Setup: public prime p=${p}, generator g=${g}`,
    codeLine: 1,
    variables: { p, g },
  };

  yield {
    type: "private",
    data: {
      phase: "private",
      p,
      g,
      alice: { private: a },
      bob: { private: b },
      message: `Alice picks private key a=${a}, Bob picks private key b=${b}`,
    },
    description: `Private keys chosen: Alice a=${a}, Bob b=${b}`,
    codeLine: 2,
    variables: { a, b },
  };

  const A = modPow(g, a, p);
  const B = modPow(g, b, p);

  yield {
    type: "public",
    data: {
      phase: "public",
      p,
      g,
      alice: { private: a, public: A },
      bob: { private: b, public: B },
      message: `Alice computes A = g^a mod p = ${g}^${a} mod ${p} = ${A}. Bob computes B = g^b mod p = ${g}^${b} mod ${p} = ${B}`,
      formula: `A = ${g}^${a} mod ${p} = ${A}\nB = ${g}^${b} mod ${p} = ${B}`,
    },
    description: `Public keys: A=${A}, B=${B}`,
    codeLine: 3,
    variables: { A, B },
  };

  yield {
    type: "exchange",
    data: {
      phase: "exchange",
      p,
      g,
      alice: { private: a, public: A },
      bob: { private: b, public: B },
      message: `Alice sends A=${A} to Bob. Bob sends B=${B} to Alice. (Over public channel!)`,
    },
    description: `Exchange: Alice → A=${A} → Bob, Bob → B=${B} → Alice`,
    codeLine: 4,
    variables: { sentA: A, sentB: B },
  };

  const sAlice = modPow(B, a, p);
  const sBob = modPow(A, b, p);

  yield {
    type: "shared",
    data: {
      phase: "shared",
      p,
      g,
      alice: { private: a, public: A, shared: sAlice },
      bob: { private: b, public: B, shared: sBob },
      message: `Alice: s = B^a mod p = ${B}^${a} mod ${p} = ${sAlice}. Bob: s = A^b mod p = ${A}^${b} mod ${p} = ${sBob}`,
      formula: `Alice: s = ${B}^${a} mod ${p} = ${sAlice}\nBob:   s = ${A}^${b} mod ${p} = ${sBob}`,
    },
    description: `Shared secret computed: Alice=${sAlice}, Bob=${sBob}`,
    codeLine: 5,
    variables: { sAlice, sBob },
  };

  yield {
    type: "done",
    data: {
      phase: "done",
      p,
      g,
      alice: { private: a, public: A, shared: sAlice },
      bob: { private: b, public: B, shared: sBob },
      message:
        sAlice === sBob
          ? `Both computed the same shared secret: ${sAlice}! Key exchange successful.`
          : `ERROR: secrets don't match (${sAlice} ≠ ${sBob})`,
    },
    description: `Key exchange complete! Shared secret = ${sAlice}`,
    codeLine: 7,
    variables: { sharedSecret: sAlice, match: sAlice === sBob },
  };
}

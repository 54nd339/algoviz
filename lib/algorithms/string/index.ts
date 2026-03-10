export { boyerMoore, boyerMooreMeta } from "./boyer-moore";
export { kmp, kmpMeta } from "./kmp";
export { rabinKarp, rabinKarpMeta } from "./rabin-karp";
export { regexNFA, regexNFAMeta } from "./regex-nfa";
export type {
  NFAState,
  NFATransition,
  RegexNFAStep,
  StringMatchStep,
} from "./types";

import type { AlgorithmStep } from "@/types";

import { boyerMoore } from "./boyer-moore";
import { kmp } from "./kmp";
import { rabinKarp } from "./rabin-karp";
import { regexNFA } from "./regex-nfa";
import type { StringMatchStep } from "./types";
import type { RegexNFAStep } from "./types";

export const STRING_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<StringMatchStep>, void, undefined>
> = {
  kmp: (input) => kmp(input as { text: string; pattern: string }),
  "rabin-karp": (input) =>
    rabinKarp(input as { text: string; pattern: string }),
  "boyer-moore": (input) =>
    boyerMoore(input as { text: string; pattern: string }),
};

export const REGEX_NFA_GENERATOR: (
  input: unknown,
) => Generator<AlgorithmStep<RegexNFAStep>, void, undefined> = (input) =>
  regexNFA(input as { text: string; pattern: string });

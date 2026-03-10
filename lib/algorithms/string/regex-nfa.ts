import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { NFAState, NFATransition, RegexNFAStep } from "./types";

export const regexNFAMeta: AlgorithmMeta = {
  id: "regex-nfa",
  name: "Regex NFA (Thompson's)",
  category: "string",
  description:
    "Builds a Non-deterministic Finite Automaton from a simplified regex (supports literals, |, *, ?, concatenation, and grouping with parentheses) using Thompson's construction, then simulates it on input by tracking the set of active states.",
  timeComplexity: { best: "O(n * m)", average: "O(n * m)", worst: "O(n * m)" },
  spaceComplexity: "O(m)",
  pseudocode: `function thompson(regex):
  parse regex into postfix
  build NFA fragments from postfix
  return combined NFA

function simulate(nfa, input):
  current = epsilonClosure({start})
  for each char in input:
    next = {}
    for each state in current:
      if transition(state, char) exists:
        add target to next
    current = epsilonClosure(next)
  return accepting in current`,
  presets: [
    {
      name: 'a|b matches "a"',
      generator: () => ({ text: "a", pattern: "a|b" }),
      expectedCase: "average",
    },
    {
      name: 'ab* matches "abbb"',
      generator: () => ({ text: "abbb", pattern: "ab*" }),
      expectedCase: "average",
    },
    {
      name: '(ab)*c matches "ababc"',
      generator: () => ({ text: "ababc", pattern: "(ab)*c" }),
      expectedCase: "average",
    },
    {
      name: 'a?b matches "b"',
      generator: () => ({ text: "b", pattern: "a?b" }),
      expectedCase: "average",
    },
    {
      name: '(a|b)*abb matches "aababb"',
      generator: () => ({ text: "aababb", pattern: "(a|b)*abb" }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "NFA simulation is exponential.",
      reality:
        "Thompson's NFA simulation is O(n*m) where n = input length and m = number of NFA states, because we track state sets rather than backtracking.",
    },
  ],
  relatedAlgorithms: ["kmp", "rabin-karp", "boyer-moore"],
};

registerAlgorithm(regexNFAMeta);

// --- NFA building via Thompson's construction ---

interface NFAFragment {
  start: number;
  accept: number;
}

let stateCounter = 0;

function newState(): number {
  return stateCounter++;
}

function addRegexToPostfix(regex: string): string {
  let output = "";
  const ops: string[] = [];
  let i = 0;
  const concats: number[] = [];
  let nAtoms = 0;
  let nAlts = 0;

  while (i < regex.length) {
    const c = regex[i];
    switch (c) {
      case "(":
        if (nAtoms > 1) {
          nAtoms--;
          output += ".";
        }
        concats.push(nAtoms);
        ops.push(String(nAlts));
        nAtoms = 0;
        nAlts = 0;
        i++;
        continue;
      case ")":
        if (nAtoms > 1) {
          nAtoms--;
          output += ".";
        }
        while (nAlts > 0) {
          output += "|";
          nAlts--;
        }
        nAtoms = concats.pop() ?? 0;
        nAlts = Number(ops.pop() ?? "0");
        nAtoms++;
        i++;
        continue;
      case "|":
        if (nAtoms > 1) {
          nAtoms--;
          output += ".";
        }
        nAlts++;
        nAtoms = 0;
        i++;
        continue;
      case "*":
      case "?":
        output += c;
        i++;
        continue;
      default:
        if (nAtoms > 1) {
          nAtoms--;
          output += ".";
        }
        output += c;
        nAtoms++;
        i++;
        continue;
    }
  }

  if (nAtoms > 1) {
    nAtoms--;
    output += ".";
  }
  while (nAlts > 0) {
    output += "|";
    nAlts--;
  }

  return output;
}

function buildNFA(regex: string): {
  states: NFAState[];
  transitions: NFATransition[];
  start: number;
  accept: number;
} {
  stateCounter = 0;
  const postfix = addRegexToPostfix(regex);
  const states: NFAState[] = [];
  const transitions: NFATransition[] = [];
  const stack: NFAFragment[] = [];

  function makeState(accepting: boolean, label?: string): number {
    const id = newState();
    states.push({ id, label, isAccepting: accepting });
    return id;
  }

  function addTransition(
    from: number,
    to: number,
    symbol: string | null,
  ): void {
    transitions.push({ from, to, symbol });
  }

  for (const c of postfix) {
    switch (c) {
      case ".": {
        const f2 = stack.pop()!;
        const f1 = stack.pop()!;
        addTransition(f1.accept, f2.start, null);
        states[f1.accept].isAccepting = false;
        stack.push({ start: f1.start, accept: f2.accept });
        break;
      }
      case "|": {
        const f2 = stack.pop()!;
        const f1 = stack.pop()!;
        const s = makeState(false, "split");
        const a = makeState(true, "join");
        addTransition(s, f1.start, null);
        addTransition(s, f2.start, null);
        states[f1.accept].isAccepting = false;
        states[f2.accept].isAccepting = false;
        addTransition(f1.accept, a, null);
        addTransition(f2.accept, a, null);
        stack.push({ start: s, accept: a });
        break;
      }
      case "*": {
        const f = stack.pop()!;
        const s = makeState(false, "split");
        const a = makeState(true, "accept");
        addTransition(s, f.start, null);
        addTransition(s, a, null);
        states[f.accept].isAccepting = false;
        addTransition(f.accept, s, null);
        stack.push({ start: s, accept: a });
        break;
      }
      case "?": {
        const f = stack.pop()!;
        const s = makeState(false, "split");
        const a = makeState(true, "accept");
        addTransition(s, f.start, null);
        addTransition(s, a, null);
        states[f.accept].isAccepting = false;
        addTransition(f.accept, a, null);
        stack.push({ start: s, accept: a });
        break;
      }
      default: {
        const s = makeState(false, c);
        const a = makeState(true, c);
        addTransition(s, a, c);
        stack.push({ start: s, accept: a });
        break;
      }
    }
  }

  const final = stack.pop()!;
  return { states, transitions, start: final.start, accept: final.accept };
}

function epsilonClosure(
  stateSet: Set<number>,
  transitions: NFATransition[],
): Set<number> {
  const closure = new Set(stateSet);
  const worklist = [...stateSet];
  while (worklist.length > 0) {
    const s = worklist.pop()!;
    for (const t of transitions) {
      if (t.from === s && t.symbol === null && !closure.has(t.to)) {
        closure.add(t.to);
        worklist.push(t.to);
      }
    }
  }
  return closure;
}

function move(
  stateSet: Set<number>,
  symbol: string,
  transitions: NFATransition[],
): Set<number> {
  const result = new Set<number>();
  for (const s of stateSet) {
    for (const t of transitions) {
      if (t.from === s && t.symbol === symbol) {
        result.add(t.to);
      }
    }
  }
  return result;
}

export function* regexNFA(input: {
  text: string;
  pattern: string;
}): AlgorithmGenerator<RegexNFAStep> {
  const { text, pattern } = input;
  const nfa = buildNFA(pattern);

  yield {
    type: "build",
    data: {
      states: nfa.states,
      transitions: nfa.transitions,
      currentStates: [],
      inputIndex: -1,
      input: text,
      pattern,
      accepted: false,
      phase: "build",
      description: `Built NFA with ${nfa.states.length} states for /${pattern}/`,
    },
    description: `Built NFA with ${nfa.states.length} states for pattern /${pattern}/`,
    codeLine: 1,
    variables: {
      numStates: nfa.states.length,
      numTransitions: nfa.transitions.length,
    },
  };

  let current = epsilonClosure(new Set([nfa.start]), nfa.transitions);

  yield {
    type: "epsilon-closure",
    data: {
      states: nfa.states,
      transitions: nfa.transitions,
      currentStates: [...current],
      inputIndex: -1,
      input: text,
      pattern,
      accepted: current.has(nfa.accept),
      phase: "simulate",
      description: `Initial epsilon closure: {${[...current].join(", ")}}`,
    },
    description: `Start: epsilon closure from state ${nfa.start} → {${[...current].join(", ")}}`,
    codeLine: 8,
    variables: { currentStates: [...current] },
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const moved = move(current, ch, nfa.transitions);
    current = epsilonClosure(moved, nfa.transitions);

    const accepted = current.has(nfa.accept);

    yield {
      type: "step",
      data: {
        states: nfa.states,
        transitions: nfa.transitions,
        currentStates: [...current],
        inputIndex: i,
        input: text,
        pattern,
        accepted,
        phase: "simulate",
        description: `Read '${ch}': states → {${[...current].join(", ")}}`,
      },
      description:
        current.size > 0
          ? `Read '${ch}' (index ${i}): move+closure → {${[...current].join(", ")}}${accepted ? " [ACCEPTING]" : ""}`
          : `Read '${ch}' (index ${i}): no reachable states — input rejected`,
      codeLine: 11,
      variables: { char: ch, index: i, states: [...current], accepted },
    };

    if (current.size === 0) break;
  }

  const finalAccepted = current.has(nfa.accept);

  yield {
    type: "done",
    data: {
      states: nfa.states,
      transitions: nfa.transitions,
      currentStates: [...current],
      inputIndex: text.length,
      input: text,
      pattern,
      accepted: finalAccepted,
      phase: "simulate",
      description: finalAccepted ? "Input accepted!" : "Input rejected.",
    },
    description: finalAccepted
      ? `Input "${text}" is accepted by /${pattern}/`
      : `Input "${text}" is rejected by /${pattern}/`,
    codeLine: 14,
    variables: { accepted: finalAccepted, finalStates: [...current] },
  };
}

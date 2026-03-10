export function getTableLabel(algorithmId?: string): {
  title: string;
  description: string;
} {
  switch (algorithmId) {
    case "kmp":
      return {
        title: "Failure Function",
        description:
          "failure[i] = length of longest proper prefix of pattern[0..i] that is also a suffix",
      };
    case "boyer-moore":
      return {
        title: "Bad Character Table",
        description:
          "Maps each character in the pattern to its last occurrence index",
      };
    case "rabin-karp":
      return {
        title: "Hash Values",
        description:
          "Rolling hash of the current text window compared to the pattern hash",
      };
    default:
      return { title: "Auxiliary Table", description: "" };
  }
}

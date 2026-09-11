export type DiffChangeType = 'added' | 'removed' | 'unchanged';

export interface DiffLine {
  type: DiffChangeType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  similarity: number; // 0 - 100%
  metricsCount: number;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: DiffStats;
}

/**
 * Compute line-by-line diff between two strings using Longest Common Subsequence (LCS).
 */
export function computeLineDiff(textA: string, textB: string): DiffResult {
  const linesA = textA.split(/\r?\n/);
  const linesB = textB.split(/\r?\n/);

  const n = linesA.length;
  const m = linesB.length;

  // LCS Matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to assemble diff lines
  const resultLines: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      resultLines.unshift({
        type: 'unchanged',
        content: linesA[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      resultLines.unshift({
        type: 'added',
        content: linesB[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      resultLines.unshift({
        type: 'removed',
        content: linesA[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  // Calculate statistics
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  let metricsCount = 0;

  // Regex to detect numbers/metrics like $1.2M, 40%, 10k, 250ms, 99.99%
  const metricRegex = /(?:\b\$\d+(?:\.\d+)?[kKmMbB]?|\b\d+(?:\.\d+)?%|\b\d+[kKmMbB]\b|\b\d+\+?(?:\s*(?:ms|sec|min|users|requests|req\/s|tps))\b)/g;

  resultLines.forEach((line) => {
    if (line.type === 'added') {
      additions++;
      const metrics = line.content.match(metricRegex);
      if (metrics) metricsCount += metrics.length;
    } else if (line.type === 'removed') {
      deletions++;
    } else {
      unchanged++;
    }
  });

  const totalLines = additions + deletions + unchanged;
  const similarity = totalLines > 0 ? Math.round((unchanged / (unchanged + Math.max(additions, deletions))) * 100) : 100;

  return {
    lines: resultLines,
    stats: {
      additions,
      deletions,
      unchanged,
      similarity,
      metricsCount,
    },
  };
}

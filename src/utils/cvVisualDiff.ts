import { CVData, ExperienceItem, SkillCategory } from '../types/cv';
import { DiffStats } from './diffUtils';

export function countMetrics(text: string): number {
  if (!text) return 0;
  const regex = /(?:\b\$\d+(?:\.\d+)?[kKmMbB]?|\b\d+(?:\.\d+)?%|\b\d+[kKmMbB]\b|\b\d+\+?(?:\s*(?:ms|sec|min|users|requests|req\/s|tps))\b)/g;
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Tokenizes text into words and delimiters (punctuation, whitespace) for granular diffing
 */
function tokenizeWords(text: string): string[] {
  if (!text) return [];
  // Match words or sequences of non-word whitespace/punctuation
  return text.match(/[\p{L}\p{N}_\-]+|[^\p{L}\p{N}_\-\s]+|\s+/gu) || [];
}

/**
 * Word-level diff using Longest Common Subsequence (LCS)
 */
export function diffWords(
  textA: string,
  textB: string
): { textAWithDiff: string; textBWithDiff: string; addedWords: number; removedWords: number } {
  if (!textA && !textB) return { textAWithDiff: '', textBWithDiff: '', addedWords: 0, removedWords: 0 };
  if (!textA) return { textAWithDiff: '', textBWithDiff: `<mark class="cv-diff-add">${textB}</mark>`, addedWords: textB.split(/\s+/).length, removedWords: 0 };
  if (!textB) return { textAWithDiff: `<mark class="cv-diff-del">${textA}</mark>`, textBWithDiff: '', addedWords: 0, removedWords: textA.split(/\s+/).length };
  if (textA.trim() === textB.trim()) return { textAWithDiff: textA, textBWithDiff: textB, addedWords: 0, removedWords: 0 };

  const tokensA = tokenizeWords(textA);
  const tokensB = tokenizeWords(textB);

  const n = tokensA.length;
  const m = tokensB.length;

  // LCS Matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (tokensA[i - 1] === tokensB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const resultA: string[] = [];
  const resultB: string[] = [];

  let i = n;
  let j = m;
  let addedWords = 0;
  let removedWords = 0;

  let currentAddChunk: string[] = [];
  let currentDelChunk: string[] = [];

  const flushAdd = () => {
    if (currentAddChunk.length > 0) {
      resultB.unshift(`<mark class="cv-diff-add">${currentAddChunk.join('')}</mark>`);
      currentAddChunk = [];
    }
  };

  const flushDel = () => {
    if (currentDelChunk.length > 0) {
      resultA.unshift(`<mark class="cv-diff-del">${currentDelChunk.join('')}</mark>`);
      currentDelChunk = [];
    }
  };

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
      flushAdd();
      flushDel();
      resultA.unshift(tokensA[i - 1]);
      resultB.unshift(tokensB[j - 1]);
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      if (/\S/.test(tokensB[j - 1])) addedWords++;
      currentAddChunk.unshift(tokensB[j - 1]);
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      if (/\S/.test(tokensA[i - 1])) removedWords++;
      currentDelChunk.unshift(tokensA[i - 1]);
      i--;
    }
  }

  flushAdd();
  flushDel();

  return {
    textAWithDiff: resultA.join(''),
    textBWithDiff: resultB.join(''),
    addedWords,
    removedWords,
  };
}

/**
 * Calculates string similarity coefficient (0 to 1) based on character bigrams (Dice coefficient)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0;

  const bigrams1 = new Set<string>();
  for (let i = 0; i < s1.length - 1; i++) {
    bigrams1.add(s1.substring(i, i + 2));
  }

  let intersection = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bi = s2.substring(i, i + 2);
    if (bigrams1.has(bi)) intersection++;
  }

  return (2.0 * intersection) / (s1.length - 1 + s2.length - 1);
}

export interface VisualCvDiffResult {
  dataAWithDiff: CVData;
  dataBWithDiff: CVData;
  stats: DiffStats;
}

/**
 * Computes deep visual diff between two CVData structures.
 * Injects non-breaking HTML highlight tags for marked/EditableText rendering.
 */
export function computeVisualCvDiff(dataA: CVData, dataB: CVData): VisualCvDiffResult {
  let totalAdditions = 0;
  let totalDeletions = 0;
  let totalUnchanged = 0;
  let metricsCount = 0;

  // 1. Title Diff
  const titleA = dataA.title || '';
  const titleB = dataB.title || '';
  let finalTitleA = titleA;
  let finalTitleB = titleB;

  if (titleA.trim() !== titleB.trim()) {
    const titleDiff = diffWords(titleA, titleB);
    finalTitleA = titleDiff.textAWithDiff;
    finalTitleB = titleDiff.textBWithDiff;
    totalAdditions += titleDiff.addedWords;
    totalDeletions += titleDiff.removedWords;
  } else {
    totalUnchanged += titleA.split(/\s+/).filter(Boolean).length;
  }

  // 2. Summary Diff
  const sumA = dataA.summary || '';
  const sumB = dataB.summary || '';
  let finalSummaryA = sumA;
  let finalSummaryB = sumB;

  if (sumA.trim() !== sumB.trim()) {
    const sumDiff = diffWords(sumA, sumB);
    finalSummaryA = sumDiff.textAWithDiff;
    finalSummaryB = sumDiff.textBWithDiff;
    totalAdditions += sumDiff.addedWords;
    totalDeletions += sumDiff.removedWords;

    const addedMetrics = countMetrics(finalSummaryB);
    metricsCount += addedMetrics;
  } else {
    totalUnchanged += sumA.split(/\s+/).filter(Boolean).length;
  }

  // 3. Experience & Projects Diff Helper
  const diffItemList = (itemsA: ExperienceItem[] = [], itemsB: ExperienceItem[] = []): { itemsAOut: ExperienceItem[]; itemsBOut: ExperienceItem[] } => {
    const itemsAOut: ExperienceItem[] = [];
    const itemsBOut: ExperienceItem[] = [];

    const maxLen = Math.max(itemsA.length, itemsB.length);

    for (let i = 0; i < maxLen; i++) {
      const itemA = itemsA[i];
      const itemB = itemsB[i];

      if (!itemA && itemB) {
        // Completely new experience item in B
        const newBullets = itemB.bullets.map((b) => {
          totalAdditions += b.split(/\s+/).filter(Boolean).length;
          metricsCount += countMetrics(b);
          return `<span class="cv-diff-added-bullet"><mark class="cv-diff-add">${b}</mark></span>`;
        });
        itemsBOut.push({ ...itemB, bullets: newBullets });
        continue;
      }

      if (itemA && !itemB) {
        // Experience item removed in B
        const removedBullets = itemA.bullets.map((b) => {
          totalDeletions += b.split(/\s+/).filter(Boolean).length;
          return `<span class="cv-diff-removed-bullet"><mark class="cv-diff-del">${b}</mark></span>`;
        });
        itemsAOut.push({ ...itemA, bullets: removedBullets });
        continue;
      }

      if (itemA && itemB) {
        const bulletsAOut: string[] = [];
        const bulletsBOut: string[] = [];

        const bulletsA = itemA.bullets || [];
        const bulletsB = itemB.bullets || [];

        // Match bullets between itemA and itemB
        const matchedInA = new Set<number>();

        for (let bIdx = 0; bIdx < bulletsB.length; bIdx++) {
          const bulletB = bulletsB[bIdx];

          // Check for exact match in A
          const exactIdx = bulletsA.findIndex((bA, idx) => !matchedInA.has(idx) && bA.trim() === bulletB.trim());
          if (exactIdx !== -1) {
            matchedInA.add(exactIdx);
            bulletsBOut.push(bulletB);
            totalUnchanged += bulletB.split(/\s+/).filter(Boolean).length;
            continue;
          }

          // Check for near match in A (> 0.45 similarity)
          let bestSim = 0;
          let bestIdx = -1;
          for (let aIdx = 0; aIdx < bulletsA.length; aIdx++) {
            if (matchedInA.has(aIdx)) continue;
            const sim = calculateSimilarity(bulletsA[aIdx], bulletB);
            if (sim > bestSim && sim >= 0.4) {
              bestSim = sim;
              bestIdx = aIdx;
            }
          }

          if (bestIdx !== -1) {
            matchedInA.add(bestIdx);
            const wDiff = diffWords(bulletsA[bestIdx], bulletB);
            bulletsBOut.push(`<span class="cv-diff-added-bullet">${wDiff.textBWithDiff}</span>`);
            totalAdditions += wDiff.addedWords;
            totalDeletions += wDiff.removedWords;
            metricsCount += countMetrics(bulletB);
          } else {
            // New bullet
            totalAdditions += bulletB.split(/\s+/).filter(Boolean).length;
            metricsCount += countMetrics(bulletB);
            bulletsBOut.push(`<span class="cv-diff-added-bullet"><mark class="cv-diff-add">${bulletB}</mark></span>`);
          }
        }

        // Check for unmatched bullets in A (removed bullets)
        for (let aIdx = 0; aIdx < bulletsA.length; aIdx++) {
          if (matchedInA.has(aIdx)) {
            bulletsAOut.push(bulletsA[aIdx]);
          } else {
            totalDeletions += bulletsA[aIdx].split(/\s+/).filter(Boolean).length;
            bulletsAOut.push(`<span class="cv-diff-removed-bullet"><mark class="cv-diff-del">${bulletsA[aIdx]}</mark></span>`);
          }
        }

        itemsAOut.push({ ...itemA, bullets: bulletsAOut });
        itemsBOut.push({ ...itemB, bullets: bulletsBOut });
      }
    }

    return { itemsAOut, itemsBOut };
  };

  const expDiff = diffItemList(dataA.experience, dataB.experience);
  const projDiff = diffItemList(dataA.projects, dataB.projects);

  // 4. Skills Diff
  const allSkillsA = new Set(
    (dataA.skillGroups || []).flatMap((g) => g.skills.map((s) => s.trim().toLowerCase()))
  );
  const allSkillsB = new Set(
    (dataB.skillGroups || []).flatMap((g) => g.skills.map((s) => s.trim().toLowerCase()))
  );

  const formatSkillGroups = (groups: SkillCategory[] = [], isTarget: boolean): SkillCategory[] => {
    return groups.map((group) => {
      const formattedSkills = group.skills.map((skill) => {
        const cleanLower = skill.trim().toLowerCase();
        if (isTarget) {
          if (!allSkillsA.has(cleanLower)) {
            totalAdditions += 1;
            return `cv-diff-added-skill:${skill}`;
          }
          totalUnchanged += 1;
          return skill;
        } else {
          if (!allSkillsB.has(cleanLower)) {
            totalDeletions += 1;
            return `cv-diff-removed-skill:${skill}`;
          }
          totalUnchanged += 1;
          return skill;
        }
      });
      return { ...group, skills: formattedSkills };
    });
  };

  const skillGroupsA = formatSkillGroups(dataA.skillGroups, false);
  const skillGroupsB = formatSkillGroups(dataB.skillGroups, true);

  const totalTokens = totalAdditions + totalDeletions + totalUnchanged;
  const similarity = totalTokens > 0
    ? Math.round((totalUnchanged / (totalUnchanged + Math.max(totalAdditions, totalDeletions))) * 100)
    : 100;

  const dataAWithDiff: CVData = {
    ...dataA,
    title: finalTitleA,
    summary: finalSummaryA,
    experience: expDiff.itemsAOut,
    projects: projDiff.itemsAOut,
    skillGroups: skillGroupsA,
  };

  const dataBWithDiff: CVData = {
    ...dataB,
    title: finalTitleB,
    summary: finalSummaryB,
    experience: expDiff.itemsBOut,
    projects: projDiff.itemsBOut,
    skillGroups: skillGroupsB,
  };

  const stats: DiffStats = {
    additions: totalAdditions,
    deletions: totalDeletions,
    unchanged: totalUnchanged,
    similarity,
    metricsCount,
  };

  return {
    dataAWithDiff,
    dataBWithDiff,
    stats,
  };
}

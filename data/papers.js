const LEGACY_ASSET_BASE =
  process.env.NEXT_PUBLIC_LEGACY_ASSET_BASE ??
  "https://ict-day-papers-quiz.vercel.app";

function makePaper({ number, sourceUrl, answers, assetBase = LEGACY_ASSET_BASE }) {
  const slug = `phy-${String(number).padStart(2, "0")}`;
  return {
    id: slug,
    number,
    title: `PHY ${String(number).padStart(2, "0")}`,
    sourceUrl,
    assetBase,
    questions: answers.map((answer, index) => {
      const q = String(index + 1).padStart(2, "0");
      return {
        id: `${slug}-q${q}`,
        number: index + 1,
        answer,
        image: `/questions/${slug}/q-${q}.webp`,
        alt: `PHY ${String(number).padStart(2, "0")} - Question ${index + 1}`,
      };
    }),
  };
}

export const papers = [
  makePaper({ number: 1, sourceUrl: "https://drive.google.com/file/d/1QFSUHQjLhZOR5pUXEpvJGwptOohHAtB8/view", answers: [2, 3, 2, 4, 2, 2, 5] }),
  makePaper({ number: 2, sourceUrl: "https://drive.google.com/file/d/1f5jmWmdOjTG4DUHI0f5bodRfgK_4upfl/view", answers: [2, 2, 2, 3, 3, 2] }),
  makePaper({ number: 3, sourceUrl: "https://drive.google.com/file/d/1MVVA9YFbdflPqYTn3uTtRzd-YQu7Uu2b/view", answers: [4, 3, 3, 2, 4, 3, 3] }),
  makePaper({ number: 4, sourceUrl: "https://drive.google.com/file/d/1W4Yi7CqR07_y4O8eGsIWoygU3ii0I4ri/view", answers: [4, 3, 3, 3, 3, 5, 1] }),
  makePaper({ number: 5, sourceUrl: "https://drive.google.com/file/d/1_g4ARNidNM3lwbClPwyj3WOe19ht5K3T/view", answers: [4, 2, 3, 2, 4, 3] }),
  makePaper({ number: 6, sourceUrl: "https://drive.google.com/file/d/126PJZSDgG9i8wLqli6QNdpF5DX-yVCyH/view", answers: [3, 3, 2, 2, 2] }),
  makePaper({ number: 7, sourceUrl: "https://drive.google.com/file/d/13qJNNU26xSRgx5JpHwZa5FqjJ482M_us/view", answers: [2, 2, 3, 1, 1] }),
  makePaper({ number: 8, sourceUrl: "https://drive.google.com/file/d/1b7-FN309OkJq041e_AJs3zTkikX_D2ap/view", answers: [3, 1, 2, 3, 1] }),
  makePaper({ number: 9, sourceUrl: "https://drive.google.com/file/d/1untAePEgVh4CCTNRB0BydII098joHQq7/view", answers: [3, 1, 2, 2, 2, 3] }),
  makePaper({ number: 10, sourceUrl: "https://drive.google.com/file/d/1q6SeXlMIhJN4tPrqrhIoXz8RtKrm6Vt9/view", answers: [1, 3, 2, 2, 2, 2] }),
  makePaper({ number: 11, sourceUrl: "https://drive.google.com/file/d/1o-k0QvJMdw6AGzj-A1pkkBryWRTEofcH/view", answers: [3, 3, 3, 4] }),
  makePaper({ number: 12, sourceUrl: "https://drive.google.com/file/d/1Ib0En4adNTLtHM5TEKLsy4zHV3gr2A4A/view", answers: [5, 2, 3, 4, 1, 2] }),
  makePaper({ number: 13, sourceUrl: "https://drive.google.com/file/d/1P2Og0Sl8ke57YaQVB7I3kJ6a8inYYsmo/view", answers: [3, 1, 4, 2, 3, 1] }),
  makePaper({ number: 14, sourceUrl: "https://drive.google.com/file/d/1baaYP1nB4mZcG8E9A8m38wd2QtX7LpKc/view", answers: [2, 1, 2, 2, 5, 3] }),
  makePaper({ number: 15, sourceUrl: "https://drive.google.com/file/d/1_xp0gchRQA3i2StrjOrNFdj4I8KyH5-I/view", answers: [3, 2, 4, 3, 2, 5, 3] }),
  makePaper({ number: 16, sourceUrl: "https://drive.google.com/file/d/1D1GVSXOfUlcHQ5Y9t15FlZHjqd6cJoZJ/view", answers: [4, 2, 3, 3, 2, 2, 3] }),
  makePaper({ number: 17, sourceUrl: "https://drive.google.com/file/d/1IV1q1Sv9UX7kaHE26WWfDOMvzm8-XJTv/view", answers: [3, 3, 3, 2, 5, 5, 3, 3] }),
  makePaper({ number: 18, sourceUrl: "https://drive.google.com/file/d/14eOPYxScpoi9CG2FJ8Oc5pewn72bzZ-p/view", answers: [4, 3, 4, 3, 3, 2, 3, 3] }),
  makePaper({ number: 19, sourceUrl: "https://drive.google.com/file/d/1rCKMJlW-wc8YRHvZiWBlwMqlxiTivpgQ/view", answers: [1, 2, 3, 1] }),
  makePaper({ number: 20, sourceUrl: "https://drive.google.com/file/d/1_5KOMuoobEkbkq2LHoPhcHO9W_A9yCnA/view", answers: [3, 1, 2, 3, 2, 3], assetBase: "" }),
  makePaper({ number: 21, sourceUrl: "https://drive.google.com/file/d/1zrrisAycPZnkivf9L1uxMuzXoQk1Oc5b/view", answers: [4, 1, 2, 2], assetBase: "" }),
];

export function flattenPapers(selectedPapers = papers) {
  return selectedPapers.flatMap((paper) =>
    paper.questions.map((question) => ({
      ...question,
      paperNumber: paper.number,
      paperTitle: paper.title,
      sourceUrl: paper.sourceUrl,
      imageUrl: `${paper.assetBase || ""}${question.image}`,
    }))
  );
}

export function questionsForMode(mode) {
  if (mode === "all") return flattenPapers(papers);
  const number = Number(mode.replace("paper-", ""));
  const paper = papers.find((item) => item.number === number);
  return paper ? flattenPapers([paper]) : [];
}

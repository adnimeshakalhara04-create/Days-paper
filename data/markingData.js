const markingIds = {
  1: "125t1Y0eM69Zg0vO-XsxTzq1vpUfQwp-k",
  2: "1hz-I6HiRHzTbgEq0WyVaKDSiUvhmI0VG",
  3: "1T8s0YznS3ZR7FqHiw213-rdDXKuqVFO4",
  4: "1XNBg24Jw2MpUhua2yHjOw8dXITMtJWwT",
  5: "18uuQNuilh3oH7pyuAM5stvM9GQF0Q2qc",
  6: "1150xjGFJwr8q7ZpiETKxk5Xlf8-A5QY9",
  7: "1gxcQRmBBN085wlxeoS7Aq0X0gT6PV02_",
  8: "1IQY7j26pTBCEc6UbflxQgmnBP77RJXSY",
  9: "1d0GvK-zpjrVG9weUVFGU-yGCmKMVK5Tc",
  10: "1dlszEP4yqwAHVmr0d93Q8Y6o-VGreaCv",
  11: "1e6iijIjFtJe29ysAIp5_DpYOQ2vJSAYO",
  12: "1fsj5M6wGKPWtEocUbKnd8xqcEE2T5pqh",
  13: "1eLDkZrSWOfRMk3xyNpBHcrjwQOj95mV9",
  14: "1meautJMPRAg4POr7U3FZaTqDHUEoUdXj",
  15: "1ty4x5GiPD28Fsn9qeNCwP75TM_pyIOV0",
  16: "1vtB4_cCtXjt_sLvEAKVJgJzcwL9xeEaI",
  17: "1RNEdevR_boC_twg7YIovTmNV6Uhirso1",
  18: "1V0ZCICNvGkH5HGdTW8DdoyOQPkTIlgTR",
  19: "11hHGgiS1OWuhBvnKOk09toRAgzmr8Nl3",
  20: "1SzaL4v7nFXp_LMW52wv9YWRzeG_aIkfD",
  21: "1y-Eqs1nMpDs96vBlFGNjPlSyNCwfi63J",
};

const officialAnswers = {
  1: [2, 3, 2, 4, 2, 2, 5],
  2: [2, 2, 2, 3, 3, 2],
  3: [4, 3, 3, 4, 2, 3, 3],
  4: [4, 3, 3, 3, 3, 5, 1],
  5: [4, 2, 3, 2, 4, 3],
  6: [3, 3, 2, 2, 2],
  7: [2, 2, 3, 1, 1],
  8: [3, 1, 2, 3, 1],
  9: [3, 1, 2, 2, 2, 3],
  10: [1, 3, 2, 2, 2, 2],
  11: [3, 3, 3, 4],
  12: [5, 2, 3, 4, 1, 2],
  13: [3, 1, 4, 2, 3, 1],
  14: [2, 1, 2, 2, 5, 3],
  15: [3, 2, 4, 3, 2, 5, 3],
  16: [4, 2, 3, 3, 2, 2, 3],
  17: [3, 3, 3, 2, 5, 5, 3, 3],
  18: [4, 3, 4, 3, 3, 2, 3, 3],
  19: [1, 2, 3, 1],
  20: [3, 1, 2, 3, 2, 3],
  21: [4, 1, 2, 2],
};

export function getOfficialMarking(paperNumber, questionNumber) {
  const id = markingIds[paperNumber];
  const answer = officialAnswers[paperNumber]?.[questionNumber - 1];
  return {
    answer,
    previewUrl: id ? `https://drive.google.com/file/d/${id}/preview#page=${questionNumber}` : "",
    openUrl: id ? `https://drive.google.com/file/d/${id}/view` : "",
  };
}

export function choiceReason(choice, correctAnswer) {
  if (choice === correctAnswer) {
    return "Correct - this option matches the official marking scheme. The marking explanation below shows the exact reasoning used for this question.";
  }
  return `Incorrect - the official marking scheme gives option ${correctAnswer} as the correct answer. Compare option ${choice} with the official explanation below to see the exact statement, rule, or component that makes it invalid.`;
}

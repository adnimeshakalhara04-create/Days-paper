const LEGACY_ASSET_BASE =
  process.env.NEXT_PUBLIC_LEGACY_ASSET_BASE ??
  "https://ict-day-papers-quiz.vercel.app";

function makePaper({ number, sourceUrl, answers, contents, assetBase = LEGACY_ASSET_BASE }) {
  const slug = `phy-${String(number).padStart(2, "0")}`;
  return {
    id: slug,
    number,
    title: `PHY ${String(number).padStart(2, "0")}`,
    sourceUrl,
    assetBase,
    questions: answers.map((answer, index) => {
      const q = String(index + 1).padStart(2, "0");
      const content = contents?.[index];
      return {
        id: `${slug}-q${q}`,
        number: index + 1,
        answer,
        content,
        image: content ? null : `/questions/${slug}/q-${q}.webp`,
        alt: `PHY ${String(number).padStart(2, "0")} - Question ${index + 1}`,
      };
    }),
  };
}

const phy20 = [
`In a traditional computer motherboard architecture, which component directly connects high-speed hardware devices such as the Central Processing Unit (CPU), RAM, and PCI Express (PCIe) graphics cards, and how does it interface with slower peripheral devices?\n\n1) The Northbridge handles slow peripherals directly, while the Southbridge connects the CPU and RAM.\n2) The Southbridge connects the CPU directly to RAM, and communicates with the Northbridge via the System Bus.\n3) The Northbridge connects high-speed components (CPU, RAM, PCIe graphics) directly and connects to slow peripherals via the Southbridge.\n4) The Southbridge manages high-speed graphics and RAM, passing low-speed USB data through the CPU.\n5) Both Northbridge and Southbridge connect directly to the CPU using identical high-speed buses.`,
`During the instruction fetch and decode phases of the CPU machine cycle, several register transfers occur under the direction of the Control Unit (CU). Consider the following statements regarding this process:\n\nA - The Control Unit sends a memory read control signal via the control bus after the target address is placed into the Memory Address Register (MAR).\nB - The Program Counter (PC) holds the binary opcode of the current instruction while it is being decoded by the Control Unit.\nC - The Instruction Register (IR) holds the memory address of the next instruction that needs to be fetched from RAM.\n\nWhich of the above statement(s) is/are correct?\n\n1) A only\n2) C only\n3) A and B only\n4) A and C only\n5) All of the above`,
`In modern computer motherboard design, which CPU socket type features delicate electrical pins built directly into the motherboard socket itself rather than on the underside of the processor chip, reducing the risk of damaging the processor during installation?\n\n1) PGA (Pin Grid Array)\n2) LGA (Land Grid Array)\n3) BGA (Ball Grid Array)\n4) DIP (Dual In-line Package)\n5) ZIF (Zero Insertion Force)`,
`A computer engineering student is preparing a quick reference guide to compare the functions of two CPU components. A section of the guide is shown below.\n\nCharacteristic                              Component X   Component Y\nPerforms arithmetic operations              ✓             ✗\nHolds operands temporarily                   ✗             ✓\nPerforms logical comparisons                 ✓             ✗\nProvides temporary high-speed storage        ✗             ✓\n\nComponent X and Y are respectively:\n\n1) X = Registers, Y = ALU\n2) X = CU, Y = Registers\n3) X = ALU, Y = Registers\n4) X = Memory, Y = ALU\n5) X = Cache, Y = Registers`,
`Which statement correctly distinguishes a multi-core processor from a single-core processor?\n\n1) A multi-core processor always has a higher clock speed than a single-core processor.\n2) A multi-core processor can execute multiple threads simultaneously, improving multitasking performance.\n3) A single-core processor cannot execute more than one program.\n4) A multi-core processor requires multiple operating systems to function.\n5) A single-core processor always consumes more power than a multi-core processor.`,
`A CPU executes the instruction: INPUT A, ADD 15, STORE RESULT.\n\nWhich sequence best represents the order in which the Control Unit coordinates the hardware components?\n\n1) Registers → I/O Device → Memory → ALU\n2) Memory → Registers → I/O Device → ALU\n3) I/O Device → Registers → ALU → Memory\n4) ALU → Registers → Memory → I/O Device\n5) Registers → Memory → ALU → I/O Device`,
];

const phy21 = [
`Consider the following statements.\n\nA - During an arithmetic instruction, operands are normally obtained from registers, while the ALU performs the required operation.\nB - The accumulator is part of the ALU because it stores the result produced by an arithmetic operation.\nC - The ALU may generate carry, zero, or overflow conditions, but these are stored in a status register.\nD - Registers can temporarily retain binary values, whereas the ALU mainly transforms values rather than storing them.\n\nWhich statements are correct?\n\n1) A and B only\n2) A and C only\n3) B, C and D only\n4) A, C and D only\n5) A, B, C and D All`,
`In a CPU during the Fetch Execution Cycle, consider the following sub-operations.\n\nI - Fetching the instruction from main memory into the Instruction Register (IR).\nII - Transferring data from the Accumulator (a Data Register) to main memory during a store operation.\n\nWhich of the following correctly identifies the role of the Memory Address Register (MAR) and Program Counter (PC) in these operations?\n\n1) In (I), PC holds the address of the next instruction, which is copied to MAR; in (II), MAR holds the destination memory address.\n2) In (I), MAR holds the instruction code directly; in (II), PC holds the destination memory address.\n3) In (I), PC directly fetches the instruction; in (II), MAR is not used as data goes directly from Accumulator to memory.\n4) In (I), MAR increments the instruction address; in (II), PC holds the data to be written into memory.\n5) In (I), PC is copied directly to IR; in (II), MAR holds the data value transferred from Accumulator.`,
`A processor must handle video rendering, encryption, and background services together, but further increasing its clock speed is limited by power and heat. Which feature of a multi-core processor most directly addresses this problem?\n\n1) Each core increases the clock speed of the other cores.\n2) Different cores can execute independent instruction streams concurrently.\n3) All cores combine to execute every single instruction at the same time.\n4) Additional cores remove the sequential sections of a program.\n5) Each core stores a complete copy of main memory.`,
`Consider the following CPU register diagram:\n\nMAR → Main Memory\nMDR ↔ Main Memory\nPC — holds address of next instruction.\n\nWhich statement correctly describes the function of these registers?\n\n1) MAR stores the data being processed, PC stores instructions, and MDR stores memory addresses.\n2) MAR holds the memory address to be accessed, PC holds the address of the next instruction, and MDR stores the data being transferred to or from memory.\n3) PC stores the current data value, MAR stores the next instruction, and MDR stores the CPU clock value.\n4) MAR and MDR both store only instructions, while PC stores data values.\n5) PC stores the address of the previous instruction, MAR stores input data only, and MDR stores output addresses.`,
];

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
  makePaper({ number: 20, sourceUrl: "https://drive.google.com/file/d/1_5KOMuoobEkbkq2LHoPhcHO9W_A9yCnA/view", answers: [3, 1, 2, 3, 2, 3], contents: phy20 }),
  makePaper({ number: 21, sourceUrl: "https://drive.google.com/file/d/1zrrisAycPZnkivf9L1uxMuzXoQk1Oc5b/view", answers: [4, 1, 2, 2], contents: phy21 }),
];

export function flattenPapers(selectedPapers = papers) {
  return selectedPapers.flatMap((paper) =>
    paper.questions.map((question) => ({
      ...question,
      paperNumber: paper.number,
      paperTitle: paper.title,
      sourceUrl: paper.sourceUrl,
      imageUrl: question.image ? `${paper.assetBase || ""}${question.image}` : null,
    }))
  );
}

export function questionsForMode(mode) {
  if (mode === "all") return flattenPapers(papers);
  const number = Number(mode.replace("paper-", ""));
  const paper = papers.find((item) => item.number === number);
  return paper ? flattenPapers([paper]) : [];
}

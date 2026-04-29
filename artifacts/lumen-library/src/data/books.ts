import type { Book } from "./types";

import meditationsCover from "../assets/covers/meditations.png";
import atomicHabitsCover from "../assets/covers/atomic-habits.png";
import thinkingFastCover from "../assets/covers/thinking-fast.png";
import zeroToOneCover from "../assets/covers/zero-to-one.png";
import briefHistoryCover from "../assets/covers/brief-history.png";
import powerOfNowCover from "../assets/covers/power-of-now.png";

export type BookCategory = "Philosophy" | "Self-Help" | "Psychology" | "Business" | "Science" | "Spirituality";

export interface BookSummarySection {
  heading: string;
  paragraphs: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  coverImageUrl: string;
  shortDescription: string;
  keyTakeaways: string[];
  summarySections: BookSummarySection[];
}

export const books: Book[] = [
  {
    id: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    category: "Philosophy",
    coverImageUrl: meditationsCover,
    shortDescription: "A series of personal writings by Roman Emperor Marcus Aurelius, recording his notes to himself and ideas on Stoic philosophy. It offers practical wisdom on navigating life's challenges, managing emotions, and finding peace amidst chaos.",
    keyTakeaways: [
      "Focus on what you can control, let go of what you cannot.",
      "Your mind's tranquility depends on the quality of your thoughts.",
      "Embrace impermanence; everything is temporary.",
      "Live virtuously, guided by reason and duty."
    ],
    summarySections: [
      {
        heading: "Introduction to Stoicism",
        paragraphs: [
          "In Meditations, Marcus Aurelius doesn't present a systematic philosophical treatise. Instead, he offers a raw, unfiltered look into the mind of an emperor grappling with the heavy burdens of leadership and the eternal human quest for meaning.",
          "Stoicism, as practiced by Aurelius, is not about suppressing emotion, but rather about cultivating a mind so clear and a spirit so strong that external circumstances cannot disturb your inner peace."
        ]
      },
      {
        heading: "The Dichotomy of Control",
        paragraphs: [
          "At the heart of Stoic practice is the clear division between things that are up to us and things that are not. Aurelius repeatedly reminds himself that external events—the actions of others, the weather, disease, or disaster—are beyond his control.",
          "What is within his control is his judgment of these events. By detaching his inner state from external outcomes, he creates a fortress of tranquility that no external force can breach."
        ]
      }
    ]
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    coverImageUrl: atomicHabitsCover,
    shortDescription: "A comprehensive guide on how to build good habits and break bad ones. The book reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    keyTakeaways: [
      "Habits are the compound interest of self-improvement.",
      "Focus on systems rather than goals.",
      "Make good habits obvious, attractive, easy, and satisfying.",
      "Make bad habits invisible, unattractive, difficult, and unsatisfying."
    ],
    summarySections: [
      {
        heading: "The Power of Tiny Changes",
        paragraphs: [
          "We often convince ourselves that massive success requires massive action. Whether it is losing weight, building a business, or writing a book, we put pressure on ourselves to make some earth-shattering improvement that everyone will talk about.",
          "Meanwhile, improving by 1 percent isn't particularly notable—sometimes it isn't even noticeable—but it can be far more meaningful, especially in the long run. The difference a tiny improvement can make over time is astounding."
        ]
      }
    ]
  },
  {
    id: "thinking-fast",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Psychology",
    coverImageUrl: thinkingFastCover,
    shortDescription: "A groundbreaking tour of the mind that explains the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.",
    keyTakeaways: [
      "Our brain uses two systems: System 1 (fast/intuitive) and System 2 (slow/analytical).",
      "We are highly susceptible to cognitive biases and heuristics.",
      "Loss aversion makes us fear losing more than we value gaining.",
      "Our memory of an event is often different from our experience of it."
    ],
    summarySections: [
      {
        heading: "Two Systems of Thought",
        paragraphs: [
          "Kahneman introduces a framework for understanding the human mind by dividing it into two distinct systems. System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control.",
          "System 2 allocates attention to the effortful mental activities that demand it, including complex computations. The operations of System 2 are often associated with the subjective experience of agency, choice, and concentration."
        ]
      }
    ]
  },
  {
    id: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    category: "Business",
    coverImageUrl: zeroToOneCover,
    shortDescription: "Notes on startups, or how to build the future. Thiel presents a contrarian view on innovation, arguing that the next Bill Gates will not build an operating system, and the next Larry Page won't make a search engine.",
    keyTakeaways: [
      "True innovation means going from 0 to 1 (creating something new), not 1 to n (copying).",
      "Monopolies drive innovation; perfect competition kills profits.",
      "Start with a small, niche market and dominate it.",
      "A great team and a strong foundational culture are essential."
    ],
    summarySections: [
      {
        heading: "The Challenge of the Future",
        paragraphs: [
          "Every moment in business happens only once. The next Mark Zuckerberg won't build a social network. The next Larry Page won't build a search engine. If you are copying these guys, you aren't learning from them.",
          "Doing what we already know how to do takes the world from 1 to n, adding more of something familiar. But every time we create something new, we go from 0 to 1. The act of creation is singular, as is the moment of creation."
        ]
      }
    ]
  },
  {
    id: "brief-history",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    coverImageUrl: briefHistoryCover,
    shortDescription: "A landmark volume in science writing by one of the great minds of our time. Hawking explores profound questions about the universe, its origins, and its ultimate fate in accessible language.",
    keyTakeaways: [
      "The universe is expanding and has a finite history, beginning with the Big Bang.",
      "Time is not absolute; it is relative to the observer.",
      "Black holes emit radiation and will eventually evaporate.",
      "The quest for a unified theory of physics continues."
    ],
    summarySections: [
      {
        heading: "Our Picture of the Universe",
        paragraphs: [
          "For centuries, humanity viewed the universe as static and unchanging. Stars were fixed in their spheres, and time ticked away uniformly for everyone everywhere.",
          "The twentieth century shattered this illusion. We now know that our universe is dynamic, expanding, and governed by laws that defy simple intuition. From the microscopic weirdness of quantum mechanics to the grand scale of general relativity, the universe is far stranger than we could have ever imagined."
        ]
      }
    ]
  },
  {
    id: "power-of-now",
    title: "The Power of Now",
    author: "Eckhart Tolle",
    category: "Spirituality",
    coverImageUrl: powerOfNowCover,
    shortDescription: "A guide to spiritual enlightenment. Tolle argues that the present moment is all we ever have, and that focusing on the past or the future is the root cause of human suffering.",
    keyTakeaways: [
      "The present moment is the only reality; the past and future are illusions.",
      "Identify your mind's constant chatter and step back from it as an observer.",
      "Accept what is, rather than resisting it.",
      "True peace comes from a state of intense conscious presence."
    ],
    summarySections: [
      {
        heading: "You Are Not Your Mind",
        paragraphs: [
          "The greatest obstacle to experiencing the reality of your connectedness is identification with your mind, which causes thought to become compulsive. Not to be able to stop thinking is a dreadful affliction, but we don't realize this because almost everyone is suffering from it.",
          "The mind is a superb instrument if used rightly. Used wrongly, however, it becomes very destructive. To put it more accurately, it is not so much that you use your mind wrongly—you usually don't use it at all. It uses you. This is the disease."
        ]
      }
    ]
  }
];

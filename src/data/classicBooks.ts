export interface ClassicBook {
  id: string;
  title: string;
  author: string;
  year: string;
  coverColor: string;
  description: string;
  gutenbergUrl: string;
  sampleChapterExcerpt: string;
  keyThemes: string[];
  readingLevel: string;
}

export const CLASSIC_BOOKS: ClassicBook[] = [
  {
    id: 'aesops-fables',
    title: "Aesop's Fables",
    author: 'Aesop',
    year: 'c. 6th century BCE',
    coverColor: 'from-amber-500 to-orange-600',
    description: 'A timeless collection of ancient Greek moral allegories featuring talking animals, enduring wisdom, and lessons on human nature.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/11339',
    sampleChapterExcerpt: 'A Fox one day spied a beautiful bunch of ripe grapes hanging from a vine trained along the branches of a tree. The grapes seemed ready to burst with juice, and the Fox\'s mouth watered as he gazed at them. He stepped back, took a run and a jump, and just missed the bunch...',
    keyThemes: ['Moral Wisdom', 'Human Nature', 'Character Building'],
    readingLevel: 'All Ages / Classic'
  },
  {
    id: 'alices-adventures',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    year: '1865',
    coverColor: 'from-sky-500 to-blue-600',
    description: 'A whimsical masterpiece of imaginative literature following a curious young girl down the rabbit hole into an absurd wonderland of logic and wonder.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/11',
    sampleChapterExcerpt: 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversation?"',
    keyThemes: ['Imagination', 'Curiosity', 'Logic & Absurdity'],
    readingLevel: 'Young Adult / Literary Classic'
  },
  {
    id: 'wizard-of-oz',
    title: "The Wonderful Wizard of Oz",
    author: 'L. Frank Baum',
    year: '1900',
    coverColor: 'from-emerald-500 to-teal-600',
    description: 'Dorothy and her companions travel the yellow brick road to the Emerald City, discovering courage, heart, and brains within themselves.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/55',
    sampleChapterExcerpt: 'Dorothy lived in the midst of the great Kansas prairies, with Uncle Henry, who was a farmer, and Aunt Em, who was the farmer\'s wife. Their house was small, for the lumber to build it had to be carried by wagon many miles...',
    keyThemes: ['Self-Discovery', 'Friendship', 'Home & Belonging'],
    readingLevel: 'All Ages / Fantasy'
  },
  {
    id: 'sherlock-holmes',
    title: "The Adventures of Sherlock Holmes",
    author: 'Sir Arthur Conan Doyle',
    year: '1892',
    coverColor: 'from-sky-700 to-blue-950',
    description: 'Twelve classic detective stories showcasing the world\'s greatest consulting detective, Sherlock Holmes, and Dr. John Watson in Victorian London.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/1661',
    sampleChapterExcerpt: 'To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler...',
    keyThemes: ['Deductive Reasoning', 'Observation', 'Justice'],
    readingLevel: 'Classic Mystery'
  },
  {
    id: 'the-secret-garden',
    title: "The Secret Garden",
    author: 'Frances Hodgson Burnett',
    year: '1911',
    coverColor: 'from-rose-500 to-pink-600',
    description: 'The transformative tale of Mary Lennox, an orphaned girl whose discovery of an abandoned walled garden brings healing to her family.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/113',
    sampleChapterExcerpt: 'When Mary Lennox was sent to Misselthwaite Manor to live with her uncle everybody said she was the most disagreeable-looking child ever seen. It was true, too. She had a little thin face and a little thin body, thin light hair and a sour expression...',
    keyThemes: ['Healing', 'Nature', 'Emotional Renewal'],
    readingLevel: 'Classic Children\'s Literature'
  },
  {
    id: 'meditations',
    title: "Meditations",
    author: 'Marcus Aurelius',
    year: '161–180 CE',
    coverColor: 'from-sky-600 to-blue-950',
    description: 'The personal philosophical journal of the Roman Emperor Marcus Aurelius, offering foundational Stoic insights on duty, resilience, and inner tranquility.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/2680',
    sampleChapterExcerpt: 'When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil...',
    keyThemes: ['Stoicism', 'Self-Mastery', 'Inner Peace', 'Duty'],
    readingLevel: 'Philosophy / Leadership'
  },
  {
    id: 'as-a-man-thinketh',
    title: "As a Man Thinketh",
    author: 'James Allen',
    year: '1903',
    coverColor: 'from-amber-600 to-yellow-600',
    description: 'A pioneer essay on the power of thought and how our internal mental states shape our circumstances, health, and life achievements.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/4507',
    sampleChapterExcerpt: 'Mind is the Master power that molds and makes, and Man is Mind, and evermore he takes the tool of Thought, and, shaping what he wills, brings forth a thousand joys, a thousand ills: He thinks in secret, and it comes to pass: Environment is but his looking-glass.',
    keyThemes: ['Mindset', 'Personal Growth', 'Habits of Mind'],
    readingLevel: 'Self-Improvement Classic'
  },
  {
    id: 'the-art-of-war',
    title: "The Art of War",
    author: 'Sun Tzu',
    year: '5th century BCE',
    coverColor: 'from-red-600 to-slate-900',
    description: 'An ancient military and philosophical treatise on strategy, conflict resolution, psychology, and achieving victory without violence.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/132',
    sampleChapterExcerpt: 'Sun Tzu said: The art of war is of vital importance to the State. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected...',
    keyThemes: ['Strategy', 'Leadership', 'Mental Discipline'],
    readingLevel: 'Philosophy & Strategy'
  },
  {
    id: 'the-time-machine',
    title: "The Time Machine",
    author: 'H.G. Wells',
    year: '1895',
    coverColor: 'from-cyan-600 to-blue-800',
    description: 'The foundational science fiction novel that coined the concept of a time machine and explored the future of humanity through brilliant imagination.',
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/35',
    sampleChapterExcerpt: 'The Time Traveller was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burnt brightly, and the soft radiance of the incandescent lights caught the bubbles that flashed and passed in our glasses...',
    keyThemes: ['Science Fiction', 'Evolution', 'Human Future'],
    readingLevel: 'Science Fiction Classic'
  }
];

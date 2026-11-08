import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in server/.env');
  process.exit(1);
}

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [val => val.length === 4, 'Must have exactly 4 choices']
    },
    correctOption: { type: Number, required: true, min: 0, max: 3 },
    points: { type: Number, default: 1 },
    explanation: { type: String, default: '' }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    targetClass: { type: String, trim: true },
    className: { type: String, trim: true },
    description: { type: String, default: '' },
    durationMinutes: { type: Number, default: 25 },
    passMarks: { type: Number, default: 10 },
    totalMarks: { type: Number, default: 25 },
    questions: [questionSchema],
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    isInQuizBank: { type: Boolean, default: true, index: true },
    publishStatus: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
    publishWindow: {
      startAt: { type: String },
      endAt: { type: String },
      isAlwaysActive: { type: Boolean, default: true }
    },
    allocation: {
      mode: { type: String, enum: ['all', 'classes', 'students'], default: 'all' },
      targetClasses: { type: [String], default: [] },
      targetStudentIds: { type: [String], default: [] }
    },
    enableAntiCheating: { type: Boolean, default: true },
    enableWebcamProctoring: { type: Boolean, default: false },
    enableTabSwitchDetection: { type: Boolean, default: true },
    enableFullscreenLockdown: { type: Boolean, default: false },
    enableClipboardBlocking: { type: Boolean, default: true },
    maxStrikes: { type: Number, default: 3 },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export const QUIZ_CH18 = {
  id: 'quiz-ch18-tch-1792153549134',
  title: 'Class 12 Biology: Chapter 18 — Reproduction (Past Papers & Board Mastery)',
  subject: 'Biology',
  targetClass: 'Class 12 (Intermediate Pre-Medical)',
  className: 'Class 12 (Intermediate Pre-Medical)',
  description: 'Comprehensive 25 MCQ Examination on Plant & Animal Reproduction, Photoperiodism, Male & Female Reproductive Endocrinology, Menstrual Cycle, and STDs derived from Board past papers and official syllabus standards.',
  durationMinutes: 25,
  passMarks: 10,
  totalMarks: 25,
  teacherId: 'tch-1792153549134',
  teacherName: 'M.Afzal',
  isInQuizBank: true,
  publishStatus: 'published',
  publishWindow: {
    isAlwaysActive: true
  },
  allocation: {
    mode: 'all',
    targetClasses: ['Class 12 (Intermediate Pre-Medical)', 'Class VIII (PAF College Sargodha Prep)'],
    targetStudentIds: ['std-1792944741691']
  },
  enableAntiCheating: true,
  enableTabSwitchDetection: true,
  enableClipboardBlocking: true,
  maxStrikes: 3,
  shuffleQuestions: true,
  shuffleOptions: true,
  questions: [
    {
      id: 'q_ch18_01',
      questionText: 'Which of the following processes involves the development of an embryo from an unfertilized egg?',
      options: ['Apomixis', 'Parthenogenesis', 'Parthenocarpy', 'Polyembryony'],
      correctOption: 1,
      points: 1,
      explanation: 'Parthenogenesis is the development of an unfertilized egg into an embryo without fertilization, as seen in honeybee drones (haploid) or aphids (diploid) (BISE Faisalabad/Lahore).'
    },
    {
      id: 'q_ch18_02',
      questionText: 'In plants, the production of seeds without fertilization or meiosis is termed as:',
      options: ['Parthenogenesis', 'Apomixis', 'Vernalization', 'Photoperiodism'],
      correctOption: 1,
      points: 1,
      explanation: 'Apomixis refers to the development of a diploid embryo from maternal ovarian/ovule tissues without meiosis or fertilization (BISE Gujranwala/Multan).'
    },
    {
      id: 'q_ch18_03',
      questionText: 'Drones (male bees) in a honeybee colony are produced by:',
      options: ['Diploid parthenogenesis', 'Haploid parthenogenesis', 'Double fertilization', 'Internal fertilization'],
      correctOption: 1,
      points: 1,
      explanation: 'Queen bees lay unfertilized haploid eggs (n = 16) which develop via haploid parthenogenesis into fertile haploid male drones (BISE Lahore/Multan).'
    },
    {
      id: 'q_ch18_04',
      questionText: 'The promotion of flowering in biennial and winter-annual plants by exposure to low temperature (chilling) is called:',
      options: ['Phototropism', 'Photoperiodism', 'Vernalization', 'Etiolation'],
      correctOption: 2,
      points: 1,
      explanation: 'Vernalization is the chilling treatment (around 4 °C for 4 days to 3 months) that induces flowering through the hypothetical hormone vernalin (BISE Gujranwala/Rawalpindi).'
    },
    {
      id: 'q_ch18_05',
      questionText: 'Which wavelength of light is absorbed by the Pr (P660) form of phytochrome to convert it into the biologically active Pfr (P730) form?',
      options: ['Blue light (450 nm)', 'Red light (660 nm)', 'Far-red light (730 nm)', 'Ultraviolet light (320 nm)'],
      correctOption: 1,
      points: 1,
      explanation: 'Phytochrome Pr (P660) absorbs red light at 660 nm and is rapidly converted into the active Pfr (P730) form, which regulates photoperiodic flowering (BISE Multan/Sargodha).'
    },
    {
      id: 'q_ch18_06',
      questionText: 'Which of the following is a classic Short-Day Plant (Long-Night Plant) that requires a continuous, uninterrupted dark period to flower?',
      options: ['Henbane', 'Wheat', 'Cocklebur (Xanthium)', 'Cabbage'],
      correctOption: 2,
      points: 1,
      explanation: 'Cocklebur (Xanthium strumarium), chrysanthemum, and soybean are short-day plants; a brief flash of light during their critical dark period completely prevents flowering (BISE Faisalabad/Lahore).'
    },
    {
      id: 'q_ch18_07',
      questionText: 'Double fertilization is a unique diagnostic feature of which group of plants?',
      options: ['Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms'],
      correctOption: 3,
      points: 1,
      explanation: 'In angiosperms, one sperm fuses with the egg nucleus to form a diploid (2n) zygote, while the second sperm fuses with the diploid secondary fusion nucleus to form a triploid (3n) endosperm nucleus (BISE Lahore/Sargodha).'
    },
    {
      id: 'q_ch18_08',
      questionText: 'Animals that retain shelled eggs inside the female reproductive tract until hatching and then give birth to living young are termed:',
      options: ['Oviparous', 'Viviparous', 'Ovoviviparous', 'Marsupials'],
      correctOption: 2,
      points: 1,
      explanation: 'Ovoviviparous animals (e.g., certain sharks, vipers, and garter snakes) incubate eggs internally without a maternal placental connection and give birth to live young (BISE Lahore/Faisalabad).'
    },
    {
      id: 'q_ch18_09',
      questionText: 'Identical (monozygotic) twins in humans develop from:',
      options: ['Two separate ova fertilized by two different sperms', 'A single zygote that splits at the early cleavage stage', 'One ovum fertilized simultaneously by two sperms', 'Two polar bodies fertilized by sperms'],
      correctOption: 1,
      points: 1,
      explanation: 'Identical (monozygotic) twins arise when a single fertilized egg splits into two separate embryos during early cleavage; they share identical genetic makeup and are always the same sex (BISE Sargodha/DG Khan).'
    },
    {
      id: 'q_ch18_10',
      questionText: 'In the human testes, developing sperms are protected, structurally supported, and nourished by:',
      options: ['Interstitial cells of Leydig', 'Sertoli cells', 'Spermatogonia', 'Germinal epithelial cells'],
      correctOption: 1,
      points: 1,
      explanation: 'Sertoli cells (sustentacular nurse cells) provide mechanical support, nourishment, and fluid secretion to spermatogenic cells throughout spermatogenesis (BISE Rawalpindi/Lahore).'
    },
    {
      id: 'q_ch18_11',
      questionText: 'Testosterone secretion by the interstitial cells of Leydig is directly stimulated by which pituitary hormone?',
      options: ['FSH', 'ICSH / LH', 'Prolactin', 'Oxytocin'],
      correctOption: 1,
      points: 1,
      explanation: 'Interstitial Cell Stimulating Hormone (ICSH, also known as Luteinizing Hormone in males) stimulates Leydig cells to synthesize and secrete testosterone (BISE Faisalabad/Multan).'
    },
    {
      id: 'q_ch18_12',
      questionText: 'Spermatozoa produced in the seminiferous tubules undergo functional maturation and temporary storage in the:',
      options: ['Vas deferens', 'Epididymis', 'Seminal vesicles', 'Ejaculatory duct'],
      correctOption: 1,
      points: 1,
      explanation: 'The epididymis is a highly convoluted duct coiled atop each testis where sperms acquire motility, complete maturation, and are stored prior to ejaculation (BISE Gujranwala/Lahore).'
    },
    {
      id: 'q_ch18_13',
      questionText: 'Which accessory male reproductive gland secretes an alkaline, fructose-rich fluid that provides energy for sperm motility?',
      options: ['Prostate gland', 'Seminal vesicles', "Bulbourethral (Cowper's) gland", "Bartholin's gland"],
      correctOption: 1,
      points: 1,
      explanation: 'Seminal vesicles contribute approximately 60% of semen volume, providing fructose for energy, prostaglandins for uterine contraction, and clotting enzymes (BISE Sahiwal/Multan).'
    },
    {
      id: 'q_ch18_14',
      questionText: 'In human females, fertilization of the secondary oocyte typically occurs in which specific region?',
      options: ['Uterine cavity', 'Cervix', 'Ampulla of the Fallopian tube (Oviduct)', 'Ovarian surface'],
      correctOption: 2,
      points: 1,
      explanation: 'Fertilization normally takes place in the ampulla (upper third) of the Fallopian tube within 12–24 hours following ovulation (BISE Lahore/Faisalabad).'
    },
    {
      id: 'q_ch18_15',
      questionText: 'During the follicular phase of the human menstrual cycle, developing follicles secrete increasing amounts of which hormone to rebuild the endometrium?',
      options: ['Progesterone', 'Estrogen', 'Luteinizing Hormone (LH)', 'Human Chorionic Gonadotropin (hCG)'],
      correctOption: 1,
      points: 1,
      explanation: 'Estrogen produced by the theca and granulosa cells of the developing Graafian follicle stimulates proliferative vascularization and thickening of the uterine endometrium (BISE Faisalabad/Lahore/Gujranwala).'
    },
    {
      id: 'q_ch18_16',
      questionText: 'Ovulation (release of the secondary oocyte on approximately Day 14 of the menstrual cycle) is triggered by:',
      options: ['A sharp decrease in estrogen', 'A massive mid-cycle surge of Luteinizing Hormone (LH)', 'High continuous secretion of progesterone', 'A sudden elevation in FSH alone'],
      correctOption: 1,
      points: 1,
      explanation: 'Peak estrogen levels from the mature follicle exert positive feedback on the pituitary, triggering a sharp LH surge that causes the Graafian follicle to rupture within 24–36 hours (BISE Faisalabad/Multan/Rawalpindi).'
    },
    {
      id: 'q_ch18_17',
      questionText: 'Following ovulation, the ruptured Graafian follicle transforms into a yellowish endocrine gland called the:',
      options: ['Corpus albicans', 'Corpus luteum', 'Corpus callosum', 'Antrum'],
      correctOption: 1,
      points: 1,
      explanation: 'Under LH influence, follicular remnants transform into the corpus luteum, which secretes progesterone to maintain the secretory endometrium for embryo implantation (BISE Faisalabad/DG Khan/Lahore).'
    },
    {
      id: 'q_ch18_18',
      questionText: 'Menstruation (shedding of the vascularized uterine endometrial lining) occurs primarily due to:',
      options: ['Sudden elevation of blood LH levels', 'Degeneration of the corpus luteum causing a sharp decline in progesterone and estrogen', 'Excessive release of human chorionic gonadotropin', 'Peak levels of FSH'],
      correctOption: 1,
      points: 1,
      explanation: 'If fertilization does not occur, the corpus luteum regresses into the corpus albicans. The withdrawal of progesterone and estrogen causes spasms of endometrial spiral arteries, tissue necrosis, and menstrual bleeding (BISE Gujranwala/Lahore).'
    },
    {
      id: 'q_ch18_19',
      questionText: 'At what specific stage of meiosis is a human egg arrested when it is ovulated from the Graafian follicle?',
      options: ['Prophase I', 'Metaphase I', 'Metaphase II', 'Anaphase II'],
      correctOption: 2,
      points: 1,
      explanation: 'Human oogenesis resumes at puberty up to Metaphase II. The secondary oocyte is released at ovulation arrested in Metaphase II and completes meiosis II only upon sperm entry (BISE Lahore/Multan).'
    },
    {
      id: 'q_ch18_20',
      questionText: 'Which hormone produced by the embryonic trophoblast maintains the corpus luteum during early pregnancy and is detected by home pregnancy tests?',
      options: ['Human Chorionic Gonadotropin (hCG)', 'Prolactin', 'Oxytocin', 'Progesterone'],
      correctOption: 0,
      points: 1,
      explanation: "hCG is secreted by the blastocyst's syncytiotrophoblast; it mimics LH to sustain the corpus luteum and ensure continued progesterone output during the first trimester (BISE Sargodha/Lahore)."
    },
    {
      id: 'q_ch18_21',
      questionText: 'The powerful rhythmic uterine contractions during parturition (labor) are stimulated by a positive feedback loop involving which posterior pituitary hormone?',
      options: ['Prolactin', 'Oxytocin', 'Luteinizing Hormone', 'Vasopressin'],
      correctOption: 1,
      points: 1,
      explanation: 'Oxytocin stimulates myometrial contractions; cervical stretching by the fetal head triggers additional oxytocin release from the posterior pituitary in a classic positive feedback mechanism (BISE Faisalabad/Sahiwal).'
    },
    {
      id: 'q_ch18_22',
      questionText: 'Syphilis is a serious sexually transmitted disease caused by which pathogenic spirochete bacterium?',
      options: ['Neisseria gonorrhoeae', 'Treponema pallidum', 'Chlamydia trachomatis', 'Haemophilus ducreyi'],
      correctOption: 1,
      points: 1,
      explanation: 'Syphilis is caused by the corkscrew-shaped spirochete Treponema pallidum, presenting with primary chancres, secondary systemic rash, and tertiary neurological/cardiovascular damage (BISE Lahore/Bahawalpur).'
    },
    {
      id: 'q_ch18_23',
      questionText: 'Which sexually transmitted disease is caused by a Gram-negative diplococcus bacterium and causes painful purulent urethral discharge?',
      options: ['Syphilis', 'Gonorrhea', 'Genital Herpes', 'Candidiasis'],
      correctOption: 1,
      points: 1,
      explanation: 'Gonorrhea is caused by the Gram-negative bacterium Neisseria gonorrhoeae, leading to acute urethritis, pelvic inflammatory disease (PID), and neonatal conjunctivitis (BISE Gujranwala/Multan).'
    },
    {
      id: 'q_ch18_24',
      questionText: 'The development of a fruit without fertilization of ovules, yielding seedless fruits like bananas and navel oranges, is termed:',
      options: ['Parthenogenesis', 'Parthenocarpy', 'Apomixis', 'Etiolation'],
      correctOption: 1,
      points: 1,
      explanation: 'Parthenocarpy is the natural or auxin/gibberellin-induced development of seedless fruits without prior pollination or fertilization (BISE Rawalpindi/Lahore).'
    },
    {
      id: 'q_ch18_25',
      questionText: 'Which hormone is primarily responsible for milk production (synthesis) by mammary alveolar cells following childbirth?',
      options: ['Oxytocin', 'Prolactin', 'Progesterone', 'Estrogen'],
      correctOption: 1,
      points: 1,
      explanation: "Prolactin (secreted by the anterior pituitary) stimulates milk synthesis, whereas oxytocin stimulates the ejection ('letdown') of milk from alveolar ducts (BISE Multan/Faisalabad)."
    }
  ]
};

export const QUIZ_CH24 = {
  id: 'quiz-ch24-tch-1792153549134',
  title: 'Class 12 Biology: Chapter 24 — Evolution (Past Papers & Board Mastery)',
  subject: 'Biology',
  targetClass: 'Class 12 (Intermediate Pre-Medical)',
  className: 'Class 12 (Intermediate Pre-Medical)',
  description: 'Comprehensive 25 MCQ Examination on Theories of Evolution, Natural Selection, Neo-Darwinism, Evidences of Evolution, Hardy-Weinberg Equilibrium, Origin of Life, and Wildlife Conservation.',
  durationMinutes: 25,
  passMarks: 10,
  totalMarks: 25,
  teacherId: 'tch-1792153549134',
  teacherName: 'M.Afzal',
  isInQuizBank: true,
  publishStatus: 'published',
  publishWindow: {
    isAlwaysActive: true
  },
  allocation: {
    mode: 'all',
    targetClasses: ['Class 12 (Intermediate Pre-Medical)', 'Class VIII (PAF College Sargodha Prep)'],
    targetStudentIds: ['std-1792944741691']
  },
  enableAntiCheating: true,
  enableTabSwitchDetection: true,
  enableClipboardBlocking: true,
  maxStrikes: 3,
  shuffleQuestions: true,
  shuffleOptions: true,
  questions: [
    {
      id: 'q_ch24_01',
      questionText: 'Organs that are structurally and anatomically alike due to common evolutionary ancestry but perform different functions are called:',
      options: ['Analogous organs', 'Homologous organs', 'Vestigial organs', 'Atavistic organs'],
      correctOption: 1,
      points: 1,
      explanation: 'Homologous structures (e.g., forelimbs of humans, cats, whales, and bats) share a common basic pentadactyl skeletal plan indicating divergent evolution from a common ancestral form (BISE Lahore/Sargodha/Faisalabad).'
    },
    {
      id: 'q_ch24_02',
      questionText: 'The wings of a bat and the wings of a butterfly represent which evolutionary phenomenon?',
      options: ['Divergent evolution (Homology)', 'Convergent evolution (Analogy)', 'Parallel evolution', 'Vestigial development'],
      correctOption: 1,
      points: 1,
      explanation: 'Analogous organs (wings of insects vs birds/bats) have different developmental origins and structures but evolved to perform the same function due to similar environmental selective pressures (BISE Gujranwala/Multan).'
    },
    {
      id: 'q_ch24_03',
      questionText: 'Which of the following structures is considered a rudimentary vestigial organ in the human body?',
      options: ['Gallbladder', 'Vermiform appendix', 'Spleen', 'Thyroid gland'],
      correctOption: 1,
      points: 1,
      explanation: 'The vermiform appendix, coccyx, plica semilunaris (nictitating membrane remnant), and auricular ear muscles are non-functional vestigial evolutionary remnants in humans (BISE Faisalabad/Lahore).'
    },
    {
      id: 'q_ch24_04',
      questionText: 'Charles Darwin formulated his revolutionary theory of Natural Selection primarily while observing the unique fauna of which archipelago aboard the HMS Beagle?',
      options: ['Hawaiian Islands', 'Galapagos Islands', 'Canary Islands', 'Falkland Islands'],
      correctOption: 1,
      points: 1,
      explanation: 'During his 1831–1836 voyage on HMS Beagle, Darwin observed 13 closely related species of ground finches on the Galapagos Islands, noting how beak variations correlated with distinct food sources (BISE Gujranwala/Lahore).'
    },
    {
      id: 'q_ch24_05',
      questionText: "In which year did Charles Darwin publish his monumental book 'On the Origin of Species by Means of Natural Selection'?",
      options: ['1831', '1859', '1882', '1900'],
      correctOption: 1,
      points: 1,
      explanation: "Darwin published 'On the Origin of Species' on November 24, 1859, proposing overproduction, struggle for existence, variation, and survival of the fittest (BISE Lahore/Faisalabad/Multan)."
    },
    {
      id: 'q_ch24_06',
      questionText: "Neo-Darwinism (the Modern Evolutionary Synthesis) reconciles Darwin's natural selection with:",
      options: ['Lamarckian inheritance of acquired traits', 'Mendelian genetics and population gene pool dynamics', 'Spontaneous generation', 'Catastrophism'],
      correctOption: 1,
      points: 1,
      explanation: 'Neo-Darwinism (formulated in the 1940s) explains how mutations, genetic recombination, and gene pool allele frequencies provide the raw variation upon which natural selection acts (BISE Lahore/Faisalabad/Multan).'
    },
    {
      id: 'q_ch24_07',
      questionText: 'The mathematical binomial equation representing the Hardy-Weinberg equilibrium for genotype frequencies of two alleles is:',
      options: ['p + q = 1', 'p² + 2pq + q² = 1', 'p² + q² = 1', '(p + q)² = 0'],
      correctOption: 1,
      points: 1,
      explanation: 'In the Hardy-Weinberg equation p² + 2pq + q² = 1, p² represents the homozygous dominant frequency, 2pq represents the heterozygous carrier frequency, and q² represents the homozygous recessive frequency (BISE Faisalabad/Lahore).'
    },
    {
      id: 'q_ch24_08',
      questionText: 'In a population in Hardy-Weinberg equilibrium, if the frequency of a recessive allele (q) is 0.2, what is the frequency of heterozygous carriers (2pq)?',
      options: ['0.04', '0.16', '0.32', '0.64'],
      correctOption: 2,
      points: 1,
      explanation: 'Since p + q = 1, p = 1 - 0.2 = 0.8. The carrier frequency is 2pq = 2 * (0.8) * (0.2) = 0.32 (32%) (BISE Gujranwala/Multan).'
    },
    {
      id: 'q_ch24_09',
      questionText: 'Which of the following conditions is required to maintain Hardy-Weinberg genetic equilibrium across generations?',
      options: ['Small population size', 'High rate of directional mutation', 'Non-random assortative mating', 'Large population size with random mating'],
      correctOption: 3,
      points: 1,
      explanation: 'Hardy-Weinberg equilibrium requires: (1) large population size, (2) random mating, (3) no gene flow/migration, (4) no net mutations, and (5) no natural selection (BISE Rawalpindi/Sargodha).'
    },
    {
      id: 'q_ch24_10',
      questionText: 'A drastic random reduction in population size caused by natural disasters (earthquake, flood) that alters gene pool frequencies is termed:',
      options: ['Founder effect', 'Bottleneck effect', 'Gene flow', 'Balanced polymorphism'],
      correctOption: 1,
      points: 1,
      explanation: 'A bottleneck event occurs when a catastrophe drastically reduces population numbers at random, leaving a surviving gene pool with significantly altered and reduced allele diversity (BISE Lahore/Faisalabad).'
    },
    {
      id: 'q_ch24_11',
      questionText: 'The famous transitional fossil Archaeopteryx lithographica exhibits characteristics intermediate between:',
      options: ['Fishes and Amphibians', 'Amphibians and Reptiles', 'Reptiles and Birds', 'Birds and Mammals'],
      correctOption: 2,
      points: 1,
      explanation: 'Archaeopteryx possessed reptilian features (teeth, long bony tail, clawed digits) alongside avian traits (feathers, wishbone/furcula, wings) confirming dinosaurian ancestry of birds (BISE Multan/Sahiwal).'
    },
    {
      id: 'q_ch24_12',
      questionText: "Which respiratory electron transport protein is widely studied as a 'molecular clock' because its amino acid sequence is conserved across all aerobic organisms?",
      options: ['Hemoglobin', 'Cytochrome c', 'Myoglobin', 'Insulin'],
      correctOption: 1,
      points: 1,
      explanation: 'Cytochrome c is a 104-amino-acid mitochondrial protein whose sequence divergence closely matches evolutionary divergence times derived from the fossil record (BISE Gujranwala/Bahawalpur).'
    },
    {
      id: 'q_ch24_13',
      questionText: 'The Hydrothermal Vent Hypothesis proposes that the earliest anaerobic archaebacteria evolved around deep-sea vents fueled by which energy-rich gas?',
      options: ['Oxygen (O2)', 'Hydrogen sulfide (H2S)', 'Carbon monoxide (CO)', 'Nitrogen dioxide (NO2)'],
      correctOption: 1,
      points: 1,
      explanation: 'Hydrothermal hot springs on the ocean floor spewed water at 120 °C laden with hydrogen sulfide (H2S), iron, and nickel sulfides, providing chemosynthetic energy for primitive life (BISE Sargodha/DG Khan).'
    },
    {
      id: 'q_ch24_14',
      questionText: 'In the landmark 1953 Miller-Urey experiment simulating the prebiotic Earth atmosphere, which mixture of gases was subjected to electric sparks?',
      options: ['O2, N2, CO2, and H2O', 'CH4, NH3, H2, and H2O vapor', 'CO2, O3, Ar, and CH4', 'SO2, NO2, Cl2, and H2O'],
      correctOption: 1,
      points: 1,
      explanation: 'Stanley Miller and Harold Urey circulated methane (CH4), ammonia (NH3), hydrogen (H2), and water vapor (reducing atmosphere) past electrical discharges, producing amino acids (glycine, alanine) (BISE Lahore/Rawalpindi).'
    },
    {
      id: 'q_ch24_15',
      questionText: "The discovery of catalytic RNA molecules called 'Ribozymes' led to which major hypothesis regarding the origin of genetic systems?",
      options: ['Protein-first hypothesis', 'RNA World Hypothesis', 'Panspermia hypothesis', 'Clay crystal hypothesis'],
      correctOption: 1,
      points: 1,
      explanation: 'Because RNA can both store genetic code and catalyze biochemical reactions (acting as ribozymes), the RNA World Hypothesis posits that RNA preceded DNA and proteins in prebiotic evolution (BISE Faisalabad/Multan).'
    },
    {
      id: 'q_ch24_16',
      questionText: 'The Endosymbiotic Theory (popularized by Lynn Margulis) explains that eukaryotic mitochondria originated from ancestral:',
      options: ['Photosynthetic cyanobacteria', 'Aerobic heterotrophic proteobacteria', 'Methanogenic archaebacteria', 'Extremophilic halophiles'],
      correctOption: 1,
      points: 1,
      explanation: 'Mitochondria contain their own circular 70S DNA and ribosomes and are derived from ancient aerobic bacteria engulfed by primitive anaerobic eukaryotes (BISE Gujranwala/Lahore).'
    },
    {
      id: 'q_ch24_17',
      questionText: 'Jean-Baptiste de Lamarck explained the evolution of the long neck of the giraffe using which discredited concept?',
      options: ['Survival of the fittest', 'Inheritance of acquired characteristics through use and disuse', 'Discontinuous genetic mutations', 'Geographic isolation'],
      correctOption: 1,
      points: 1,
      explanation: 'Lamarck proposed that physical modifications acquired by an organism during its lifetime (stretching neck to reach high foliage) are directly inherited by its progeny (BISE Multan/Sargodha).'
    },
    {
      id: 'q_ch24_18',
      questionText: 'The rapid increase in the frequency of dark-colored (melanic) peppered moths (Biston betularia) in polluted industrial England is a textbook demonstration of:',
      options: ['Artificial selection', 'Natural selection via selective predation', 'Random genetic drift', 'Genetic bottleneck'],
      correctOption: 1,
      points: 1,
      explanation: 'Industrial soot blackened lichen-covered tree trunks, camouflaging the dark carbonaria form against bird predation while making the typical light form easily visible (industrial melanism) (BISE Lahore/Faisalabad).'
    },
    {
      id: 'q_ch24_19',
      questionText: "Which rare mammal endemic to the Indus River system in Pakistan is categorized as an 'Endangered Species' due to dam construction and pollution?",
      options: ['Markhor (Capra falconeri)', 'Indus River Dolphin (Platanista minor / indi)', 'Snow Leopard (Panthera uncia)', 'Chinkara Gazelle'],
      correctOption: 1,
      points: 1,
      explanation: 'The Indus River blind dolphin (Platanista minor) is an endangered cetacean confined to fragmented stretches of the Indus River between barrages in Pakistan (BISE Gujranwala/Multan).'
    },
    {
      id: 'q_ch24_20',
      questionText: "A biological species whose wild population has declined so drastically that it is in immediate danger of total extinction throughout its range is defined as:",
      options: ['Threatened species', 'Endangered species', 'Rare species', 'Extirpated species'],
      correctOption: 1,
      points: 1,
      explanation: 'An endangered species faces imminent risk of extinction throughout all or a significant portion of its range without aggressive conservation intervention (BISE Gujranwala/Sargodha).'
    },
    {
      id: 'q_ch24_21',
      questionText: 'The type of speciation where a physical geographical barrier (mountain range, canyon, river) splits a population into isolated groups is termed:',
      options: ['Sympatric speciation', 'Allopatric speciation', 'Parapatric speciation', 'Polyploid speciation'],
      correctOption: 1,
      points: 1,
      explanation: 'Allopatric speciation occurs when geographic isolation prevents gene flow, allowing separate populations to diverge independently under local selective pressures (BISE Faisalabad/Lahore).'
    },
    {
      id: 'q_ch24_22',
      questionText: 'When natural selection favors intermediate phenotypic variants while culling extreme individuals at both ends of a trait spectrum, it is called:',
      options: ['Directional selection', 'Disruptive selection', 'Stabilizing selection', 'Balancing selection'],
      correctOption: 2,
      points: 1,
      explanation: 'Stabilizing selection narrows phenotypic variation by favoring average individuals (e.g., human infant birth weight centered around 3–4 kg) (BISE Lahore/Rawalpindi).'
    },
    {
      id: 'q_ch24_23',
      questionText: 'Pelvic bones and rudimentary femurs embedded deep within the abdominal musculature of modern baleen whales are examples of:',
      options: ['Analogous structures', 'Atavistic anomalies', 'Vestigial skeletal remnants', 'Homoplastic adaptations'],
      correctOption: 2,
      points: 1,
      explanation: 'Whale pelvic bones are non-functional remnants of ancestral four-legged terrestrial mammalian ancestors (such as Pakicetus and Ambulocetus) (BISE Gujranwala/Bahawalpur).'
    },
    {
      id: 'q_ch24_24',
      questionText: 'The establishment of a new isolated colony by a very small group of emigrant individuals carrying only a fraction of the parent gene pool diversity is known as:',
      options: ['Gene flow', 'Founder effect', 'Disruptive selection', 'Adaptive radiation'],
      correctOption: 1,
      points: 1,
      explanation: 'The founder effect is a form of genetic drift seen when a small founder group establishes a new colony, often producing high frequencies of previously rare recessive alleles (BISE Sahiwal/Multan).'
    },
    {
      id: 'q_ch24_25',
      questionText: 'The Houbara Bustard (Chlamydotis undulata) is classified in Pakistan under which wildlife conservation category?',
      options: ['Extinct in the Wild', 'Vulnerable / Threatened migratory bird', 'Invasive alien species', 'Abundant domestic species'],
      correctOption: 1,
      points: 1,
      explanation: 'The Houbara bustard is a vulnerable migratory desert bird that winters in Cholistan and Balochistan and is protected under strict wildlife conservation schedules (BISE Multan/DG Khan).'
    }
  ]
};

async function runSeed() {
  try {
    console.log('Connecting to MongoDB Atlas at:', MONGODB_URI.split('@')[1] || 'Cluster');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');

    // Upsert Chapter 18
    const res18 = await Quiz.findOneAndUpdate(
      { id: QUIZ_CH18.id },
      QUIZ_CH18,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Saved Chapter 18: ${res18.title} (Questions: ${res18.questions.length})`);

    // Upsert Chapter 24
    const res24 = await Quiz.findOneAndUpdate(
      { id: QUIZ_CH24.id },
      QUIZ_CH24,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Saved Chapter 24: ${res24.title} (Questions: ${res24.questions.length})`);

    const totalCount = await Quiz.countDocuments();
    console.log(`Total Quizzes now in MongoDB Atlas: ${totalCount}`);

    await mongoose.disconnect();
    console.log('Disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

runSeed();

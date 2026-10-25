import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  CheckCircle2,
  X,
  Monitor,
  RotateCcw,
  MessageCircle,
  Menu,
  Send,
  Eye,
  HelpCircle
} from 'lucide-react';
import { Login } from './Login';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/* ══════════════════════════════════════════════════════════════════════════════
   TYPES & DATA MODELS
══════════════════════════════════════════════════════════════════════════════ */
interface ProgramItem {
  id: string;
  category: 'school' | 'military';
  title: string;
  badge: string;
  badgeColor: string;
  targetGroup: string;
  classSize: string;
  schedule: string;
  desc: string;
  features: string[];
  img: string;
}

interface TestQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/* ══════════════════════════════════════════════════════════════════════════════
   HERO CAROUSEL SLIDES (Authentic Pakistani Academy Focus)
══════════════════════════════════════════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    bg: '/images/pak_army_parade.jpg',
    tag: 'Armed Forces Pre-Commissioning',
    title: 'Where Military Character Meets Academic Excellence',
    subtitle: 'Pirmahal’s dedicated dual-track institution: Solid School Education (Classes 1 to 10) along with specialized preparatory coaching for Cadet Colleges and Armed Forces Commissions.',
    highlight: 'PMA Long Course • PAF GDP • Navy PN Cadet',
    actionText: 'Inquire for 2026 Batches',
    targetSection: 'admissions'
  },
  {
    bg: '/images/pak_school_study.jpg',
    tag: 'School Academic Wing (Class 1–10)',
    title: 'Solid Board Education for Classes 1 to 10',
    subtitle: 'Rigorous conceptual schooling aligned with Federal Board (FBISE) and Punjab Board curricula. Strict 1:15 batch ratios guarantee individual teacher care.',
    highlight: 'Federal Board (FBISE) & Punjab Boards',
    actionText: 'Explore School Classes',
    targetSection: 'programs'
  },
  {
    bg: '/images/pak_cadet_drill.jpg',
    tag: 'Cadet College Entry & ISSB Prep',
    title: 'Cadet College Entry & Initial Officer Screening',
    subtitle: 'Focused entrance test coaching for Cadet College Hasan Abdal, Kohat, Batrasi, and MCJ, alongside computerized intelligence and physical agility drills.',
    highlight: 'Class 7 & 8 Entry • ISSB Guidance',
    actionText: 'Try CBT Simulator',
    targetSection: 'test-simulator'
  },
  {
    bg: '/images/pak_female_officers.jpg',
    tag: 'Empowering Future Leaders',
    title: 'Lady Cadet Course & Armed Forces Nursing Services',
    subtitle: 'Specialized physical, intelligence, and academic training modules tailored for female candidates aspiring to commission in the armed forces.',
    highlight: 'LCC • AFNS • Medical Cadets',
    actionText: 'Inquire Now',
    targetSection: 'admissions'
  }
];

/* ══════════════════════════════════════════════════════════════════════════════
   DUAL-TRACK PROGRAMS DATA (Streamlined & Focused)
══════════════════════════════════════════════════════════════════════════════ */
const PROGRAMS_DATA: ProgramItem[] = [
  {
    id: 'school-primary',
    category: 'school',
    title: 'Primary Foundation Wing (Classes 1–5)',
    badge: 'School Academic Wing',
    badgeColor: '#1a2b45',
    targetGroup: 'Boys & Girls (Ages 6–11)',
    classSize: 'Max 15 Students per Class',
    schedule: 'Mon – Fri: 08:00 AM – 01:30 PM',
    desc: 'Strong foundation in English, Mathematics, General Science, and Islamic Ethics with character building and structured daily study habits.',
    features: [
      'Conceptual Math & Phonics-based English',
      'Daily supervised homework & reading room',
      'Interactive mental arithmetic drills',
      'Basic physical fitness & posture training'
    ],
    img: '/images/pak_school_boy.jpg'
  },
  {
    id: 'school-middle',
    category: 'school',
    title: 'Middle School & Pre-Cadet (Classes 6–8)',
    badge: 'School Academic Wing',
    badgeColor: '#1a2b45',
    targetGroup: 'Class 6, 7 & 8 Students',
    classSize: 'Max 15 Students per Class',
    schedule: 'Morning Classes + Evening Prep',
    desc: 'Intensive middle school curriculum combined with early Cadet College entrance exam preparation (Hasan Abdal, Kohat, PAF Sargodha).',
    features: [
      'Dual-focus on Board syllabus & entrance tests',
      'Analytical Mathematics, Physics & English grammar',
      'Weekly timed speed tests & CBT practice',
      'Confidence building & declamation training'
    ],
    img: '/images/pak_school_girl.jpg'
  },
  {
    id: 'school-matric',
    category: 'school',
    title: 'Matriculation Board Wing (Classes 9 & 10)',
    badge: 'Board Distinction Focus',
    badgeColor: '#c5a059',
    targetGroup: 'Matric Science (Biology / Computer)',
    classSize: 'Max 20 Students per Section',
    schedule: 'Comprehensive Board Syllabus Coverage',
    desc: 'Targeting 95%+ marks in FBISE and Punjab Boards through chapter-wise past paper analysis, regular numerical problem workshops, and lab sessions.',
    features: [
      'Past 10 years solved board papers practice',
      'Physics, Chemistry & Biology conceptual labs',
      'Full-length mock board examinations',
      'One-on-one weak topic revision sessions'
    ],
    img: '/images/pak_school_study.jpg'
  },
  {
    id: 'cadet-entry',
    category: 'military',
    title: 'Cadet College Entry Test Prep (Class 7 & 8 Entry)',
    badge: 'Cadet College Entry',
    badgeColor: '#4b5320',
    targetGroup: 'Class 6 & 7 Boys & Girls',
    classSize: 'Intensive 20-Seat Batches',
    schedule: 'Evening & Weekend Intensive Batches',
    desc: 'Comprehensive entry test preparation for Cadet College Hasan Abdal, Cadet College Kohat, Military College Jhelum, Military College Murree, and Cadet College Batrasi.',
    features: [
      'Specialized English essay writing & comprehension',
      'Advanced Mathematics & Intelligence questions',
      'Interview grooming & psychological orientation',
      'Medical examination checklist guidance'
    ],
    img: '/images/pak_cadet_campus.jpg'
  },
  {
    id: 'pma-long-course',
    category: 'military',
    title: 'PMA Long Course & Officer Commission',
    badge: 'Armed Forces Commission',
    badgeColor: '#4b5320',
    targetGroup: 'Intermediate / F.Sc / A-Level Candidates',
    classSize: 'Max 25 Candidates per Course',
    schedule: '8-Week Pre-Commission Bootcamp',
    desc: 'Complete initial computerized test prep, physical efficiency conditioning (2-mile run, pushups, pullups), and comprehensive ISSB ground simulation.',
    features: [
      'Verbal & Non-Verbal computerized intelligence',
      'Academic test coaching (General Knowledge, Math)',
      'Outdoor GTO group obstacle simulation',
      'Psychological tests: WAT, TAT & Situation Reaction'
    ],
    img: '/images/pak_cadet_drill.jpg'
  },
  {
    id: 'paf-navy-special',
    category: 'military',
    title: 'PAF GDP, Navy PN Cadet & Lady Cadet Course (LCC)',
    badge: 'Air Force • Navy • LCC',
    badgeColor: '#2e4a7d',
    targetGroup: 'Matric / F.Sc Pre-Eng / Pre-Med / Graduates',
    classSize: 'Specialized 20-Seat Batches',
    schedule: 'Flexible Morning & Evening Shifts',
    desc: 'Tailored preparation for PAF General Duty Pilot (GDP), Aeronautical Engineering, Navy PN Cadet, and Lady Cadet Course (LCC/AFNS).',
    features: [
      'Aviation physics, flight aptitude & trigonometry',
      'Navy initial test & naval history syllabus',
      'Female cadet fitness, obstacle & interview coaching',
      'Real exam simulation on computerized testing engine'
    ],
    img: '/images/pak_female_officers.jpg'
  }
];

/* ══════════════════════════════════════════════════════════════════════════════
   AUTHENTIC CBT TEST SIMULATOR QUESTIONS
══════════════════════════════════════════════════════════════════════════════ */
const CBT_TEST_QUESTIONS: Record<string, TestQuestion[]> = {
  intelligence: [
    {
      id: 1,
      category: 'Verbal Intelligence — Analogy',
      question: 'SOLDIER is to REGIMENT as CADET is to:',
      options: ['Battalion', 'Academy', 'Barracks', 'Company'],
      correctIndex: 1,
      explanation: 'A soldier is organized under a regiment, while a cadet is trained and organized under an academy.'
    },
    {
      id: 2,
      category: 'Non-Verbal & Numerical Series',
      question: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
      options: ['95', '127', '120', '135'],
      correctIndex: 1,
      explanation: 'The pattern is (n × 2) + 1: (3×2)+1=7, (7×2)+1=15, (15×2)+1=31, (31×2)+1=63, (63×2)+1=127.'
    },
    {
      id: 3,
      category: 'Direction & Tactical Sense',
      question: 'A cadet marches 4 km North, then turns East and marches 3 km. How far is he from his starting point?',
      options: ['7 km', '5 km', '12 km', '6 km'],
      correctIndex: 1,
      explanation: 'Applying the Pythagorean theorem: √(4² + 3²) = √(16 + 9) = √25 = 5 km.'
    },
    {
      id: 4,
      category: 'Verbal Intelligence — Coding',
      question: 'If "MARCH" is coded as "OCVEJ", how will "DRILL" be coded in the same pattern?',
      options: ['ESJMM', 'FTKNN', 'EQKMM', 'FSLNN'],
      correctIndex: 1,
      explanation: 'Each letter is shifted forward by +2 positions: D->F, R->T, I->K, L->N, L->N (FTKNN).'
    },
    {
      id: 5,
      category: 'Classification & Odd One Out',
      question: 'Which of the following military assets does NOT belong with the others?',
      options: ['Submarine', 'Frigate', 'Main Battle Tank', 'Destroyer'],
      correctIndex: 2,
      explanation: 'Submarine, Frigate, and Destroyer are naval warships, whereas a Main Battle Tank is an armored ground combat vehicle.'
    }
  ],
  academic: [
    {
      id: 101,
      category: 'Physics — Mechanics',
      question: 'What is the SI unit of Force, defined as kg·m/s²?',
      options: ['Joule', 'Pascal', 'Newton', 'Watt'],
      correctIndex: 2,
      explanation: 'The SI unit of force is the Newton (N), equal to the force required to accelerate 1 kg by 1 m/s².'
    },
    {
      id: 102,
      category: 'Mathematics — Algebra',
      question: 'If 2x + 5 = 17, what is the value of 3x - 1?',
      options: ['15', '17', '18', '20'],
      correctIndex: 1,
      explanation: '2x = 17 - 5 = 12 => x = 6. Substituting into 3x - 1 gives 3(6) - 1 = 17.'
    },
    {
      id: 103,
      category: 'Chemistry — Chemical Reactions',
      question: 'Which gas is produced when zinc granules react with dilute hydrochloric acid?',
      options: ['Oxygen', 'Carbon Dioxide', 'Hydrogen', 'Nitrogen'],
      correctIndex: 2,
      explanation: 'Zn + 2HCl → ZnCl₂ + H₂↑. Hydrogen gas is released in the reaction.'
    },
    {
      id: 104,
      category: 'General Science — Earth Science',
      question: 'What is the approximate acceleration due to gravity (g) on the surface of Earth?',
      options: ['8.2 m/s²', '9.8 m/s²', '11.2 m/s²', '6.67 m/s²'],
      correctIndex: 1,
      explanation: 'The standard acceleration due to Earth gravity at sea level is approximately 9.8 m/s².'
    },
    {
      id: 105,
      category: 'English — Prepositions',
      question: 'Choose the correct preposition: "The cadet was committed ___ achieving top board distinction."',
      options: ['for', 'to', 'with', 'in'],
      correctIndex: 1,
      explanation: 'The verb phrase "committed" is idiomatically followed by the preposition "to" (committed to doing something).'
    }
  ]
};

/* ══════════════════════════════════════════════════════════════════════════════
   PRESTIGIOUS VETERAN FACULTY
══════════════════════════════════════════════════════════════════════════════ */
interface TrainingWingItem {
  id: string;
  title: string;
  supervision: string;
  badge: string;
  tag: string;
  desc: string;
  features: string[];
  img: string;
}

const TRAINING_WINGS: TrainingWingItem[] = [
  {
    id: 'military-selection',
    title: 'Armed Forces & ISSB Selection Panel',
    supervision: 'Supervised by Retired Defense Officers & ISSB Psychologists',
    badge: 'PMA • PAF • Navy Selection',
    tag: 'Commission Wing',
    desc: 'Rigorous initial computerized screening, outdoor GTO command tasks, psychological orientation (WAT, TAT), and mock selection interviews.',
    features: [
      'Daily computerized verbal & non-verbal intelligence practice',
      'Realistic group planning & outdoor command simulations',
      'Individual candidate personality & confidence appraisal'
    ],
    img: '/images/pak_cadet_drill.jpg'
  },
  {
    id: 'academic-wing',
    title: 'School Academic Wing (Classes 1 to 10)',
    supervision: 'Senior Subject Specialists (Federal Board FBISE & Punjab Boards)',
    badge: 'Federal & Punjab Board Curricula',
    tag: 'School Education',
    desc: 'Deep conceptual foundation in Mathematics, General Science, Physics, Chemistry, and English Grammar with past 10 years solved board papers practice.',
    features: [
      'Strict 1:15 teacher-student ratio for individual guidance',
      'Chapter-wise conceptual worksheets & numerical clinics',
      'Daily supervised homework check & parent weekly reporting'
    ],
    img: '/images/pak_school_study.jpg'
  },
  {
    id: 'cadet-college-prep',
    title: 'Cadet College Preparatory Wing',
    supervision: 'Experienced Entrance Test Coaches for Class 7 & 8 Entry',
    badge: 'Hasan Abdal • Kohat • Batrasi • MCJ',
    tag: 'Cadet College Entry',
    desc: 'Dedicated entrance test preparation for Cadet College Hasan Abdal, Kohat, Military College Jhelum, Murree, and Batrasi entrance tests and medical standards.',
    features: [
      'Creative English and Urdu essay writing workshops',
      'Advanced arithmetic, algebraic problem-solving drills',
      'Pre-cadet interview grooming & medical checklist review'
    ],
    img: '/images/pak_cadet_campus.jpg'
  },
  {
    id: 'physical-drill',
    title: 'Physical Fitness, Obstacle & Drill Wing',
    supervision: 'Conducted by Retired Armed Forces Drill Instructors',
    badge: 'Standard Military PT',
    tag: 'Physical Fitness',
    desc: 'Daily physical training regimen designed to meet military fitness standards including 1.6km running, chin-ups, push-ups, and agility drills.',
    features: [
      'Morning & evening endurance running and stamina building',
      'Standard obstacle course navigation & body balance drills',
      'Discipline, punctuality, and military bearing development'
    ],
    img: '/images/pak_cadet_parade.jpg'
  }
];

/* ══════════════════════════════════════════════════════════════════════════════
   CAMPUS LIFE & TRAINING GALLERY (100% Clean Verified Images)
══════════════════════════════════════════════════════════════════════════════ */
const GALLERY_ITEMS = [
  {
    title: 'Pakistan Military Academy Cadet Drill',
    tag: 'Military Discipline',
    desc: 'PMA Kakul Gentlemen Cadets marching in synchronized parade formation with rifles and green berets.',
    img: '/images/pak_cadet_drill.jpg'
  },
  {
    title: 'Air Force Academy Grand Campus & Fountains',
    tag: 'Campus Life',
    desc: 'Lush green lawns and architectural reflection pools of the premier military training campus.',
    img: '/images/pak_cadet_campus.jpg'
  },
  {
    title: 'PAF Fighter Pilots & Aviator Crew',
    tag: 'Aviation Wing',
    desc: 'Flight officers and pilots in flight gear preparing for tactical aviation missions.',
    img: '/images/pak_paf_officers.jpg'
  },
  {
    title: 'Academic Study & Science Problem Solving',
    tag: 'School Academic Wing',
    desc: 'Dedicated student in school uniform solving mathematics and science problems under faculty guidance.',
    img: '/images/pak_school_study.jpg'
  },
  {
    title: 'Pakistan Navy Cadets with Ceremonial Swords',
    tag: 'Naval Wing',
    desc: 'Pristine white uniforms and naval honor guard formation at national commissioning ceremonies.',
    img: '/images/pak_navy_cadets.jpg'
  },
  {
    title: 'Pakistan Army Lady Cadet Officers',
    tag: 'Girls Leadership',
    desc: 'Exemplary lady cadet officers representing dedication, discipline, and national service.',
    img: '/images/pak_female_officers.jpg'
  }
];

/* ══════════════════════════════════════════════════════════════════════════════
   FREQUENTLY ASKED QUESTIONS (Accordion)
══════════════════════════════════════════════════════════════════════════════ */
const FAQ_ITEMS = [
  {
    q: 'Does Cadets Coaching Academy offer regular school classes for Class 1 to 10?',
    a: 'Yes! We run a full-time School Academic Wing from Class 1 through Class 10, strictly aligned with Federal Board (FBISE) and Punjab Board curricula. Students receive complete academic schooling with an added advantage: structured military-grade discipline, character training, and small 1:15 batch sizes.'
  },
  {
    q: 'Can parents visit the academy office in Sadar Bazar, Pirmahal?',
    a: 'Yes, parents are warmly welcomed. You can visit our office at Sadar Bazar, Pirmahal from Monday to Saturday (08:00 AM – 06:00 PM) to meet our instructional staff, inspect our study facilities, and receive a free evaluation for your child. Please call or WhatsApp +92 370 9993993 to schedule a visit.'
  },
  {
    q: 'What is the batch size and teacher-to-student ratio?',
    a: 'We maintain a strict maximum limit of 20 to 25 students per class (1:15 ratio). Unlike overcrowded commercial centers with 50+ students packed in halls, our small founding batches guarantee individual attention, personalized daily homework checking, and weekly WhatsApp progress updates to parents.'
  },
  {
    q: 'Are fee concessions available for Shuhada and Armed Forces families?',
    a: 'Yes. As an honor to our national defenders, Cadets Coaching Academy provides a 10% to 15% special educational fee concession for the children of Armed Forces personnel, Police officers, and Shuhada families upon verification.'
  },
  {
    q: 'What are the daily academy timings for school and evening sessions?',
    a: 'We operate two structured shifts: Morning School Academic Wing (08:00 AM – 01:30 PM) for regular classes 1 to 10, and Afternoon/Evening Pre-Cadet & Military Wing (02:30 PM – 06:00 PM) dedicated to entry test coaching, past paper workshops, and physical PT drills.'
  },
  {
    q: 'Which Cadet Colleges and Military Commissions do you prepare students for?',
    a: 'We prepare students for Cadet College Hasan Abdal, Cadet College Kohat, Military College Jhelum, Military College Murree, Cadet College Batrasi, and WAPDA Cadet College Tarbela, as well as initial tests and ISSB orientation for Pakistan Army (PMA Long Course), Pakistan Air Force (GDP/Aeronautical), and Pakistan Navy (PN Cadet & Lady Cadet Course).'
  }
];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export const LandingPage: React.FC = () => {
  // Navigation & Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryCourse, setInquiryCourse] = useState('School Academic Wing (Classes 1–10)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<typeof GALLERY_ITEMS[0] | null>(null);

  // Hero & Filter States
  const [heroSlide, setHeroSlide] = useState(0);
  const [programFilter, setProgramFilter] = useState<'all' | 'school' | 'military'>('all');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // CBT Test Simulator State
  const [activeTestCategory, setActiveTestCategory] = useState<'intelligence' | 'academic'>('intelligence');
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [testTimeRemaining, setTestTimeRemaining] = useState(180);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScoreResult, setTestScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Navigation & Active Section State
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  // Quick Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  const handleSubmitInquiry = async () => {
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      alert('Please enter both student/parent name and phone number.');
      return;
    }
    setIsSubmittingInquiry(true);
    try {
      await addDoc(collection(db, 'admissions_inquiries'), {
        name: inquiryName.trim(),
        phone: inquiryPhone.trim(),
        program: inquiryCourse,
        status: 'New',
        source: 'Website Landing Page',
        createdAt: serverTimestamp(),
        dateString: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
      });
      setInquirySubmitted(true);
    } catch (err) {
      console.error('Error saving admission inquiry to Firestore:', err);
      // Still show submitted so parent can connect via WhatsApp
      setInquirySubmitted(true);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // 1. Scroll Progress, Header Scroll & Back-to-Top Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Luxury Scroll Animation Observer (IntersectionObserver fallback for Firefox)
  //    In Chrome/Edge/Safari 26+ the native CSS animation-timeline: view() takes over.
  useEffect(() => {
    // Skip JS-driven reveals if the browser supports native CSS scroll-driven animations
    const supportsNative = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Auto-stagger direct children of grid containers
            const children = entry.target.querySelectorAll<HTMLElement>(
              ':scope > .scroll-reveal, :scope > .scroll-reveal-left, :scope > .scroll-reveal-right, :scope > .scroll-reveal-scale'
            );
            children.forEach((child, i) => {
              if (!child.classList.contains('stagger-1') &&
                  !child.classList.contains('stagger-2') &&
                  !child.classList.contains('stagger-3') &&
                  !child.classList.contains('stagger-4') &&
                  !child.classList.contains('stagger-5') &&
                  !child.classList.contains('stagger-6')) {
                child.style.transitionDelay = `${(i + 1) * 0.09}s`;
              }
            });
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    const selectors = [
      '.scroll-reveal',
      '.scroll-reveal-left',
      '.scroll-reveal-right',
      '.scroll-reveal-scale',
      '.lux-divider',
      '.lux-label'
    ].join(', ');

    const revealElements = document.querySelectorAll(selectors);

    if (supportsNative) {
      // In native-CSS mode: only trigger lux-divider + lux-label (gold lines) via JS
      // because their ::after pseudo-elements need the .is-visible class
      const jsOnly = document.querySelectorAll('.lux-divider, .lux-label');
      jsOnly.forEach((el) => observer.observe(el));
    } else {
      // Full fallback: observe everything
      revealElements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, [programFilter]);


  // 3. Hero Carousel Auto-Rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // 4. Scrollspy Active Section Tracker
  useEffect(() => {
    const sectionIds = ['home', 'about', 'programs', 'test-simulator', 'faculty', 'gallery', 'faq', 'admissions'];
    const handleScrollActive = () => {
      const scrollY = window.scrollY;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const sec = document.getElementById(sectionIds[i]);
        if (sec) {
          const top = sec.offsetTop - 120;
          if (scrollY >= top) {
            setActiveNavTab(sectionIds[i]);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollActive, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollActive);
  }, []);

  // 5. Test Simulator Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (testStarted && !testSubmitted && testTimeRemaining > 0) {
      timer = setInterval(() => {
        setTestTimeRemaining((prev) => {
          if (prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, testSubmitted, testTimeRemaining]);

  // Smooth Scroll Helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveNavTab(id);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 75;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Open Quick Admissions Modal
  const handleOpenInquiry = (courseName?: string) => {
    if (courseName) {
      setInquiryCourse(courseName);
    }
    setInquirySubmitted(false);
    setShowInquiryModal(true);
  };

  // CBT Simulator Handlers
  const currentQuestions = CBT_TEST_QUESTIONS[activeTestCategory];

  const handleStartTest = (category: 'intelligence' | 'academic') => {
    setActiveTestCategory(category);
    setTestStarted(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTestTimeRemaining(180);
    setTestSubmitted(false);
    setTestScoreResult(null);
    scrollToSection('test-simulator');
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleFinishTest = () => {
    setTestSubmitted(true);
    let correctCount = 0;
    currentQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });
    const pct = Math.round((correctCount / currentQuestions.length) * 100);
    setTestScoreResult({
      score: correctCount,
      total: currentQuestions.length,
      percentage: pct
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filtered Programs
  const filteredPrograms = PROGRAMS_DATA.filter((p) => {
    if (programFilter === 'school') return p.category === 'school';
    if (programFilter === 'military') return p.category === 'military';
    return true;
  });

  // Handle WhatsApp Direct Launch
  const openWhatsApp = (msg?: string) => {
    const defaultMsg = msg || `Hello, I would like to inquire about admissions for ${inquiryCourse} at Cadets Coaching Academy.`;
    const url = `https://wa.me/923709993993?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#f7f9fb', color: '#1a2b45', overflowX: 'hidden' }}>
      
      {/* ══════════════════════════════════════════════════════════════════════════
          0. VIEWPORT SCROLL PROGRESS BAR (NEXT-GEN SCROLL MOTION)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          1. FIXED PERSISTENT VANGUARD NAVBAR (ALWAYS VISIBLE AT TOP OF SCREEN)
      ══════════════════════════════════════════════════════════════════════════ */}
      <header className="vanguard-navbar">
        {/* Top Announcement Bar (Smoothly collapses on scroll to preserve screen space) */}
        <div className="top-announcement-bar" style={{
          backgroundColor: '#1a2b45',
          color: '#ffffff',
          fontSize: '0.8rem',
          overflow: 'hidden',
          maxHeight: isScrolled ? '0px' : '38px',
          opacity: isScrolled ? 0 : 1,
          transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
          borderBottom: isScrolled ? 'none' : '1px solid rgba(197, 160, 89, 0.3)'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '6px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <span style={{ backgroundColor: '#c5a059', color: '#1a2b45', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Admissions 2026
              </span>
              <span>Inaugural Batches Open • Limited to 25 Seats per Wing • Class 1–10 & Armed Forces</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href="tel:+923709993993" style={{ color: '#fed488', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Phone size={13} /> +92 370 9993993
              </a>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
              <a href="mailto:cadetscoachingpml@gmail.com" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                <Mail size={13} color="#c5a059" /> cadetscoachingpml@gmail.com
              </a>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
              <span style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} color="#c5a059" /> Sadar Bazar, Pirmahal
              </span>
            </div>
          </div>
        </div>

        {/* Primary Minimalist Navbar Row (Screenshot Match) */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isScrolled ? '8px 24px' : '11px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'padding 0.25s ease'
        }}>
          
          {/* Academy Brand Identity */}
          <div
            onClick={() => scrollToSection('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <img
              src="/logo.png?v=4"
              alt="CCA Logo"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.png'; }}
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <div>
              <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: "'Montserrat', sans-serif" }}>
                CADETS COACHING <span style={{ color: '#c5a059' }}>ACADEMY</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                Class 1–10 • Armed Forces Wing
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean Minimalist Text + Active Underline Bar) */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'Why CCA' },
              { id: 'programs', label: 'Programs' },
              { id: 'test-simulator', label: 'CBT Test' },
              { id: 'faculty', label: 'Faculty' },
              { id: 'gallery', label: 'Campus Life' },
              { id: 'admissions', label: 'Contact' }
            ].map((link) => {
              const isActive = activeNavTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`nav-item-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Links (Log in + Get in Touch pill button) */}
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setShowLoginModal(true)}
              className="nav-login-link"
              title="Cadet & Faculty Portal Login"
            >
              Log in
            </button>

            <button
              onClick={() => handleOpenInquiry('General Admissions 2026')}
              className="nav-cta-pill"
            >
              <span>Get in Touch</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            style={{
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            {mobileMenuOpen ? <X size={22} color="#0f172a" /> : <Menu size={22} color="#0f172a" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.1)'
          }}>
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'Why CCA' },
              { id: 'programs', label: 'Dual-Track Programs' },
              { id: 'test-simulator', label: 'CBT Test Simulator' },
              { id: 'faculty', label: 'Faculty' },
              { id: 'gallery', label: 'Campus Life' },
              { id: 'admissions', label: 'Contact & Admissions' }
            ].map((link) => {
              const isActive = activeNavTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  style={{
                    background: isActive ? 'rgba(15, 23, 42, 0.05)' : 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#0f172a' : '#475569',
                    padding: '12px 14px',
                    minHeight: '48px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    borderLeft: isActive ? '4px solid #0f172a' : '4px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                    touchAction: 'manipulation'
                  }}
                >
                  {link.label}
                </button>
              );
            })}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                style={{ flex: 1, minHeight: '48px', padding: '12px', border: '1.5px solid #0f172a', borderRadius: '10px', background: 'none', fontWeight: 700, color: '#0f172a', touchAction: 'manipulation' }}
              >
                Log in
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleOpenInquiry(); }}
                className="nav-cta-pill"
                style={{ flex: 1, minHeight: '48px', justifyContent: 'center', touchAction: 'manipulation' }}
              >
                Get in Touch
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. DYNAMIC HERO SECTION WITH HIGH-CLARITY AUTHENTIC SLIDES
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="home" className="hero-section" style={{ position: 'relative', minHeight: '660px', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundColor: '#04162f', paddingTop: isScrolled ? '65px' : '95px', transition: 'padding-top 0.25s ease' }}>
        
        {/* Background Slide Image */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: heroSlide === idx ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
              zIndex: 1
            }}
          >
            <img
              src={slide.bg}
              alt={slide.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Luminous High-Contrast Overlay for Perfect Legibility */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(4,22,47,0.92) 0%, rgba(4,22,47,0.78) 50%, rgba(4,22,47,0.45) 100%)'
            }} />
          </div>
        ))}

        {/* Hero Content Layer */}
        <div className="hero-content-layer" style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', width: '100%' }}>
          <div style={{ maxWidth: '720px' }}>
            
            {/* Vanguard Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(4, 22, 47, 0.75)',
              border: '1px solid rgba(254, 212, 136, 0.4)',
              color: '#fed488',
              padding: '6px 16px',
              borderRadius: '50px',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '20px',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <Shield size={14} color="#fed488" /> {HERO_SLIDES[heroSlide].tag}
            </div>

            {/* Headline */}
            <h1 className="hero-title" style={{
              fontSize: 'clamp(2.2rem, 4.2vw, 3.8rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              margin: '0 0 20px',
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              Where Military Discipline Meets <span style={{ color: '#fed488' }}>Academic Distinction</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle" style={{
              fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
              color: '#e2e8f0',
              lineHeight: 1.6,
              margin: '0 0 32px',
              maxWidth: '640px'
            }}>
              {HERO_SLIDES[heroSlide].subtitle}
            </p>

            {/* Call to Actions */}
            <div className="hero-cta-group" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <button
                onClick={() => handleOpenInquiry('Founding Batch 2026 Registration')}
                style={{
                  backgroundColor: '#c5a059',
                  color: '#1a2b45',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 25px -5px rgba(197, 160, 89, 0.5)',
                  transition: 'all 0.25s ease'
                }}
                className="hover-lift"
              >
                <span>Apply for 2026 Batch</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => scrollToSection('programs')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.borderColor = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
              >
                <BookOpen size={18} /> Explore Dual Tracks
              </button>

              <button
                onClick={() => handleStartTest('intelligence')}
                style={{
                  backgroundColor: 'rgba(4, 22, 47, 0.7)',
                  color: '#fed488',
                  border: '1.5px solid #c5a059',
                  padding: '15px 26px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c5a059';
                  e.currentTarget.style.color = '#1a2b45';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(4, 22, 47, 0.7)';
                  e.currentTarget.style.color = '#fed488';
                }}
              >
                <Monitor size={17} /> Try CBT Simulator
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="hero-metrics-bar" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '16px',
              backgroundColor: 'rgba(4, 22, 47, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '16px 20px'
            }}>
              {[
                { label: 'Ratio', value: '1:15', desc: 'Strict Small Batches' },
                { label: 'Mentors', value: '100%', desc: 'Ex-Military & Gold Medalists' },
                { label: 'CBT Bank', value: '750+', desc: 'Exam Questions Ready' },
                { label: 'Session', value: '2026', desc: 'Inaugural Admissions Open' }
              ].map((m, i) => (
                <div key={i} style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingRight: '12px' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fed488', fontFamily: "'Montserrat', sans-serif" }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>{m.desc}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div style={{ position: 'absolute', bottom: '24px', right: '32px', zIndex: 20, display: 'flex', gap: '8px' }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              style={{
                width: heroSlide === i ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                backgroundColor: heroSlide === i ? '#fed488' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. THE 4 PILLARS OF EXCELLENCE (WHY CHOOSE CCA)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="about" style={{ padding: '90px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="scroll-reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c5a059', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', fontFamily: "'JetBrains Mono', monospace" }} className="lux-label">
            <Shield size={16} /> Why Choose Cadets Coaching Academy
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', fontWeight: 900, color: '#1a2b45', margin: '0 0 16px', fontFamily: "'Montserrat', sans-serif" }}>
            Why Families Choose <span style={{ color: '#c5a059' }}>Cadets Coaching Academy</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            Combining rigorous Board education (Classes 1 to 10) with Cadet College & Armed Forces pre-commissioning in an environment of moral discipline, physical fitness, and personal attention.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
          {[
            {
              icon: BookOpen,
              title: 'Dual-Track Curriculum',
              desc: 'School classes 1–10 receive full academic board tutoring alongside military-grade personality and aptitude development.',
              badge: 'Classes 1–10 + Armed Forces'
            },
            {
              icon: Users,
              title: 'Strict 1:15 Batch Ratio',
              desc: 'No overcrowded halls. Every classroom is capped at 15 to 20 students to ensure daily individualized progress checks and teacher feedback.',
              badge: 'Guaranteed Attention'
            },
            {
              icon: Shield,
              title: 'Veteran Military Faculty',
              desc: 'Mentored directly by retired Brigadier, Squadron Leader, and Naval Commander rank officers with real selection board insight.',
              badge: 'Army • PAF • Navy'
            },
            {
              icon: Monitor,
              title: 'Computer-Based Testing Lab',
              desc: 'Real computerized exam terminals replicating the exact testing software used in Armed Forces and Cadet College selection centers.',
              badge: 'Live Simulator'
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              className={`scroll-reveal-scale stagger-${idx + 1} hover-lift`}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '36px 28px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(26, 43, 69, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(197, 160, 89, 0.12)',
                  color: '#c5a059',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <pillar.icon size={28} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c5a059', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {pillar.badge}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a2b45', margin: '0 0 12px', fontFamily: "'Montserrat', sans-serif" }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px', color: '#1a2b45', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} color="#c5a059" /> 2026 Academic Standard
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Luxury gold divider line ── */}
      <div className="lux-divider" style={{ maxWidth: '800px', margin: '0 auto' }} />

      {/* ══════════════════════════════════════════════════════════════════════════
          DIRECTOR'S WELCOME & FOUNDING VISION (Human Authentic Touch)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="scroll-reveal-left">
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid rgba(197, 160, 89, 0.4)',
            borderRadius: '20px',
            padding: 'clamp(28px, 4vw, 48px)',
            boxShadow: '0 8px 30px rgba(26, 43, 69, 0.04)'
          }}>
            <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '16px',
                backgroundColor: '#1a2b45',
                color: '#c5a059',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 6px 16px rgba(26, 43, 69, 0.2)'
              }}>
                <GraduationCap size={44} />
              </div>
              
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(197, 160, 89, 0.15)', color: '#1a2b45', padding: '3px 12px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                  Director's Desk • Pirmahal Campus
                </div>
                <h3 style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)', fontWeight: 900, color: '#1a2b45', margin: '0 0 16px', fontFamily: "'Montserrat', sans-serif" }}>
                  "Building Character, Academic Rigor & Military Preparedness"
                </h3>
                
                <div style={{ color: '#475569', fontSize: '0.96rem', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ margin: 0 }}>
                    Welcome to Cadets Coaching Academy, Pirmahal. As we inaugurate our founding 2026 batches, our mission is clear: to provide young boys and girls an environment that combines solid academic learning with military discipline, honor, and character.
                  </p>
                  <p style={{ margin: 0 }}>
                    Unlike commercial coaching centers where students are lost in crowded halls, we have intentionally capped each batch at strictly <strong>25 students</strong>. This guarantees that every child receives direct attention from our senior board faculty and retired military instructors. We focus equally on conceptual board mastery (FBISE & Punjab Boards), spoken English fluency, physical stamina (daily PT & drill), and Islamic moral grounding.
                  </p>
                  <p style={{ margin: 0 }}>
                    We warmly welcome parents to visit our office at <strong>Sadar Bazar, Pirmahal</strong>, meet our instructional team, and observe our classes in action.
                  </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a2b45' }}>
                      Director of Academics & Training
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Cadets Coaching Academy, Pirmahal
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenInquiry('Office Visit & Parent Counseling')}
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.86rem',
                        border: '1.5px solid #1a2b45',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: '#1a2b45',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Book Office Visit
                    </button>
                    <button
                      onClick={() => openWhatsApp('Hello, I would like to schedule an office visit and meet the Academy Director at Cadets Coaching Academy, Sadar Bazar, Pirmahal.')}
                      style={{
                        backgroundColor: '#25d366',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MessageCircle size={15} /> WhatsApp Director's Office
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. DUAL-TRACK ACADEMIC & MILITARY PROGRAMS SECTION
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="programs" style={{ padding: '90px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }} className="scroll-reveal">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c5a059', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontFamily: "'JetBrains Mono', monospace" }} className="lux-label">
              <GraduationCap size={16} /> Admissions 2026 Curriculum
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', fontWeight: 900, color: '#1a2b45', margin: '0 0 14px', fontFamily: "'Montserrat', sans-serif" }}>
              Dual-Track Programs: <span style={{ color: '#c5a059' }}>School & Armed Forces</span>
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '680px', margin: '0 auto' }}>
              Select a wing below to explore our academic school syllabus or pre-commission military training roadmaps.
            </p>

            {/* Filter Tabs */}
            <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', marginTop: '28px', gap: '6px' }}>
              {[
                { key: 'all', label: 'All Programs' },
                { key: 'school', label: 'School Academic Wing (Class 1–10)' },
                { key: 'military', label: 'Armed Forces & Cadet College' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setProgramFilter(tab.key as any)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: programFilter === tab.key ? '#1a2b45' : 'transparent',
                    color: programFilter === tab.key ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Programs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="scroll-reveal hover-lift"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(26, 43, 69, 0.04)'
                }}
              >
                {/* Clean Image Container with Hover Zoom */}
                <div className="img-zoom-container" style={{ height: '220px', backgroundColor: '#04162f' }}>
                  <img
                    src={program.img}
                    alt={program.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    backgroundColor: program.badgeColor,
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {program.badge}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a2b45', margin: '0 0 10px', fontFamily: "'Montserrat', sans-serif" }}>
                      {program.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                      {program.desc}
                    </p>

                    {/* Key Attributes */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
                      <span style={{ fontSize: '0.78rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                        👥 {program.classSize}
                      </span>
                      <span style={{ fontSize: '0.78rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                        🎯 {program.targetGroup}
                      </span>
                    </div>

                    {/* Bullet Points */}
                    <ul style={{ padding: 0, margin: '0 0 24px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {program.features.map((feat, fi) => (
                        <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#334155' }}>
                          <Check size={16} color="#c5a059" style={{ flexShrink: 0 }} /> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleOpenInquiry(program.title)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a2b45',
                      color: '#ffffff',
                      border: 'none',
                      padding: '13px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#c5a059';
                      e.currentTarget.style.color = '#1a2b45';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a2b45';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                  >
                    <span>Apply for {program.title.split(' ')[0]}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Welfare & Quota Banner */}
          <div style={{
            marginTop: '50px',
            backgroundColor: '#f8fafc',
            border: '1.5px dashed rgba(197, 160, 89, 0.6)',
            borderRadius: '14px',
            padding: '24px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(197, 160, 89, 0.15)', color: '#c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#1a2b45', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎖️ Shuhada & Armed Forces Children Welfare Quota</span>
                  <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>Special Concession</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>
                  Cadets Coaching Academy proudly provides a 10% to 15% educational fee concession for the children of Shuhada, serving and retired Armed Forces, and Police personnel.
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenInquiry('Welfare Quota & Fee Concession')}
              style={{
                backgroundColor: '#1a2b45',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Inquire for Quota Details
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          5. LIVE CBT COMPUTER-BASED TEST SIMULATOR (HIGH-INTERACTIVITY)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="test-simulator" style={{ padding: '90px 24px', backgroundColor: '#04162f', color: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fed488', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
              <Monitor size={16} /> Computer-Based Testing Lab (CBT)
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 14px', fontFamily: "'Montserrat', sans-serif" }}>
              Experience the Official <span style={{ color: '#fed488' }}>Selection Board CBT System</span>
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#94a3b8', maxWidth: '640px', margin: '0 auto' }}>
              Test your speed and analytical readiness right now on our live initial exam simulator. Choose a category below and start your diagnostic.
            </p>
          </div>

          {/* Simulator Terminal Box */}
          <div style={{
            backgroundColor: '#0d1f38',
            borderRadius: '20px',
            border: '2px solid rgba(197, 160, 89, 0.4)',
            padding: '36px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)'
          }}>
            
            {/* Engine Header & Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '28px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#fed488', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {activeTestCategory === 'intelligence' ? 'Verbal & Non-Verbal Intelligence Test' : 'Academic & Science Diagnostic'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  CCA Computerized Diagnostic Engine
                </div>
              </div>

              {/* Subject Category Selector */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleStartTest('intelligence')}
                  style={{
                    backgroundColor: activeTestCategory === 'intelligence' ? '#c5a059' : 'rgba(255,255,255,0.08)',
                    color: activeTestCategory === 'intelligence' ? '#1a2b45' : '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Intelligence Test
                </button>
                <button
                  onClick={() => handleStartTest('academic')}
                  style={{
                    backgroundColor: activeTestCategory === 'academic' ? '#c5a059' : 'rgba(255,255,255,0.08)',
                    color: activeTestCategory === 'academic' ? '#1a2b45' : '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Academic (Physics / Math)
                </button>
              </div>
            </div>

            {/* STATE 1: Ready to Start */}
            {!testStarted && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.15)', color: '#fed488', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Monitor size={36} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px' }}>Ready to Test Your Aptitude?</h3>
                <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto 28px', fontSize: '0.94rem', lineHeight: 1.6 }}>
                  5 curated questions • 3-minute timed countdown • Immediate commission suitability score and solution explanations.
                </p>
                <button
                  onClick={() => handleStartTest('intelligence')}
                  style={{
                    backgroundColor: '#c5a059',
                    color: '#1a2b45',
                    border: 'none',
                    padding: '14px 36px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(197, 160, 89, 0.4)',
                    transition: 'all 0.25s ease'
                  }}
                  className="hover-lift"
                >
                  Start Live CBT Test Now
                </button>
              </div>
            )}

            {/* STATE 2: Test Active in Progress */}
            {testStarted && !testSubmitted && (
              <div>
                {/* Timer & Question Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', padding: '12px 20px', borderRadius: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: testTimeRemaining < 30 ? '#ef4444' : '#fed488', fontWeight: 800, fontSize: '0.95rem' }}>
                    <Clock size={18} />
                    <span>Time Remaining: {formatTimer(testTimeRemaining)}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 700 }}>
                    Question {currentQuestionIdx + 1} of {currentQuestions.length}
                  </div>
                </div>

                {/* Question Box */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '8px' }}>
                    {currentQuestions[currentQuestionIdx].category}
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 22px', lineHeight: 1.5 }}>
                    {currentQuestions[currentQuestionIdx].question}
                  </h4>

                  {/* 4 Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentQuestions[currentQuestionIdx].options.map((opt, optIdx) => {
                      const qId = currentQuestions[currentQuestionIdx].id;
                      const isSelected = selectedAnswers[qId] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(qId, optIdx)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: `2px solid ${isSelected ? '#fed488' : 'rgba(255, 255, 255, 0.1)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            fontSize: '0.95rem',
                            fontWeight: isSelected ? 800 : 500,
                            color: isSelected ? '#fed488' : '#ffffff',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? '#fed488' : 'rgba(255,255,255,0.3)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            backgroundColor: isSelected ? '#fed488' : 'transparent',
                            color: isSelected ? '#1a2b45' : '#ffffff'
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Test Navigation Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                      opacity: currentQuestionIdx === 0 ? 0.4 : 1
                    }}
                  >
                    Previous Question
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {currentQuestionIdx < currentQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                        style={{
                          backgroundColor: '#2e4a7d',
                          color: '#ffffff',
                          border: 'none',
                          padding: '11px 26px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishTest}
                        style={{
                          backgroundColor: '#c5a059',
                          color: '#1a2b45',
                          border: 'none',
                          padding: '11px 30px',
                          borderRadius: '8px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(197, 160, 89, 0.4)'
                        }}
                      >
                        Submit Test Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STATE 3: Test Results Card with Solutions */}
            {testSubmitted && testScoreResult && (
              <div style={{ padding: '10px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    color: testScoreResult.percentage >= 80 ? '#fed488' : (testScoreResult.percentage >= 60 ? '#10b981' : '#f87171'),
                    lineHeight: 1,
                    fontFamily: "'Montserrat', sans-serif"
                  }}>
                    {testScoreResult.percentage}%
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
                    {testScoreResult.score} of {testScoreResult.total} Correct Answers
                  </div>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: testScoreResult.percentage >= 80 ? 'rgba(197, 160, 89, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: testScoreResult.percentage >= 80 ? '#fed488' : '#10b981',
                    padding: '6px 18px',
                    borderRadius: '50px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    marginTop: '12px'
                  }}>
                    {testScoreResult.percentage >= 80 ? '🎖️ High Officer Potential — Commission Standard!' : (testScoreResult.percentage >= 60 ? '✅ Passed — Solid Foundation for Cadet Wing' : '📚 Coaching Recommended — Enroll in Preparatory Batch')}
                  </div>
                </div>

                {/* Explanations List */}
                <h4 style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>Detailed Answer Explanations:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', paddingRight: '6px' }}>
                  {currentQuestions.map((q, idx) => {
                    const isCorrect = selectedAnswers[q.id] === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        style={{
                          backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          padding: '14px 18px',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Q{idx + 1}: {q.question}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isCorrect ? '#10b981' : '#f87171' }}>
                            {isCorrect ? 'CORRECT (+1)' : 'INCORRECT (0)'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '6px' }}>
                          💡 <strong>Solution:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ textAlign: 'center', marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleStartTest(activeTestCategory)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.25)',
                      padding: '11px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <RotateCcw size={16} /> Retake Diagnostic
                  </button>

                  <button
                    onClick={() => handleOpenInquiry(`CBT Diagnostic Score: ${testScoreResult.percentage}%`)}
                    style={{
                      backgroundColor: '#c5a059',
                      color: '#1a2b45',
                      border: 'none',
                      padding: '11px 28px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={16} /> Submit Score for Counseling
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          6. INSTRUCTIONAL DEPARTMENTS & MENTORSHIP WINGS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="faculty" style={{ padding: '90px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }} className="scroll-reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c5a059', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontFamily: "'JetBrains Mono', monospace" }} className="lux-label">
            <Award size={16} /> Structured Training Framework
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', fontWeight: 900, color: '#1a2b45', margin: '0 0 14px', fontFamily: "'Montserrat', sans-serif" }}>
            Specialized Instructional & <span style={{ color: '#c5a059' }}>Mentorship Wings</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            Supervised by experienced Board subject specialists and retired Armed Forces instructors—ensuring complete academic mastery, psychological readiness, and physical stamina.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          {TRAINING_WINGS.map((wing) => (
            <div
              key={wing.id}
              className="scroll-reveal hover-lift"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(26, 43, 69, 0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '220px', backgroundColor: '#04162f' }}>
                <img src={wing.img} alt={wing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  backgroundColor: '#1a2b45',
                  color: '#fed488',
                  padding: '4px 12px',
                  borderRadius: '50px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {wing.tag}
                </span>
              </div>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2b45', margin: '0 0 6px', fontFamily: "'Montserrat', sans-serif" }}>
                    {wing.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#c5a059', fontWeight: 700, marginBottom: '12px' }}>
                    {wing.supervision}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                    {wing.desc}
                  </p>
                  
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {wing.features.map((f, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155' }}>
                        <Check size={14} color="#c5a059" style={{ flexShrink: 0 }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                  🎖️ {wing.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          7. CAMPUS LIFE & TRAINING GALLERY WITH LIGHTBOX ZOOM
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="gallery" style={{ padding: '90px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }} className="scroll-reveal">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c5a059', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontFamily: "'JetBrains Mono', monospace" }} className="lux-label">
              <Eye size={16} /> Authentic Campus & Parade Imagery
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', fontWeight: 900, color: '#1a2b45', margin: '0 0 14px', fontFamily: "'Montserrat', sans-serif" }}>
              Campus Life, Drills & <span style={{ color: '#c5a059' }}>Parade Formations</span>
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Click any photograph below to expand and view in high resolution.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {GALLERY_ITEMS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedGalleryPhoto(item)}
                className="scroll-reveal hover-lift img-zoom-container"
                style={{
                  borderRadius: '14px',
                  height: '260px',
                  cursor: 'pointer',
                  backgroundColor: '#04162f',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}
              >
                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(4,22,47,0.85) 0%, rgba(4,22,47,0.1) 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px'
                }}>
                  <span style={{ color: '#fed488', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.tag}
                  </span>
                  <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, margin: '4px 0 0' }}>
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          8. FOUNDING BATCH VOICES & PARENT TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="reviews" style={{ padding: '90px 24px', backgroundColor: '#f7f9fb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }} className="scroll-reveal">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c5a059', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontFamily: "'JetBrains Mono', monospace" }} className="lux-label">
              <Users size={16} /> Founding Batch Enrollees
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', fontWeight: 900, color: '#1a2b45', margin: '0 0 14px', fontFamily: "'Montserrat', sans-serif" }}>
              Trusted by Parents & <span style={{ color: '#c5a059' }}>Cadet Aspirants</span>
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Hear from the first batch of parents and students enrolled in our 2026 inaugural academic and cadet wings.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {[
              {
                name: 'Muhammad Hamza',
                role: 'Parent of Class 8 Cadet Aspirant',
                location: 'Rawalpindi / Islamabad',
                text: 'Finding an academy that offers genuine school academic classes with proper military discipline was impossible until we visited CCA. The 1:15 ratio means my son gets personal mentoring every day.',
                rating: 5,
                badge: 'Batch 2026 Parent'
              },
              {
                name: 'Fatima Zahra',
                role: 'F.Sc Pre-Eng Student • PAF GDP Aspirant',
                location: 'Pirmahal',
                text: 'The computer-based test lab is a total game-changer. Practicing on the exact same testing engine used by the PAF selection board gave me immense confidence for my initial exam.',
                rating: 5,
                badge: '2026 Cadet Candidate'
              },
              {
                name: 'Bilal Ahmed',
                role: 'PMA Long Course Aspirant',
                location: 'Toba Tek Singh',
                text: 'Learning directly from retired military officers gives you insights no ordinary book can provide. The outdoor GTO obstacle simulation and physical conditioning in Pirmahal is top-tier.',
                rating: 5,
                badge: 'Officer Candidate'
              }
            ].map((testi, idx) => (
              <div
                key={idx}
                className={`scroll-reveal-scale stagger-${idx + 1} hover-lift`}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '32px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(26, 43, 69, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '4px', color: '#c5a059', marginBottom: '16px' }}>
                    {[...Array(testi.rating)].map((_, r) => (
                      <Star key={r} size={16} fill="#c5a059" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.65, fontStyle: 'italic', margin: '0 0 20px' }}>
                    "{testi.text}"
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1a2b45', fontSize: '0.98rem' }}>{testi.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{testi.role} • {testi.location}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#1a2b45', padding: '4px 10px', borderRadius: '50px', fontWeight: 700 }}>
                    {testi.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          9. FREQUENTLY ASKED QUESTIONS (EXPANDABLE ACCORDION)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: '90px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }} className="scroll-reveal">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c5a059', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontFamily: "'JetBrains Mono', monospace" }} className="lux-label">
              <HelpCircle size={16} /> Clarifications for Parents
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.6rem)', fontWeight: 900, color: '#1a2b45', margin: '0 0 14px', fontFamily: "'Montserrat', sans-serif" }}>
              Frequently Asked <span style={{ color: '#c5a059' }}>Questions</span>
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#64748b' }}>
              Clear answers to the most common questions regarding our academic curriculum, military wing, and batch admissions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="scroll-reveal"
                  style={{
                    backgroundColor: isOpen ? '#f7f9fb' : '#ffffff',
                    border: `1.5px solid ${isOpen ? '#c5a059' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#1a2b45' }}>
                      {faq.q}
                    </span>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isOpen ? '#c5a059' : '#f1f5f9',
                      color: isOpen ? '#1a2b45' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}>
                      <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 24px 22px', fontSize: '0.92rem', color: '#475569', lineHeight: 1.65 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          10. FINAL CALL TO ACTION & DIRECT ADMISSIONS BAR
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="admissions" style={{
        backgroundColor: '#1a2b45',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(197, 160, 89, 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(46, 74, 125, 0.3) 0%, transparent 50%)',
        color: '#ffffff',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }} className="scroll-reveal">
          <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.15)', color: '#fed488', marginBottom: '20px' }}>
            <GraduationCap size={32} />
          </div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: 900, margin: '0 0 16px', fontFamily: "'Montserrat', sans-serif" }}>
            Begin Your Cadet & Academic Journey Today
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 36px' }}>
            Join the founding 2026 batches at Cadets Coaching Academy. With limited 25 seats per wing, register early to secure enrollment and personal faculty counseling.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOpenInquiry('Direct Admissions 2026')}
              style={{
                backgroundColor: '#c5a059',
                color: '#1a2b45',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px rgba(197, 160, 89, 0.4)',
                transition: 'all 0.25s ease'
              }}
              className="hover-lift"
            >
              <Send size={18} /> Apply for 2026 Batch
            </button>

            <button
              onClick={() => openWhatsApp()}
              style={{
                backgroundColor: '#25d366',
                color: '#ffffff',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.25s ease'
              }}
              className="hover-lift"
            >
              <MessageCircle size={18} /> Chat with Admissions
            </button>

            <a
              href="tel:+923709993993"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.4)',
                padding: '15px 30px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.98rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              <Phone size={18} /> Call +92 370 9993993
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          11. FOOTER
      ══════════════════════════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '60px 24px 30px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <img src="/logo.png?v=4" alt="CCA Logo" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1a2b45', fontFamily: "'Montserrat', sans-serif" }}>
                CADETS COACHING <span style={{ color: '#c5a059' }}>ACADEMY</span>
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
              Pakistan's premier dual-track institution delivering excellence in School Education (Classes 1–10) and Armed Forces Pre-Commissioning.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#c5a059', fontWeight: 800 }}>
              Batch 2026 Admissions Open
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#1a2b45', fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px', fontFamily: "'Montserrat', sans-serif" }}>
              Academic Wings
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              {['Primary Foundation (Class 1–5)', 'Middle School Pre-Cadet (Class 6–8)', 'Matriculation Board Wing (Class 9 & 10)', 'Computer-Based Testing Lab'].map((link, idx) => (
                <li key={idx}>
                  <button onClick={() => scrollToSection('programs')} style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', cursor: 'pointer', textAlign: 'left' }}>
                    › {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Military Wings */}
          <div>
            <h4 style={{ color: '#1a2b45', fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px', fontFamily: "'Montserrat', sans-serif" }}>
              Armed Forces Wing
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              {['Cadet College Entrance Exams', 'PMA Long Course Preparation', 'PAF GDP & Aeronautical Wing', 'Navy PN Cadet & Lady Cadet Course (LCC)'].map((link, idx) => (
                <li key={idx}>
                  <button onClick={() => scrollToSection('programs')} style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', cursor: 'pointer', textAlign: 'left' }}>
                    › {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Location */}
          <div>
            <h4 style={{ color: '#1a2b45', fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px', fontFamily: "'Montserrat', sans-serif" }}>
              Academy Office
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: '#64748b' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <MapPin size={16} color="#c5a059" style={{ flexShrink: 0 }} />
                <span>Sadar Bazar, Pirmahal, Punjab, Pakistan</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Phone size={16} color="#c5a059" style={{ flexShrink: 0 }} />
                <a href="tel:+923709993993" style={{ color: '#64748b', textDecoration: 'none' }}>+92 370 9993993</a>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Mail size={16} color="#c5a059" style={{ flexShrink: 0 }} />
                <a href="mailto:cadetscoachingpml@gmail.com" style={{ color: '#64748b', textDecoration: 'none' }}>cadetscoachingpml@gmail.com</a>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Clock size={16} color="#c5a059" style={{ flexShrink: 0 }} />
                <span>Mon – Sat: 08:00 AM – 06:00 PM</span>
              </div>
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          © 2026 <strong style={{ color: '#1a2b45' }}>Cadets Coaching Academy</strong>. All rights reserved. Dedicated to the Defence & Academic Future of Pakistan.
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════════════
          12. FLOATING QUICK ACTIONS (WHATSAPP & BACK-TO-TOP)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9990, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        
        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#1a2b45',
              color: '#ffffff',
              border: '1.5px solid rgba(197, 160, 89, 0.4)',
              boxShadow: '0 4px 16px rgba(26, 43, 69, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease'
            }}
            title="Scroll to Top"
            className="hover-lift"
          >
            <ChevronDown size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}

        {/* WhatsApp Direct Admissions Floating Action Button */}
        <button
          onClick={() => openWhatsApp()}
          className="floating-action-pulse hover-lift"
          style={{
            backgroundColor: '#25d366',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
            transition: 'all 0.25s ease'
          }}
          title="Direct WhatsApp Admissions Chat"
        >
          <MessageCircle size={20} />
          <span>Chat Admissions</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          13. QUICK ADMISSIONS INQUIRY & REGISTRATION MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {showInquiryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 22, 47, 0.82)',
          backdropFilter: 'blur(8px)',
          zIndex: 100002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ backgroundColor: '#1a2b45', color: '#ffffff', padding: '24px 28px', position: 'relative' }}>
              <button
                onClick={() => setShowInquiryModal(false)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
              <div style={{ fontSize: '0.75rem', color: '#fed488', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Batch 2026 Admissions
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '4px 0 0', fontFamily: "'Montserrat', sans-serif" }}>
                Admissions Inquiry & Seat Booking
              </h3>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px' }}>
              {inquirySubmitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a2b45', margin: '0 0 8px' }}>
                    Application Successfully Submitted!
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>
                    Thank you, <strong>{inquiryName}</strong>! Your inquiry for <strong>{inquiryCourse}</strong> has been logged into the Cadets Coaching Academy database. Our admissions officer will contact you on <strong>{inquiryPhone}</strong>.
                  </p>
                  <button
                    onClick={() => openWhatsApp(`Hello, I just submitted an inquiry for ${inquiryName} regarding ${inquiryCourse}.`)}
                    style={{
                      width: '100%',
                      backgroundColor: '#25d366',
                      color: '#ffffff',
                      border: 'none',
                      padding: '13px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageCircle size={18} /> Chat with Admissions on WhatsApp Now
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                    Enter your details below to request admission details or reserve one of 25 limited seats per batch.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1a2b45', marginBottom: '6px' }}>
                        Selected Program
                      </label>
                      <input
                        type="text"
                        value={inquiryCourse}
                        onChange={(e) => setInquiryCourse(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.9rem',
                          backgroundColor: '#f8fafc',
                          color: '#1a2b45',
                          fontWeight: 600
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1a2b45', marginBottom: '6px' }}>
                        Student / Parent Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tariq Khan"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1a2b45', marginBottom: '6px' }}>
                        WhatsApp / Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 0370 9993993"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSubmitInquiry}
                      disabled={isSubmittingInquiry}
                      style={{
                        backgroundColor: '#1a2b45',
                        color: '#ffffff',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        cursor: isSubmittingInquiry ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '6px',
                        opacity: isSubmittingInquiry ? 0.7 : 1
                      }}
                    >
                      <Send size={16} /> {isSubmittingInquiry ? 'Submitting Application...' : 'Submit Admission Inquiry'}
                    </button>

                    <div style={{ textAlign: 'center', margin: '4px 0', fontSize: '0.8rem', color: '#94a3b8' }}>or</div>

                    <button
                      onClick={() => openWhatsApp(`Hello, my name is ${inquiryName || 'Parent/Aspirant'}. I want to inquire about admissions for ${inquiryCourse}.`)}
                      style={{
                        backgroundColor: '#25d366',
                        color: '#ffffff',
                        border: 'none',
                        padding: '13px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <MessageCircle size={18} /> Connect Directly on WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          14. CADET PORTAL LOGIN MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 22, 47, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 100003,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              <X size={18} />
            </button>
            <Login />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          15. GALLERY LIGHTBOX ZOOM MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {selectedGalleryPhoto && (
        <div
          onClick={() => setSelectedGalleryPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 22, 47, 0.92)',
            backdropFilter: 'blur(10px)',
            zIndex: 100004,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0d1f38',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              position: 'relative',
              border: '1px solid rgba(197, 160, 89, 0.3)'
            }}
          >
            <button
              onClick={() => setSelectedGalleryPhoto(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            <img
              src={selectedGalleryPhoto.img}
              alt={selectedGalleryPhoto.title}
              style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', backgroundColor: '#000000' }}
            />

            <div style={{ padding: '24px', color: '#ffffff' }}>
              <span style={{ color: '#fed488', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedGalleryPhoto.tag}
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '6px 0 8px' }}>
                {selectedGalleryPhoto.title}
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                {selectedGalleryPhoto.desc}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Quiz, Question, Teacher, Student } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Sparkles,
  Copy,
  ChevronRight,
  ChevronLeft,
  FileText,
  Target,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Save,
  Camera,
  Layers,
  Maximize2,
  Shuffle,
  Lock,
  Unlock,
} from 'lucide-react';

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => void;
  teacher: Teacher | null;
  students: Student[];
  editingQuiz?: Quiz | null;
  initialClass?: string;
  initialSubject?: string;
}

export const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teacher,
  students,
  editingQuiz,
  initialClass,
  initialSubject,
}) => {
  useModalScrollLock(isOpen);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

  // Dynamic class & subject options from teacher's assignments
  const teacherClasses = teacher ? Array.from(new Set(teacher.assignments.map((a) => a.className).filter(Boolean))) : [];
  const teacherSubjects = teacher ? Array.from(new Set(teacher.assignments.map((a) => a.subject).filter(Boolean))) : [];
  const availableClassOptions = teacherClasses.length > 0 ? teacherClasses : ['General Cohort'];

  // Step 1: Meta, Class, Subject, Timers & Allocation
  const [title, setTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [subject, setSubject] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState<string>('');
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);

  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passMarks, setPassMarks] = useState(10);
  const [isInQuizBank, setIsInQuizBank] = useState(true);

  // Filter subjects based on the currently selected class
  const availableSubjectsForSelectedClass = useMemo(() => {
    if (!teacher || teacher.assignments.length === 0) return [];
    if (!selectedClass || selectedClass === '__all__') {
      return Array.from(new Set(teacher.assignments.map((a) => a.subject).filter(Boolean)));
    }
    return Array.from(
      new Set(
        teacher.assignments
          .filter((a) => a.className.trim().toLowerCase() === selectedClass.trim().toLowerCase())
          .map((a) => a.subject)
          .filter(Boolean)
      )
    );
  }, [teacher, selectedClass]);

  const getEffectiveClass = () => {
    if (selectedClass === '__all__') return '';
    return selectedClass;
  };

  const getEffectiveSubject = () => {
    if (isCustomSubject) return customSubjectName.trim();
    return subject.trim();
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);

    if (newClass === '__all__') {
      setAllocationMode('all');
      setTargetClasses(teacherClasses);
      const allSubjs = Array.from(new Set(teacher?.assignments.map((a) => a.subject).filter(Boolean) || []));
      if (!isCustomSubject && (!subject || !allSubjs.includes(subject))) {
        if (allSubjs.length > 0) {
          setSubject(allSubjs[0]);
        }
      }
    } else {
      setAllocationMode('classes');
      setTargetClasses([newClass]);

      // Filter subjects for this new class
      const classSubjs = teacher
        ? Array.from(
            new Set(
              teacher.assignments
                .filter((a) => a.className.trim().toLowerCase() === newClass.trim().toLowerCase())
                .map((a) => a.subject)
                .filter(Boolean)
            )
          )
        : [];

      // If current subject is not in the subjects for this class, switch to first available
      if (!isCustomSubject && (!subject || !classSubjs.includes(subject))) {
        if (classSubjs.length > 0) {
          setSubject(classSubjs[0]);
        } else if (teacherSubjects.length > 0) {
          setSubject(teacherSubjects[0]);
        }
      }
    }
  };

  const handleSubjectSelectChange = (newSubject: string) => {
    if (newSubject === '__custom__') {
      setIsCustomSubject(true);
      setSubject('');
    } else {
      setIsCustomSubject(false);
      setSubject(newSubject);
    }
  };

  // Publishing Schedule Timer
  const [publishPreset, setPublishPreset] = useState<'24h' | '3d' | '7d' | 'always' | 'custom'>('3d');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  // Target Allocation Combination
  const [allocationMode, setAllocationMode] = useState<'all' | 'classes' | 'students'>('classes');
  const [targetClasses, setTargetClasses] = useState<string[]>([]);
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);

  // Examination Security & Cheating Bust Protocols
  const [enableAntiCheating, setEnableAntiCheating] = useState<boolean>(true);
  const [enableWebcamProctoring, setEnableWebcamProctoring] = useState<boolean>(true);
  const [enableTabSwitchDetection, setEnableTabSwitchDetection] = useState<boolean>(true);
  const [enableFullscreenLockdown, setEnableFullscreenLockdown] = useState<boolean>(true);
  const [enableClipboardBlocking, setEnableClipboardBlocking] = useState<boolean>(true);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [maxStrikes, setMaxStrikes] = useState<number>(3);

  // Step 2: Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q_' + Date.now(),
      questionText: '',
      options: ['', '', '', ''],
      correctOption: 0,
      points: 5,
      explanation: '',
    },
  ]);

  const prevIsOpenRef = useRef(false);
  const prevEditingQuizIdRef = useRef<string | undefined>(undefined);

  // Setup initial state
  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = isOpen && !prevIsOpenRef.current;
    const editingQuizChanged = (editingQuiz?.id || '') !== (prevEditingQuizIdRef.current || '');

    // Only populate or reset when modal actually opens or target editing quiz ID changes.
    // NEVER wipe quiz fields while the teacher is actively typing questions/details!
    if (!justOpened && !editingQuizChanged) {
      return;
    }

    prevIsOpenRef.current = true;
    prevEditingQuizIdRef.current = editingQuiz?.id;

    const now = new Date();
    const nowISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    const end3d = new Date(now.getTime() + 72 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    if (editingQuiz) {
      setTitle(editingQuiz.title);

      const targetCls =
        editingQuiz.targetClass ||
        (editingQuiz.allocation?.targetClasses && editingQuiz.allocation.targetClasses.length === 1
          ? editingQuiz.allocation.targetClasses[0]
          : '');

      if (editingQuiz.allocation?.mode === 'all') {
        setSelectedClass('__all__');
      } else if (targetCls && teacherClasses.includes(targetCls)) {
        setSelectedClass(targetCls);
      } else if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]);
      } else {
        setSelectedClass('');
      }

      const currentSubj = editingQuiz.subject || '';
      const subjectsForClass = teacher
        ? teacher.assignments
            .filter((a) => !targetCls || a.className.toLowerCase() === targetCls.toLowerCase())
            .map((a) => a.subject)
        : [];

      if (currentSubj && subjectsForClass.includes(currentSubj)) {
        setSubject(currentSubj);
        setIsCustomSubject(false);
        setCustomSubjectName('');
      } else if (currentSubj && teacherSubjects.includes(currentSubj)) {
        setSubject(currentSubj);
        setIsCustomSubject(false);
        setCustomSubjectName('');
      } else if (currentSubj) {
        setSubject('__custom__');
        setIsCustomSubject(true);
        setCustomSubjectName(currentSubj);
      } else {
        setSubject(subjectsForClass[0] || teacherSubjects[0] || '');
        setIsCustomSubject(false);
        setCustomSubjectName('');
      }

      setDescription(editingQuiz.description || '');
      setDurationMinutes(editingQuiz.durationMinutes);
      setPassMarks(editingQuiz.passMarks);
      setIsInQuizBank(editingQuiz.isInQuizBank);
      setEnableAntiCheating(editingQuiz.enableAntiCheating !== false);
      setEnableWebcamProctoring(editingQuiz.enableWebcamProctoring !== false);
      setEnableTabSwitchDetection(editingQuiz.enableTabSwitchDetection !== false);
      setEnableFullscreenLockdown(editingQuiz.enableFullscreenLockdown !== false);
      setEnableClipboardBlocking(editingQuiz.enableClipboardBlocking !== false);
      setShuffleQuestions(editingQuiz.shuffleQuestions !== false);
      setMaxStrikes(editingQuiz.maxStrikes || 3);
      setQuestions(editingQuiz.questions);
      setAllocationMode(editingQuiz.allocation.mode);
      setTargetClasses(editingQuiz.allocation.targetClasses || []);
      setTargetStudentIds(editingQuiz.allocation.targetStudentIds || []);

      if (editingQuiz.publishWindow.isAlwaysActive) {
        setPublishPreset('always');
      } else {
        setPublishPreset('custom');
        setStartDateTime(
          editingQuiz.publishWindow.startAt
            ? new Date(editingQuiz.publishWindow.startAt).toISOString().slice(0, 16)
            : nowISO
        );
        setEndDateTime(
          editingQuiz.publishWindow.endAt
            ? new Date(editingQuiz.publishWindow.endAt).toISOString().slice(0, 16)
            : end3d
        );
      }
      setActiveStep(1);
      setActiveQuestionIndex(0);
    } else {
      setTitle('');

      // New quiz creation: determine initial class and subject
      const defaultClass =
        initialClass || (teacherClasses.length > 0 ? teacherClasses[0] : '');

      if (defaultClass && teacherClasses.includes(defaultClass)) {
        setSelectedClass(defaultClass);
      } else if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]);
      } else {
        setSelectedClass('');
      }

      // Determine subjects for that default class
      const classSubjects = teacher
        ? teacher.assignments
            .filter((a) => !defaultClass || a.className.toLowerCase() === defaultClass.toLowerCase())
            .map((a) => a.subject)
            .filter(Boolean)
        : [];

      const defaultSubject =
        initialSubject || (classSubjects.length > 0 ? classSubjects[0] : (teacherSubjects[0] || ''));

      if (defaultSubject && classSubjects.includes(defaultSubject)) {
        setSubject(defaultSubject);
        setIsCustomSubject(false);
        setCustomSubjectName('');
      } else if (defaultSubject && teacherSubjects.includes(defaultSubject)) {
        setSubject(defaultSubject);
        setIsCustomSubject(false);
        setCustomSubjectName('');
      } else if (defaultSubject) {
        setSubject('__custom__');
        setIsCustomSubject(true);
        setCustomSubjectName(defaultSubject);
      } else {
        setSubject('');
        setIsCustomSubject(false);
        setCustomSubjectName('');
      }

      if (defaultClass) {
        setTargetClasses([defaultClass]);
        setAllocationMode('classes');
      } else {
        setTargetClasses(teacherClasses.length > 0 ? [teacherClasses[0]] : []);
        setAllocationMode(teacherClasses.length > 0 ? 'classes' : 'all');
      }

      setDescription('');
      setDurationMinutes(15);
      setPassMarks(3);
      setIsInQuizBank(true);
      setEnableAntiCheating(true);
      setEnableWebcamProctoring(true);
      setEnableTabSwitchDetection(true);
      setEnableFullscreenLockdown(true);
      setEnableClipboardBlocking(true);
      setShuffleQuestions(true);
      setMaxStrikes(3);
      setPublishPreset('3d');
      setStartDateTime(nowISO);
      setEndDateTime(end3d);
      setTargetStudentIds([]);
      setQuestions([
        {
          id: 'q_' + Date.now(),
          questionText: '',
          options: ['', '', '', ''],
          correctOption: 0,
          points: 5,
          explanation: '',
        },
      ]);
      setActiveStep(1);
      setActiveQuestionIndex(0);
    }
  }, [isOpen, editingQuiz?.id, initialClass, initialSubject]);

  if (!isOpen) return null;

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);

  // Question Management
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: 'q_' + (Date.now() + Math.random()),
      questionText: '',
      options: ['', '', '', ''],
      correctOption: 0,
      points: 5,
      explanation: '',
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
  };

  const handleDuplicateQuestion = (index: number) => {
    const src = questions[index];
    const clone: Question = {
      ...src,
      id: 'q_' + (Date.now() + Math.random()),
      questionText: src.questionText ? `${src.questionText} (Copy)` : '',
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, clone);
    setQuestions(updated);
    setActiveQuestionIndex(index + 1);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('Examination must have at least 1 question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (activeQuestionIndex >= updated.length) {
      setActiveQuestionIndex(updated.length - 1);
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[optIndex] = text;
    updated[qIndex] = { ...updated[qIndex], options: newOptions };
    setQuestions(updated);
  };

  // Quick Preset Sample Inserter
  const injectSampleQuestions = () => {
    setQuestions([
      {
        id: 'q_samp_1',
        questionText: 'If 5 cadets complete a drill obstacle course in 20 minutes, how long will 10 cadets take working at identical pace?',
        options: ['10 minutes', '20 minutes', '40 minutes', '15 minutes'],
        correctOption: 1,
        points: 5,
        explanation: 'Each cadet works independently at identical pace, hence 20 minutes remains constant.',
      },
      {
        id: 'q_samp_2',
        questionText: 'Find the odd one out in this intelligence sequence: Alpha, Bravo, Charlie, Delta, Falcon.',
        options: ['Bravo', 'Charlie', 'Falcon', 'Delta'],
        correctOption: 2,
        points: 5,
        explanation: 'Falcon is a bird name; the others are NATO military phonetic alphabet designations.',
      },
      {
        id: 'q_samp_3',
        questionText: 'A military aircraft flies 900 km in 1.5 hours. What is its average speed in km/h?',
        options: ['450 km/h', '600 km/h', '750 km/h', '900 km/h'],
        correctOption: 1,
        points: 5,
        explanation: 'Speed = Distance / Time = 900 / 1.5 = 600 km/h.',
      },
    ]);
    setActiveQuestionIndex(0);
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!title.trim()) {
        alert('Please enter an Assessment Title before proceeding.');
        return;
      }
      const effSubj = getEffectiveSubject();
      if (!effSubj) {
        alert('Please select or specify a Subject for this assessment.');
        return;
      }
      if (allocationMode === 'classes' && targetClasses.length === 0) {
        const effCls = getEffectiveClass();
        if (effCls) {
          setTargetClasses([effCls]);
        } else {
          alert('Please select at least one class cohort for class allocation, or choose "All My Classes".');
          return;
        }
      }
      if (allocationMode === 'students' && targetStudentIds.length === 0) {
        alert('Please select at least one cadet for targeted cadet allocation.');
        return;
      }
      if (
        publishPreset === 'custom' &&
        startDateTime &&
        endDateTime &&
        new Date(endDateTime).getTime() <= new Date(startDateTime).getTime()
      ) {
        alert('Deadline End Date & Time must be scheduled after Start Date & Time.');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
          alert(`Question #${i + 1} has empty question text.`);
          setActiveQuestionIndex(i);
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].trim()) {
            alert(`Question #${i + 1}, Option ${String.fromCharCode(65 + j)} is empty.`);
            setActiveQuestionIndex(i);
            return;
          }
        }
      }
      if (Number(passMarks) > totalMarks) {
        alert(`Passing marks threshold (${passMarks}) cannot exceed Total marks (${totalMarks}). Please adjust pass marks.`);
        setActiveStep(1);
        return;
      }
      setActiveStep(3);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an Assessment Title.');
      setActiveStep(1);
      return;
    }

    const effSubj = getEffectiveSubject();
    if (!effSubj) {
      alert('Please select or specify a Subject for this assessment.');
      setActiveStep(1);
      return;
    }

    const numPassMarks = Number(passMarks) || 0;
    if (numPassMarks <= 0) {
      alert('Passing marks threshold must be at least 1.');
      setActiveStep(1);
      return;
    }
    if (numPassMarks > totalMarks) {
      alert(`Passing marks threshold (${numPassMarks}) cannot exceed Total marks (${totalMarks}). Please adjust pass marks in Step 1.`);
      setActiveStep(1);
      return;
    }

    const effCls = getEffectiveClass();
    const finalTargetClasses =
      allocationMode === 'all'
        ? teacherClasses
        : allocationMode === 'classes'
        ? targetClasses.length > 0
          ? targetClasses
          : effCls
          ? [effCls]
          : teacherClasses
        : [];

    if (allocationMode === 'classes' && finalTargetClasses.length === 0) {
      alert('Please select at least one class cohort for class allocation, or choose "All My Classes".');
      setActiveStep(1);
      return;
    }

    if (allocationMode === 'students' && targetStudentIds.length === 0) {
      alert('Please select at least one cadet for targeted cadet allocation.');
      setActiveStep(1);
      return;
    }

    if (
      publishPreset === 'custom' &&
      startDateTime &&
      endDateTime &&
      new Date(endDateTime).getTime() <= new Date(startDateTime).getTime()
    ) {
      alert('Deadline End Date & Time must be scheduled after Start Date & Time.');
      setActiveStep(1);
      return;
    }

    // Validate Questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        alert(`Question #${i + 1} has empty question text.`);
        setActiveStep(2);
        setActiveQuestionIndex(i);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          alert(`Question #${i + 1}, Option ${String.fromCharCode(65 + j)} is empty.`);
          setActiveStep(2);
          setActiveQuestionIndex(i);
          return;
        }
      }
    }

    // Build Publishing Window
    const pubWindow = buildPublishWindow();

    onSave({
      title: title.trim(),
      subject: effSubj,
      targetClass: effCls || undefined,
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 15,
      passMarks: numPassMarks,
      totalMarks,
      questions,
      teacherId: teacher?.id || 'tch-1',
      teacherName: teacher?.name || 'Faculty Instructor',
      isInQuizBank,
      enableAntiCheating,
      enableWebcamProctoring,
      enableTabSwitchDetection,
      enableFullscreenLockdown,
      enableClipboardBlocking,
      shuffleQuestions,
      maxStrikes,
      publishStatus: 'published',
      publishWindow: pubWindow,
      allocation: {
        mode: allocationMode,
        targetClasses: finalTargetClasses,
        targetStudentIds: allocationMode === 'students' ? targetStudentIds : [],
      },
    });

    onClose();
  };

  const buildPublishWindow = () => {
    let startIso: string | undefined;
    let endIso: string | undefined;
    let isAlways = false;

    const now = new Date();
    if (publishPreset === 'always') {
      isAlways = true;
    } else if (publishPreset === '24h') {
      startIso = now.toISOString();
      endIso = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (publishPreset === '3d') {
      startIso = now.toISOString();
      endIso = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
    } else if (publishPreset === '7d') {
      startIso = now.toISOString();
      endIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      startIso = startDateTime ? new Date(startDateTime).toISOString() : now.toISOString();
      endIso = endDateTime ? new Date(endDateTime).toISOString() : undefined;
    }

    return {
      isAlwaysActive: isAlways,
      startAt: startIso,
      endAt: endIso,
    };
  };

  const handleRequestClose = () => {
    // Check if there is any work that could be drafted
    const hasEnteredTitle = title.trim().length > 0;
    const hasEnteredDescription = description.trim().length > 0;
    const hasQuestions = questions.some(
      (q) => q.questionText.trim().length > 0 || q.options.some((opt) => opt.trim().length > 0)
    );

    if (hasEnteredTitle || hasEnteredDescription || hasQuestions || editingQuiz) {
      setIsExitConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleSaveDraft = () => {
    const effSubj = getEffectiveSubject() || 'General';
    const effCls = getEffectiveClass();
    const draftTitle = title.trim() || `Draft: ${effSubj} Assessment (${new Date().toLocaleDateString()})`;
    const pubWindow = buildPublishWindow();

    const finalTargetClasses =
      allocationMode === 'all'
        ? teacherClasses
        : allocationMode === 'classes'
        ? targetClasses.length > 0
          ? targetClasses
          : effCls
          ? [effCls]
          : teacherClasses
        : [];

    onSave({
      title: draftTitle,
      subject: effSubj,
      targetClass: effCls || undefined,
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 15,
      passMarks: Number(passMarks) || 10,
      totalMarks,
      questions,
      teacherId: teacher?.id || 'tch-1',
      teacherName: teacher?.name || 'Faculty Instructor',
      isInQuizBank,
      publishStatus: 'draft',
      publishWindow: pubWindow,
      allocation: {
        mode: allocationMode,
        targetClasses: finalTargetClasses,
        targetStudentIds: allocationMode === 'students' ? targetStudentIds : [],
      },
    });

    setIsExitConfirmOpen(false);
    onClose();
  };

  const handleDiscardAndExit = () => {
    setIsExitConfirmOpen(false);
    onClose();
  };

  const currentQ = questions[activeQuestionIndex] || questions[0];

  return (
    <div className="modal-overlay" data-lenis-prevent="true" onClick={handleRequestClose}>
      <div
        className="modal-container"
        data-lenis-prevent="true"
        style={{ maxWidth: '1020px', width: '96vw', height: '90vh', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Exit / Draft Confirmation Prompt Modal */}
        {isExitConfirmOpen && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1.75rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-crisp)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                    Unsaved Assessment Paper
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    You have an assessment paper in progress.
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Do you want to save this quiz paper as a <strong>Draft</strong> so you can finish and publish it later, or <strong>Discard</strong> all changes?
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem' }}
                  onClick={handleSaveDraft}
                >
                  <Save size={16} />
                  <span>Save as Draft (Finish Later)</span>
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem' }}
                  onClick={handleDiscardAndExit}
                >
                  <Trash2 size={16} />
                  <span>Discard Changes</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.6rem 1rem' }}
                  onClick={() => setIsExitConfirmOpen(false)}
                >
                  <span>Keep Editing</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header with Live Stats Counter */}
        <div className="modal-header" style={{ borderBottom: '2px solid var(--border-crisp)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--crest-gold-surface)',
                border: '1px solid var(--crest-gold-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--crest-gold-dark)',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-cinzel" style={{ fontSize: '1.2rem', color: 'var(--primary-navy)' }}>
                {editingQuiz ? 'Edit Examination Paper' : 'Assessment Studio'}
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Faculty: <strong>{teacher?.name || 'Instructor'}</strong> • Total Marks: <span className="font-mono" style={{ color: 'var(--primary-navy)', fontWeight: 800 }}>{totalMarks} pts</span> • Duration: <span className="font-mono">{durationMinutes}m</span>
              </div>
            </div>
          </div>

          <button className="modal-close-btn" onClick={handleRequestClose}>
            <X size={20} />
          </button>
        </div>

        {/* 3-Step Wizard Navigator */}
        <div className="create-quiz-wizard-nav">
          <button
            type="button"
            className={`create-quiz-wizard-btn ${activeStep === 1 ? 'active' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <span
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: activeStep === 1 ? 'var(--primary-navy)' : '#cbd5e1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              1
            </span>
            <span>Paper Meta & Dual Timers</span>
          </button>

          <button
            type="button"
            className={`create-quiz-wizard-btn ${activeStep === 2 ? 'active' : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <span
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: activeStep === 2 ? 'var(--primary-navy)' : '#cbd5e1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              2
            </span>
            <span>Question Studio ({questions.length})</span>
          </button>

          <button
            type="button"
            className={`create-quiz-wizard-btn ${activeStep === 3 ? 'active' : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <span
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: activeStep === 3 ? 'var(--primary-navy)' : '#cbd5e1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              3
            </span>
            <span>Review & Allot</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="modal-body" data-lenis-prevent="true" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
          {/* STEP 1: Paper Meta & Dual Timers */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Section 1: Basic Paper Details */}
              <div style={{ background: 'var(--paper-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-crisp)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={18} color="var(--primary-navy)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      Assessment General Details
                    </h4>
                  </div>
                  {teacher && teacherClasses.length > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Assigned to: <strong>{teacherClasses.length} Registered Class(es)</strong>
                    </span>
                  )}
                </div>

                {/* Paper Title */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Examination Paper Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mathematics Comprehensive Test #4"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {/* Class & Subject Selector Grid */}
                <div className="form-row" style={{ marginBottom: '1rem' }}>
                  {/* Class Selection */}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Class Cohort *</span>
                      {selectedClass && selectedClass !== '__all__' && (
                        <span className="badge badge-gold font-mono" style={{ fontSize: '0.7rem' }}>
                          Active Class
                        </span>
                      )}
                    </label>

                    <select
                      className="form-select"
                      value={selectedClass}
                      onChange={(e) => handleClassChange(e.target.value)}
                      required
                    >
                      {teacherClasses.length > 0 ? (
                        <>
                          <optgroup label="Your Created Classes">
                            {teacherClasses.map((cls) => (
                              <option key={cls} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Global Options">
                            <option value="__all__">All My Classes (Global)</option>
                          </optgroup>
                        </>
                      ) : (
                        <option value="">No Classes Created Yet (Create in Dashboard)</option>
                      )}
                    </select>

                    {/* Quick Class Badges */}
                    {teacherClasses.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                        {teacherClasses.map((cls) => (
                          <button
                            key={cls}
                            type="button"
                            className={`badge ${selectedClass === cls ? 'badge-navy' : 'badge-gray'}`}
                            style={{ cursor: 'pointer', fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => handleClassChange(cls)}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subject Selection (Filtered by chosen class) */}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Subject *</span>
                      {availableSubjectsForSelectedClass.length > 0 && !isCustomSubject && (
                        <span className="badge badge-purple font-mono" style={{ fontSize: '0.7rem' }}>
                          {availableSubjectsForSelectedClass.length} Subject(s) in Class
                        </span>
                      )}
                    </label>

                    {!isCustomSubject ? (
                      <select
                        className="form-select"
                        value={subject}
                        onChange={(e) => handleSubjectSelectChange(e.target.value)}
                        required
                      >
                        {availableSubjectsForSelectedClass.length > 0 ? (
                          <>
                            <optgroup label={selectedClass && selectedClass !== '__all__' ? `Subjects in ${selectedClass}` : 'Your Created Subjects'}>
                              {availableSubjectsForSelectedClass.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Other Options">
                              <option value="__custom__">➕ Other / Custom Subject...</option>
                            </optgroup>
                          </>
                        ) : (
                          <>
                            {teacherSubjects.length > 0 ? (
                              <>
                                <optgroup label="All Faculty Subjects">
                                  {teacherSubjects.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </optgroup>
                                <option value="__custom__">➕ Custom Subject</option>
                              </>
                            ) : (
                              <>
                                <option value="">-- No Subjects Configured --</option>
                                <option value="__custom__">➕ Enter Custom Subject</option>
                              </>
                            )}
                          </>
                        )}
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Mathematics, Urdu, Physics"
                          value={customSubjectName}
                          onChange={(e) => setCustomSubjectName(e.target.value)}
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setIsCustomSubject(false);
                            setSubject(availableSubjectsForSelectedClass[0] || teacherSubjects[0] || '');
                          }}
                          title="Back to class subjects list"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Quick Subject Badges */}
                    {availableSubjectsForSelectedClass.length > 0 && !isCustomSubject && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                        {availableSubjectsForSelectedClass.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`badge ${subject === s ? 'badge-gold' : 'badge-gray'}`}
                            style={{ cursor: 'pointer', fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => {
                              setIsCustomSubject(false);
                              setSubject(s);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Syllabus / Description */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Exam Instructions / Candidate Syllabus</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Topics: Algebra, Trigonometry, and Intelligence Drills. Negative marking not applied."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 2: Dual Timers Control Matrix */}
              <div style={{ background: 'var(--paper-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-crisp)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Clock size={18} color="var(--crest-gold-dark)" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Dual Timer Architecture & Scoring
                  </h4>
                </div>

                <div className="form-row">
                  {/* Timer 1: Test Taking Duration */}
                  <div className="form-group">
                    <label className="form-label">
                      Timer 1: Exam Taking Duration
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {[10, 15, 20, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          className={`badge ${durationMinutes === mins ? 'badge-gold' : 'badge-gray'}`}
                          style={{ cursor: 'pointer', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                          onClick={() => setDurationMinutes(mins)}
                        >
                          {mins} Mins
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        className="form-input font-mono"
                        min={1}
                        max={180}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ maxWidth: '120px' }}
                      />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Minutes Allowed</span>
                    </div>
                  </div>

                  {/* Pass Marks */}
                  <div className="form-group">
                    <label className="form-label">
                      Passing Marks Threshold
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        className="form-input font-mono"
                        min={1}
                        max={totalMarks || 100}
                        value={passMarks}
                        onChange={(e) => setPassMarks(parseInt(e.target.value) || 1)}
                        style={{ maxWidth: '120px', borderColor: Number(passMarks) > totalMarks ? '#dc2626' : undefined }}
                      />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        out of <strong>{totalMarks} Total Marks</strong>
                      </span>
                      {Number(passMarks) > totalMarks && (
                        <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, width: '100%' }}>
                          ⚠️ Passing marks cannot exceed Total marks ({totalMarks})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timer 2: Publishing Availability Window */}
                <div style={{ marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-crisp)' }}>
                  <label className="form-label">
                    Timer 2: Publishing Window (When Students Can Access Test)
                  </label>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                    {[
                      { id: '24h', label: 'Active 24 Hours' },
                      { id: '3d', label: 'Active 3 Days' },
                      { id: '7d', label: 'Active 7 Days' },
                      { id: 'always', label: 'Indefinitely Active' },
                      { id: 'custom', label: 'Custom Schedule' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`badge ${publishPreset === p.id ? 'badge-navy' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setPublishPreset(p.id as any)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {publishPreset === 'custom' && (
                    <div className="form-row" style={{ marginTop: '0.75rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          Start Date & Time (UTC)
                        </label>
                        <input
                          type="datetime-local"
                          className="form-input font-mono"
                          value={startDateTime}
                          onChange={(e) => setStartDateTime(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          Deadline End Date & Time (UTC)
                        </label>
                        <input
                          type="datetime-local"
                          className="form-input font-mono"
                          value={endDateTime}
                          onChange={(e) => setEndDateTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Target Allocation & Quiz Bank Persistent Switch */}
              <div style={{ background: 'var(--paper-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-crisp)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Target size={18} color="var(--cadet-green)" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Target Class & Student Allocation
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="allocMode"
                      checked={allocationMode === 'classes'}
                      onChange={() => setAllocationMode('classes')}
                    />
                    <span>Allot to Specific Classes</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="allocMode"
                      checked={allocationMode === 'students'}
                      onChange={() => setAllocationMode('students')}
                    />
                    <span>Allot to Specific Students</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="allocMode"
                      checked={allocationMode === 'all'}
                      onChange={() => setAllocationMode('all')}
                    />
                    <span>All Enrolled Students (Global)</span>
                  </label>
                </div>

                {allocationMode === 'all' && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.82rem', color: '#166534' }}>
                    <strong>Faculty Allotment:</strong> {teacherClasses.length > 0 ? (
                      <>This test will be allotted to all <strong>{teacherClasses.length}</strong> class cohort(s) you manage ({teacherClasses.join(', ')}). It is completely private to your students.</>
                    ) : (
                      <>All current and future students enrolled under your faculty profile will automatically receive this assessment.</>
                    )}
                  </div>
                )}

                {allocationMode === 'classes' && (
                  teacherClasses.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {availableClassOptions.map((cls) => {
                        const isSelected = targetClasses.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            className={`badge ${isSelected ? 'badge-gold' : 'badge-gray'}`}
                            style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              if (isSelected) {
                                if (targetClasses.length > 1) {
                                  setTargetClasses(targetClasses.filter((c) => c !== cls));
                                }
                              } else {
                                setTargetClasses([...targetClasses, cls]);
                              }
                            }}
                          >
                            {isSelected ? '• ' : '+ '}
                            {cls}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', color: '#92400e' }}>
                      No class cohorts created yet. Please select <strong>"All Enrolled Students"</strong> above, or create a Class Cohort from your dashboard first.
                    </div>
                  )
                )}

                {allocationMode === 'students' && (
                  <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-crisp)' }}>
                    {students.map((s) => {
                      const isChecked = targetStudentIds.includes(s.id);
                      return (
                        <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTargetStudentIds([...targetStudentIds, s.id]);
                              } else {
                                setTargetStudentIds(targetStudentIds.filter((id) => id !== s.id));
                              }
                            }}
                          />
                          <span>
                            <strong>{s.name}</strong> ({s.className}) — <code>{s.loginId}</code>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Persistent Quiz Bank Switch */}
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-crisp)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                      Store in Persistent Quiz Bank
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Saves this test in your repository so you can re-use and clone it anytime for new batches.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isInQuizBank}
                    onChange={(e) => setIsInQuizBank(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Section 4: Cheating Bust Protocols & Anti-Cheating Suite */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Master Switch Hero Card */}
                <div
                  style={{
                    background: enableAntiCheating ? 'linear-gradient(135deg, rgba(22, 101, 52, 0.08) 0%, rgba(30, 58, 138, 0.08) 100%)' : '#f8fafc',
                    padding: '1.15rem 1.25rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${enableAntiCheating ? '#16a34a' : 'var(--border-crisp)'}`,
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: enableAntiCheating ? '#16a34a' : '#64748b',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: enableAntiCheating ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none',
                        }}
                      >
                        {enableAntiCheating ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                            Cheating Bust Protocols & Anti-Cheating Suite
                          </h4>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: enableAntiCheating ? '#dcfce7' : '#f1f5f9',
                              color: enableAntiCheating ? '#15803d' : '#64748b',
                              border: `1px solid ${enableAntiCheating ? '#86efac' : '#cbd5e1'}`,
                            }}
                          >
                            {enableAntiCheating ? 'Protocols Active' : 'Protocols Disabled'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                          {enableAntiCheating
                            ? 'AI vision proctoring, tab-switch monitoring, fullscreen lockdown, and strike disqualification are active.'
                            : 'Open Practice Mode — All automated cheating detection and proctoring restrictions are disabled for this quiz.'}
                        </p>
                      </div>
                    </div>

                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        background: enableAntiCheating ? '#16a34a' : '#94a3b8',
                        color: '#ffffff',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        userSelect: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={enableAntiCheating}
                        onChange={(e) => setEnableAntiCheating(e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      {enableAntiCheating ? <Lock size={14} /> : <Unlock size={14} />}
                      <span>{enableAntiCheating ? 'Cheating Bust: ON' : 'Cheating Bust: OFF'}</span>
                    </label>
                  </div>
                </div>

                {/* Sub-Protocols (Visible only when Master Switch is ON) */}
                {enableAntiCheating ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '2px solid #86efac' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      Configure Individual Bust Protocols:
                    </div>

                    {/* Protocol 1: AI Webcam Proctoring Toggle */}
                    <div style={{ background: 'var(--paper-bg)', padding: '0.9rem 1.15rem', borderRadius: '8px', border: `1.5px solid ${enableWebcamProctoring ? '#86efac' : 'var(--border-crisp)'}`, transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: enableWebcamProctoring ? 'rgba(21, 128, 61, 0.12)' : '#f1f5f9', color: enableWebcamProctoring ? '#15803d' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Camera size={18} />
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.1rem 0' }}>
                              AI Webcam Gaze & Head Tracking Protocol
                            </h5>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                              Tracks eye gaze and head angles (looking up at phone, down at desk) with cumulative 15s automatic termination.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={enableWebcamProctoring}
                          onChange={(e) => setEnableWebcamProctoring(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#15803d', flexShrink: 0 }}
                        />
                      </div>
                    </div>

                    {/* Protocol 2: Tab & Application Switching Detection Toggle */}
                    <div style={{ background: 'var(--paper-bg)', padding: '0.9rem 1.15rem', borderRadius: '8px', border: `1.5px solid ${enableTabSwitchDetection ? '#93c5fd' : 'var(--border-crisp)'}`, transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: enableTabSwitchDetection ? 'rgba(30, 64, 175, 0.12)' : '#f1f5f9', color: enableTabSwitchDetection ? '#1d4ed8' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Layers size={18} />
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.1rem 0' }}>
                              Tab & Application Switching Bust Protocol
                            </h5>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                              Logs strikes whenever a cadet switches browser tabs, minimizes the window, or accesses external apps.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={enableTabSwitchDetection}
                          onChange={(e) => setEnableTabSwitchDetection(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1d4ed8', flexShrink: 0 }}
                        />
                      </div>
                    </div>

                    {/* Protocol 3: Fullscreen Lockdown Mode Toggle */}
                    <div style={{ background: 'var(--paper-bg)', padding: '0.9rem 1.15rem', borderRadius: '8px', border: `1.5px solid ${enableFullscreenLockdown ? '#fde047' : 'var(--border-crisp)'}`, transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: enableFullscreenLockdown ? 'rgba(202, 138, 4, 0.12)' : '#f1f5f9', color: enableFullscreenLockdown ? '#b45309' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Maximize2 size={18} />
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.1rem 0' }}>
                              Strict Fullscreen Lockdown Protocol
                            </h5>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                              Locks assessment into full-screen immersion and triggers security alerts on escape or window resizing attempts.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={enableFullscreenLockdown}
                          onChange={(e) => setEnableFullscreenLockdown(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#d97706', flexShrink: 0 }}
                        />
                      </div>
                    </div>

                    {/* Protocol 4: Copy-Paste, Context Menu & DevTools Blocking */}
                    <div style={{ background: 'var(--paper-bg)', padding: '0.9rem 1.15rem', borderRadius: '8px', border: `1.5px solid ${enableClipboardBlocking ? '#c4b5fd' : 'var(--border-crisp)'}`, transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: enableClipboardBlocking ? 'rgba(109, 40, 217, 0.12)' : '#f1f5f9', color: enableClipboardBlocking ? '#6d28d9' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Copy size={18} />
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.1rem 0' }}>
                              Clipboard & DevTools Blocking Protocol
                            </h5>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                              Blocks text copying (Ctrl+C), pasting (Ctrl+V), right-click context menus, and inspect element dev tools.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={enableClipboardBlocking}
                          onChange={(e) => setEnableClipboardBlocking(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6d28d9', flexShrink: 0 }}
                        />
                      </div>
                    </div>

                    {/* Protocol 5: Question & Option Shuffling */}
                    <div style={{ background: 'var(--paper-bg)', padding: '0.9rem 1.15rem', borderRadius: '8px', border: `1.5px solid ${shuffleQuestions ? '#fbcfe8' : 'var(--border-crisp)'}`, transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: shuffleQuestions ? 'rgba(190, 24, 93, 0.12)' : '#f1f5f9', color: shuffleQuestions ? '#be185d' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Shuffle size={18} />
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.1rem 0' }}>
                              Randomize Question Sequence per Student
                            </h5>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                              Dynamically shuffles question order for every cadet attempt to prevent adjacent-screen answer copying.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={shuffleQuestions}
                          onChange={(e) => setShuffleQuestions(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#be185d', flexShrink: 0 }}
                        />
                      </div>
                    </div>

                    {/* Protocol 6: Disqualification Violation Threshold */}
                    <div style={{ background: 'var(--paper-bg)', padding: '0.9rem 1.15rem', borderRadius: '8px', border: '1px solid var(--border-crisp)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AlertTriangle size={18} />
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.1rem 0' }}>
                              Disqualification Strike Threshold
                            </h5>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                              Number of security infractions allowed before the cadet's test is automatically terminated with 0 marks.
                            </p>
                          </div>
                        </div>

                        <select
                          className="form-control"
                          value={maxStrikes}
                          onChange={(e) => setMaxStrikes(Number(e.target.value))}
                          style={{ width: '180px', fontSize: '0.82rem', padding: '0.4rem 0.6rem', fontWeight: 700 }}
                        >
                          <option value={1}>1 Strike (Instant Zero)</option>
                          <option value={2}>2 Strikes (Strict)</option>
                          <option value={3}>3 Strikes (Standard - Rec.)</option>
                          <option value={5}>5 Strikes (Lenient)</option>
                          <option value={999}>Audit Only (No Disqualification)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.85rem 1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', color: '#92400e', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                    <span><strong>Relaxed / Practice Assessment:</strong> Cheating bust protocols are disabled. Students can take this quiz in any window size without webcam requirements or tab-switch disqualifications.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Question Paper Builder & Question Studio */}
          {activeStep === 2 && (
            <div className="create-quiz-question-studio-grid">
              {/* Left: Question Outline Sidebar */}
              <div
                style={{
                  background: 'var(--paper-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-crisp)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Question Outline ({questions.length})
                  </span>
                  <button
                    type="button"
                    className="btn btn-navy btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.74rem' }}
                    onClick={handleAddQuestion}
                  >
                    <Plus size={13} />
                    <span>New</span>
                  </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '2px' }}>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(idx)}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '6px',
                        background: activeQuestionIndex === idx ? '#ffffff' : 'transparent',
                        border: activeQuestionIndex === idx ? '1.5px solid var(--crest-gold)' : '1px solid var(--border-crisp)',
                        boxShadow: activeQuestionIndex === idx ? 'var(--shadow-subtle)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                        <span
                          className="font-mono"
                          style={{
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            color: activeQuestionIndex === idx ? 'var(--primary-navy)' : 'var(--text-muted)',
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '120px',
                            color: 'var(--text-heading)',
                          }}
                        >
                          {q.questionText ? q.questionText : 'Untitled Question'}
                        </span>
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                        {q.points}p
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed var(--border-crisp)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', fontSize: '0.74rem' }}
                    onClick={injectSampleQuestions}
                  >
                    <Sparkles size={12} color="var(--crest-gold-dark)" />
                    <span>Load 3 Cadet Drills</span>
                  </button>
                </div>
              </div>

              {/* Right: Active Question Editor */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid var(--border-crisp)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.15rem',
                }}
              >
                {/* Active Question Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-crisp)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="question-num-badge font-mono">
                      Question #{activeQuestionIndex + 1}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        Marks:
                      </span>
                      <input
                        type="number"
                        className="form-input font-mono"
                        min={1}
                        max={50}
                        value={currentQ.points}
                        onChange={(e) =>
                          handleQuestionChange(
                            activeQuestionIndex,
                            'points',
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        style={{ width: '65px', padding: '0.25rem 0.5rem', height: '32px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDuplicateQuestion(activeQuestionIndex)}
                      title="Duplicate Question"
                    >
                      <Copy size={13} />
                      <span>Duplicate</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveQuestion(activeQuestionIndex)}
                      title="Delete Question"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div>
                  <label className="form-label">Question Text / Problem Statement *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter the problem statement, drill question, or mathematical scenario..."
                    value={currentQ.questionText}
                    onChange={(e) =>
                      handleQuestionChange(activeQuestionIndex, 'questionText', e.target.value)
                    }
                    required
                  />
                </div>

                {/* 4 Options Matrix with Correct Answer Radio Button */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Multiple Choice Options & Correct Key *
                    </label>
                    <span style={{ fontSize: '0.74rem', color: 'var(--cadet-green)', fontWeight: 700 }}>
                      ● Selected Radio = Correct Key
                    </span>
                  </div>

                  <div className="options-builder-grid">
                    {currentQ.options.map((opt, optIdx) => {
                      const isCorrect = currentQ.correctOption === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);

                      return (
                        <div
                          key={optIdx}
                          style={{
                            background: isCorrect ? 'var(--status-success-bg)' : '#ffffff',
                            border: `1.5px solid ${isCorrect ? 'var(--status-success-border)' : 'var(--border-crisp)'}`,
                            borderRadius: '6px',
                            padding: '0.65rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct_${activeQuestionIndex}`}
                              checked={isCorrect}
                              onChange={() =>
                                handleQuestionChange(activeQuestionIndex, 'correctOption', optIdx)
                              }
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                              {letter}:
                            </span>
                          </label>

                          <input
                            type="text"
                            className="form-input"
                            style={{
                              border: 'none',
                              padding: '0.3rem 0.4rem',
                              background: 'transparent',
                              boxShadow: 'none',
                            }}
                            placeholder={`Enter Option ${letter}`}
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(activeQuestionIndex, optIdx, e.target.value)
                            }
                            required
                          />

                          {isCorrect && (
                            <span className="badge badge-green" style={{ fontSize: '0.68rem', marginLeft: 'auto' }}>
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation / Marking Scheme Notes */}
                <div>
                  <label className="form-label">
                    Marking Scheme Notes / Explanation (Revealed to student after submission)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Formula: Speed = Distance / Time. Unit conversion is required."
                    value={currentQ.explanation || ''}
                    onChange={(e) =>
                      handleQuestionChange(activeQuestionIndex, 'explanation', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Complete Paper Review & Final Allocation Check */}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Paper Summary Pill */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-navy-surface) 100%)',
                  color: '#ffffff',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid var(--border-crisp-dark)',
                  borderLeft: '4px solid var(--crest-gold)',
                }}
              >
                <div>
                  <h3 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                    {title || 'Untitled Assessment'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--crest-gold-light)', marginTop: '0.2rem' }}>
                    Class: <strong>{getEffectiveClass() || 'All Classes (Global)'}</strong> • Subject: <strong>{getEffectiveSubject() || 'General'}</strong> • Faculty: {teacher?.name || 'Instructor'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-gold font-mono">{questions.length} Questions</span>
                  <span className="badge badge-green font-mono">{totalMarks} Total Marks</span>
                  <span className="badge badge-blue font-mono">{durationMinutes} Mins Duration</span>
                </div>
              </div>

              {/* Paper Questions Mock View */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Question Paper Review ({questions.length} Items)
                </h4>

                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      background: 'var(--paper-bg)',
                      padding: '1rem 1.25rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-crisp)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.84rem' }}>
                        Q#{idx + 1} ({q.points} Marks)
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={() => {
                          setActiveStep(2);
                          setActiveQuestionIndex(idx);
                        }}
                      >
                        Edit Question
                      </button>
                    </div>

                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.65rem' }}>
                      {q.questionText || <em style={{ color: 'var(--text-muted)' }}>No question text entered</em>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.82rem' }}>
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctOption === oIdx;
                        return (
                          <div
                            key={oIdx}
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: '4px',
                              background: isCorrect ? '#dcfce7' : '#ffffff',
                              border: `1px solid ${isCorrect ? '#86efac' : 'var(--border-crisp)'}`,
                              color: isCorrect ? '#166534' : 'var(--text-body)',
                              fontWeight: isCorrect ? 700 : 400,
                            }}
                          >
                            <span className="font-mono">{String.fromCharCode(65 + oIdx)}:</span> {opt || '—'}
                            {isCorrect && <span style={{ float: 'right', fontSize: '0.7rem' }}>Key</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-crisp)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveStep((activeStep - 1) as any)}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={handleRequestClose}>
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveDraft}
              title="Save work in progress as draft"
            >
              <Save size={16} />
              <span>Save as Draft</span>
            </button>

            {activeStep < 3 ? (
              <button
                type="button"
                className="btn btn-navy"
                onClick={handleNextStep}
              >
                <span>Continue to {activeStep === 1 ? 'Questions' : 'Review'}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleFinalSubmit}>
                <ShieldCheck size={18} />
                <span>{editingQuiz ? 'Update & Publish Assessment' : 'Publish Assessment to Students'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

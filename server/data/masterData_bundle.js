const MASTER_ADMINS = [
  {
    "id": "admin-1",
    "name": "Brig. (R) Muhammad Khan",
    "email": "principal@cadetsacademy.com",
    "phone": "+92 300 9988776",
    "loginId": "admin",
    "password": "password123",
    "role": "admin",
    "googleId": "",
    "googlePicture": "",
    "createdAt": "2026-07-01T08:00:00Z",
    "updatedAt": "2026-10-13T13:08:23.209Z"
  },
  {
    "id": "admin-2",
    "name": "Col. (R) Ahmed Farooq",
    "email": "viceprincipal@cadetsacademy.com",
    "phone": "+92 300 5544332",
    "loginId": "vp_ahmed",
    "password": "password123",
    "role": "admin",
    "googleId": "",
    "googlePicture": "",
    "createdAt": "2026-07-05T09:00:00Z",
    "updatedAt": "2026-10-13T13:08:24.703Z"
  },
  {
    "id": "admin-1788087569405",
    "name": "M.Afzal",
    "email": "Mafzal@ccap.com@cadetsacademy.com",
    "phone": "03338968438",
    "loginId": "mafzal@ccap.com",
    "password": "Mafzal123",
    "role": "admin",
    "googleId": "",
    "googlePicture": "",
    "updatedAt": "2026-10-13T13:09:07.774Z",
    "createdAt": "2026-07-01T08:00:00Z"
  }
];
const MASTER_DEVELOPERS = [
  {
    "id": "dev-1",
    "name": "Master Developer (Root)",
    "email": "dev@cadetsacademy.com",
    "phone": "+92 300 0000000",
    "loginId": "dev",
    "password": "TT@0786",
    "role": "developer",
    "googleId": "",
    "googlePicture": "",
    "createdAt": "2026-07-01T08:00:00Z",
    "updatedAt": "2026-10-13T13:09:09.136Z"
  }
];
const MASTER_TEACHERS = [
  {
    "id": "tch-1792153549134",
    "name": "M.Afzal",
    "email": "tmobiles.egadgets@gmail.com",
    "phone": "+92 300 1234567",
    "loginId": "m.afzal",
    "password": "password123",
    "assignments": [
      {
        "className": "Class VIII (PAF College Sargodha Prep)",
        "subject": "Intelligence Test"
      },
      {
        "className": "Class VIII (PAF College Sargodha Prep)",
        "subject": "English"
      },
      {
        "className": "Class VIII (PAF College Sargodha Prep)",
        "subject": "Mathematics"
      },
      {
        "className": "Class VIII (PAF College Sargodha Prep)",
        "subject": "General Science"
      },
      {
        "className": "Class VIII (PAF College Sargodha Prep)",
        "subject": "Urdu"
      }
    ],
    "maxClasses": 5,
    "lifetimeClassesCreated": 1,
    "recruitedAt": "2026-10-16T12:25:49.139Z",
    "updatedAt": "2026-10-16T12:29:13.857Z",
    "subscription": {
      "id": "sub-1792153549136-agydg",
      "userId": "tch-1792153549134",
      "userName": "M.Afzal",
      "userEmail": "tmobiles.egadgets@gmail.com",
      "loginId": "m.afzal",
      "planId": "plan-faculty-30d",
      "planName": "Faculty Pass (30 Days)",
      "tier": "monthly",
      "price": "Institutional Grant",
      "durationDays": 30,
      "maxClasses": 5,
      "status": "active",
      "startDate": "2026-10-16T12:25:49.136Z",
      "expiryDate": "2026-11-15T12:25:49.136Z",
      "paymentMethod": "cash",
      "transactionRef": "INSTITUTIONAL-RECRUITMENT",
      "activatedAt": "2026-10-16T12:25:49.136Z",
      "verifiedAt": "2026-10-16T12:25:49.136Z",
      "verifiedBy": "ADMIN",
      "notes": "Active validity configured for 30 days upon faculty recruitment"
    },
    "validityDays": 30
  },
  {
    "id": "tch-1790487384156",
    "name": "Prof. Fresh QA",
    "email": "fresh_qa@cadetsacademy.com",
    "phone": "+92 300 0011223",
    "loginId": "t_fresh_qa",
    "password": "password123",
    "assignments": [],
    "maxClasses": 5,
    "lifetimeClassesCreated": 0,
    "googleId": "",
    "googlePicture": "",
    "recruitedAt": "2026-09-27T05:36:24.156Z",
    "updatedAt": "2026-10-13T13:11:34.141Z"
  },
  {
    "id": "tch-1790433953275",
    "name": "Prof. Mobile QA",
    "email": "mobile_qa@cadetsacademy.com",
    "phone": "+92 300 7766554",
    "loginId": "t_mobile_qa",
    "password": "password123",
    "assignments": [
      {
        "subject": "General Science & Logic",
        "className": "Cadet Wing Bravo"
      }
    ],
    "maxClasses": 5,
    "lifetimeClassesCreated": 1,
    "googleId": "",
    "googlePicture": "",
    "recruitedAt": "2026-09-26T14:45:53.276Z",
    "updatedAt": "2026-10-13T13:11:34.456Z"
  },
  {
    "id": "tch-1790433140838",
    "name": "Prof. Desktop QA",
    "email": "desktop_qa@cadetsacademy.com",
    "phone": "+92 300 1122334",
    "loginId": "t_desktop_qa",
    "password": "password123",
    "assignments": [
      {
        "className": "Cadet Wing Alpha",
        "subject": "Advanced Physics"
      }
    ],
    "maxClasses": 10,
    "lifetimeClassesCreated": 1,
    "googleId": "",
    "googlePicture": "",
    "recruitedAt": "2026-09-26T14:32:20.839Z",
    "updatedAt": "2026-10-13T13:11:33.796Z"
  },
  {
    "id": "tch-afzal",
    "name": "Prof. M. Afzal",
    "email": "afzal@ccap.com",
    "phone": "+92 300 1122334",
    "loginId": "afzal@ccap.com",
    "password": "Afzal123/",
    "assignments": [
      {
        "className": "Grade 9 & 10",
        "subject": "Mathematics"
      },
      {
        "className": "7",
        "subject": "English"
      },
      {
        "subject": "Verbal and non verbal",
        "className": "PMA 159 LC"
      },
      {
        "className": "PMA 159 LC",
        "subject": "English"
      },
      {
        "subject": "Physics",
        "className": "PMA 159 LC"
      }
    ],
    "maxClasses": 5,
    "lifetimeClassesCreated": 3,
    "googleId": "",
    "googlePicture": "",
    "recruitedAt": "2026-08-01T08:00:00Z",
    "updatedAt": "2026-10-13T13:09:28.998Z"
  },
  {
    "id": "tch-1",
    "name": "Sir Asad Mahmood",
    "email": "asad.mahmood@cadetsacademy.com",
    "phone": "+92 301 5551122",
    "loginId": "asad_math",
    "password": "password123",
    "assignments": [
      {
        "subject": "Mathematics",
        "className": "Class 8 (Cadet Prep)"
      },
      {
        "subject": "Physics & General Science",
        "className": "Class 7 (Cadet Prep)"
      },
      {
        "subject": "Non-Verbal Intelligence",
        "className": "Class 6 (Cadet Prep)"
      }
    ],
    "maxClasses": 5,
    "lifetimeClassesCreated": 3,
    "googleId": "",
    "googlePicture": "",
    "recruitedAt": "2026-08-01T09:00:00Z",
    "updatedAt": "2026-10-13T13:09:10.802Z"
  },
  {
    "id": "tch-2",
    "name": "Capt. Tariq Rehman",
    "email": "tariq.rehman@cadetsacademy.com",
    "phone": "+92 321 8889900",
    "loginId": "tariq_intel",
    "password": "password123",
    "assignments": [
      {
        "subject": "Verbal Intelligence",
        "className": "Military College Prep Batch"
      },
      {
        "className": "Class 8 (Cadet Prep)",
        "subject": "General Knowledge & Current Affairs"
      },
      {
        "subject": "English Language",
        "className": "Grade 9 & 10"
      }
    ],
    "maxClasses": 5,
    "lifetimeClassesCreated": 3,
    "googleId": "",
    "googlePicture": "",
    "recruitedAt": "2026-08-05T10:30:00Z",
    "updatedAt": "2026-10-13T13:09:28.682Z"
  },
  {
    "id": "tch-3",
    "name": "Mrs. Fatima Zahra",
    "email": "fatima.zahra@cadetsacademy.com",
    "phone": "+92 333 4455667",
    "loginId": "fatima_eng",
    "password": "password123",
    "assignments": [
      {
        "className": "Class 8 (Cadet Prep)",
        "subject": "English Language"
      },
      {
        "subject": "English Language",
        "className": "Class 7 (Cadet Prep)"
      }
    ],
    "maxClasses": 5,
    "lifetimeClassesCreated": 2,
    "googleId": "",
    "googlePicture": "",
    "recruitedAt": "2026-08-08T11:00:00Z",
    "updatedAt": "2026-10-13T13:09:29.301Z"
  },
  {
    "id": "tch-1788087930203",
    "name": "MIan",
    "email": "mian@gmail.com",
    "phone": "123456789",
    "loginId": "mianmeth",
    "password": "password123",
    "assignments": [],
    "maxClasses": 5,
    "lifetimeClassesCreated": 0,
    "googleId": "",
    "googlePicture": "",
    "updatedAt": "2026-10-13T13:11:33.097Z",
    "recruitedAt": "2026-08-01T08:00:00Z"
  },
  {
    "id": "tch-1788165728014",
    "name": "Mrs Afzal",
    "email": "wertyuiopp@kjhgfcdxz",
    "phone": "1234567890-",
    "loginId": "mrsafzal@ccap.com",
    "password": "password123",
    "assignments": [
      {
        "className": "Class 8",
        "subject": "English"
      }
    ],
    "maxClasses": 10,
    "lifetimeClassesCreated": 1,
    "googleId": "",
    "googlePicture": "",
    "updatedAt": "2026-10-13T13:11:33.472Z",
    "recruitedAt": "2026-08-01T08:00:00Z"
  },
  {
    "id": "tch-1787898544703",
    "name": "Mam Muddasser",
    "email": "muddasserrazzaq@gmail.com",
    "phone": "+92 332 7142765",
    "loginId": "muddasserrazzaq@ccap.com",
    "password": "password123",
    "assignments": [
      {
        "className": "Class 8",
        "subject": "English"
      }
    ],
    "maxClasses": 5,
    "lifetimeClassesCreated": 0,
    "googleId": "",
    "googlePicture": "",
    "updatedAt": "2026-10-13T13:09:10.495Z",
    "recruitedAt": "2026-08-01T08:00:00Z"
  }
];
const MASTER_STUDENTS = [
  {
    "id": "std-1790434111251",
    "name": "Cadet Mobile Bravo",
    "email": "cadet_mobile@cadetsacademy.com",
    "phone": "+92 300 4455667",
    "className": "Cadet Wing Bravo",
    "loginId": "cadet_mb_01",
    "password": "password123",
    "enrolledByTeacherId": "tch-1790433953275",
    "enrolledClasses": [
      {
        "enrollmentId": "enr-init-std-1790434111251",
        "enrolledByTeacherId": "TEACHER",
        "className": "Cadet Wing Bravo",
        "status": "active",
        "enrolledAt": "2026-08-15T10:00:00Z"
      },
      {
        "enrollmentId": "enr-std-1790434111251-1791881414176-3it8",
        "status": "active",
        "enrolledByTeacherId": "tch-1790433953275",
        "className": "Class 9 (Advanced Physics)",
        "enrolledAt": "2026-10-13T08:50:14.176Z"
      }
    ],
    "enrolledAt": "2026-10-13T08:50:14.178Z",
    "updatedAt": "2026-10-13T13:11:42.790Z",
    "googleId": "",
    "googlePicture": "",
    "subscription": {
      "transactionRef": "FACULTY-ENROLLED-tch-1790433953275",
      "loginId": "cadet_mb_01",
      "userEmail": "cadet_mobile@cadetsacademy.com",
      "planName": "Institutional Enrolled Pass",
      "id": "sub-inst-1791881414175-6c4v",
      "price": "Complimentary (Faculty Enrolled)",
      "paymentMethod": "cash",
      "status": "active",
      "expiryDate": "2027-10-13T08:50:14.176Z",
      "userName": "Cadet Mobile Bravo",
      "startDate": "2026-10-13T08:50:14.176Z",
      "durationDays": 365,
      "planId": "plan-institutional",
      "activatedAt": "2026-10-13T08:50:14.176Z",
      "userId": "std-1790434111251",
      "maxClasses": 5,
      "verifiedBy": "FACULTY_TEACHER",
      "notes": "Automatically authorized upon teacher enrollment.",
      "verifiedAt": "2026-10-13T08:50:14.176Z",
      "tier": "annual"
    }
  },
  {
    "id": "std-1791879785065",
    "name": "Test Cadet New",
    "email": "testcadet@gmail.com",
    "phone": "",
    "className": "Cadet Wing Bravo",
    "loginId": "test_cadet_new",
    "password": "password123",
    "enrolledByTeacherId": "tch-1790433953275",
    "enrolledClasses": [
      {
        "enrolledAt": "2026-10-13T08:23:05.066Z",
        "enrolledByTeacherId": "tch-1790433953275",
        "className": "Cadet Wing Bravo",
        "enrollmentId": "enr-std-1791879785065-1791879785066-3xz1",
        "status": "active"
      }
    ],
    "enrolledAt": "2026-10-13T08:23:05.066Z",
    "updatedAt": "2026-10-13T13:11:43.133Z",
    "googleId": "",
    "googlePicture": "",
    "subscription": {
      "activatedAt": "2026-10-13T08:23:05.065Z",
      "durationDays": 365,
      "notes": "Automatically authorized upon teacher enrollment.",
      "maxClasses": 5,
      "tier": "annual",
      "verifiedAt": "2026-10-13T08:23:05.065Z",
      "userId": "std-1791879785065",
      "verifiedBy": "FACULTY_TEACHER",
      "planId": "plan-institutional",
      "loginId": "test_cadet_new",
      "paymentMethod": "cash",
      "userEmail": "testcadet@gmail.com",
      "userName": "Test Cadet New",
      "status": "active",
      "price": "Complimentary (Faculty Enrolled)",
      "planName": "Institutional Enrolled Pass",
      "transactionRef": "FACULTY-ENROLLED-tch-1790433953275",
      "id": "sub-inst-1791879785065-zaai",
      "startDate": "2026-10-13T08:23:05.065Z",
      "expiryDate": "2027-10-13T08:23:05.065Z"
    }
  },
  {
    "id": "std-1790433290468",
    "name": "Cadet Desktop Alpha",
    "email": "cadet_desktop@cadetsacademy.com",
    "phone": "+92 300 9988112",
    "className": "Cadet Wing Alpha",
    "loginId": "cadet_dt_01",
    "password": "password123",
    "enrolledByTeacherId": "tch-1790433140838",
    "enrolledClasses": [
      {
        "className": "Cadet Wing Alpha",
        "enrollmentId": "enr-init-std-1790433290468",
        "enrolledByTeacherId": "TEACHER",
        "status": "active",
        "enrolledAt": "2026-08-15T10:00:00Z"
      }
    ],
    "enrolledAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:42.488Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-1",
    "name": "Ali Raza",
    "email": "ali.raza.cadet@gmail.com",
    "phone": "+92 300 1234567",
    "className": "Class 8 (Cadet Prep)",
    "loginId": "ali_raza",
    "password": "password123",
    "enrolledByTeacherId": "tch-1",
    "enrolledClasses": [
      {
        "className": "Class 8 (Cadet Prep)",
        "enrollmentId": "enr-std-1-1791788663992",
        "enrolledAt": "2026-10-12T07:04:23.992Z",
        "enrolledByTeacherId": "TEACHER",
        "status": "active"
      }
    ],
    "enrolledAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:35.799Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-2",
    "name": "Hamza Tariq",
    "email": "hamza.tariq.cadet@gmail.com",
    "phone": "+92 321 7654321",
    "className": "Class 8 (Cadet Prep)",
    "loginId": "hamza_t",
    "password": "password123",
    "enrolledByTeacherId": "tch-1",
    "enrolledClasses": [
      {
        "enrollmentId": "enr-init-std-2",
        "className": "Class 8 (Cadet Prep)",
        "enrolledAt": "2026-08-16T11:30:00Z",
        "enrolledByTeacherId": "tch-1",
        "status": "active"
      }
    ],
    "enrolledAt": "2026-08-16T11:30:00Z",
    "updatedAt": "2026-10-13T13:11:37.956Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-5",
    "name": "Usman Ghani",
    "email": "usman.ghani.cadet@gmail.com",
    "phone": "+92 302 4433221",
    "className": "Class 8 (Cadet Prep)",
    "loginId": "usman_g",
    "password": "password123",
    "enrolledByTeacherId": "tch-1",
    "enrolledClasses": [
      {
        "enrollmentId": "enr-init-std-5",
        "className": "Class 8 (Cadet Prep)",
        "enrolledByTeacherId": "tch-1",
        "status": "active",
        "enrolledAt": "2026-08-21T16:00:00Z"
      }
    ],
    "enrolledAt": "2026-08-21T16:00:00Z",
    "updatedAt": "2026-10-13T13:11:38.856Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-4",
    "name": "Zainab Fatima",
    "email": "zainab.fatima.cadet@gmail.com",
    "phone": "+92 345 5544332",
    "className": "Class 7 (Cadet Prep)",
    "loginId": "zainab_f",
    "password": "password123",
    "enrolledByTeacherId": "tch-1",
    "enrolledClasses": [
      {
        "enrolledAt": "2026-08-20T14:20:00Z",
        "enrollmentId": "enr-init-std-4",
        "enrolledByTeacherId": "tch-1",
        "status": "active",
        "className": "Class 7 (Cadet Prep)"
      }
    ],
    "enrolledAt": "2026-08-20T14:20:00Z",
    "updatedAt": "2026-10-13T13:11:38.547Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-8",
    "name": "Daniyal Khan",
    "email": "daniyal.khan.cadet@gmail.com",
    "phone": "+92 334 1122998",
    "className": "Class 7 (Cadet Prep)",
    "loginId": "daniyal_k",
    "password": "password123",
    "enrolledByTeacherId": "tch-1",
    "enrolledClasses": [
      {
        "enrolledByTeacherId": "tch-1",
        "enrolledAt": "2026-08-22T08:30:00Z",
        "className": "Class 7 (Cadet Prep)",
        "status": "active",
        "enrollmentId": "enr-init-std-8"
      }
    ],
    "enrolledAt": "2026-08-22T08:30:00Z",
    "updatedAt": "2026-10-13T13:11:40.337Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-3",
    "name": "Muhammad Saad",
    "email": "saad.muhammad.cadet@gmail.com",
    "phone": "+92 333 9876543",
    "className": "Military College Prep Batch",
    "loginId": "saad_m",
    "password": "password123",
    "enrolledByTeacherId": "tch-2",
    "enrolledClasses": [
      {
        "status": "active",
        "enrollmentId": "enr-init-std-3",
        "enrolledAt": "2026-08-18T09:15:00Z",
        "enrolledByTeacherId": "tch-2",
        "className": "Military College Prep Batch"
      }
    ],
    "enrolledAt": "2026-08-18T09:15:00Z",
    "updatedAt": "2026-10-13T13:11:38.250Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-9",
    "name": "Shahmeer Ali",
    "email": "",
    "phone": "+92 315 8877665",
    "className": "Military College Prep Batch",
    "loginId": "shahmeer_a",
    "password": "password123",
    "enrolledByTeacherId": "tch-2",
    "enrolledClasses": [
      {
        "status": "active",
        "enrolledByTeacherId": "tch-2",
        "enrolledAt": "2026-08-19T10:00:00Z",
        "className": "Military College Prep Batch",
        "enrollmentId": "enr-init-std-9"
      }
    ],
    "enrolledAt": "2026-08-19T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:40.651Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-aiza",
    "name": "Aiza",
    "email": "aiza@ccap.com",
    "phone": "+92 300 1112223",
    "className": "Class 9&10",
    "loginId": "aiza@ccap.com",
    "password": "password123",
    "enrolledByTeacherId": "tch-afzal",
    "enrolledClasses": [
      {
        "enrolledByTeacherId": "tch-afzal",
        "enrollmentId": "enr-init-std-aiza",
        "className": "Class 9&10",
        "enrolledAt": "2026-08-28T08:00:00Z",
        "status": "active"
      }
    ],
    "enrolledAt": "2026-08-28T08:00:00Z",
    "updatedAt": "2026-10-13T13:11:39.748Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-ayesha",
    "name": "Ayesha",
    "email": "ayesha@ccap.com",
    "phone": "+92 300 4445556",
    "className": "Class 9&10",
    "loginId": "ayesha@ccap.com",
    "password": "password123",
    "enrolledByTeacherId": "tch-afzal",
    "enrolledClasses": [
      {
        "className": "Class 9&10",
        "status": "active",
        "enrolledAt": "2026-08-28T08:00:00Z",
        "enrollmentId": "enr-init-std-ayesha",
        "enrolledByTeacherId": "tch-afzal"
      }
    ],
    "enrolledAt": "2026-08-28T08:00:00Z",
    "updatedAt": "2026-10-13T13:11:40.037Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-6",
    "name": "Hassan Ali",
    "email": "",
    "phone": "+92 301 9988112",
    "className": "Class 9&10",
    "loginId": "hassan_ali",
    "password": "password123",
    "enrolledByTeacherId": "tch-afzal",
    "enrolledClasses": [
      {
        "enrolledByTeacherId": "tch-afzal",
        "status": "active",
        "enrollmentId": "enr-init-std-6",
        "enrolledAt": "2026-08-22T09:00:00Z",
        "className": "Class 9&10"
      }
    ],
    "enrolledAt": "2026-08-22T09:00:00Z",
    "updatedAt": "2026-10-13T13:11:39.147Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-7",
    "name": "Bilal Ahmed",
    "email": "",
    "phone": "+92 322 4455667",
    "className": "Class 9&10",
    "loginId": "bilal_a",
    "password": "password123",
    "enrolledByTeacherId": "tch-afzal",
    "enrolledClasses": [
      {
        "enrolledByTeacherId": "tch-afzal",
        "enrolledAt": "2026-08-22T10:30:00Z",
        "className": "Class 9&10",
        "enrollmentId": "enr-init-std-7",
        "status": "active"
      }
    ],
    "enrolledAt": "2026-08-22T10:30:00Z",
    "updatedAt": "2026-10-13T13:11:39.446Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-1791100895511",
    "name": "ali",
    "email": "ali@cca.com",
    "phone": "03006565438",
    "className": "PMA Long Course",
    "loginId": "ali",
    "password": "password123",
    "enrolledClasses": [
      {
        "enrolledByTeacherId": "TEACHER",
        "status": "active",
        "enrollmentId": "enr-init-std-1791100895511",
        "className": "PMA Long Course",
        "enrolledAt": "2026-08-15T10:00:00Z"
      }
    ],
    "enrolledAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:41.262Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-1791627479489",
    "name": "M Tech Solutions",
    "email": "mtechsolutions.online@gmail.com",
    "phone": "",
    "className": "Class 8 (Cadet Prep)",
    "loginId": "cadet-mtechsolutionso",
    "password": "password123",
    "enrolledClasses": [
      {
        "status": "active",
        "className": "Class 8 (Cadet Prep)",
        "enrolledByTeacherId": "TEACHER",
        "enrollmentId": "enr-init-std-1791627479489",
        "enrolledAt": "2026-08-15T10:00:00Z"
      }
    ],
    "enrolledAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:41.881Z",
    "googleId": "103411923988572555653",
    "googlePicture": "https://lh3.googleusercontent.com/a/ACg8ocII9sGdOkKM1HwcwTlGhpc9c59b9RyZte0ebVwkZEFDVXMtipU=s96-c"
  },
  {
    "id": "std-1791643884932",
    "name": "Tuaha Afzal",
    "email": "tuahaafzal28@gmail.com",
    "phone": "",
    "className": "Class 8 (Cadet Prep)",
    "loginId": "cadet-tuahaafzal28",
    "password": "password123",
    "enrolledClasses": [
      {
        "enrolledByTeacherId": "TEACHER",
        "className": "Class 8 (Cadet Prep)",
        "enrollmentId": "enr-init-std-1791643884932",
        "status": "active",
        "enrolledAt": "2026-08-15T10:00:00Z"
      }
    ],
    "enrolledAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:42.187Z",
    "googleId": "107994344027946583972",
    "googlePicture": ""
  },
  {
    "id": "std-1788168752003",
    "name": "TuahaAfzal",
    "email": "tuahaafzal5@gmail.com",
    "phone": "03336484707",
    "className": "Class 8",
    "loginId": "tuahaafzal",
    "password": "password123",
    "enrolledByTeacherId": "tch-1788165728014",
    "enrolledClasses": [
      {
        "status": "active",
        "className": "Class 8",
        "enrolledByTeacherId": "TEACHER",
        "enrollmentId": "enr-init-std-1788168752003",
        "enrolledAt": "2026-08-15T10:00:00Z"
      }
    ],
    "enrolledAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:40.948Z",
    "googleId": "",
    "googlePicture": "",
    "subscription": {
      "userName": "TuahaAfzal",
      "durationDays": 90,
      "planName": "Cadet Term Prep Pass",
      "userId": "std-1788168752003",
      "paymentMethod": "credit_card",
      "planId": "plan-quarterly",
      "expiryDate": "2027-01-02T15:08:54.788Z",
      "loginId": "tuahaafzal",
      "startDate": "2026-10-04T15:08:54.788Z",
      "status": "active",
      "transactionRef": "CARD-ONLINE-OK",
      "price": "PKR 3,800",
      "tier": "quarterly",
      "verifiedBy": "SYSTEM",
      "verifiedAt": "2026-10-04T15:08:54.788Z",
      "userEmail": "tuahaafzal5@gmail.com",
      "activatedAt": "2026-10-04T15:08:54.788Z",
      "id": "sub-1791126534788-3ohzv"
    }
  },
  {
    "id": "std-1791184631598",
    "name": "TUAHA Afzal",
    "email": "tuahaafzal7@gmail.com",
    "phone": "",
    "className": "Class 8 (Cadet Prep)",
    "loginId": "cadet-tuahaafzal7",
    "password": "password123",
    "enrolledClasses": [
      {
        "status": "active",
        "className": "Class 8 (Cadet Prep)",
        "enrolledByTeacherId": "TEACHER",
        "enrolledAt": "2026-10-05T07:17:11.598Z",
        "enrollmentId": "enr-init-std-1791184631598"
      }
    ],
    "enrolledAt": "2026-10-05T07:17:11.598Z",
    "updatedAt": "2026-10-13T13:11:35.485Z",
    "googleId": "115811421546404510200",
    "googlePicture": "https://lh3.googleusercontent.com/a/ACg8ocIX0os6LQR8bdDrFFojGn6fFppa6g9aqDsRDAeMcAbw8kXdSg=s96-c"
  },
  {
    "id": "std-1791015845129",
    "name": "Pilot Test 1",
    "email": "pilot1@ccap.com",
    "phone": "03001122334",
    "className": "Class 9&10",
    "loginId": "pilot_test_1",
    "password": "password123",
    "enrolledClasses": [
      {
        "enrollmentId": "enr-init-std-1791015845129",
        "status": "active",
        "className": "Class 9&10",
        "enrolledByTeacherId": "TEACHER",
        "enrolledAt": "2026-08-15T10:00:00Z"
      }
    ],
    "enrolledAt": "2026-08-15T10:00:00Z",
    "updatedAt": "2026-10-13T13:11:41.559Z",
    "googleId": "",
    "googlePicture": ""
  },
  {
    "id": "std-1788168752003",
    "name": "TuahaAfzal",
    "email": "tuahaafzal5@gmail.com",
    "phone": "03336484707",
    "className": "Class 8",
    "loginId": "tuahaafzal",
    "password": "password123",
    "enrolledClasses": [
      {
        "enrollmentId": "enr-init-std-1788168752003",
        "className": "Class 8",
        "enrolledByTeacherId": "TEACHER",
        "status": "active",
        "enrolledAt": "2026-08-15T10:00:00Z"
      }
    ],
    "updatedAt": "2026-10-11T08:26:29.019Z",
    "googleId": "",
    "googlePicture": "",
    "subscription": {
      "activatedAt": "2026-10-04T15:08:54.788Z",
      "userName": "TuahaAfzal",
      "verifiedBy": "SYSTEM",
      "loginId": "tuahaafzal",
      "id": "sub-1791126534788-3ohzv",
      "paymentMethod": "credit_card",
      "status": "active",
      "planName": "Cadet Term Prep Pass",
      "expiryDate": "2027-01-02T15:08:54.788Z",
      "transactionRef": "CARD-ONLINE-OK",
      "price": "PKR 3,800",
      "durationDays": 90,
      "userEmail": "tuahaafzal5@gmail.com",
      "verifiedAt": "2026-10-04T15:08:54.788Z",
      "userId": "std-1788168752003",
      "startDate": "2026-10-04T15:08:54.788Z",
      "planId": "plan-quarterly",
      "tier": "quarterly"
    },
    "enrolledAt": "2026-08-15T10:00:00Z"
  }
];
const MASTER_QUIZZES = [
  {
    "title": "Science & Logic Cadet Drill 2026",
    "subject": "General Science & Logic",
    "description": "Standard mobile verification test with cheating busting enabled.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 15,
    "questions": [
      {
        "id": "q_samp_1",
        "questionText": "If 5 cadets complete a drill obstacle course in 20 minutes, how long will 10 cadets take working at identical pace?",
        "options": [
          "10 minutes",
          "20 minutes",
          "40 minutes",
          "15 minutes"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Each cadet works independently at identical pace, hence 20 minutes remains constant."
      },
      {
        "id": "q_samp_2",
        "questionText": "Find the odd one out in this intelligence sequence: Alpha, Bravo, Charlie, Delta, Falcon.",
        "options": [
          "Bravo",
          "Charlie",
          "Falcon",
          "Delta"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Falcon is a bird name; the others are NATO military phonetic alphabet designations."
      },
      {
        "id": "q_samp_3",
        "questionText": "A military aircraft flies 900 km in 1.5 hours. What is its average speed in km/h?",
        "options": [
          "450 km/h",
          "600 km/h",
          "750 km/h",
          "900 km/h"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Speed = Distance / Time = 900 / 1.5 = 600 km/h."
      }
    ],
    "teacherId": "tch-1790433953275",
    "teacherName": "Prof. Mobile QA",
    "isInQuizBank": true,
    "enableAntiCheating": true,
    "enableWebcamProctoring": true,
    "enableTabSwitchDetection": true,
    "enableFullscreenLockdown": true,
    "enableClipboardBlocking": true,
    "shuffleQuestions": true,
    "maxStrikes": 3,
    "publishStatus": "published",
    "publishWindow": {
      "isAlwaysActive": false,
      "startAt": "2026-09-26T14:50:29.286Z",
      "endAt": "2026-09-29T14:50:29.286Z"
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Cadet Wing Bravo"
      ],
      "targetStudentIds": []
    },
    "id": "quiz-1790434229286",
    "createdAt": "2026-09-26T14:50:29.286Z",
    "updatedAt": "2026-09-26T14:50:29.286Z"
  },
  {
    "title": "Physics Midterm Exam 2026",
    "subject": "Advanced Physics",
    "description": "Newtonian Mechanics, Thermodynamics, and Vector Fields.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 15,
    "questions": [
      {
        "id": "q_samp_1",
        "questionText": "If 5 cadets complete a drill obstacle course in 20 minutes, how long will 10 cadets take working at identical pace?",
        "options": [
          "10 minutes",
          "20 minutes",
          "40 minutes",
          "15 minutes"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Each cadet works independently at identical pace, hence 20 minutes remains constant."
      },
      {
        "id": "q_samp_2",
        "questionText": "Find the odd one out in this intelligence sequence: Alpha, Bravo, Charlie, Delta, Falcon.",
        "options": [
          "Bravo",
          "Charlie",
          "Falcon",
          "Delta"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Falcon is a bird name; the others are NATO military phonetic alphabet designations."
      },
      {
        "id": "q_samp_3",
        "questionText": "A military aircraft flies 900 km in 1.5 hours. What is its average speed in km/h?",
        "options": [
          "450 km/h",
          "600 km/h",
          "750 km/h",
          "900 km/h"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Speed = Distance / Time = 900 / 1.5 = 600 km/h."
      }
    ],
    "teacherId": "tch-1790433140838",
    "teacherName": "Prof. Desktop QA",
    "isInQuizBank": true,
    "enableAntiCheating": true,
    "enableWebcamProctoring": true,
    "enableTabSwitchDetection": true,
    "enableFullscreenLockdown": true,
    "enableClipboardBlocking": true,
    "shuffleQuestions": true,
    "maxStrikes": 3,
    "publishStatus": "published",
    "publishWindow": {
      "isAlwaysActive": false,
      "startAt": "2026-09-26T14:37:15.427Z",
      "endAt": "2026-09-29T14:37:15.427Z"
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Cadet Wing Alpha"
      ],
      "targetStudentIds": []
    },
    "id": "quiz-1790433435427",
    "createdAt": "2026-09-26T14:37:15.427Z",
    "updatedAt": "2026-09-26T14:37:15.427Z"
  },
  {
    "id": "quiz-101",
    "title": "Algebra & Arithmetic Progression Assessment",
    "subject": "Mathematics",
    "targetClass": "Class 8 (Cadet Prep)",
    "description": "Timed assessment covering linear equations, ratio proportions, geometry, and arithmetic sequences.",
    "durationMinutes": 15,
    "passMarks": 15,
    "totalMarks": 25,
    "teacherId": "tch-1",
    "teacherName": "Sir Asad Mahmood",
    "isInQuizBank": true,
    "publishStatus": "published",
    "enableWebcamProctoring": true,
    "enableTabSwitchDetection": true,
    "enableFullscreenLockdown": true,
    "publishWindow": {
      "startAt": "2026-09-26T12:23:37.877Z",
      "endAt": "2026-09-28T14:23:37.877Z",
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class 8 (Cadet Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-08-22T08:00:00Z",
    "updatedAt": "2026-08-22T08:00:00Z",
    "questions": [
      {
        "id": "q1",
        "questionText": "If 6 men can complete a piece of work in 15 days, in how many days can 10 men complete the same work?",
        "options": [
          "6 days",
          "9 days",
          "10 days",
          "12 days"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Work = 6 * 15 = 90 man-days. For 10 men: 90 / 10 = 9 days."
      },
      {
        "id": "q2",
        "questionText": "Find the next number in the sequence: 3, 7, 15, 31, 63, ?",
        "options": [
          "95",
          "120",
          "127",
          "128"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Each term is (Previous Term * 2) + 1. So (63 * 2) + 1 = 127."
      },
      {
        "id": "q3",
        "questionText": "The sum of interior angles of a triangle is always:",
        "options": [
          "90\xB0",
          "180\xB0",
          "270\xB0",
          "360\xB0"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "The sum of all interior angles of any planar triangle is strictly 180\xB0."
      },
      {
        "id": "q4",
        "questionText": "If a train traveling at 72 km/h crosses a 200m platform in 20 seconds, what is the length of the train?",
        "options": [
          "150 m",
          "200 m",
          "250 m",
          "300 m"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Speed = 72 * (5/18) = 20 m/s. Total distance in 20s = 20 * 20 = 400m. Length of train = 400 - 200 = 200m."
      },
      {
        "id": "q5",
        "questionText": "What is 35% of 240?",
        "options": [
          "72",
          "80",
          "84",
          "96"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "0.35 * 240 = 84."
      }
    ]
  },
  {
    "id": "quiz-102",
    "title": "Verbal Intelligence Analogies & Classification Test",
    "subject": "Verbal Intelligence",
    "targetClass": "Military College Prep Batch",
    "description": "Intelligence screening test with word relationships, direction sense, and odd-one-out questions.",
    "durationMinutes": 10,
    "passMarks": 15,
    "totalMarks": 25,
    "teacherId": "tch-2",
    "teacherName": "Capt. Tariq Rehman",
    "isInQuizBank": true,
    "publishStatus": "published",
    "enableWebcamProctoring": true,
    "enableTabSwitchDetection": true,
    "enableFullscreenLockdown": true,
    "publishWindow": {
      "startAt": "2026-09-25T14:23:37.877Z",
      "endAt": "2026-09-29T14:23:37.877Z",
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Military College Prep Batch",
        "Class 8 (Cadet Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-08-20T10:00:00Z",
    "updatedAt": "2026-08-20T10:00:00Z",
    "questions": [
      {
        "id": "v1",
        "questionText": "Doctor is to Hospital as Teacher is to:",
        "options": [
          "Laboratory",
          "School",
          "Office",
          "Court"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "A doctor operates in a hospital; a teacher operates in a school."
      },
      {
        "id": "v2",
        "questionText": "Which word is the odd one out?",
        "options": [
          "Carrot",
          "Potato",
          "Apple",
          "Radish"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Apple is a fruit growing above ground on trees; the others are root vegetables."
      },
      {
        "id": "v3",
        "questionText": "If SOUTH-EAST becomes NORTH, NORTH-EAST becomes WEST and so on, what will WEST become?",
        "options": [
          "NORTH-EAST",
          "SOUTH-EAST",
          "SOUTH-WEST",
          "NORTH-WEST"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "The directions are rotated 135 degrees anti-clockwise. West becomes South-East."
      },
      {
        "id": "v4",
        "questionText": "Complete the analogy: Light : Sun :: Heat : ?",
        "options": [
          "Ice",
          "Fire",
          "Water",
          "Air"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Sun is the primary source of daylight; fire is a direct producer of heat."
      },
      {
        "id": "v5",
        "questionText": "Which letter comes next in the alphabetical series: B, D, G, K, ?",
        "options": [
          "M",
          "N",
          "P",
          "Q"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Pattern: +2 (D), +3 (G), +4 (K), +5 (P). Thus, P is the correct next letter."
      }
    ]
  },
  {
    "id": "quiz-103",
    "title": "General Science Mechanics & Energy Drills",
    "subject": "Physics & General Science",
    "targetClass": "Class 7 (Cadet Prep)",
    "description": "Newtonian motion, force calculations, kinetic and potential energy principles.",
    "durationMinutes": 12,
    "passMarks": 15,
    "totalMarks": 25,
    "teacherId": "tch-1",
    "teacherName": "Sir Asad Mahmood",
    "isInQuizBank": true,
    "publishStatus": "published",
    "publishWindow": {
      "startAt": "2026-09-26T04:23:37.877Z",
      "endAt": "2026-09-27T14:23:37.877Z",
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class 7 (Cadet Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-08-23T11:00:00Z",
    "updatedAt": "2026-08-23T11:00:00Z",
    "questions": [
      {
        "id": "s1",
        "questionText": "What is the standard SI unit of Force?",
        "options": [
          "Joule",
          "Newton",
          "Watt",
          "Pascal"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "The SI unit of force is the Newton (N = kg\xB7m/s\xB2)."
      },
      {
        "id": "s2",
        "questionText": "Which form of energy is stored in a compressed mechanical spring?",
        "options": [
          "Kinetic Energy",
          "Elastic Potential Energy",
          "Chemical Energy",
          "Thermal Energy"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "A compressed or stretched spring stores Elastic Potential Energy (1/2 kx\xB2)."
      },
      {
        "id": "s3",
        "questionText": "Acceleration due to gravity on the Earth surface is approximately:",
        "options": [
          "9.8 m/s\xB2",
          "8.9 m/s\xB2",
          "10.5 m/s\xB2",
          "12.0 m/s\xB2"
        ],
        "correctOption": 0,
        "points": 5,
        "explanation": "Standard gravitational acceleration at sea level is approximately 9.8 m/s\xB2."
      },
      {
        "id": "s4",
        "questionText": "The process in which a liquid turns directly into gas without boiling is called:",
        "options": [
          "Condensation",
          "Sublimation",
          "Evaporation",
          "Freezing"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Evaporation is the surface phenomenon where liquid molecules escape into the vapor phase."
      },
      {
        "id": "s5",
        "questionText": "Sound waves cannot travel through which of the following media?",
        "options": [
          "Water",
          "Steel",
          "Air",
          "Vacuum"
        ],
        "correctOption": 3,
        "points": 5,
        "explanation": "Sound is a mechanical wave that requires a material medium to propagate; it cannot travel through a vacuum."
      }
    ]
  },
  {
    "id": "quiz-104",
    "title": "Cadet English Grammar, Synonyms & Prepositions Test",
    "subject": "English Language",
    "targetClass": "Class 8 (Cadet Prep)",
    "description": "Cadet entry level testing covering active/passive voice, appropriate prepositions, synonyms, and correction of sentences.",
    "durationMinutes": 15,
    "passMarks": 15,
    "totalMarks": 25,
    "teacherId": "tch-3",
    "teacherName": "Mrs. Fatima Zahra",
    "isInQuizBank": true,
    "publishStatus": "published",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class 8 (Cadet Prep)",
        "Class 7 (Cadet Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-08-25T09:00:00Z",
    "updatedAt": "2026-08-25T09:00:00Z",
    "questions": [
      {
        "id": "e1",
        "questionText": 'Choose the correct preposition: "The cadet is proficient ___ Mathematics and Science."',
        "options": [
          "on",
          "in",
          "at",
          "with"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": 'The adjective "proficient" is standardly followed by the preposition "in".'
      },
      {
        "id": "e2",
        "questionText": 'Identify the synonym of the word "COURAGEOUS":',
        "options": [
          "Timid",
          "Valiant",
          "Reckless",
          "Hesitant"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": '"Valiant" means brave and courageous.'
      },
      {
        "id": "e3",
        "questionText": 'Change into passive voice: "The teacher solved the difficult equation."',
        "options": [
          "The difficult equation was solved by the teacher.",
          "The difficult equation is solved by the teacher.",
          "The teacher was solving the difficult equation.",
          "The equation has been solved by the teacher."
        ],
        "correctOption": 0,
        "points": 5,
        "explanation": 'Past simple active "solved" becomes past simple passive "was solved".'
      },
      {
        "id": "e4",
        "questionText": "Select the word with correct spelling:",
        "options": [
          "Disciplene",
          "Discipline",
          "Descipline",
          "Disipline"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "The correct spelling is D-I-S-C-I-P-L-I-N-E."
      },
      {
        "id": "e5",
        "questionText": 'Complete the proverb: "Actions speak louder than ___."',
        "options": [
          "arguments",
          "thoughts",
          "words",
          "speeches"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": 'The famous English proverb is "Actions speak louder than words."'
      }
    ]
  },
  {
    "id": "quiz-105",
    "title": "Pakistan Defense, Geography & Cadet College General Knowledge",
    "subject": "General Knowledge & Current Affairs",
    "targetClass": "Class 8 (Cadet Prep)",
    "description": "Essential knowledge covering Pakistan Armed Forces history, geography, national monuments, and military awards.",
    "durationMinutes": 10,
    "passMarks": 15,
    "totalMarks": 25,
    "teacherId": "tch-2",
    "teacherName": "Capt. Tariq Rehman",
    "isInQuizBank": true,
    "publishStatus": "published",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class 8 (Cadet Prep)",
        "Military College Prep Batch"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-08-26T10:00:00Z",
    "updatedAt": "2026-08-26T10:00:00Z",
    "questions": [
      {
        "id": "gk1",
        "questionText": "What is the highest military gallantry award of Pakistan?",
        "options": [
          "Sitara-e-Jurat",
          "Hilal-e-Imtiaz",
          "Nishan-e-Haider",
          "Tamgha-e-Basalat"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Nishan-e-Haider is the supreme military award for extraordinary valor in combat."
      },
      {
        "id": "gk2",
        "questionText": "In which mountain range is K2 (Godwin-Austen), the second highest peak in the world, located?",
        "options": [
          "Himalayas",
          "Karakoram",
          "Hindu Kush",
          "Sulaiman Range"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "K2 is situated in the Karakoram range in Gilgit-Baltistan, Pakistan."
      },
      {
        "id": "gk3",
        "questionText": "Where is the Pakistan Military Academy (PMA) located?",
        "options": [
          "Risalpur",
          "Kakul (Abbottabad)",
          "Rawalpindi",
          "Quetta"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "PMA is located at Kakul near Abbottabad, Khyber Pakhtunkhwa."
      },
      {
        "id": "gk4",
        "questionText": "Who composed the musical score for the National Anthem of Pakistan?",
        "options": [
          "Hafeez Jalandhari",
          "Ahmed G. Chagla",
          "Mehdi Hassan",
          "Allama Iqbal"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Ahmed Ghulamali Chagla composed the music in 1949, while Hafeez Jalandhari wrote the lyrics in 1952."
      },
      {
        "id": "gk5",
        "questionText": "Which river is the longest in Pakistan?",
        "options": [
          "Jhelum River",
          "Chenab River",
          "Ravi River",
          "Indus River"
        ],
        "correctOption": 3,
        "points": 5,
        "explanation": "The Indus River is the longest river in Pakistan, traversing approximately 3,180 km."
      }
    ]
  },
  {
    "id": "quiz-afzal-draft-1",
    "title": "SSC-II Mathematics: Basic Algebraic Identities & Formulas (Unit 1)",
    "subject": "Mathematics",
    "targetClass": "Class 9&10",
    "description": "Comprehensive 10th Class Mathematics Master Bank assessment covering basic algebraic identities, trinomial expansions, cubic formulas, and difference of squares (Q1 \u2013 Q10). Strictly aligned with BISE Past Papers.",
    "durationMinutes": 20,
    "passMarks": 25,
    "totalMarks": 50,
    "teacherId": "tch-afzal",
    "teacherName": "Prof. M. Afzal",
    "isInQuizBank": true,
    "publishStatus": "published",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "all",
      "targetClasses": [
        "Class 9&10",
        "Grade 9 & 10"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-08-28T07:20:00Z",
    "updatedAt": "2026-08-28T07:20:00Z",
    "questions": [
      {
        "id": "q_afzal_1",
        "questionText": "The expansion of the basic algebraic identity (a + b)\xB2 is equal to:",
        "options": [
          "a\xB2 + b\xB2",
          "a\xB2 + 2ab + b\xB2",
          "a\xB2 - 2ab + b\xB2",
          "a\xB2 + ab + b\xB2"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Standard expansion: (a + b)\xB2 = (a + b)(a + b) = a\xB2 + 2ab + b\xB2."
      },
      {
        "id": "q_afzal_2",
        "questionText": "The algebraic formula (a - b)\xB2 expands to:",
        "options": [
          "a\xB2 - b\xB2",
          "a\xB2 - 2ab - b\xB2",
          "a\xB2 - 2ab + b\xB2",
          "a\xB2 + 2ab + b\xB2"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Standard binomial difference formula: (a - b)\xB2 = a\xB2 - 2ab + b\xB2."
      },
      {
        "id": "q_afzal_3",
        "questionText": "The factorization of the difference of two squares (a\xB2 - b\xB2) is:",
        "options": [
          "(a - b)(a - b)",
          "(a + b)(a + b)",
          "(a - b)(a + b)",
          "(a\xB2 - b)(a + b\xB2)"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "Difference of two squares identity: a\xB2 - b\xB2 = (a - b)(a + b)."
      },
      {
        "id": "q_afzal_4",
        "questionText": "The identity (a + b)\xB2 + (a - b)\xB2 simplifies to:",
        "options": [
          "4ab",
          "2(a\xB2 + b\xB2)",
          "2(a\xB2 - b\xB2)",
          "a\xB2 + b\xB2"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "(a\xB2 + 2ab + b\xB2) + (a\xB2 - 2ab + b\xB2) = 2a\xB2 + 2b\xB2 = 2(a\xB2 + b\xB2)."
      },
      {
        "id": "q_afzal_5",
        "questionText": "The identity (a + b)\xB2 - (a - b)\xB2 is identically equal to:",
        "options": [
          "2(a\xB2 + b\xB2)",
          "4ab",
          "2ab",
          "a\xB2 - b\xB2"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "(a\xB2 + 2ab + b\xB2) - (a\xB2 - 2ab + b\xB2) = 4ab."
      },
      {
        "id": "q_afzal_6",
        "questionText": "The complete expansion of the trinomial square (a + b + c)\xB2 is:",
        "options": [
          "a\xB2 + b\xB2 + c\xB2 + ab + bc + ca",
          "a\xB2 + b\xB2 + c\xB2 + 2ab + 2bc + 2ca",
          "a\xB2 + b\xB2 + c\xB2 - 2ab - 2bc - 2ca",
          "a\xB3 + b\xB3 + c\xB3 + 3abc"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Standard trinomial identity for the square of sum of three terms: (a + b + c)\xB2 = a\xB2 + b\xB2 + c\xB2 + 2ab + 2bc + 2ca."
      },
      {
        "id": "q_afzal_7",
        "questionText": "The cubic expansion of a sum of two terms (a + b)\xB3 is given by:",
        "options": [
          "a\xB3 + b\xB3 + 3ab(a + b)",
          "a\xB3 + b\xB3 - 3ab(a + b)",
          "a\xB3 - b\xB3 + 3ab(a + b)",
          "a\xB3 + 3a\xB2b + 3ab\xB2 - b\xB3"
        ],
        "correctOption": 0,
        "points": 5,
        "explanation": "(a + b)\xB3 = a\xB3 + 3a\xB2b + 3ab\xB2 + b\xB3 = a\xB3 + b\xB3 + 3ab(a + b)."
      },
      {
        "id": "q_afzal_8",
        "questionText": "The cubic expansion of (a - b)\xB3 is given by:",
        "options": [
          "a\xB3 - b\xB3 + 3ab(a - b)",
          "a\xB3 - b\xB3 - 3ab(a - b)",
          "a\xB3 + b\xB3 - 3ab(a - b)",
          "a\xB3 - 3a\xB2b - 3ab\xB2 - b\xB3"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "(a - b)\xB3 = a\xB3 - 3a\xB2b + 3ab\xB2 - b\xB3 = a\xB3 - b\xB3 - 3ab(a - b)."
      },
      {
        "id": "q_afzal_9",
        "questionText": "The factorization formula for a\xB3 + b\xB3 is:",
        "options": [
          "(a + b)(a\xB2 + ab + b\xB2)",
          "(a + b)(a\xB2 - ab + b\xB2)",
          "(a - b)(a\xB2 + ab + b\xB2)",
          "(a + b)(a\xB2 - 2ab + b\xB2)"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Sum of cubes identity: a\xB3 + b\xB3 = (a + b)(a\xB2 - ab + b\xB2)."
      },
      {
        "id": "q_afzal_10",
        "questionText": "The factorization formula for a\xB3 - b\xB3 is:",
        "options": [
          "(a - b)(a\xB2 - ab + b\xB2)",
          "(a - b)(a\xB2 + ab + b\xB2)",
          "(a + b)(a\xB2 - ab + b\xB2)",
          "(a - b)(a\xB2 + 2ab + b\xB2)"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Difference of cubes identity: a\xB3 - b\xB3 = (a - b)(a\xB2 + ab + b\xB2)."
      }
    ]
  },
  {
    "id": "quiz-afzal-pakstudies",
    "title": "Ideology of Pakistan & Constitutional History Examination",
    "subject": "Pak Studies",
    "targetClass": "Class 9&10",
    "description": "Foundational Pakistan Studies assessment covering the Two-Nation Theory, Lahore Resolution 1940, and the Objective Resolution 1949.",
    "durationMinutes": 15,
    "passMarks": 15,
    "totalMarks": 25,
    "teacherId": "tch-afzal",
    "teacherName": "Prof. M. Afzal",
    "isInQuizBank": true,
    "publishStatus": "published",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class 9&10"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-08-28T09:00:00Z",
    "updatedAt": "2026-08-28T09:00:00Z",
    "questions": [
      {
        "id": "ps1",
        "questionText": "In which city was the historic Pakistan Resolution (Lahore Resolution) passed on 23rd March 1940?",
        "options": [
          "Karachi",
          "Lahore (Minto Park)",
          "Dhaka",
          "Delhi"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "The resolution was passed at Minto Park (now Iqbal Park), Lahore during the All-India Muslim League annual session."
      },
      {
        "id": "ps2",
        "questionText": "Who presented the historic Objective Resolution in the Constituent Assembly on March 7, 1949?",
        "options": [
          "Quaid-e-Azam Muhammad Ali Jinnah",
          "Liaquat Ali Khan",
          "Khawaja Nazimuddin",
          "Chaudhry Muhammad Ali"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Prime Minister Liaquat Ali Khan presented the Objective Resolution, serving as the preamble to Pakistan constitutions."
      },
      {
        "id": "ps3",
        "questionText": "Who gave the presidential address at Allahabad in 1930 presenting the concept of a separate Muslim state?",
        "options": [
          "Sir Syed Ahmad Khan",
          "Allama Muhammad Iqbal",
          "Chaudhry Rehmat Ali",
          "Maulana Muhammad Ali Jauhar"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Allama Muhammad Iqbal delivered the historic Allahabad Address in December 1930."
      },
      {
        "id": "ps4",
        "questionText": "When was the First Constitution of Pakistan enforced?",
        "options": [
          "14 August 1947",
          "23 March 1956",
          "8 June 1962",
          "14 August 1973"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "The 1956 Constitution was enforced on 23rd March 1956, declaring Pakistan an Islamic Republic."
      },
      {
        "id": "ps5",
        "questionText": "Under the Indus Waters Treaty 1960, which three western rivers were allocated exclusively to Pakistan?",
        "options": [
          "Ravi, Beas, Sutlej",
          "Indus, Jhelum, Chenab",
          "Kabul, Swat, Kurram",
          "Indus, Ravi, Sutlej"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Under the 1960 treaty brokered by the World Bank, the western rivers (Indus, Jhelum, Chenab) were allocated to Pakistan."
      }
    ]
  },
  {
    "id": "quiz-afzal-direct-allot",
    "title": "Cadet Mathematics Diagnostic Sprint (Allotted by Student ID)",
    "subject": "Mathematics",
    "targetClass": "Class 9&10",
    "description": "Specialized diagnostic drill directly allotted to individual enrolled students by Student ID (Aiza, Ayesha, and Hassan Ali).",
    "durationMinutes": 10,
    "passMarks": 10,
    "totalMarks": 20,
    "teacherId": "tch-afzal",
    "teacherName": "Prof. M. Afzal",
    "isInQuizBank": true,
    "publishStatus": "published",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "students",
      "targetClasses": [],
      "targetStudentIds": [
        "std-aiza",
        "std-ayesha",
        "std-6"
      ]
    },
    "createdAt": "2026-08-29T10:00:00Z",
    "updatedAt": "2026-08-29T10:00:00Z",
    "questions": [
      {
        "id": "dir_q1",
        "questionText": "Solve for x: 3x + 9 = 24",
        "options": [
          "x = 3",
          "x = 5",
          "x = 7",
          "x = 9"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "3x = 24 - 9 = 15 => x = 15 / 3 = 5."
      },
      {
        "id": "dir_q2",
        "questionText": "What is the square root of 625?",
        "options": [
          "15",
          "25",
          "35",
          "45"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "25 * 25 = 625."
      },
      {
        "id": "dir_q3",
        "questionText": "If a rectangle has length 12 cm and width 8 cm, its perimeter is:",
        "options": [
          "96 cm",
          "40 cm",
          "48 cm",
          "20 cm"
        ],
        "correctOption": 1,
        "points": 5,
        "explanation": "Perimeter = 2 * (12 + 8) = 2 * 20 = 40 cm."
      },
      {
        "id": "dir_q4",
        "questionText": "The value of (-2)\xB3 is:",
        "options": [
          "-6",
          "6",
          "-8",
          "8"
        ],
        "correctOption": 2,
        "points": 5,
        "explanation": "(-2) * (-2) * (-2) = -8."
      }
    ]
  },
  {
    "id": "quiz-paf-intel-1",
    "title": "PAF College Sargodha \u2014 Intelligence Test: Verbal & Series (Part 1)",
    "subject": "Intelligence Test",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - Intelligence Paper assessing verbal reasoning, pattern recognition, and number sequences.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_intel_1_q1",
        "questionText": "What comes next in the number series: 3, 6, 12, 24, __?",
        "options": [
          "36",
          "40",
          "48",
          "52"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Each number is obtained by multiplying the previous number by 2: 3 * 2 = 6, 6 * 2 = 12, 12 * 2 = 24, 24 * 2 = 48."
      },
      {
        "id": "paf_intel_1_q2",
        "questionText": "Find the odd one out among the following vehicles:",
        "options": [
          "Car",
          "Bus",
          "Train",
          "Bicycle"
        ],
        "correctOption": 3,
        "points": 1,
        "explanation": "Bicycle is human-powered and non-motorized, whereas car, bus, and train are motorized engines."
      },
      {
        "id": "paf_intel_1_q3",
        "questionText": "If BOOK is coded as 43 (B=2, O=15, O=15, K=11), what is PEN coded as?",
        "options": [
          "32",
          "35",
          "38",
          "40"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Using standard alphabetical positions: P=16, E=5, N=14. Total sum = 16 + 5 + 14 = 35."
      },
      {
        "id": "paf_intel_1_q4",
        "questionText": "Which number replaces the question mark: 2, 5, 10, 17, 26, ?",
        "options": [
          "35",
          "37",
          "39",
          "41"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "The differences between consecutive terms are successive odd numbers: +3, +5, +7, +9, +11. Thus, 26 + 11 = 37."
      },
      {
        "id": "paf_intel_1_q5",
        "questionText": "Doctor is to Hospital as Teacher is to:",
        "options": [
          "Student",
          "Classroom",
          "School",
          "Book"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "A doctor operates in a hospital; analogously, a teacher works in a school (professional workplace relationship)."
      },
      {
        "id": "paf_intel_1_q6",
        "questionText": "If SOUTH-EAST becomes NORTH, and NORTH-EAST becomes WEST, what will WEST become?",
        "options": [
          "SOUTH-EAST",
          "NORTH-EAST",
          "SOUTH-WEST",
          "NORTH-WEST"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "The cardinal directions are rotated 135 degrees clockwise. West rotated 135 degrees clockwise points directly to South-East."
      },
      {
        "id": "paf_intel_1_q7",
        "questionText": "Which word does not belong with the other three?",
        "options": [
          "Inch",
          "Ounce",
          "Centimeter",
          "Yard"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Ounce is a unit of weight/mass, whereas inch, centimeter, and yard are all units of linear distance/length."
      },
      {
        "id": "paf_intel_1_q8",
        "questionText": "Complete the letter series: B, D, G, K, P, __",
        "options": [
          "S",
          "U",
          "V",
          "W"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "The intervals between letters increase consecutively: B(+2)=D, D(+3)=G, G(+4)=K, K(+5)=P, P(+6)=V."
      },
      {
        "id": "paf_intel_1_q9",
        "questionText": "A man walks 5 km East, turns right and walks 4 km, then turns left and walks 5 km. In which direction is he from the starting point?",
        "options": [
          "North-East",
          "South-East",
          "North-West",
          "South-West"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "The net displacement is 10 km East and 4 km South, placing him in the South-East quadrant from his origin."
      },
      {
        "id": "paf_intel_1_q10",
        "questionText": "If WATER is written as YCVGT, how is FIRE written?",
        "options": [
          "HKTG",
          "GKTH",
          "HKTF",
          "GJTF"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "Each letter is shifted forward by 2 positions in the alphabet: F(+2)->H, I(+2)->K, R(+2)->T, E(+2)->G => HKTG."
      }
    ]
  },
  {
    "id": "quiz-paf-intel-2",
    "title": "PAF College Sargodha \u2014 Intelligence Test: Analytical & Spatial (Part 2)",
    "subject": "Intelligence Test",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - Intelligence Paper assessing deductive reasoning, spatial relations, and mathematical logic.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_intel_2_q1",
        "questionText": `Pointing to a photograph, Ali says, "She is the daughter of my grandfather's only son." Who is she to Ali?`,
        "options": [
          "Mother",
          "Sister",
          "Aunt",
          "Cousin"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Ali's grandfather's only son is Ali's father. The daughter of Ali's father is Ali's sister."
      },
      {
        "id": "paf_intel_2_q2",
        "questionText": "If 5 machines take 5 minutes to make 5 widgets, how many minutes will 100 machines take to make 100 widgets?",
        "options": [
          "100 minutes",
          "20 minutes",
          "5 minutes",
          "1 minute"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "One machine takes 5 minutes to manufacture 1 widget. Therefore, 100 machines operating in parallel make 100 widgets in 5 minutes."
      },
      {
        "id": "paf_intel_2_q3",
        "questionText": "Which number comes next in the sequence: 1, 4, 9, 16, 25, 36, __?",
        "options": [
          "45",
          "48",
          "49",
          "50"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "These are squares of consecutive natural numbers: 1\xB2, 2\xB2, 3\xB2, 4\xB2, 5\xB2, 6\xB2, and 7\xB2 = 49."
      },
      {
        "id": "paf_intel_2_q4",
        "questionText": "Light is to Eye as Sound is to:",
        "options": [
          "Music",
          "Ear",
          "Nose",
          "Tone"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "The eye is the sensory receptor organ for light; the ear is the sensory receptor organ for sound."
      },
      {
        "id": "paf_intel_2_q5",
        "questionText": "In a 3x3 magic square with rows [4, 9, 2], [3, 5, 7], and [8, 1, ?] where every row and column sums to 15, what is ?",
        "options": [
          "6",
          "5",
          "4",
          "7"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "Sum of third row: 8 + 1 + ? = 15 => 9 + ? = 15 => ? = 6."
      },
      {
        "id": "paf_intel_2_q6",
        "questionText": "If CAT = 24 (3+1+20) and DOG = 26 (4+15+7), then PIG = ?",
        "options": [
          "32",
          "31",
          "33",
          "30"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "Sum of letter values: P(16) + I(9) + G(7) = 32."
      },
      {
        "id": "paf_intel_2_q7",
        "questionText": "In a class of 45 cadets, Tariq ranks 12th from the top. What is his rank from the bottom?",
        "options": [
          "33rd",
          "34th",
          "35th",
          "36th"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Rank from bottom = Total cadets - Rank from top + 1 = 45 - 12 + 1 = 34th."
      },
      {
        "id": "paf_intel_2_q8",
        "questionText": "Which of the following geometric figures has the greatest number of lines of symmetry?",
        "options": [
          "Equilateral Triangle",
          "Square",
          "Regular Hexagon",
          "Circle"
        ],
        "correctOption": 3,
        "points": 1,
        "explanation": "A circle possesses infinitely many lines of symmetry passing through its center, surpassing any regular polygon."
      },
      {
        "id": "paf_intel_2_q9",
        "questionText": "Find the missing pair in the pattern: AZ, BY, CX, DW, __?",
        "options": [
          "EU",
          "EV",
          "FU",
          "FV"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "The first letter increases alphabetically (A, B, C, D, E) while the second letter reverses from Z (Z, Y, X, W, V) giving EV."
      },
      {
        "id": "paf_intel_2_q10",
        "questionText": "Statement: Some roses are flowers. All flowers are plants. Conclusion:",
        "options": [
          "All plants are roses",
          "Some roses are plants",
          "No roses are plants",
          "All flowers are roses"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Since the subset of roses that are flowers belong to all flowers, and all flowers are plants, some roses must be plants."
      }
    ]
  },
  {
    "id": "quiz-paf-eng-1",
    "title": "PAF College Sargodha \u2014 English: Grammar & Tenses (Part 1)",
    "subject": "English",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - English Paper assessing verb tenses, prepositions, and structural grammar.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_eng_1_q1",
        "questionText": "Identify the grammatically correct sentence in Present Perfect Continuous Tense:",
        "options": [
          "He has been living here since five years.",
          "He has been living here for five years.",
          "He is living here since five years.",
          "He lived here for five years."
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": '"For" is used to denote an unspecified period or duration (five years), whereas "since" denotes a specific point in time.'
      },
      {
        "id": "paf_eng_1_q2",
        "questionText": 'Choose the correct preposition: "The cadet is fond ___ flying aircraft."',
        "options": [
          "with",
          "about",
          "of",
          "in"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": 'The adjective "fond" takes the dependent preposition "of" (fond of doing something).'
      },
      {
        "id": "paf_eng_1_q3",
        "questionText": "Which of the following is an Abstract Noun?",
        "options": [
          "Pilot",
          "Aircraft",
          "Bravery",
          "Runway"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Bravery represents a quality, virtue, or intangible concept that cannot be touched physically, making it an abstract noun."
      },
      {
        "id": "paf_eng_1_q4",
        "questionText": "Select the word with the correct spelling:",
        "options": [
          "Accomodation",
          "Accommodation",
          "Acommodation",
          "Accomadation"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": 'Accommodation is spelled with double "c" and double "m".'
      },
      {
        "id": "paf_eng_1_q5",
        "questionText": 'Fill in the blank: "Neither the captain nor the crew members ___ present at the debriefing."',
        "options": [
          "was",
          "were",
          "is",
          "has"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": 'When subjects are joined by "neither... nor", the verb agrees with the closer subject ("crew members" is plural, requiring "were").'
      },
      {
        "id": "paf_eng_1_q6",
        "questionText": '"The sun rises in the east." The verb "rises" in this sentence is:',
        "options": [
          "Transitive verb",
          "Intransitive verb",
          "Auxiliary verb",
          "Modal verb"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": 'An intransitive verb does not take a direct object; "in the east" is an adverbial prepositional phrase.'
      },
      {
        "id": "paf_eng_1_q7",
        "questionText": "Choose the sentence with correct punctuation:",
        "options": [
          "Alas! We have lost the match.",
          "Alas, we have lost the match!",
          "Alas. We have lost the match!",
          "Alas? We have lost the match."
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": 'Interjections conveying deep sorrow or emotion (such as "Alas!") require an exclamation mark immediately following the word.'
      },
      {
        "id": "paf_eng_1_q8",
        "questionText": 'Complete the conditional sentence: "If it rains tomorrow, we ___ the sports gala."',
        "options": [
          "would cancel",
          "will cancel",
          "cancelled",
          "had cancelled"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "First conditional formula: If + Simple Present (rains), will + base verb (will cancel) for probable future conditions."
      },
      {
        "id": "paf_eng_1_q9",
        "questionText": 'Choose the closest synonym for the word "COURAGEOUS":',
        "options": [
          "Timid",
          "Valiant",
          "Cowardly",
          "Hesitant"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": '"Valiant" means bold, courageous, or exhibiting bravery, exactly matching the definition of courageous.'
      },
      {
        "id": "paf_eng_1_q10",
        "questionText": '"The pen is mightier than the sword." Which figure of speech is exemplified here?',
        "options": [
          "Simile",
          "Metaphor",
          "Metonymy",
          "Hyperbole"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": 'Metonymy replaces the name of a thing with something closely associated with it ("pen" represents written communication, "sword" represents military warfare).'
      }
    ]
  },
  {
    "id": "quiz-paf-eng-2",
    "title": "PAF College Sargodha \u2014 English: Syntax, Voice & Vocabulary (Part 2)",
    "subject": "English",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - English Paper assessing active/passive voice, direct/indirect narration, and lexical precision.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_eng_2_q1",
        "questionText": 'Change the voice: "The pilot landed the fighter jet safely."',
        "options": [
          "The fighter jet was landed safely by the pilot.",
          "The fighter jet is landed safely by the pilot.",
          "The fighter jet had been landed safely by the pilot.",
          "The pilot was landed safely by the fighter jet."
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": 'Simple past tense active ("landed") transforms into past passive: was/were + past participle ("was landed").'
      },
      {
        "id": "paf_eng_2_q2",
        "questionText": 'Change into Indirect Speech: He said, "I have done my duty."',
        "options": [
          "He said that he has done his duty.",
          "He said that he had done his duty.",
          "He told that he did his duty.",
          "He says that he had done his duty."
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": 'With a past tense reporting verb ("said"), present perfect ("have done") shifts back to past perfect ("had done").'
      },
      {
        "id": "paf_eng_2_q3",
        "questionText": 'What is the antonym of the word "EXPAND"?',
        "options": [
          "Enlarge",
          "Contract",
          "Stretch",
          "Broaden"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": '"Contract" means to shrink or decrease in dimensions, which is the direct opposite of expand.'
      },
      {
        "id": "paf_eng_2_q4",
        "questionText": 'Identify the conjunction in this sentence: "He worked diligently, yet he failed to secure the top badge."',
        "options": [
          "diligently",
          "yet",
          "failed",
          "secure"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": '"Yet" is an adversative coordinating conjunction connecting two independent clauses.'
      },
      {
        "id": "paf_eng_2_q5",
        "questionText": 'What is the plural form of the noun "Crisis"?',
        "options": [
          "Crisises",
          "Crises",
          "Crisi",
          "Crisis"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Nouns of classical Greek origin ending in -is change to -es in their plural form (crisis -> crises)."
      },
      {
        "id": "paf_eng_2_q6",
        "questionText": 'What is the feminine gender term for a young horse ("Colt")?',
        "options": [
          "Mare",
          "Filly",
          "Ewe",
          "Vixen"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "A young male horse is a colt; a young female horse is a filly (a mature female horse is a mare)."
      },
      {
        "id": "paf_eng_2_q7",
        "questionText": 'Fill in the blank: "Hardly had we reached the airfield ___ the storm broke out."',
        "options": [
          "than",
          "when",
          "then",
          "while"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": 'The correlative conjunction structure is "Hardly... when" (or "Scarcely... when"), not "than".'
      },
      {
        "id": "paf_eng_2_q8",
        "questionText": 'Choose the correct meaning of the idiom: "To burn the midnight oil"',
        "options": [
          "To waste electricity or fuel",
          "To work or study late into the night",
          "To set fire to household items",
          "To fall asleep during guard duty"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "The idiom refers to working diligently or studying well into the late night hours."
      },
      {
        "id": "paf_eng_2_q9",
        "questionText": "Choose the sentence with the correct natural order of adjectives:",
        "options": [
          "A red big Pakistani jet",
          "A big red Pakistani jet",
          "A Pakistani red big jet",
          "A red Pakistani big jet"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Standard English adjective sequence follows: Size (big) -> Color (red) -> Proper Origin (Pakistani)."
      },
      {
        "id": "paf_eng_2_q10",
        "questionText": '"Whose flight bag is this?" In this sentence, the word "Whose" functions as an:',
        "options": [
          "Interrogative Pronoun",
          "Interrogative Adjective",
          "Possessive Pronoun",
          "Relative Pronoun"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": '"Whose" directly precedes and modifies the noun "flight bag", classifying it as an interrogative adjective.'
      }
    ]
  },
  {
    "id": "quiz-paf-math-1",
    "title": "PAF College Sargodha \u2014 Mathematics: Arithmetic, Ratios & Percentage (Part 1)",
    "subject": "Mathematics",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - Mathematics Paper covering proportional reasoning, percentages, time-speed-distance, and commercial arithmetic.",
    "durationMinutes": 20,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_math_1_q1",
        "questionText": "If 12 men can construct a boundary wall in 8 days, how many days will 16 men take to construct the same wall at the same rate?",
        "options": [
          "4 days",
          "6 days",
          "10 days",
          "12 days"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Inverse variation formula: M1 * D1 = M2 * D2 => 12 * 8 = 16 * D2 => 96 = 16 * D2 => D2 = 6 days."
      },
      {
        "id": "paf_math_1_q2",
        "questionText": "An article purchased for Rs. 800 is sold for Rs. 1000. What is the profit percentage?",
        "options": [
          "20%",
          "25%",
          "15%",
          "30%"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Profit = Selling Price - Cost Price = 1000 - 800 = 200. Profit % = (200 / 800) * 100 = 25%."
      },
      {
        "id": "paf_math_1_q3",
        "questionText": "Find the compound ratio of 2:3 and 6:7.",
        "options": [
          "4:7",
          "12:21",
          "8:10",
          "1:2"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "Compound ratio = (antecedent1 * antecedent2) : (consequent1 * consequent2) = (2 * 6) : (3 * 7) = 12:21 = 4:7."
      },
      {
        "id": "paf_math_1_q4",
        "questionText": "Calculate the simple interest on a principal of Rs. 5000 at 6% per annum for 3 years.",
        "options": [
          "Rs. 600",
          "Rs. 900",
          "Rs. 1200",
          "Rs. 1500"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Simple Interest = (P * R * T) / 100 = (5000 * 6 * 3) / 100 = 90,000 / 100 = Rs. 900."
      },
      {
        "id": "paf_math_1_q5",
        "questionText": "A train moving at a uniform speed of 72 km/h crosses a telegraph pole in 10 seconds. What is the length of the train?",
        "options": [
          "150 m",
          "180 m",
          "200 m",
          "220 m"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Speed in m/s = 72 * (5/18) = 20 m/s. Length of train = Speed * Time = 20 m/s * 10 s = 200 meters."
      },
      {
        "id": "paf_math_1_q6",
        "questionText": "The arithmetic average of 5 consecutive odd numbers is 25. What is the smallest of these numbers?",
        "options": [
          "21",
          "23",
          "25",
          "19"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "In 5 consecutive odd numbers, the average equals the middle (3rd) number: 25. The numbers are 21, 23, 25, 27, 29; smallest is 21."
      },
      {
        "id": "paf_math_1_q7",
        "questionText": "Evaluate: 15% of 240 + 25% of 120 = ?",
        "options": [
          "60",
          "66",
          "72",
          "80"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "15% of 240 = 0.15 * 240 = 36. 25% of 120 = 0.25 * 120 = 30. Sum = 36 + 30 = 66."
      },
      {
        "id": "paf_math_1_q8",
        "questionText": "If A:B = 3:4 and B:C = 8:9, what is the ratio A:C in simplest terms?",
        "options": [
          "2:3",
          "1:2",
          "3:5",
          "4:5"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "A/C = (A/B) * (B/C) = (3/4) * (8/9) = 24 / 36 = 2/3, which is 2:3."
      },
      {
        "id": "paf_math_1_q9",
        "questionText": "A vehicle consumes 8 liters of fuel for a distance of 120 km. How many liters are required to travel 300 km?",
        "options": [
          "16 liters",
          "18 liters",
          "20 liters",
          "24 liters"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Fuel efficiency = 120 / 8 = 15 km/liter. For 300 km: 300 / 15 = 20 liters."
      },
      {
        "id": "paf_math_1_q10",
        "questionText": "Find the Highest Common Factor (HCF) of 36, 54, and 90.",
        "options": [
          "9",
          "12",
          "18",
          "27"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Prime factors: 36 = 2\xB2 * 3\xB2, 54 = 2 * 3\xB3, 90 = 2 * 3\xB2 * 5. HCF = 2 * 3\xB2 = 18."
      }
    ]
  },
  {
    "id": "quiz-paf-math-2",
    "title": "PAF College Sargodha \u2014 Mathematics: Algebra, Polynomials & Sets (Part 2)",
    "subject": "Mathematics",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - Mathematics Paper assessing algebraic manipulations, factorization, equations, and set theory.",
    "durationMinutes": 20,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_math_2_q1",
        "questionText": "If x + 1/x = 4, determine the value of x\xB2 + 1/x\xB2.",
        "options": [
          "14",
          "16",
          "18",
          "12"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "(x + 1/x)\xB2 = x\xB2 + 1/x\xB2 + 2 => 4\xB2 = x\xB2 + 1/x\xB2 + 2 => 16 - 2 = 14."
      },
      {
        "id": "paf_math_2_q2",
        "questionText": "Factorize completely: a\xB2 - 9b\xB2",
        "options": [
          "(a - 3b)(a - 3b)",
          "(a + 3b)(a - 3b)",
          "(a + 9b)(a - b)",
          "(a + 3b)\xB2"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Difference of squares rule: x\xB2 - y\xB2 = (x + y)(x - y). Here a\xB2 - (3b)\xB2 = (a + 3b)(a - 3b)."
      },
      {
        "id": "paf_math_2_q3",
        "questionText": "If Set A = {1, 2, 3, 4} and Set B = {3, 4, 5, 6}, what is A \u2229 B?",
        "options": [
          "{1, 2}",
          "{5, 6}",
          "{3, 4}",
          "{1, 2, 3, 4, 5, 6}"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "The intersection (\u2229) contains elements common to both sets, which are 3 and 4."
      },
      {
        "id": "paf_math_2_q4",
        "questionText": "Solve the linear equation for x: 5x - 7 = 3x + 9",
        "options": [
          "x = 6",
          "x = 8",
          "x = 7",
          "x = 5"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "5x - 3x = 9 + 7 => 2x = 16 => x = 8."
      },
      {
        "id": "paf_math_2_q5",
        "questionText": "What is the degree of the multivariable polynomial 4x\xB3y\xB2 - 7x\xB2y\u2074 + 9?",
        "options": [
          "5",
          "6",
          "4",
          "7"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "The degree is the maximum sum of exponents among terms: for -7x\xB2y\u2074, degree is 2 + 4 = 6."
      },
      {
        "id": "paf_math_2_q6",
        "questionText": "Expand the algebraic expression (2x + 3y)\xB2:",
        "options": [
          "4x\xB2 + 9y\xB2",
          "4x\xB2 + 6xy + 9y\xB2",
          "4x\xB2 + 12xy + 9y\xB2",
          "2x\xB2 + 6xy + 3y\xB2"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "(a + b)\xB2 = a\xB2 + 2ab + b\xB2 => (2x)\xB2 + 2(2x)(3y) + (3y)\xB2 = 4x\xB2 + 12xy + 9y\xB2."
      },
      {
        "id": "paf_math_2_q7",
        "questionText": "Given universal set U = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10} and A = {2, 4, 6, 8, 10}, find A' (complement of A):",
        "options": [
          "{1, 3, 5, 7, 9}",
          "{0, 1, 3, 5, 7, 9}",
          "{2, 4, 6, 8, 10}",
          "Empty set { }"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "Complement A' contains elements in U that do not belong to A, which are the odd integers: {1, 3, 5, 7, 9}."
      },
      {
        "id": "paf_math_2_q8",
        "questionText": "If x = 2 and y = -1, evaluate the algebraic expression: 3x\xB2 - 2xy + y\xB2",
        "options": [
          "15",
          "17",
          "19",
          "11"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "3(2)\xB2 - 2(2)(-1) + (-1)\xB2 = 3(4) - (-4) + 1 = 12 + 4 + 1 = 17."
      },
      {
        "id": "paf_math_2_q9",
        "questionText": "Find the principal algebraic square root of (x\xB2 + 6x + 9):",
        "options": [
          "x + 9",
          "x + 3",
          "x - 3",
          "x + 6"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "x\xB2 + 6x + 9 = (x + 3)\xB2, so its principal square root is (x + 3)."
      },
      {
        "id": "paf_math_2_q10",
        "questionText": "The sum of three consecutive integers is 72. Find the three numbers.",
        "options": [
          "22, 23, 24",
          "23, 24, 25",
          "24, 25, 26",
          "21, 22, 23"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Let the numbers be n, n+1, n+2. n + (n+1) + (n+2) = 72 => 3n + 3 = 72 => 3n = 69 => n = 23. Numbers are 23, 24, 25."
      }
    ]
  },
  {
    "id": "quiz-paf-math-3",
    "title": "PAF College Sargodha \u2014 Mathematics: Geometry & Mensuration (Part 3)",
    "subject": "Mathematics",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - Mathematics Paper assessing geometric angles, Pythagorean theorem, circles, and 3D mensuration.",
    "durationMinutes": 20,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_math_3_q1",
        "questionText": "What is the sum of all interior angles of a quadrilateral?",
        "options": [
          "180\xB0",
          "270\xB0",
          "360\xB0",
          "540\xB0"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Formula for interior angles of an n-sided polygon: (n - 2) * 180\xB0. For quadrilateral (n=4): (4 - 2) * 180\xB0 = 360\xB0."
      },
      {
        "id": "paf_math_3_q2",
        "questionText": "In a right-angled triangle, the base is 6 cm and perpendicular is 8 cm. What is the length of the hypotenuse?",
        "options": [
          "9 cm",
          "10 cm",
          "12 cm",
          "14 cm"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Pythagoras theorem: h\xB2 = 6\xB2 + 8\xB2 = 36 + 64 = 100 => h = \u221A100 = 10 cm."
      },
      {
        "id": "paf_math_3_q3",
        "questionText": "Find the area of a circle whose radius is 7 cm. (Take \u03C0 = 22/7)",
        "options": [
          "44 cm\xB2",
          "154 cm\xB2",
          "88 cm\xB2",
          "308 cm\xB2"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Area = \u03C0 * r\xB2 = (22/7) * 7 * 7 = 22 * 7 = 154 cm\xB2."
      },
      {
        "id": "paf_math_3_q4",
        "questionText": "Two complementary angles are in the ratio 2:3. What is the measure of the smaller angle?",
        "options": [
          "30\xB0",
          "36\xB0",
          "45\xB0",
          "54\xB0"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Complementary angles add up to 90\xB0. 2x + 3x = 90 => 5x = 90 => x = 18\xB0. Smaller angle = 2 * 18 = 36\xB0."
      },
      {
        "id": "paf_math_3_q5",
        "questionText": "Find the volume of a solid cube having an edge length of 5 cm:",
        "options": [
          "25 cm\xB3",
          "100 cm\xB3",
          "125 cm\xB3",
          "150 cm\xB3"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Volume of cube = edge\xB3 = 5 * 5 * 5 = 125 cm\xB3."
      },
      {
        "id": "paf_math_3_q6",
        "questionText": "What is the formula for the total surface area of a closed right circular cylinder of radius r and height h?",
        "options": [
          "2\u03C0rh",
          "2\u03C0r(r + h)",
          "\u03C0r\xB2h",
          "2\u03C0r\xB2"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Total surface area = curved surface area (2\u03C0rh) + 2 circular bases (2\u03C0r\xB2) = 2\u03C0r(r + h)."
      },
      {
        "id": "paf_math_3_q7",
        "questionText": "If the perimeter of a square field is 48 cm, what is its enclosed area?",
        "options": [
          "96 cm\xB2",
          "144 cm\xB2",
          "120 cm\xB2",
          "196 cm\xB2"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Side length of square = Perimeter / 4 = 48 / 4 = 12 cm. Area = 12\xB2 = 144 cm\xB2."
      },
      {
        "id": "paf_math_3_q8",
        "questionText": "An angle whose measure is strictly greater than 90\xB0 and less than 180\xB0 is termed an:",
        "options": [
          "Acute angle",
          "Reflex angle",
          "Obtuse angle",
          "Right angle"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "By geometric definition, an obtuse angle measures between 90\xB0 and 180\xB0 non-inclusive."
      },
      {
        "id": "paf_math_3_q9",
        "questionText": "In an observed statistical data sample, the value that occurs with the highest frequency is called the:",
        "options": [
          "Mean",
          "Median",
          "Mode",
          "Range"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Mode is defined mathematically as the datum value appearing with maximum frequency."
      },
      {
        "id": "paf_math_3_q10",
        "questionText": "Find the median of the following set of test scores: 4, 8, 2, 9, 6, 5, 7.",
        "options": [
          "5",
          "6",
          "7",
          "8"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Sort in ascending order: 2, 4, 5, 6, 7, 8, 9. The middle element (4th out of 7 observations) is 6."
      }
    ]
  },
  {
    "id": "quiz-paf-sci-1",
    "title": "PAF College Sargodha \u2014 General Science: Physics & Sound (Part 1)",
    "subject": "General Science",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - General Science Paper assessing acoustics, optics, electricity, and thermodynamics.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_sci_1_q1",
        "questionText": "Sound waves are mechanical waves and cannot travel through which of the following?",
        "options": [
          "Water",
          "Steel",
          "Vacuum",
          "Air"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Sound waves propagate by vibrating material particles. Because vacuum has no matter, sound cannot travel through it."
      },
      {
        "id": "paf_sci_1_q2",
        "questionText": "What is the SI unit of electrical resistance?",
        "options": [
          "Volt",
          "Ampere",
          "Ohm",
          "Watt"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Electrical resistance opposing electric current is measured in Ohms (symbol \u03A9)."
      },
      {
        "id": "paf_sci_1_q3",
        "questionText": "When white light enters a triangular glass prism, it disperses into seven spectral colors. This optical phenomenon is called:",
        "options": [
          "Refraction",
          "Reflection",
          "Dispersion",
          "Diffraction"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Dispersion is the separation of polychromatic white light into its component wavelengths due to differential refractive indices."
      },
      {
        "id": "paf_sci_1_q4",
        "questionText": "Which of the following substances is a superior conductor of electrical current?",
        "options": [
          "Glass",
          "Rubber",
          "Copper",
          "Plastic"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Copper is a metallic element with abundant free conduction electrons that facilitate electric charge flow."
      },
      {
        "id": "paf_sci_1_q5",
        "questionText": "Which scientific instrument is utilized to measure atmospheric pressure?",
        "options": [
          "Thermometer",
          "Barometer",
          "Hydrometer",
          "Anemometer"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "A barometer measures atmospheric air pressure (in mmHg or hectopascals)."
      },
      {
        "id": "paf_sci_1_q6",
        "questionText": "Thermal energy transfer occurring through solids predominantly takes place by:",
        "options": [
          "Conduction",
          "Convection",
          "Radiation",
          "Absorption"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "In solids, heat transfers predominantly via conduction through atomic and lattice vibrations without mass movement."
      },
      {
        "id": "paf_sci_1_q7",
        "questionText": "What is the speed of light propagating in a vacuum?",
        "options": [
          "3 \xD7 10\u2076 m/s",
          "3 \xD7 10\u2078 m/s",
          "3 \xD7 10\xB9\u2070 m/s",
          "3 \xD7 10\u2074 m/s"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Light in a vacuum travels at an approximate fundamental speed of 300,000,000 m/s or 3 \xD7 10\u2078 m/s."
      },
      {
        "id": "paf_sci_1_q8",
        "questionText": "A concave mirror forms what type of image when an object is positioned at optical infinity?",
        "options": [
          "Virtual and magnified",
          "Real, inverted and highly diminished",
          "Real and erect",
          "Virtual and erect"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Parallel incident rays from infinity converge exactly at the mirror's principal focus, creating a real, inverted, point-sized/diminished image."
      },
      {
        "id": "paf_sci_1_q9",
        "questionText": "In an electrical testing circuit, an ammeter must always be connected in:",
        "options": [
          "Series",
          "Parallel",
          "Diagonal",
          "Opposite"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": "An ammeter has very low internal resistance and must be wired in series so that the full loop current traverses it."
      },
      {
        "id": "paf_sci_1_q10",
        "questionText": "In physical mechanics, mechanical Work is defined as the product of Force and:",
        "options": [
          "Time",
          "Mass",
          "Displacement",
          "Velocity"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Work = Force \xD7 Displacement in the directional vector of applied force (W = F \xB7 d)."
      }
    ]
  },
  {
    "id": "quiz-paf-sci-2",
    "title": "PAF College Sargodha \u2014 General Science: Chemistry & Biology (Part 2)",
    "subject": "General Science",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - General Science Paper assessing cellular biology, chemical reactions, environmental science, and physiology.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_sci_2_q1",
        "questionText": 'Which eukaryotic cellular organelle is universally termed the "powerhouse of the cell"?',
        "options": [
          "Ribosome",
          "Mitochondria",
          "Golgi apparatus",
          "Nucleus"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Mitochondria synthesize cellular ATP through aerobic cellular respiration, fueling metabolic activities."
      },
      {
        "id": "paf_sci_2_q2",
        "questionText": "What is the chemical composition formula of hydrated Rust?",
        "options": [
          "FeSO\u2084",
          "Fe\u2082O\u2083\xB7nH\u2082O",
          "FeCl\u2083",
          "FeO"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "Rust is hydrated ferric oxide, chemically designated as Fe\u2082O\u2083\xB7nH\u2082O."
      },
      {
        "id": "paf_sci_2_q3",
        "questionText": "Which atmospheric greenhouse gas is the principal contributor to anthropogenic global warming?",
        "options": [
          "Oxygen",
          "Nitrogen",
          "Carbon dioxide",
          "Argon"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Carbon dioxide (CO\u2082) traps radiated infrared energy within the troposphere, driving the greenhouse effect."
      },
      {
        "id": "paf_sci_2_q4",
        "questionText": "The biological loss of water vapor from plant foliage through microscopic stomata is known as:",
        "options": [
          "Photosynthesis",
          "Respiration",
          "Transpiration",
          "Translocation"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Transpiration is the evaporation of excess water through foliar stomatal pores that also creates the transpirational pull."
      },
      {
        "id": "paf_sci_2_q5",
        "questionText": "What is the pH value of pure deionized water at standard 25\xB0C?",
        "options": [
          "0",
          "5",
          "7",
          "14"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "At 25\xB0C, [H\u207A] equals [OH\u207B] in neutral pure water, yielding a neutral pH of exactly 7."
      },
      {
        "id": "paf_sci_2_q6",
        "questionText": "Which of the following processes represents an irreversible Chemical Change?",
        "options": [
          "Melting of ice",
          "Boiling of water",
          "Rusting of iron",
          "Dissolving sugar in water"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Rusting of iron chemically combines iron and oxygen into iron oxide, producing a new chemical compound."
      },
      {
        "id": "paf_sci_2_q7",
        "questionText": "How many muscular chambers does the human heart contain?",
        "options": [
          "2",
          "3",
          "4",
          "6"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "The human heart is quadricameral: consisting of two receiving atria and two pumping ventricles."
      },
      {
        "id": "paf_sci_2_q8",
        "questionText": "Which inorganic acid is secreted in the gastric mucosa of the human stomach to facilitate protein digestion?",
        "options": [
          "Sulfuric acid",
          "Nitric acid",
          "Hydrochloric acid",
          "Acetic acid"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Parietal cells secrete dilute Hydrochloric acid (HCl) to activate pepsinogen and maintain gastric acidity."
      },
      {
        "id": "paf_sci_2_q9",
        "questionText": "In human respiratory physiology, the essential exchange of O\u2082 and CO\u2082 occurs inside:",
        "options": [
          "Trachea",
          "Bronchi",
          "Alveoli",
          "Larynx"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Alveoli are thin-walled, vascularized air sacs across whose epithelial membrane gas diffusion takes place."
      },
      {
        "id": "paf_sci_2_q10",
        "questionText": "Which atomic subatomic particle carries a negative elementary charge (-1)?",
        "options": [
          "Proton",
          "Neutron",
          "Electron",
          "Positron"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "Electrons orbit the atomic nucleus and possess a negative fundamental electric charge."
      }
    ]
  },
  {
    "id": "quiz-paf-urdu-1",
    "title": "PAF College Sargodha \u2014 Urdu: Adab, Qawaid & Zaban (Part 1)",
    "subject": "Urdu",
    "targetClass": "Class VIII (PAF College Sargodha Prep)",
    "description": "Class VIII Entrance Examination - Urdu Paper assessing literary comprehension, grammar rules, proverbs, and vocabulary.",
    "durationMinutes": 15,
    "passMarks": 5,
    "totalMarks": 10,
    "teacherId": "tch-m-afzal",
    "teacherName": "M.Afzal",
    "isInQuizBank": false,
    "publishStatus": "draft",
    "publishWindow": {
      "isAlwaysActive": true
    },
    "allocation": {
      "mode": "classes",
      "targetClasses": [
        "Class VIII (PAF College Sargodha Prep)"
      ],
      "targetStudentIds": []
    },
    "createdAt": "2026-10-16T12:00:00Z",
    "updatedAt": "2026-10-16T12:00:00Z",
    "questions": [
      {
        "id": "paf_urdu_1_q1",
        "questionText": "\u0639\u0644\u0627\u0645\u06C1 \u0645\u062D\u0645\u062F \u0627\u0642\u0628\u0627\u0644 \u06A9\u06CC \u067E\u06C1\u0644\u06CC \u0627\u0631\u062F\u0648 \u0634\u0639\u0631\u06CC \u062A\u0635\u0646\u06CC\u0641 \u06A9\u0648\u0646 \u0633\u06CC \u06C1\u06D2\u061F",
        "options": [
          "\u0628\u0627\u0644\u0650 \u062C\u0628\u0631\u06CC\u0644",
          "\u0628\u0627\u0646\u06AF\u0650 \u062F\u0631\u0627",
          "\u0636\u0631\u0628\u0650 \u06A9\u0644\u06CC\u0645",
          "\u0627\u0631\u0645\u063A\u0627\u0646\u0650 \u062D\u062C\u0627\u0632"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": '\u0639\u0644\u0627\u0645\u06C1 \u0645\u062D\u0645\u062F \u0627\u0642\u0628\u0627\u0644 \u06A9\u0627 \u067E\u06C1\u0644\u0627 \u0627\u0631\u062F\u0648 \u0634\u0639\u0631\u06CC \u0645\u062C\u0645\u0648\u0639\u06C1 "\u0628\u0627\u0646\u06AF\u0650 \u062F\u0631\u0627" \u06C1\u06D2 \u062C\u0648 1924\u0621 \u0645\u06CC\u06BA \u0637\u0628\u0639 \u06C1\u0648\u0627\u06D4'
      },
      {
        "id": "paf_urdu_1_q2",
        "questionText": '\u0644\u0641\u0638 "\u0631\u0648\u0634\u0646\u06CC" \u06A9\u0627 \u0645\u062A\u0636\u0627\u062F \u0644\u0641\u0638 \u06A9\u06CC\u0627 \u06C1\u06D2\u061F',
        "options": [
          "\u0627\u062C\u0627\u0644\u0627",
          "\u062A\u0627\u0631\u06CC\u06A9\u06CC",
          "\u0633\u0627\u06CC\u06C1",
          "\u0686\u0645\u06A9"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "\u0631\u0648\u0634\u0646\u06CC \u06A9\u0627 \u0645\u062A\u0636\u0627\u062F (\u0627\u0644\u0679) \u0644\u0641\u0638 \u062A\u0627\u0631\u06CC\u06A9\u06CC \u06CC\u0627 \u0627\u0646\u062F\u06BE\u06CC\u0631\u0627 \u06C1\u06D2\u06D4"
      },
      {
        "id": "paf_urdu_1_q3",
        "questionText": '\u0642\u0648\u0627\u0639\u062F \u06A9\u06CC \u0631\u0648 \u0633\u06D2 \u062C\u0645\u0644\u06C1 "\u0627\u062D\u0645\u062F \u062A\u06CC\u0632 \u062F\u0648\u0691\u062A\u0627 \u06C1\u06D2" \u0645\u06CC\u06BA \u0644\u0641\u0638 "\u062A\u06CC\u0632" \u06A9\u06CC\u0627 \u06C1\u06D2\u061F',
        "options": [
          "\u0627\u0633\u0645",
          "\u0641\u0639\u0644",
          "\u0645\u062A\u0639\u0644\u0642 \u0641\u0639\u0644 (\u062A\u0645\u06CC\u0632)",
          "\u062D\u0631\u0641"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": '\u0644\u0641\u0638 "\u062A\u06CC\u0632" \u0641\u0639\u0644 "\u062F\u0648\u0691\u062A\u0627 \u06C1\u06D2" \u06A9\u06CC \u0631\u0641\u062A\u0627\u0631 \u0627\u0648\u0631 \u0627\u0646\u062F\u0627\u0632 \u0628\u06CC\u0627\u0646 \u06A9\u0631 \u0631\u06C1\u0627 \u06C1\u06D2\u060C \u0644\u06C1\u0670\u0630\u0627 \u06CC\u06C1 \u0645\u062A\u0639\u0644\u0642 \u0641\u0639\u0644 (Adverb) \u06C1\u06D2\u06D4'
      },
      {
        "id": "paf_urdu_1_q4",
        "questionText": "\u062F\u0631\u062C \u0630\u06CC\u0644 \u0645\u06CC\u06BA \u0633\u06D2 \u062F\u0631\u0633\u062A \u0627\u0645\u0644\u0627 \u06A9\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u06CC\u062C\u06CC\u06D2:",
        "options": [
          "\u0636\u0631\u0648\u0631\u062A \u0645\u0646\u062F",
          "\u0632\u0631\u0648\u0631\u062A \u0645\u0646\u062F",
          "\u0636\u0631\u0648\u0631\u062A\u0645\u0646\u062F",
          "\u0636\u0631\u0631\u062A\u0645\u0646\u062F"
        ],
        "correctOption": 0,
        "points": 1,
        "explanation": '\u0644\u0641\u0638 "\u0636\u0631\u0648\u0631\u062A" \u0639\u0631\u0628\u06CC \u0627\u0644\u0627\u0635\u0644 \u06C1\u06D2 \u0627\u0648\u0631 \u0636\u0627\u062F \u0633\u06D2 \u0644\u06A9\u06BE\u0627 \u062C\u0627\u062A\u0627 \u06C1\u06D2\u060C \u062F\u0631\u0633\u062A \u0627\u0645\u0644\u0627 "\u0636\u0631\u0648\u0631\u062A \u0645\u0646\u062F" \u06C1\u06D2\u06D4'
      },
      {
        "id": "paf_urdu_1_q5",
        "questionText": '\u0636\u0631\u0628 \u0627\u0644\u0645\u062B\u0644 \u0645\u06A9\u0645\u0644 \u06A9\u06CC\u062C\u06CC\u06D2: "\u0646\u0627\u0686 \u0646\u06C1 \u062C\u0627\u0646\u06D2 ___ \u0679\u06CC\u0691\u06BE\u0627"',
        "options": [
          "\u067E\u0627\u0624\u06BA",
          "\u0635\u062D\u0646",
          "\u0622\u0646\u06AF\u0646",
          "\u0631\u0627\u0633\u062A\u06C1"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": '\u0645\u0634\u06C1\u0648\u0631 \u0627\u0631\u062F\u0648 \u0636\u0631\u0628 \u0627\u0644\u0645\u062B\u0644 \u06C1\u06D2: "\u0646\u0627\u0686 \u0646\u06C1 \u062C\u0627\u0646\u06D2 \u0622\u0646\u06AF\u0646 \u0679\u06CC\u0691\u06BE\u0627" \u06CC\u0639\u0646\u06CC \u0627\u067E\u0646\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC \u0686\u06BE\u067E\u0627\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0645\u0627\u062D\u0648\u0644 \u06A9\u0648 \u0642\u0635\u0648\u0631\u0648\u0627\u0631 \u0679\u06BE\u06C1\u0631\u0627\u0646\u0627\u06D4'
      },
      {
        "id": "paf_urdu_1_q6",
        "questionText": '\u0644\u0641\u0638 "\u06A9\u062A\u0627\u0628" \u06A9\u06CC \u0639\u0631\u0628\u06CC \u062C\u0645\u0639 \u0645\u06A9\u0633\u0631 \u06A9\u06CC\u0627 \u06C1\u06D2\u061F',
        "options": [
          "\u06A9\u062A\u0627\u0628\u06CC\u06BA",
          "\u0645\u06A9\u0627\u062A\u06CC\u0628",
          "\u06A9\u062A\u0628",
          "\u06A9\u062A\u0627\u0628\u0648\u06BA"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": '\u0639\u0631\u0628\u06CC \u062C\u0645\u0639 \u0645\u06A9\u0633\u0631 \u06A9\u06D2 \u0648\u0632\u0646 \u067E\u0631 \u0644\u0641\u0638 "\u06A9\u062A\u0627\u0628" \u06A9\u06CC \u062C\u0645\u0639 "\u06A9\u064F\u062A\u064F\u0628" \u06C1\u06D2\u06D4'
      },
      {
        "id": "paf_urdu_1_q7",
        "questionText": '"\u0634\u06CC\u0631 \u06A9\u06CC \u0637\u0631\u062D \u0628\u06C1\u0627\u062F\u0631" \u0645\u06CC\u06BA \u0639\u0644\u0645\u0650 \u0628\u06CC\u0627\u0646 \u06A9\u06CC \u06A9\u0648\u0646 \u0633\u06CC \u0642\u0633\u0645 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06C1\u0648\u0626\u06CC \u06C1\u06D2\u061F',
        "options": [
          "\u0627\u0633\u062A\u0639\u0627\u0631\u06C1",
          "\u062A\u0634\u0628\u06CC\u06C1",
          "\u06A9\u0646\u0627\u06CC\u06C1",
          "\u0645\u062C\u0627\u0632\u0650 \u0645\u0631\u0633\u0644"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": '\u06A9\u0633\u06CC \u0645\u0634\u062A\u0631\u06A9 \u0635\u0641\u062A \u06A9\u06CC \u0628\u0646\u0627 \u067E\u0631 \u0627\u06CC\u06A9 \u0686\u06CC\u0632 \u06A9\u0648 \u062F\u0648\u0633\u0631\u06CC \u0686\u06CC\u0632 \u06A9\u06D2 \u0645\u0634\u0627\u0628\u06C1 \u0642\u0631\u0627\u0631 \u062F\u06CC\u0646\u0627 \u062A\u0634\u0628\u06CC\u06C1 \u06A9\u06C1\u0644\u0627\u062A\u0627 \u06C1\u06D2 (\u062D\u0631\u0641\u0650 \u062A\u0634\u0628\u06CC\u06C1: "\u06A9\u06CC \u0637\u0631\u062D")\u06D4'
      },
      {
        "id": "paf_urdu_1_q8",
        "questionText": '"\u0634\u0627\u0639\u0631\u0650 \u0645\u0634\u0631\u0642" \u0627\u0648\u0631 "\u062D\u06A9\u06CC\u0645 \u0627\u0644\u0627\u0645\u062A" \u06A9\u0646 \u06A9\u0627 \u0645\u0639\u0631\u0648\u0641 \u0648 \u0645\u062D\u062A\u0631\u0645 \u0644\u0642\u0628 \u06C1\u06D2\u061F',
        "options": [
          "\u0645\u0631\u0632\u0627 \u0627\u0633\u062F \u0627\u0644\u0644\u06C1 \u062E\u0627\u0646 \u063A\u0627\u0644\u0628",
          "\u0645\u06CC\u0631 \u062A\u0642\u06CC \u0645\u06CC\u0631",
          "\u0688\u0627\u06A9\u0679\u0631 \u0639\u0644\u0627\u0645\u06C1 \u0645\u062D\u0645\u062F \u0627\u0642\u0628\u0627\u0644",
          "\u0641\u06CC\u0636 \u0627\u062D\u0645\u062F \u0641\u06CC\u0636"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": '\u0688\u0627\u06A9\u0679\u0631 \u0639\u0644\u0627\u0645\u06C1 \u0645\u062D\u0645\u062F \u0627\u0642\u0628\u0627\u0644 \u06A9\u0648 \u0627\u0646 \u06A9\u06D2 \u0628\u0644\u0646\u062F \u067E\u0627\u06CC\u06C1 \u0641\u06A9\u0631\u06CC \u067E\u06CC\u063A\u0627\u0645 \u06A9\u06D2 \u0627\u0639\u062A\u0631\u0627\u0641 \u0645\u06CC\u06BA "\u0634\u0627\u0639\u0631\u0650 \u0645\u0634\u0631\u0642" \u06A9\u0627 \u0639\u0638\u06CC\u0645 \u0644\u0642\u0628 \u062D\u0627\u0635\u0644 \u06C1\u06D2\u06D4'
      },
      {
        "id": "paf_urdu_1_q9",
        "questionText": "\u0648\u06C1 \u06A9\u0644\u0645\u06C1 \u062C\u0648 \u06A9\u0633\u06CC \u06A9\u0627\u0645 \u06A9\u06D2 \u06A9\u0631\u0646\u06D2 \u06CC\u0627 \u06C1\u0648\u0646\u06D2 \u06A9\u0648 \u0638\u0627\u06C1\u0631 \u06A9\u0631\u06D2 \u0645\u06AF\u0631 \u0627\u0633 \u0645\u06CC\u06BA \u06A9\u0648\u0626\u06CC \u0632\u0645\u0627\u0646\u06C1 \u0646\u06C1 \u067E\u0627\u06CC\u0627 \u062C\u0627\u0626\u06D2\u060C \u06A9\u06CC\u0627 \u06A9\u06C1\u0644\u0627\u062A\u0627 \u06C1\u06D2\u061F",
        "options": [
          "\u0641\u0639\u0644",
          "\u0627\u0633\u0645\u0650 \u0641\u0627\u0639\u0644",
          "\u0627\u0633\u0645\u0650 \u0645\u0635\u062F\u0631",
          "\u062D\u0631\u0641\u0650 \u0639\u0637\u0641"
        ],
        "correctOption": 2,
        "points": 1,
        "explanation": "\u0627\u0633\u0645\u0650 \u0645\u0635\u062F\u0631 \u0648\u06C1 \u06A9\u0644\u0645\u06C1 \u06C1\u06D2 \u062C\u0648 \u0628\u0630\u0627\u062A\u0650 \u062E\u0648\u062F \u06A9\u0627\u0645 \u06A9\u0627 \u0645\u0641\u06C1\u0648\u0645 \u0627\u062F\u0627 \u06A9\u0631\u06D2 \u0644\u06CC\u06A9\u0646 \u0632\u0645\u0627\u0646\u06D2 \u0633\u06D2 \u062E\u0627\u0644\u06CC \u06C1\u0648 (\u062C\u06CC\u0633\u06D2 \u06A9\u06BE\u0627\u0646\u0627\u060C \u067E\u06CC\u0646\u0627\u060C \u067E\u0691\u06BE\u0646\u0627)\u06D4"
      },
      {
        "id": "paf_urdu_1_q10",
        "questionText": '"\u0622\u0633\u0645\u0627\u0646 \u067E\u0631 \u062F\u0645\u0627\u063A \u06C1\u0648\u0646\u0627" \u0645\u062D\u0627\u0648\u0631\u06D2 \u06A9\u0627 \u0635\u062D\u06CC\u062D \u0645\u0641\u06C1\u0648\u0645 \u06A9\u06CC\u0627 \u06C1\u06D2\u061F',
        "options": [
          "\u0628\u06C1\u062A \u0628\u0644\u0646\u062F \u0645\u0642\u0627\u0645 \u062D\u0627\u0635\u0644 \u06A9\u0631\u0646\u0627",
          "\u0628\u06C1\u062A \u0632\u06CC\u0627\u062F\u06C1 \u0645\u063A\u0631\u0648\u0631 \u06C1\u0648\u0646\u0627",
          "\u0628\u06C1\u062A \u0639\u0642\u0644\u0645\u0646\u062F \u06C1\u0648\u0646\u0627",
          "\u062E\u0644\u0627 \u0645\u06CC\u06BA \u067E\u0631\u0648\u0627\u0632 \u06A9\u0631\u0646\u0627"
        ],
        "correctOption": 1,
        "points": 1,
        "explanation": "\u06CC\u06C1 \u0627\u0631\u062F\u0648 \u06A9\u0627 \u0645\u0633\u062A\u0639\u0645\u0644 \u0645\u062D\u0627\u0648\u0631\u06C1 \u06C1\u06D2 \u062C\u0633 \u06A9\u0627 \u0645\u0637\u0644\u0628 \u0634\u062F\u06CC\u062F \u062A\u06A9\u0628\u0631\u060C \u0646\u062E\u0648\u062A \u06CC\u0627 \u063A\u0631\u0648\u0631 \u0645\u06CC\u06BA \u0645\u0628\u062A\u0644\u0627 \u06C1\u0648\u0646\u0627 \u06C1\u06D2\u06D4"
      }
    ]
  }
];
const MASTER_SUBMISSIONS = [
  {
    "quizId": "quiz-1790434229286",
    "quizTitle": "Science & Logic Cadet Drill 2026",
    "subject": "General Science & Logic",
    "studentId": "std-1790434111251",
    "studentName": "Cadet Mobile Bravo",
    "studentClass": "Cadet Wing Bravo",
    "teacherId": "tch-1790433953275",
    "teacherName": "Prof. Mobile QA",
    "score": 0,
    "totalMarks": 15,
    "percentage": 0,
    "passed": false,
    "timeSpentSeconds": 404,
    "answers": {},
    "integrityAudit": {
      "tabSwitches": 1,
      "copyAttempts": 0,
      "fullscreenExits": 0,
      "isDisqualified": false,
      "infractionTimestamps": [
        "[11:50:08] Tab switched or minimized to background / app switched (Strike 1/3)"
      ],
      "webcamAudit": {
        "isCameraEnabled": true,
        "gazeAwayCount": 0,
        "faceAbsenceCount": 0,
        "totalGazeAwaySeconds": 0,
        "snapshots": []
      }
    },
    "id": "sub-std-1790434111251-quiz-1790434229286-1790491964518",
    "submittedAt": "2026-09-27T06:52:44.518Z"
  },
  {
    "quizId": "quiz-1790433435427",
    "quizTitle": "Physics Midterm Exam 2026",
    "subject": "Advanced Physics",
    "studentId": "std-1790433290468",
    "studentName": "Cadet Desktop Alpha",
    "studentClass": "Cadet Wing Alpha",
    "teacherId": "tch-1790433140838",
    "teacherName": "Prof. Desktop QA",
    "score": 5,
    "totalMarks": 15,
    "percentage": 33,
    "passed": true,
    "timeSpentSeconds": 122,
    "answers": {
      "q_samp_2": 1,
      "q_samp_3": 1,
      "q_samp_1": 0
    },
    "integrityAudit": {
      "tabSwitches": 2,
      "copyAttempts": 2,
      "fullscreenExits": 0,
      "isDisqualified": false,
      "infractionTimestamps": [
        "[19:39:02] Blocked copy attempt",
        "[19:39:02] Attempted copy shortcut (Ctrl+C / Cmd+C)",
        "[19:39:12] Tab switched or minimized to background / app switched (Strike 1/3)",
        "[19:40:22] Tab switched or minimized to background / app switched (Strike 2/3)"
      ],
      "webcamAudit": {
        "isCameraEnabled": true,
        "gazeAwayCount": 0,
        "faceAbsenceCount": 0,
        "totalGazeAwaySeconds": 0,
        "snapshots": []
      }
    },
    "id": "sub-std-1790433290468-quiz-1790433435427-1790433646987",
    "submittedAt": "2026-09-26T14:40:46.987Z"
  },
  {
    "id": "sub-1",
    "quizId": "quiz-101",
    "quizTitle": "Algebra & Arithmetic Progression Assessment",
    "subject": "Mathematics",
    "studentId": "std-1",
    "studentName": "Ali Raza",
    "studentClass": "Class 8 (Cadet Prep)",
    "teacherId": "tch-1",
    "teacherName": "Sir Asad Mahmood",
    "answers": {
      "q1": 1,
      "q2": 2,
      "q3": 1,
      "q4": 1,
      "q5": 2
    },
    "score": 25,
    "totalMarks": 25,
    "percentage": 100,
    "passed": true,
    "timeSpentSeconds": 480,
    "submittedAt": "2026-08-24T14:30:00Z",
    "integrityAudit": {
      "tabSwitches": 0,
      "copyAttempts": 0,
      "fullscreenExits": 0,
      "isDisqualified": false,
      "infractionTimestamps": []
    }
  },
  {
    "id": "sub-2",
    "quizId": "quiz-101",
    "quizTitle": "Algebra & Arithmetic Progression Assessment",
    "subject": "Mathematics",
    "studentId": "std-2",
    "studentName": "Hamza Tariq",
    "studentClass": "Class 8 (Cadet Prep)",
    "teacherId": "tch-1",
    "teacherName": "Sir Asad Mahmood",
    "answers": {
      "q1": 1,
      "q2": 2,
      "q3": 0,
      "q4": 1,
      "q5": 0
    },
    "score": 15,
    "totalMarks": 25,
    "percentage": 60,
    "passed": true,
    "timeSpentSeconds": 610,
    "submittedAt": "2026-08-24T15:10:00Z",
    "integrityAudit": {
      "tabSwitches": 1,
      "copyAttempts": 0,
      "fullscreenExits": 0,
      "isDisqualified": false,
      "infractionTimestamps": [
        "[15:05:12] Tab switched or minimized to background (Strike 1/3)"
      ]
    }
  },
  {
    "id": "sub-3",
    "quizId": "quiz-102",
    "quizTitle": "Verbal Intelligence Analogies & Classification Test",
    "subject": "Verbal Intelligence",
    "studentId": "std-3",
    "studentName": "Muhammad Saad",
    "studentClass": "Military College Prep Batch",
    "teacherId": "tch-2",
    "teacherName": "Capt. Tariq Rehman",
    "answers": {
      "v1": 1,
      "v2": 2,
      "v3": 1,
      "v4": 1,
      "v5": 2
    },
    "score": 25,
    "totalMarks": 25,
    "percentage": 100,
    "passed": true,
    "timeSpentSeconds": 320,
    "submittedAt": "2026-08-24T16:00:00Z",
    "integrityAudit": {
      "tabSwitches": 0,
      "copyAttempts": 0,
      "fullscreenExits": 0,
      "isDisqualified": false,
      "infractionTimestamps": []
    }
  },
  {
    "id": "sub-4",
    "quizId": "quiz-afzal-draft-1",
    "quizTitle": "SSC-II Mathematics: Basic Algebraic Identities & Formulas (Unit 1)",
    "subject": "Mathematics",
    "studentId": "std-aiza",
    "studentName": "Aiza",
    "studentClass": "Class 9&10",
    "teacherId": "tch-afzal",
    "teacherName": "Prof. M. Afzal",
    "answers": {
      "q_afzal_1": 1,
      "q_afzal_2": 2,
      "q_afzal_3": 2,
      "q_afzal_4": 1,
      "q_afzal_5": 1,
      "q_afzal_6": 1,
      "q_afzal_7": 0,
      "q_afzal_8": 1,
      "q_afzal_9": 1,
      "q_afzal_10": 1
    },
    "score": 50,
    "totalMarks": 50,
    "percentage": 100,
    "passed": true,
    "timeSpentSeconds": 540,
    "submittedAt": "2026-08-28T11:00:00Z",
    "integrityAudit": {
      "tabSwitches": 0,
      "copyAttempts": 0,
      "fullscreenExits": 0,
      "isDisqualified": false,
      "infractionTimestamps": []
    }
  },
  {
    "id": "sub-5",
    "quizId": "quiz-103",
    "quizTitle": "General Science Mechanics & Energy Drills",
    "subject": "Physics & General Science",
    "studentId": "std-4",
    "studentName": "Zainab Fatima",
    "studentClass": "Class 7 (Cadet Prep)",
    "teacherId": "tch-1",
    "teacherName": "Sir Asad Mahmood",
    "answers": {
      "s1": 1,
      "s2": 1,
      "s3": 0,
      "s4": 2,
      "s5": 3
    },
    "score": 25,
    "totalMarks": 25,
    "percentage": 100,
    "passed": true,
    "timeSpentSeconds": 410,
    "submittedAt": "2026-08-25T12:00:00Z",
    "integrityAudit": {
      "tabSwitches": 0,
      "copyAttempts": 0,
      "fullscreenExits": 0,
      "isDisqualified": false,
      "infractionTimestamps": []
    }
  }
];
const MASTER_SUBSCRIPTIONS = [
  {
    "id": "sub-1792153549136-agydg",
    "userId": "tch-1792153549134",
    "userName": "M.Afzal",
    "userEmail": "tmobiles.egadgets@gmail.com",
    "loginId": "m.afzal",
    "planId": "plan-faculty-30d",
    "planName": "Faculty Pass (30 Days)",
    "tier": "monthly",
    "price": "Institutional Grant",
    "durationDays": 30,
    "maxClasses": 5,
    "status": "active",
    "startDate": "2026-10-16T12:25:49.136Z",
    "expiryDate": "2026-11-15T12:25:49.136Z",
    "paymentMethod": "cash",
    "transactionRef": "INSTITUTIONAL-RECRUITMENT",
    "activatedAt": "2026-10-16T12:25:49.136Z",
    "verifiedAt": "2026-10-16T12:25:49.136Z",
    "verifiedBy": "ADMIN",
    "notes": "Active validity configured for 30 days upon faculty recruitment"
  },
  {
    "activatedAt": "2026-10-13T08:50:14.176Z",
    "planName": "Institutional Enrolled Pass",
    "expiryDate": "2027-10-13T08:50:14.176Z",
    "status": "active",
    "id": "sub-inst-1791881414175-6c4v",
    "planId": "plan-institutional",
    "paymentMethod": "cash",
    "notes": "Automatically authorized upon teacher enrollment.",
    "userEmail": "cadet_mobile@cadetsacademy.com",
    "verifiedAt": "2026-10-13T08:50:14.176Z",
    "userId": "std-1790434111251",
    "userName": "Cadet Mobile Bravo",
    "tier": "annual",
    "startDate": "2026-10-13T08:50:14.176Z",
    "verifiedBy": "FACULTY_TEACHER",
    "transactionRef": "FACULTY-ENROLLED-tch-1790433953275",
    "maxClasses": 5,
    "durationDays": 365,
    "loginId": "cadet_mb_01",
    "price": "Complimentary (Faculty Enrolled)"
  },
  {
    "status": "active",
    "loginId": "test_cadet_new",
    "verifiedAt": "2026-10-13T08:23:05.065Z",
    "userName": "Test Cadet New",
    "planId": "plan-institutional",
    "durationDays": 365,
    "price": "Complimentary (Faculty Enrolled)",
    "userId": "std-1791879785065",
    "startDate": "2026-10-13T08:23:05.065Z",
    "id": "sub-inst-1791879785065-zaai",
    "tier": "annual",
    "expiryDate": "2027-10-13T08:23:05.065Z",
    "activatedAt": "2026-10-13T08:23:05.065Z",
    "userEmail": "testcadet@gmail.com",
    "planName": "Institutional Enrolled Pass",
    "maxClasses": 5,
    "transactionRef": "FACULTY-ENROLLED-tch-1790433953275",
    "paymentMethod": "cash",
    "verifiedBy": "FACULTY_TEACHER",
    "notes": "Automatically authorized upon teacher enrollment."
  },
  {
    "verifiedBy": "SYSTEM",
    "startDate": "2026-10-04T15:08:54.788Z",
    "planName": "Cadet Term Prep Pass",
    "price": "PKR 3,800",
    "expiryDate": "2027-01-02T15:08:54.788Z",
    "tier": "quarterly",
    "id": "sub-1791126534788-3ohzv",
    "userName": "TuahaAfzal",
    "userId": "std-1788168752003",
    "loginId": "tuahaafzal",
    "transactionRef": "CARD-ONLINE-OK",
    "status": "active",
    "verifiedAt": "2026-10-04T15:08:54.788Z",
    "paymentMethod": "credit_card",
    "activatedAt": "2026-10-04T15:08:54.788Z",
    "durationDays": 90,
    "userEmail": "tuahaafzal5@gmail.com",
    "planId": "plan-quarterly"
  }
];
export {
  MASTER_ADMINS,
  MASTER_DEVELOPERS,
  MASTER_QUIZZES,
  MASTER_STUDENTS,
  MASTER_SUBMISSIONS,
  MASTER_SUBSCRIPTIONS,
  MASTER_TEACHERS
};

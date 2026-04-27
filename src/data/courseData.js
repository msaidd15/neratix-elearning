const BASE_LESSONS = [
  {
    id: 1,
    icon: "R1",
    title: "Kenalan dengan Robot",
    description: "Mengenal apa itu robot dan bagaimana robot membantu kehidupan sehari-hari.",
    duration: "12 menit",
    videoUrl: "https://www.youtube.com/embed/-kCy3yIIoO0",
    article: [
      "Robot adalah mesin cerdas yang bisa membantu manusia melakukan tugas tertentu. Di rumah, robot bisa membantu membersihkan ruangan. Di pabrik, robot membantu membuat produk dengan cepat dan rapi.",
      "Pada materi ini, kita belajar bahwa robot bekerja berdasarkan perintah. Perintah itu bisa datang dari tombol, sensor, atau program coding.",
      "Semakin baik kita memahami robot, semakin mudah kita merakit dan memprogram robot sendiri."
    ],
    note: "Tips: Bayangkan robot seperti teman baru yang bisa mengikuti instruksi dari kamu."
  },
  {
    id: 2,
    icon: "R2",
    title: "Bagian-Bagian Robot",
    description: "Belajar fungsi kepala robot, body, sensor, dan kontrol utama.",
    duration: "15 menit",
    videoUrl: "https://www.youtube.com/embed/8R7Tq4n5A9Q",
    article: [
      "Robot punya bagian penting seperti otak (controller), mata/telinga (sensor), dan otot (motor). Semua bagian ini bekerja bersama agar robot bisa bergerak.",
      "Controller bertugas memproses perintah, sensor bertugas membaca kondisi sekitar, dan motor menggerakkan roda atau lengan robot.",
      "Jika salah satu bagian tidak terpasang dengan benar, robot bisa bergerak tidak sesuai rencana."
    ],
    note: "Coba sebutkan 3 bagian robot favoritmu dan apa tugasnya."
  },
  {
    id: 3,
    icon: "R3",
    title: "Cara Kerja Sensor",
    description: "Memahami sensor jarak, cahaya, dan sentuh dengan contoh sederhana.",
    duration: "18 menit",
    videoUrl: "https://www.youtube.com/embed/6YfQYq5fP4A",
    article: [
      "Sensor membantu robot mengetahui apa yang terjadi di sekitar. Contohnya sensor jarak bisa mendeteksi tembok di depan robot.",
      "Sensor cahaya bisa membaca gelap-terang, sedangkan sensor sentuh memberi sinyal saat robot menyentuh sesuatu.",
      "Dengan sensor, robot jadi lebih pintar karena tidak bergerak asal, tapi berdasarkan data."
    ],
    note: "Sensor itu seperti panca indera pada manusia."
  },
  {
    id: 4,
    icon: "R4",
    title: "Dasar-Dasar Motor",
    description: "Mengenal motor sebagai penggerak utama robot agar bisa bergerak.",
    duration: "14 menit",
    videoUrl: "https://www.youtube.com/embed/1B4FU0A6OqQ",
    article: [
      "Motor adalah komponen yang membuat roda robot berputar. Tanpa motor, robot tidak bisa berjalan.",
      "Arah putaran motor menentukan arah gerak robot: maju, mundur, atau berbelok.",
      "Kecepatan motor juga bisa diatur agar robot bergerak pelan saat belok dan cepat saat lintasan lurus."
    ],
    note: "Latihan kecil: bedakan fungsi motor kiri dan motor kanan pada robot."
  },
  {
    id: 5,
    icon: "R5",
    title: "Logika Gerak Robot",
    description: "Belajar konsep perintah maju, berhenti, belok kanan, dan belok kiri.",
    duration: "17 menit",
    videoUrl: "https://www.youtube.com/embed/2ePf9rue1Ao",
    article: [
      "Logika gerak adalah urutan perintah yang membuat robot bergerak sesuai misi. Contoh: maju 2 detik, belok kanan, lalu berhenti.",
      "Kita bisa membuat robot lebih rapi dengan menambahkan jeda waktu antar perintah.",
      "Ketika robot belum tepat, kita lakukan debugging: cek urutan perintah dan coba ulang."
    ],
    note: "Langkah hebat: kamu sedang di materi aktif. Lanjutkan sampai selesai ya."
  },
  {
    id: 6,
    icon: "R6",
    title: "Pengenalan Blockly Coding",
    description: "Menyusun blok kode visual untuk mengontrol perilaku robot.",
    duration: "20 menit",
    videoUrl: "https://www.youtube.com/embed/svQxQfYh3xk",
    article: [
      "Blockly memudahkan coding dengan cara menyusun blok warna-warni seperti puzzle.",
      "Setiap blok punya fungsi: gerak, logika, kondisi, dan pengulangan.",
      "Dengan Blockly, anak-anak bisa belajar logika pemrograman tanpa takut salah ketik."
    ],
    note: "Setelah memahami Blockly, kamu akan lebih cepat membuat robot interaktif."
  },
  {
    id: 7,
    icon: "R7",
    title: "Membuat Robot Maju Mundur",
    description: "Praktik membuat robot bergerak maju mundur dengan perintah sederhana.",
    duration: "16 menit",
    videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ",
    article: [
      "Pada praktik ini, kita membuat dua instruksi dasar: robot maju dan robot mundur.",
      "Kunci utamanya adalah sinkronisasi putaran motor kiri dan kanan agar robot tetap stabil.",
      "Setelah berhasil, kamu bisa menambahkan tantangan gerak zig-zag."
    ],
    note: "Latihan singkat ini jadi pondasi sebelum masuk proyek yang lebih seru."
  },
  {
    id: 8,
    icon: "R8",
    title: "Robot Menghindari Halangan",
    description: "Latihan agar robot bisa mendeteksi rintangan dan mengubah arah.",
    duration: "19 menit",
    videoUrl: "https://www.youtube.com/embed/J--QVhGheP4",
    article: [
      "Pada materi ini, robot belajar membaca jarak rintangan dengan sensor ultrasonik.",
      "Saat jarak terlalu dekat, program memerintahkan robot berhenti lalu berbelok untuk mencari jalur aman.",
      "Kamu bisa atur ambang jarak agar robot lebih responsif sesuai arena latihan."
    ],
    note: "Tips: mulai dari kecepatan rendah agar uji coba lebih aman."
  },
  {
    id: 9,
    icon: "R9",
    title: "Robot Mengikuti Garis",
    description: "Membuat robot membaca garis dan bergerak mengikuti jalurnya.",
    duration: "21 menit",
    videoUrl: "https://www.youtube.com/embed/6YfQYq5fP4A",
    article: [
      "Robot line follower menggunakan sensor cahaya untuk membedakan garis hitam dan permukaan terang.",
      "Program mengoreksi putaran motor kiri-kanan agar robot tetap berada di jalur.",
      "Latihan ini mengasah logika kontrol dan akurasi gerak robot."
    ],
    note: "Coba variasikan ketebalan garis untuk melihat respon sensor."
  },
  {
    id: 10,
    icon: "R10",
    title: "Mini Project",
    description: "Gabungkan semua skill untuk membuat robot challenge pertamamu.",
    duration: "30 menit",
    videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ",
    article: [
      "Saat mini project, kamu menggabungkan gerak dasar, sensor, dan logika keputusan dalam satu misi.",
      "Rancang alur robot: mulai, membaca kondisi, bergerak, menghindari hambatan, lalu finish.",
      "Fokus utama proyek adalah kestabilan gerak dan ketepatan respon robot."
    ],
    note: "Kerjakan bertahap: uji per bagian dulu sebelum digabungkan."
  },
  {
    id: 11,
    icon: "R11",
    title: "Challenge Arena",
    description: "Selesaikan tantangan gerak robot dengan misi waktu terbatas.",
    duration: "24 menit",
    videoUrl: "https://www.youtube.com/embed/2ePf9rue1Ao",
    article: [
      "Di challenge arena, robot diuji dalam lintasan dengan beberapa skenario rintangan.",
      "Kamu perlu mengoptimalkan kecepatan sekaligus menjaga akurasi agar misi selesai tepat waktu.",
      "Gunakan hasil evaluasi tiap percobaan untuk memperbaiki strategi gerak robot."
    ],
    note: "Targetkan konsisten dulu, baru tingkatkan kecepatan."
  },
  {
    id: 12,
    icon: "R12",
    title: "Final Showcase",
    description: "Tunjukkan hasil robotmu dan raih badge akhir.",
    duration: "28 menit",
    videoUrl: "https://www.youtube.com/embed/svQxQfYh3xk",
    article: [
      "Final showcase adalah momen presentasi hasil belajar robotikmu dari awal hingga akhir.",
      "Tunjukkan bagaimana robot bekerja, tantangan yang kamu hadapi, dan solusi yang kamu pakai.",
      "Materi ini melatih kemampuan teknis sekaligus komunikasi proyek."
    ],
    note: "Presentasi singkat yang jelas lebih kuat daripada penjelasan panjang tanpa demo."
  }
];

function buildQuizForLesson(lesson) {
  const lessonNumber = String(lesson.id).padStart(2, "0");
  const optionSkills = ["sensor", "motor", "logika", "coding"];
  const optionDuration = ["5 menit", "10 menit", "15 menit", lesson.duration];
  const optionModule = ["Dashboard", "Materi", "Admin", "Login"];

  return [
    {
      id: `${lesson.id}-q1`,
      question: `Materi #${lessonNumber} membahas topik utama apa?`,
      options: { A: lesson.title, B: "Sejarah internet", C: "Bahasa Inggris", D: "Matematika dasar" },
      answer: "A"
    },
    {
      id: `${lesson.id}-q2`,
      question: `Durasi yang tertera pada materi "${lesson.title}" adalah...`,
      options: { A: optionDuration[0], B: optionDuration[1], C: optionDuration[2], D: optionDuration[3] },
      answer: "D"
    },
    {
      id: `${lesson.id}-q3`,
      question: "Komponen robot yang berfungsi sebagai penggerak adalah...",
      options: { A: "Sensor", B: "Motor", C: "Baterai cadangan", D: "Layar monitor" },
      answer: "B"
    },
    {
      id: `${lesson.id}-q4`,
      question: "Tujuan belajar materi ini paling tepat adalah...",
      options: {
        A: "Menghafal teori tanpa praktik",
        B: "Memahami konsep robotik dan penerapannya",
        C: "Menggambar robot saja",
        D: "Membuat game 3D"
      },
      answer: "B"
    },
    {
      id: `${lesson.id}-q5`,
      question: "Pada pembelajaran robotik, langkah yang benar saat robot belum sesuai adalah...",
      options: { A: "Langsung menyerah", B: "Menghapus semua komponen", C: "Melakukan debugging", D: "Mematikan aplikasi" },
      answer: "C"
    },
    {
      id: `${lesson.id}-q6`,
      question: "Materi ini termasuk bagian dari pembelajaran...",
      options: { A: "Robotik dasar", B: "Memasak", C: "Seni lukis", D: "Olahraga renang" },
      answer: "A"
    },
    {
      id: `${lesson.id}-q7`,
      question: `Jika ingin melanjutkan materi berikutnya, menu yang digunakan adalah...`,
      options: {
        A: optionModule[0],
        B: optionModule[1],
        C: "Tutup Browser",
        D: optionModule[2]
      },
      answer: "B"
    },
    {
      id: `${lesson.id}-q8`,
      question: "Dalam konteks robotik, data dari sensor digunakan untuk...",
      options: {
        A: "Menghias tampilan",
        B: "Memberi keputusan gerak robot",
        C: "Menambah ukuran robot",
        D: "Mengganti warna kabel"
      },
      answer: "B"
    },
    {
      id: `${lesson.id}-q9`,
      question: `Pilihan yang paling sesuai dengan materi "${lesson.title}" adalah...`,
      options: {
        A: `Fokus pada ${optionSkills[(lesson.id - 1) % optionSkills.length]} robot`,
        B: "Fokus pada resep makanan",
        C: "Fokus pada sejarah kerajaan",
        D: "Fokus pada astronomi"
      },
      answer: "A"
    },
    {
      id: `${lesson.id}-q10`,
      question: "Setelah menyelesaikan quiz, tindakan yang tepat adalah...",
      options: {
        A: "Mengabaikan hasil",
        B: "Mengecek jawaban dan lanjut belajar",
        C: "Keluar dari akun",
        D: "Menghapus progress"
      },
      answer: "B"
    }
  ];
}

export const COURSE_CONFIG = {
  roboexplorer: {
    id: "roboexplorer",
    name: "Neratix RoboExplorer",
    shortName: "RoboExplorer",
    badgeTarget: "Explorer Star"
  },
  robobuilder: {
    id: "robobuilder",
    name: "Neratix RoboBuilder",
    shortName: "RoboBuilder",
    badgeTarget: "Builder Star"
  },
  roboengineer: {
    id: "roboengineer",
    name: "Neratix RoboEngineer",
    shortName: "RoboEngineer",
    badgeTarget: "Engineer Star"
  }
};

export function getCourseConfig(courseKey) {
  return COURSE_CONFIG[courseKey] || null;
}

export function getCourseLessons(courseKey) {
  const config = getCourseConfig(courseKey);
  if (!config) return [];

  return BASE_LESSONS.map((lesson) => {
    let computedLesson = { ...lesson };

    if (lesson.id === 10) {
      computedLesson = {
        ...computedLesson,
        title: `Mini Project ${config.shortName}`
      };
    }

    if (lesson.id === 12) {
      computedLesson = {
        ...computedLesson,
        title: `Final Showcase`,
        description: `Tunjukkan hasil robotmu dan raih badge akhir ${config.shortName}.`
      };
    }

    return {
      ...computedLesson,
      quiz: buildQuizForLesson(computedLesson)
    };
  });
}

export const DASHBOARD_COURSES = [
  {
    id: 1,
    title: "Neratix RoboExplorer",
    thumbnail: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1000&q=80",
    package: "Neratix RoboExplorer",
    route: "/paket/roboexplorer"
  },
  {
    id: 2,
    title: "Neratix RoboBuilder",
    thumbnail: "https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?auto=format&fit=crop&w=1000&q=80",
    package: "Neratix RoboBuilder",
    route: "/paket/robobuilder"
  },
  {
    id: 3,
    title: "Neratix RoboEngineer",
    thumbnail: "https://images.unsplash.com/photo-1589254065909-b7086229d08c?auto=format&fit=crop&w=1000&q=80",
    package: "Neratix RoboEngineer",
    route: "/paket/roboengineer"
  },
  {
    id: 4,
    title: "Fakta Robotik",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
    package: "Semua Paket",
    route: "/paket/faktarobotik/materi"
  }
];

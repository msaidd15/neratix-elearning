import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/fakta.css";

const slides = [
  {
    title: "Apa Itu Robotik?",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Robot humanoid modern",
    paragraph:
      "Robotik adalah bidang yang memadukan mekanika, elektronika, dan pemrograman untuk membuat mesin yang bisa membantu manusia menyelesaikan tugas tertentu.",
    items: [
      "Robot dapat bekerja otomatis atau semi-otomatis.",
      "Robot dipakai di rumah, pabrik, rumah sakit, hingga luar angkasa.",
      "Tujuan utamanya: pekerjaan lebih cepat, aman, dan akurat."
    ]
  },
  {
    title: "Komponen Utama Robot",
    image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Komponen elektronik dan papan sirkuit robot",
    paragraph: "Setiap robot biasanya punya beberapa bagian penting agar bisa bergerak dan mengambil keputusan.",
    items: [
      "Sensor: membaca kondisi lingkungan (jarak, cahaya, suhu, suara).",
      "Controller: otak robot yang memproses data dari sensor.",
      "Aktuator: bagian yang menghasilkan gerakan, seperti motor dan servo.",
      "Sumber daya: baterai atau listrik untuk menjalankan sistem robot."
    ]
  },
  {
    title: "Jenis-Jenis Robot",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Lengan robot industri di pabrik",
    paragraph: "Robot dibuat sesuai kebutuhan. Berikut contoh jenis robot yang sering kita temui.",
    items: [
      "Robot industri: membantu perakitan dan pengelasan di pabrik.",
      "Robot layanan: seperti robot pembersih atau robot pengantar barang.",
      "Robot medis: mendukung operasi dengan presisi tinggi.",
      "Robot edukasi: dipakai untuk belajar coding dan logika."
    ]
  },
  {
    title: "Cara Kerja Robot",
    image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Robot bergerak di jalur otomatis",
    paragraph: "Secara sederhana, robot bekerja dengan siklus berulang: membaca data, memproses, lalu bertindak.",
    items: [
      "Input: sensor menangkap informasi dari sekitar.",
      "Proses: program menentukan keputusan terbaik.",
      "Output: aktuator menjalankan perintah.",
      "Umpan balik: robot mengecek hasil lalu menyesuaikan aksi berikutnya."
    ]
  },
  {
    title: "Etika dan Keselamatan Robotik",
    image: "https://images.unsplash.com/photo-1589254065909-b7086229d08c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Tim memantau robot untuk memastikan keamanan",
    paragraph: "Robot harus dirancang agar aman untuk pengguna dan lingkungan.",
    items: [
      "Gunakan robot sesuai prosedur dan area operasional.",
      "Pastikan ada tombol darurat (emergency stop) pada sistem.",
      "Lindungi data pengguna, terutama untuk robot berbasis internet.",
      "Robot membantu manusia, bukan menggantikan empati dan tanggung jawab manusia."
    ]
  },
  {
    title: "Ringkasan dan Kuis",
    image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Robot edukasi untuk pembelajaran NeraBot",
    paragraph:
      "Robotik adalah teknologi masa depan yang membuka banyak peluang karier dan inovasi. Kunci belajar robotik adalah latihan bertahap: pahami konsep, coba praktik, lalu evaluasi hasil.",
    items: [
      "1. Komponen apa yang berfungsi sebagai otak robot?",
      "2. Sebutkan satu contoh robot layanan di sekitar kita.",
      "3. Mengapa aspek keamanan penting dalam robotik?"
    ],
    quiz: true
  }
];

export default function FaktaRobotikPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const activeSlide = useMemo(() => slides[index], [index]);

  function show(nextIndex) {
    const total = slides.length;
    setIndex((nextIndex + total) % total);
  }

  return (
    <div className="wrap">
      <header className="topbar">
        <div>
          <h1 className="title">Materi Seputar Robotik</h1>
          <p className="subtitle">Belajar konsep dasar robotik lewat format slide interaktif.</p>
        </div>
        <button className="btn" type="button" onClick={() => navigate("/dashboard")}>Kembali ke Home</button>
      </header>

      <section className="slider">
        <div className="slide-head">
          <strong>{activeSlide.title}</strong>
          <span className="badge">{index + 1} / {slides.length}</span>
        </div>

        <div className="track">
          {slides.map((slide, slideIndex) => (
            <article key={slide.title} className={`slide ${slideIndex === index ? "active" : ""}`}>
              <h2>{slide.title}</h2>
              <figure className="slide-media">
                <img src={slide.image} alt={slide.imageAlt} loading="lazy" />
              </figure>
              <p>{slide.paragraph}</p>
              {slide.quiz ? (
                <div className="quiz">
                  <strong>Kuis Mini:</strong>
                  <ul>
                    {slide.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul>
                  {slide.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        <div className="nav">
          <div className="dots">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={`dot ${dotIndex === index ? "active" : ""}`}
                aria-label={`Buka slide ${dotIndex + 1}`}
                onClick={() => show(dotIndex)}
              />
            ))}
          </div>
          <div className="nav-btns">
            <button className="ctrl sec" type="button" onClick={() => show(index - 1)}>Sebelumnya</button>
            <button className="ctrl pri" type="button" onClick={() => show(index + 1)}>Berikutnya</button>
          </div>
        </div>
      </section>
    </div>
  );
}

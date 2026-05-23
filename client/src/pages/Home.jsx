import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { assetUrl, request } from "../lib/api.js";

const fallbackWords = ["Full-Stack Developer", "React Specialist", "Product Builder", "AI Explorer"];

export default function Home() {
  const [about, setAbout] = useState(null);
  const [wordIndex, setWordIndex] = useState(0);
  const words = about?.typingWords?.length ? about.typingWords : fallbackWords;

  useEffect(() => {
    request("/about").then(setAbout).catch(() => null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setWordIndex((index) => (index + 1) % words.length), 2100);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <>
      <SEO title="Adarsh | Full-Stack Developer" description="Modern full-stack portfolio for web, AI, and product work." />
      <main>
        <section className="section grid min-h-[calc(100vh-74px)] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#2a6fdb] dark:text-[#8fd694]">
              Available for thoughtful builds
            </p>
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {about?.name || "Adarsh"}
              <span className="mt-3 block text-[#2a6fdb] dark:text-[#8fd694]">{words[wordIndex]}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6675] dark:text-white/62">
              {about?.intro || "I design and ship elegant, fast, human-friendly digital products."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/projects" className="button-primary">
                View projects
              </Link>
              <Link to="/contact" className="button-secondary">
                Start a conversation
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <img
              src={assetUrl(about?.profileImage) || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"}
              alt={about?.name || "Profile portrait"}
              className="aspect-[4/5] w-full rounded-lg object-cover shadow-soft"
              loading="eager"
            />
            <div className="panel absolute bottom-5 left-5 right-5 rounded-lg p-5">
              <p className="text-sm text-[#5d6675] dark:text-white/60">Current focus</p>
              <p className="mt-1 text-lg font-bold">Premium web apps, admin systems, and AI-assisted workflows.</p>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}

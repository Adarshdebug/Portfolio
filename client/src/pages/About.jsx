import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageIntro from "../components/PageIntro.jsx";
import SEO from "../components/SEO.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { request } from "../lib/api.js";

export default function About() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    request("/about").then(setAbout).catch(() => null);
  }, []);

  return (
    <>
      <SEO title="About | Adarsh" description="Bio, skills, and resume for Adarsh." />
      <section className="section">
        <PageIntro eyebrow="About" title="Clean code, clean interfaces, clear outcomes." text="A focused snapshot of how I work and what I build best." />
        {!about ? (
          <Skeleton rows={3} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="panel rounded-lg p-8">
              <h2 className="text-3xl font-bold">{about.title}</h2>
              <p className="mt-5 text-lg leading-8 text-[#5d6675] dark:text-white/62">{about.bio}</p>
              {about.resumeUrl && (
                <a className="button-primary mt-8" href={about.resumeUrl} download>
                  Download resume
                </a>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel rounded-lg p-8">
              <h2 className="text-2xl font-bold">Skills</h2>
              <div className="mt-6 grid gap-5">
                {(about.skills || []).map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between text-sm font-semibold">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="h-2 rounded-lg bg-black/10 dark:bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                        className="h-full rounded-lg bg-[#2a6fdb] dark:bg-[#8fd694]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </section>
    </>
  );
}

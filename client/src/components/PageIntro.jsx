import { motion } from "framer-motion";

export default function PageIntro({ eyebrow, title, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2a6fdb] dark:text-[#8fd694]">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-[#5d6675] dark:text-white/62">{text}</p>
    </motion.div>
  );
}

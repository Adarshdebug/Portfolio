import { motion } from "framer-motion";
import { assetUrl } from "../lib/api.js";

export default function ProjectCard({ project }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="project-surface group overflow-hidden rounded-lg"
    >
      <div className="relative overflow-hidden">
        <img
          src={assetUrl(project.image)}
          alt={project.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-[#14161a]">
            {project.category}
          </span>
          {project.featured && <span className="rounded-lg bg-[#8fd694] px-3 py-1 text-xs font-bold text-[#14161a]">Top Project</span>}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight">{project.title}</h3>
          <span className="text-xs font-semibold text-[#5d6675] dark:text-white/45">
            {(project.techStack || []).slice(0, 1).join("")}
          </span>
        </div>
        <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#5d6675] dark:text-white/60">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(project.techStack || []).map((tech) => (
            <span key={tech} className="rounded-lg border border-black/10 bg-black/[0.03] px-3 py-1 text-xs dark:border-white/10 dark:bg-white/[0.04]">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a className="button-primary px-4 py-2" href={project.liveUrl} target="_blank" rel="noreferrer">
              View Live
            </a>
          )}
          {project.githubUrl && (
            <a className="button-secondary px-4 py-2" href={project.githubUrl} target="_blank" rel="noreferrer">
              Source Code
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

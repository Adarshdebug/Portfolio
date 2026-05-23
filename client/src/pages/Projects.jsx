import { useEffect, useMemo, useState } from "react";
import PageIntro from "../components/PageIntro.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import SEO from "../components/SEO.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { assetUrl, request } from "../lib/api.js";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    request("/projects")
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...new Set(projects.map((project) => project.category))], [projects]);
  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = category === "All" || project.category === category;
      const haystack = `${project.title} ${project.description} ${(project.techStack || []).join(" ")}`.toLowerCase();
      return matchesCategory && haystack.includes(search.toLowerCase());
    });
  }, [category, projects, search]);

  const featuredProjects = filtered.filter((project) => project.featured).slice(0, 2);
  const remainingProjects = filtered.filter((project) => !featuredProjects.some((item) => item._id === project._id));

  return (
    <>
      <SEO title="Projects | Adarsh" description="Selected AI, web, and product engineering projects." />
      <section className="section">
        <PageIntro eyebrow="Projects" title="Selected work with useful details." text="A recruiter-friendly view of my strongest engineering projects, with the best work surfaced first." />
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto]">
          <input className="input" placeholder="Search projects, stacks, or domains..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={category === item ? "button-primary px-4 py-2" : "button-secondary px-4 py-2"}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="project-surface rounded-lg p-5">
            <p className="text-sm text-[#5d6675] dark:text-white/55">Portfolio Projects</p>
            <p className="mt-2 text-3xl font-bold">{projects.length}</p>
          </div>
          <div className="project-surface rounded-lg p-5">
            <p className="text-sm text-[#5d6675] dark:text-white/55">Featured Work</p>
            <p className="mt-2 text-3xl font-bold">{projects.filter((project) => project.featured).length}</p>
          </div>
          <div className="project-surface rounded-lg p-5">
            <p className="text-sm text-[#5d6675] dark:text-white/55">Search Results</p>
            <p className="mt-2 text-3xl font-bold">{filtered.length}</p>
          </div>
        </div>
        {loading ? (
          <Skeleton rows={4} />
        ) : (
          <>
            {featuredProjects.length > 0 && (
              <div className="mb-10 grid gap-6 xl:grid-cols-2">
                {featuredProjects.map((project) => (
                  <article key={project._id} className="project-surface overflow-hidden rounded-lg">
                    <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                      <img src={assetUrl(project.image)} alt={project.title} className="h-full min-h-[280px] w-full object-cover" loading="lazy" />
                      <div className="flex flex-col justify-between p-7">
                        <div>
                          <span className="rounded-lg bg-[#2a6fdb]/10 px-3 py-1 text-xs font-bold text-[#2a6fdb] dark:bg-[#8fd694]/10 dark:text-[#8fd694]">
                            Featured
                          </span>
                          <h2 className="mt-4 text-3xl font-bold tracking-tight">{project.title}</h2>
                          <p className="mt-4 text-base leading-7 text-[#5d6675] dark:text-white/60">{project.description}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {(project.techStack || []).map((tech) => (
                              <span key={tech} className="rounded-lg border border-black/10 px-3 py-1 text-xs dark:border-white/10">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                          {project.liveUrl && (
                            <a className="button-primary px-4 py-2" href={project.liveUrl} target="_blank" rel="noreferrer">
                              Live Demo
                            </a>
                          )}
                          <a className="button-secondary px-4 py-2" href={project.githubUrl} target="_blank" rel="noreferrer">
                            View Repo
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {remainingProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

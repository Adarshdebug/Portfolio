import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { assetUrl, request } from "../lib/api.js";

const emptyProject = {
  title: "",
  description: "",
  category: "Web",
  techStack: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
  visible: true
};

const emptyAbout = {
  name: "",
  title: "",
  intro: "",
  bio: "",
  profileImage: "",
  resumeUrl: "",
  typingWords: [],
  skills: []
};

const emptyContact = {
  email: "",
  phone: "",
  location: "",
  github: "",
  linkedin: "",
  twitter: "",
  website: ""
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const normalizeAbout = (value = {}) => ({
  ...emptyAbout,
  ...value,
  typingWords: normalizeList(value.typingWords),
  skills: Array.isArray(value.skills) ? value.skills : []
});

export default function AdminPanel() {
  const { admin, logout } = useAuth();
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalProjects: 0, visibleProjects: 0, views: 0 });
  const [projects, setProjects] = useState([]);
  const [about, setAbout] = useState(emptyAbout);
  const [contact, setContact] = useState(emptyContact);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [projectImage, setProjectImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [githubUsername, setGithubUsername] = useState("Adarshdebug");
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState("");

  const navItems = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "home", label: "Home Content" },
      { id: "projects", label: "Projects" },
      { id: "contact", label: "Contact" }
    ],
    []
  );

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsData, projectData, aboutData, contactData] = await Promise.all([
        request("/projects/stats"),
        request("/projects?includeHidden=true"),
        request("/about"),
        request("/contact")
      ]);
      setStats(statsData);
      setProjects(projectData);
      setAbout(normalizeAbout(aboutData));
      setContact({ ...emptyContact, ...contactData });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const saveHomeContent = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      ["name", "title", "intro", "bio", "profileImage", "resumeUrl"].forEach((key) => {
        body.append(key, about[key] || "");
      });
      body.append("typingWords", JSON.stringify(normalizeList(about.typingWords)));
      body.append("skills", JSON.stringify(about.skills || []));
      if (profileImage) body.append("profileImage", profileImage);

      const updated = await request("/about", { method: "PUT", body });
      setAbout(normalizeAbout(updated));
      setProfileImage(null);
      toast.success("Home content updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await request("/contact", {
        method: "PUT",
        body: JSON.stringify(contact)
      });
      setContact({ ...emptyContact, ...updated });
      toast.success("Contact updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      Object.entries(projectForm).forEach(([key, value]) => body.append(key, value));
      if (projectImage) body.append("image", projectImage);

      await request(editingId ? `/projects/${editingId}` : "/projects", {
        method: editingId ? "PUT" : "POST",
        body
      });

      toast.success(editingId ? "Project updated" : "Project created");
      clearProjectForm();
      await loadDashboard();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const clearProjectForm = () => {
    setProjectForm(emptyProject);
    setEditingId(null);
    setProjectImage(null);
  };

  const editProject = (project) => {
    setActive("projects");
    setEditingId(project._id);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      category: project.category || "Web",
      techStack: (project.techStack || []).join(", "),
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      featured: Boolean(project.featured),
      visible: Boolean(project.visible)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await request(`/projects/${id}`, { method: "DELETE" });
      toast.success("Project deleted");
      await loadDashboard();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchGithubRepos = async () => {
    if (!githubUsername.trim()) {
      toast.error("Enter GitHub username");
      return;
    }
    setGithubLoading(true);
    setGithubMessage("");
    try {
      const repos = await request(`/projects/github/${githubUsername.trim()}`);
      setGithubRepos(repos);
      setGithubMessage(repos.length ? `${repos.length} repos found for ${githubUsername.trim()}` : `No repos found for ${githubUsername.trim()}`);
      toast.success("GitHub repos loaded");
    } catch (error) {
      setGithubRepos([]);
      setGithubMessage(error.message);
      toast.error(error.message);
    } finally {
      setGithubLoading(false);
    }
  };

  const syncGithubProjects = async () => {
    if (!githubUsername.trim()) {
      toast.error("Enter GitHub username");
      return;
    }
    setGithubLoading(true);
    setGithubMessage("");
    try {
      const result = await request(`/projects/sync-github/${githubUsername.trim()}`, {
        method: "POST"
      });
      setGithubMessage(result.message);
      toast.success(result.message);
      await loadDashboard();
    } catch (error) {
      setGithubMessage(error.message);
      toast.error(error.message);
    } finally {
      setGithubLoading(false);
    }
  };

  const useRepo = (repo) => {
    setProjectForm({
      ...emptyProject,
      ...repo,
      techStack: (repo.techStack || []).join(", ")
    });
    setEditingId(null);
  };

  const updateSkill = (index, key, value) => {
    setAbout((current) => ({
      ...current,
      skills: current.skills.map((skill, skillIndex) =>
        skillIndex === index ? { ...skill, [key]: key === "level" ? Number(value) : value } : skill
      )
    }));
  };

  return (
    <>
      <SEO title="Admin Dashboard | Portfolio" description="Manage portfolio content." />
      <div className="min-h-screen bg-[#f7f8fb] text-[#14161a] dark:bg-[#08090b] dark:text-white">
        <header className="sticky top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#08090b]/88">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2a6fdb] dark:text-[#8fd694]">
                Portfolio Admin
              </p>
              <h1 className="mt-1 text-2xl font-bold">Content Dashboard</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#5d6675] dark:text-white/55">{admin?.email}</span>
              <Link to="/" className="button-secondary px-4 py-2">
                View Site
              </Link>
              <button onClick={logout} className="button-primary px-4 py-2">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[240px_1fr]">
          <aside className="panel h-fit rounded-lg p-3">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                    active === item.id
                      ? "bg-[#14161a] text-white dark:bg-white dark:text-[#14161a]"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          <section>
            {loading ? (
              <div className="panel rounded-lg p-8">Loading admin data...</div>
            ) : (
              <>
                {active === "overview" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Stat label="Total projects" value={stats.totalProjects} />
                      <Stat label="Visible projects" value={stats.visibleProjects} />
                      <Stat label="Project views" value={stats.views} />
                    </div>
                    <div className="panel rounded-lg p-6">
                      <h2 className="text-xl font-bold">Quick actions</h2>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={() => setActive("home")} className="button-primary">
                          Edit Home Page
                        </button>
                        <button onClick={() => setActive("projects")} className="button-secondary">
                          Manage Projects
                        </button>
                        <button onClick={() => setActive("contact")} className="button-secondary">
                          Update Contact
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {active === "home" && (
                  <form onSubmit={saveHomeContent} className="panel grid gap-6 rounded-lg p-6">
                    <SectionTitle
                      eyebrow="Home Page"
                      title="Hero, profile photo, bio, and skills"
                      text="Yahin se homepage ka name, title, intro, typing text, photo aur about page content change hoga."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Name" value={about.name} onChange={(value) => setAbout({ ...about, name: value })} />
                      <Field label="Title" value={about.title} onChange={(value) => setAbout({ ...about, title: value })} />
                    </div>

                    <Field
                      label="Typing Words"
                      value={normalizeList(about.typingWords).join(", ")}
                      onChange={(value) => setAbout({ ...about, typingWords: normalizeList(value) })}
                      placeholder="Full-Stack Developer, React Specialist, AI Builder"
                    />

                    <label className="grid gap-2">
                      <span className="label">Short Intro</span>
                      <textarea
                        className="input min-h-24"
                        value={about.intro}
                        onChange={(event) => setAbout({ ...about, intro: event.target.value })}
                      />
                    </label>

                    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
                      <div className="rounded-lg border border-black/10 p-3 dark:border-white/10">
                        <img
                          src={assetUrl(about.profileImage)}
                          alt={about.name || "Profile preview"}
                          className="aspect-[4/5] w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="grid gap-4">
                        <Field
                          label="Profile Image URL"
                          value={about.profileImage}
                          onChange={(value) => setAbout({ ...about, profileImage: value })}
                        />
                        <label className="grid gap-2">
                          <span className="label">Upload Profile Photo</span>
                          <input
                            className="input"
                            type="file"
                            accept="image/*"
                            onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
                          />
                        </label>
                        <Field
                          label="Resume URL"
                          value={about.resumeUrl}
                          onChange={(value) => setAbout({ ...about, resumeUrl: value })}
                        />
                      </div>
                    </div>

                    <label className="grid gap-2">
                      <span className="label">Full Bio</span>
                      <textarea
                        className="input min-h-36"
                        value={about.bio}
                        onChange={(event) => setAbout({ ...about, bio: event.target.value })}
                      />
                    </label>

                    <div className="grid gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-bold">Skills</h3>
                        <button
                          type="button"
                          className="button-secondary px-4 py-2"
                          onClick={() => setAbout({ ...about, skills: [...about.skills, { name: "", level: 80 }] })}
                        >
                          Add Skill
                        </button>
                      </div>
                      {about.skills.map((skill, index) => (
                        <div key={index} className="grid gap-3 md:grid-cols-[1fr_150px_auto]">
                          <input
                            className="input"
                            value={skill.name}
                            onChange={(event) => updateSkill(index, "name", event.target.value)}
                            placeholder="Skill name"
                          />
                          <input
                            className="input"
                            type="number"
                            min="0"
                            max="100"
                            value={skill.level}
                            onChange={(event) => updateSkill(index, "level", event.target.value)}
                          />
                          <button
                            type="button"
                            className="button-secondary px-4 py-2"
                            onClick={() => setAbout({ ...about, skills: about.skills.filter((_, skillIndex) => skillIndex !== index) })}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <button className="button-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Home Content"}
                    </button>
                  </form>
                )}

                {active === "projects" && (
                  <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <form onSubmit={saveProject} className="panel grid gap-4 rounded-lg p-6">
                      <SectionTitle
                        eyebrow="Projects"
                        title={editingId ? "Edit project" : "Add new project"}
                        text="Project card, image, links, category, visibility sab yahan se manage karo."
                      />

                        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                          <p className="label mb-3">Import from GitHub</p>
                          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                            <input
                              className="input"
                              value={githubUsername}
                              onChange={(event) => setGithubUsername(event.target.value)}
                              placeholder="GitHub username"
                            />
                            <button type="button" onClick={fetchGithubRepos} className="button-secondary px-4 py-2">
                              {githubLoading ? "Fetching..." : "Fetch"}
                            </button>
                          </div>
                          <div className="mt-3">
                            <button type="button" onClick={syncGithubProjects} className="button-primary px-4 py-2">
                              Sync Portfolio From GitHub
                            </button>
                          </div>
                          {githubMessage && (
                            <p className="mt-3 text-sm text-[#5d6675] dark:text-white/60">{githubMessage}</p>
                          )}
                          {githubRepos.length > 0 && (
                            <div className="mt-4 grid gap-3">
                              {githubRepos.slice(0, 6).map((repo) => (
                                <div key={repo.githubUrl} className="rounded-lg bg-black/5 p-3 dark:bg-white/10">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold">{repo.title}</p>
                                      <p className="mt-1 text-sm text-[#5d6675] dark:text-white/60">
                                        {repo.description || "GitHub repository"}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => useRepo(repo)}
                                      className="button-secondary px-3 py-2"
                                    >
                                      Use This Repo
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      <Field label="Title" value={projectForm.title} onChange={(value) => setProjectForm({ ...projectForm, title: value })} required />
                      <label className="grid gap-2">
                        <span className="label">Description</span>
                        <textarea
                          className="input min-h-28"
                          value={projectForm.description}
                          onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
                          required
                        />
                      </label>
                      <Field label="Category" value={projectForm.category} onChange={(value) => setProjectForm({ ...projectForm, category: value })} required />
                      <Field label="Tech Stack" value={projectForm.techStack} onChange={(value) => setProjectForm({ ...projectForm, techStack: value })} placeholder="React, Node.js, MongoDB" />
                      <Field label="Live URL" value={projectForm.liveUrl} onChange={(value) => setProjectForm({ ...projectForm, liveUrl: value })} />
                      <Field label="GitHub URL" value={projectForm.githubUrl} onChange={(value) => setProjectForm({ ...projectForm, githubUrl: value })} />
                      <label className="grid gap-2">
                        <span className="label">Project Image</span>
                        <input className="input" type="file" accept="image/*" onChange={(event) => setProjectImage(event.target.files?.[0] || null)} />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Toggle label="Featured" checked={projectForm.featured} onChange={(value) => setProjectForm({ ...projectForm, featured: value })} />
                        <Toggle label="Visible" checked={projectForm.visible} onChange={(value) => setProjectForm({ ...projectForm, visible: value })} />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button className="button-primary" disabled={saving}>
                          {saving ? "Saving..." : editingId ? "Save Project" : "Create Project"}
                        </button>
                        {editingId && (
                          <button type="button" onClick={clearProjectForm} className="button-secondary">
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="grid gap-4">
                      {projects.map((project) => (
                        <article key={project._id} className="panel grid gap-4 rounded-lg p-4 md:grid-cols-[150px_1fr_auto]">
                          <img
                            src={assetUrl(project.image)}
                            alt={project.title}
                            className="h-32 w-full rounded-lg object-cover md:w-36"
                            loading="lazy"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold">{project.title}</h3>
                              <span className="rounded-lg bg-[#2a6fdb]/10 px-2 py-1 text-xs font-bold text-[#2a6fdb] dark:bg-[#8fd694]/10 dark:text-[#8fd694]">
                                {project.category}
                              </span>
                              {!project.visible && <span className="rounded-lg bg-black/10 px-2 py-1 text-xs dark:bg-white/10">Hidden</span>}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#5d6675] dark:text-white/58">{project.description}</p>
                          </div>
                          <div className="flex gap-2 md:flex-col">
                            <button onClick={() => editProject(project)} className="button-secondary px-4 py-2">
                              Edit
                            </button>
                            <button onClick={() => deleteProject(project._id)} className="button-secondary px-4 py-2">
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {active === "contact" && (
                  <form onSubmit={saveContact} className="panel grid gap-5 rounded-lg p-6">
                    <SectionTitle
                      eyebrow="Contact"
                      title="Email and social links"
                      text="Contact page par jo details dikhengi, woh yahan se update hongi."
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.keys(emptyContact).map((key) => (
                        <Field
                          key={key}
                          label={key}
                          value={contact[key] || ""}
                          onChange={(value) => setContact({ ...contact, [key]: value })}
                          required={key === "email"}
                        />
                      ))}
                    </div>
                    <button className="button-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Contact"}
                    </button>
                  </form>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2a6fdb] dark:text-[#8fd694]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#5d6675] dark:text-white/55">{text}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="panel rounded-lg p-5">
      <p className="text-sm text-[#5d6675] dark:text-white/55">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", required = false }) {
  return (
    <label className="grid gap-2">
      <span className="label capitalize">{label}</span>
      <input
        className="input"
        value={value || ""}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <span className="label">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

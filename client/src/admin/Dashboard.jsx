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

export default function Dashboard() {
  const { admin, logout } = useAuth();
  const [tab, setTab] = useState("projects");
  const [stats, setStats] = useState({ totalProjects: 0, visibleProjects: 0, views: 0 });
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepos, setGithubRepos] = useState([]);
  const [about, setAbout] = useState({ name: "", title: "", intro: "", bio: "", resumeUrl: "", skills: [] });
  const [contact, setContact] = useState({ email: "", phone: "", location: "", github: "", linkedin: "", twitter: "", website: "" });

  const tabs = useMemo(() => ["projects", "about", "contact"], []);

  const load = async () => {
    const [statsData, projectData, aboutData, contactData] = await Promise.all([
      request("/projects/stats"),
      request("/projects?includeHidden=true"),
      request("/about"),
      request("/contact")
    ]);
    setStats(statsData);
    setProjects(projectData);
    setAbout(aboutData);
    setContact(contactData);
  };

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
  }, []);

  const submitProject = async (event) => {
    event.preventDefault();
    const body = new FormData();
    Object.entries(projectForm).forEach(([key, value]) => body.append(key, value));
    if (image) body.append("image", image);

    try {
      await request(editingId ? `/projects/${editingId}` : "/projects", {
        method: editingId ? "PUT" : "POST",
        body
      });
      toast.success(editingId ? "Project updated" : "Project added");
      setProjectForm(emptyProject);
      setEditingId(null);
      setImage(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const editProject = (project) => {
    setEditingId(project._id);
    setProjectForm({
      title: project.title,
      description: project.description,
      category: project.category,
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
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchGithubRepos = async () => {
    if (!githubUsername.trim()) return;
    try {
      const repos = await request(`/projects/github/${githubUsername.trim()}`);
      setGithubRepos(repos);
      toast.success("GitHub repositories loaded");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const useRepo = (repo) => {
    setProjectForm({
      ...emptyProject,
      ...repo,
      techStack: (repo.techStack || []).join(", ")
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAbout = async (event) => {
    event.preventDefault();
    try {
      const body = new FormData();
      ["name", "title", "intro", "bio", "profileImage", "resumeUrl"].forEach((key) => {
        body.append(key, about[key] || "");
      });
      body.append("skills", JSON.stringify(about.skills || []));
      body.append("typingWords", JSON.stringify(about.typingWords || []));
      if (profileImageFile) body.append("profileImage", profileImageFile);

      await request("/about", { method: "PUT", body });
      toast.success("About updated");
      setProfileImageFile(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveContact = async (event) => {
    event.preventDefault();
    try {
      await request("/contact", { method: "PUT", body: JSON.stringify(contact) });
      toast.success("Contact updated");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
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
      <div className="min-h-screen">
        <header className="border-b border-black/10 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm text-[#5d6675] dark:text-white/55">Signed in as {admin?.email}</p>
              <h1 className="text-2xl font-bold">Portfolio Admin</h1>
            </div>
            <div className="flex gap-3">
              <Link to="/" className="button-secondary px-4 py-2">
                View site
              </Link>
              <button onClick={logout} className="button-primary px-4 py-2">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Total projects" value={stats.totalProjects} />
            <Stat label="Visible projects" value={stats.visibleProjects} />
            <Stat label="Project views" value={stats.views} />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button key={item} onClick={() => setTab(item)} className={tab === item ? "button-primary px-4 py-2 capitalize" : "button-secondary px-4 py-2 capitalize"}>
                {item}
              </button>
            ))}
          </div>

          {tab === "projects" && (
            <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <form onSubmit={submitProject} className="panel grid gap-4 rounded-lg p-6">
                <h2 className="text-xl font-bold">{editingId ? "Edit project" : "Add project"}</h2>
                <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                  <p className="label mb-3">Fetch from GitHub</p>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input className="input" value={githubUsername} onChange={(event) => setGithubUsername(event.target.value)} placeholder="GitHub username" />
                    <button type="button" onClick={fetchGithubRepos} className="button-secondary px-4 py-2">
                      Fetch repos
                    </button>
                  </div>
                  {githubRepos.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {githubRepos.slice(0, 4).map((repo) => (
                        <button key={repo.githubUrl} type="button" onClick={() => useRepo(repo)} className="rounded-lg bg-black/5 px-3 py-2 text-left text-sm hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15">
                          {repo.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Field label="Title" value={projectForm.title} onChange={(value) => setProjectForm({ ...projectForm, title: value })} />
                <label className="grid gap-2">
                  <span className="label">Description</span>
                  <textarea className="input min-h-28" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} required />
                </label>
                <Field label="Category" value={projectForm.category} onChange={(value) => setProjectForm({ ...projectForm, category: value })} />
                <Field label="Tech stack" value={projectForm.techStack} onChange={(value) => setProjectForm({ ...projectForm, techStack: value })} placeholder="React, Node.js, MongoDB" />
                <Field label="Live URL" value={projectForm.liveUrl} onChange={(value) => setProjectForm({ ...projectForm, liveUrl: value })} />
                <Field label="GitHub URL" value={projectForm.githubUrl} onChange={(value) => setProjectForm({ ...projectForm, githubUrl: value })} />
                <label className="grid gap-2">
                  <span className="label">Project image</span>
                  <input className="input" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle label="Featured" checked={projectForm.featured} onChange={(value) => setProjectForm({ ...projectForm, featured: value })} />
                  <Toggle label="Visible" checked={projectForm.visible} onChange={(value) => setProjectForm({ ...projectForm, visible: value })} />
                </div>
                <button className="button-primary">{editingId ? "Save project" : "Create project"}</button>
              </form>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <article key={project._id} className="panel grid gap-4 rounded-lg p-4 sm:grid-cols-[140px_1fr_auto]">
                    <img src={assetUrl(project.image)} alt={project.title} className="h-28 w-full rounded-lg object-cover sm:w-36" loading="lazy" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{project.title}</h3>
                        {!project.visible && <span className="rounded-lg bg-black/10 px-2 py-1 text-xs dark:bg-white/10">Hidden</span>}
                      </div>
                      <p className="mt-2 text-sm text-[#5d6675] dark:text-white/58">{project.description}</p>
                    </div>
                    <div className="flex gap-2 sm:flex-col">
                      <button onClick={() => editProject(project)} className="button-secondary px-3 py-2">
                        Edit
                      </button>
                      <button onClick={() => deleteProject(project._id)} className="button-secondary px-3 py-2">
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "about" && (
            <form onSubmit={saveAbout} className="panel mt-8 grid gap-5 rounded-lg p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2a6fdb] dark:text-[#8fd694]">
                  Home page content
                </p>
                <h2 className="mt-2 text-xl font-bold">Manage hero, photo, about, and skills</h2>
                <p className="mt-2 text-sm text-[#5d6675] dark:text-white/55">
                  These fields control the home page hero and the about page.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" value={about.name || ""} onChange={(value) => setAbout({ ...about, name: value })} />
                <Field label="Professional title" value={about.title || ""} onChange={(value) => setAbout({ ...about, title: value })} />
              </div>
              <Field label="Short home intro" value={about.intro || ""} onChange={(value) => setAbout({ ...about, intro: value })} />
              <Field
                label="Typing words"
                value={(about.typingWords || []).join(", ")}
                onChange={(value) =>
                  setAbout({
                    ...about,
                    typingWords: value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  })
                }
                placeholder="Full-Stack Developer, React Specialist, Product Builder"
              />
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="rounded-lg border border-black/10 p-3 dark:border-white/10">
                  <img
                    src={assetUrl(about.profileImage)}
                    alt={about.name || "Profile preview"}
                    className="aspect-[4/5] w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="grid gap-4">
                  <Field label="Profile image URL" value={about.profileImage || ""} onChange={(value) => setAbout({ ...about, profileImage: value })} />
                  <label className="grid gap-2">
                    <span className="label">Upload new profile photo</span>
                    <input className="input" type="file" accept="image/*" onChange={(event) => setProfileImageFile(event.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <Field label="Resume URL" value={about.resumeUrl || ""} onChange={(value) => setAbout({ ...about, resumeUrl: value })} />
              <label className="grid gap-2">
                <span className="label">Bio</span>
                <textarea className="input min-h-36" value={about.bio || ""} onChange={(event) => setAbout({ ...about, bio: event.target.value })} />
              </label>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Skills</h3>
                  <button type="button" className="button-secondary px-3 py-2" onClick={() => setAbout({ ...about, skills: [...(about.skills || []), { name: "", level: 80 }] })}>
                    Add skill
                  </button>
                </div>
                {(about.skills || []).map((skill, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
                    <input className="input" value={skill.name} onChange={(event) => updateSkill(index, "name", event.target.value)} placeholder="Skill" />
                    <input className="input" type="number" min="0" max="100" value={skill.level} onChange={(event) => updateSkill(index, "level", event.target.value)} />
                    <button type="button" className="button-secondary px-3 py-2" onClick={() => setAbout({ ...about, skills: about.skills.filter((_, skillIndex) => skillIndex !== index) })}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button className="button-primary">Save about</button>
            </form>
          )}

          {tab === "contact" && (
            <form onSubmit={saveContact} className="panel mt-8 grid gap-5 rounded-lg p-6">
              <h2 className="text-xl font-bold">Manage contact</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {["email", "phone", "location", "github", "linkedin", "twitter", "website"].map((key) => (
                  <Field key={key} label={key} value={contact[key] || ""} onChange={(value) => setContact({ ...contact, [key]: value })} />
                ))}
              </div>
              <button className="button-primary">Save contact</button>
            </form>
          )}
        </main>
      </div>
    </>
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

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="grid gap-2">
      <span className="label capitalize">{label}</span>
      <input className="input" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} required={["Title", "Category"].includes(label)} />
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

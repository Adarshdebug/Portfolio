import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageIntro from "../components/PageIntro.jsx";
import SEO from "../components/SEO.jsx";
import { request } from "../lib/api.js";

export default function Contact() {
  const [contact, setContact] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    request("/contact").then(setContact).catch(() => null);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      await request("/contact/message", { method: "POST", body: JSON.stringify(form) });
      toast.success("Message sent");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SEO title="Contact | Adarsh" description="Contact Adarsh for web, AI, and full-stack product work." />
      <section className="section">
        <PageIntro eyebrow="Contact" title="Let’s build something focused." text="Send a note with the shape of the idea, the goal, and what success should feel like." />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel rounded-lg p-8">
            <h2 className="text-2xl font-bold">Contact details</h2>
            <div className="mt-6 grid gap-4 text-[#5d6675] dark:text-white/62">
              <p>Email: {contact?.email || "admin@example.com"}</p>
              {contact?.location && <p>Location: {contact.location}</p>}
              <div className="flex flex-wrap gap-3 pt-2">
                {["github", "linkedin", "twitter", "website"].map((key) =>
                  contact?.[key] ? (
                    <a key={key} className="button-secondary px-4 py-2 capitalize" href={contact[key]} target="_blank" rel="noreferrer">
                      {key}
                    </a>
                  ) : null
                )}
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="panel grid gap-5 rounded-lg p-8">
            <label className="grid gap-2">
              <span className="label">Name</span>
              <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label className="grid gap-2">
              <span className="label">Email</span>
              <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label className="grid gap-2">
              <span className="label">Message</span>
              <textarea className="input min-h-36" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
            </label>
            <button className="button-primary" disabled={sending}>
              {sending ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

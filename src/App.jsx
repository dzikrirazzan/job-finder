import { useEffect, useMemo, useState } from "react";
import {
  IconArrowUpRight,
  IconBell,
  IconBolt,
  IconBriefcase2,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconCommand,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconFilter,
  IconHeart,
  IconHome2,
  IconInbox,
  IconLayoutList,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconSend,
  IconSettings,
  IconSortAscending,
  IconSparkles,
  IconTargetArrow,
  IconUserCircle,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import "./index.css";

const seedJobs = [
  {
    id: 1,
    company: "Monotype",
    title: "Product Designer",
    location: "Remote · APAC",
    type: "Full-time",
    source: "Company site",
    score: 94,
    salary: "$70k - $92k",
    saved: true,
    status: "Ready to apply",
    age: "2h ago",
    tags: ["Figma", "Design systems", "B2B"],
    note: "Strong match for your platform work and design-system experience.",
  },
  {
    id: 2,
    company: "Mekari",
    title: "Senior Product Designer",
    location: "Jakarta, Indonesia",
    type: "Full-time",
    source: "LinkedIn alert",
    score: 89,
    salary: "Not listed",
    saved: true,
    status: "In review",
    age: "5h ago",
    tags: ["SaaS", "Research", "Leadership"],
    note: "The role asks for stakeholder leadership. Your case study covers this well.",
  },
  {
    id: 3,
    company: "GitLab",
    title: "Product Designer, Growth",
    location: "Remote",
    type: "Full-time",
    source: "Company site",
    score: 86,
    salary: "$80k - $105k",
    saved: false,
    status: "New",
    age: "1d ago",
    tags: ["Growth", "Experimentation", "Remote"],
    note: "Strong remote fit. Tailor your intro around experimentation and activation.",
  },
  {
    id: 4,
    company: "Traveloka",
    title: "Product Designer",
    location: "Jakarta, Indonesia",
    type: "Full-time",
    source: "JobStreet alert",
    score: 82,
    salary: "Not listed",
    saved: false,
    status: "New",
    age: "1d ago",
    tags: ["Consumer", "Mobile", "Research"],
    note: "Good product scope, with a heavier consumer-app focus.",
  },
  {
    id: 5,
    company: "Lummo",
    title: "UX Designer",
    location: "Jakarta, Indonesia",
    type: "Contract",
    source: "Instagram lead",
    score: 77,
    salary: "Not listed",
    saved: false,
    status: "New",
    age: "2d ago",
    tags: ["Fintech", "Mobile", "Contract"],
    note: "An Instagram lead that needs source verification before applying.",
  },
];
const profileDefault = {
  name: "Dzikri Razzan",
  role: "Product Designer",
  location: "Jakarta, Indonesia",
  about: "I design clear, useful digital products and the systems that help teams build them well.",
  skills: ["Product design", "Figma", "Design systems", "User research", "Prototyping"],
  portfolio: "yourportfolio.com",
  resume: "Dzikri_Razzan_Product_Designer.pdf",
  preferences: ["Remote or Jakarta", "Product design", "Full-time", "B2B SaaS or consumer tech"],
};
const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};
const store = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
const makeId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const readJobs = () => {
  const value = readStore("pathway-jobs", seedJobs);
  return Array.isArray(value) && value.length ? value : seedJobs;
};
const defaultChecklist = { resume: true, portfolio: true, answers: false };

export default function App() {
  const [page, setPage] = useState("Discover"),
    [jobs, setJobs] = useState(readJobs),
    [profile, setProfile] = useState(() => readStore("pathway-profile", profileDefault)),
    [settings, setSettings] = useState(() => readStore("pathway-settings", { approvalRequired: true, notifications: true })),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(() => readJobs()[0] || null),
    [activeFilters, setActiveFilters] = useState([]),
    [sortBy, setSortBy] = useState("match"),
    [filterOpen, setFilterOpen] = useState(false),
    [commandOpen, setCommandOpen] = useState(false),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState("");
  useEffect(() => store("pathway-jobs", jobs), [jobs]);
  useEffect(() => store("pathway-profile", profile), [profile]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const filtered = useMemo(() => {
    const results = jobs.filter((j) => {
        const text = `${j.title} ${j.company} ${j.location} ${j.tags.join(" ")}`.toLowerCase();
        const queryMatch = text.includes(query.toLowerCase());
        const filterMatch = activeFilters.every((filter) => (filter === "Remote" ? j.location.toLowerCase().includes("remote") : filter === "Full-time" ? j.type === "Full-time" : text.includes("product design")));
        return queryMatch && filterMatch;
      });
    return results.sort((a, b) => {
      if (sortBy === "recent") return String(a.age).localeCompare(String(b.age));
      if (sortBy === "salary") return String(b.salary).localeCompare(String(a.salary));
      return b.score - a.score;
    });
  }, [jobs, query, activeFilters, sortBy]);
  const saved = jobs.filter((j) => j.saved).length,
    ready = jobs.filter((j) => j.status === "Ready to apply").length,
    followUps = jobs.filter((j) => j.followUp).length,
    followUpsThisWeek = jobs.filter((j) => {
      if (!j.followUp) return false;
      const date = new Date(`${j.followUp}T12:00:00`);
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + (7 - now.getDay()));
      return date >= new Date(now.setHours(0, 0, 0, 0)) && date <= weekEnd;
    }).length,
    dueJobs = jobs.filter((j) => j.followUp && new Date(`${j.followUp}T23:59:59`) <= new Date());
  const profileFields = [profile.name, profile.role, profile.location, profile.about, profile.resume, profile.portfolio];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  useEffect(() => store("pathway-settings", settings), [settings]);
  const toggleSave = (id) => setJobs((a) => a.map((j) => (j.id === id ? { ...j, saved: !j.saved } : j)));
  const updateJob = (id, changes) => setJobs((a) => a.map((j) => (j.id === id ? { ...j, ...changes } : j)));
  const addLead = (lead) => {
    const job = { ...lead, id: makeId(), score: 70, saved: false, status: "New", age: "Just now", tags: ["Needs review"], note: "New lead. Add the job description to get a tailored match analysis." };
    setJobs((a) => [job, ...a]);
    setSelected(job);
    setModal(null);
    setToast("Job lead added to your inbox");
  };
  const applied = (id) => {
    setJobs((a) => a.map((j) => (j.id === id ? { ...j, status: "Applied", saved: true } : j)));
    setSelected((a) => ({ ...a, status: "Applied", saved: true }));
    setModal(null);
    setToast("Application marked as submitted");
  };
  const exportData = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), jobs, profile, settings }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pathway-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Workspace backup downloaded");
  };
  const importData = async (file) => {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.jobs) || !payload.profile) throw new Error("Invalid backup");
      setJobs(payload.jobs);
      setProfile(payload.profile);
      if (payload.settings) setSettings(payload.settings);
      setSelected(payload.jobs[0] || null);
      setToast("Workspace backup restored");
    } catch {
      setToast("That backup file could not be restored");
    }
  };
  const nav = [
    [IconHome2, "Discover"],
    [IconInbox, "My jobs", saved],
    [IconFileText, "Applications", jobs.filter((j) => ["Applied", "In review"].includes(j.status)).length],
    [IconUserCircle, "Profile"],
    [IconSettings, "Settings"],
  ];
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <IconTargetArrow size={19} />
          </span>
          <span>Pathway</span>
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          {nav.map(([I, label, count]) => (
            <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => setPage(label)}>
              <I size={18} />
              <span>{label}</span>
              {count ? <b>{count}</b> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="source-card" onClick={() => setModal("sources")}>
            <span className="source-icon">
              <IconBolt size={17} />
            </span>
            <span>
              <strong>Sources connected</strong>
              <small>4 alerts are active</small>
            </span>
            <IconChevronDown size={16} />
          </button>
          <button className="profile-chip" onClick={() => setPage("Profile")}>
            <span className="avatar">DR</span>
            <span>
              <strong>{profile.name}</strong>
              <small>{profile.role}</small>
            </span>
            <IconChevronDown size={15} />
          </button>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <IconTargetArrow size={17} />
            </span>
            Pathway
          </div>
          <label className={`search ${commandOpen ? "command-search" : ""}`}>
            <IconSearch size={18} />
            <input aria-label="Search jobs" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles, companies, skills..." />
            <kbd><IconCommand size={11} /> K</kbd>
          </label>
          <div className="top-actions">
            <button aria-label="Notifications" className="icon-button" onClick={() => setToast("No new match alerts") }>
              <IconBell size={19} />
              <i />
            </button>
            <button className="add-button" onClick={() => setModal("lead")}>
              <IconPlus size={17} />
              Add a lead
            </button>
          </div>
        </header>
        {page === "Profile" ? (
          <Profile profile={profile} setProfile={setProfile} toast={setToast} />
        ) : page === "Applications" ? (
          <Applications
            jobs={jobs}
            updateJob={updateJob}
            select={(j) => {
              setSelected(j);
              setPage("Discover");
            }}
          />
        ) : page === "Settings" ? (
          <Settings settings={settings} setSettings={setSettings} toast={setToast} jobs={jobs} profile={profile} exportData={exportData} importData={importData} />
        ) : (
          <div className="content">
            <section className="welcome-row">
              <div>
                <p className="eyebrow">Your job search, organized</p>
                <h1>Good morning, {profile.name.split(" ")[0]}.</h1>
                <p className="lede">
                  You have <strong>{ready} high-fit roles</strong> ready for a closer look.
                </p>
              </div>
              <div className="sync-pill">
                <span className="live-dot" />
                Last scan 18 min ago <button onClick={() => setToast("Scanning your connected sources now...")}>Scan now</button>
              </div>
            </section>
            <section className="stats">
              <Stat icon={IconSparkles} number={`${ready} roles`} label="Ready to apply" />
              <Stat icon={IconLayoutList} number={`${saved} saved`} label="In your shortlist" />
              <Stat icon={IconCalendar} number={`${followUpsThisWeek} due`} label="Follow-ups this week" />
            </section>
            <section className="focus-panel">
              <div className="focus-intro">
                <span className="focus-kicker"><IconClock size={15} /> Today</span>
                <h2>Keep the search moving</h2>
                <p>{dueJobs.length ? `${dueJobs.length} follow-up${dueJobs.length > 1 ? "s" : ""} need your attention.` : "No follow-ups are overdue. Pick one high-fit role to move forward."}</p>
              </div>
              <div className="focus-actions">
                <button onClick={() => setPage("Applications")}>
                  <span className="focus-icon"><IconCalendar size={17} /></span>
                  <span><strong>{dueJobs.length ? dueJobs[0].company : "Review your pipeline"}</strong><small>{dueJobs.length ? dueJobs[0].title : "Open application tracker"}</small></span>
                  <IconArrowUpRight size={16} />
                </button>
                <button onClick={() => setPage("Profile")}>
                  <span className="focus-icon"><IconUserCircle size={17} /></span>
                  <span><strong>Profile readiness</strong><small>{profileCompletion}% of matching details filled</small></span>
                  <IconArrowUpRight size={16} />
                </button>
              </div>
            </section>
            <section className="section-header">
              <div>
                <h2>{page === "My jobs" ? "Your saved jobs" : "Top matches for you"}</h2>
                <p>Ranked against your experience and preferences.</p>
              </div>
              <div className="header-actions">
                <button className={`filter-button ${filterOpen ? "selected" : ""}`} onClick={() => setFilterOpen(!filterOpen)}>
                  <IconFilter size={16} />
                  Filters
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setQuery("");
                    setActiveFilters([]);
                  }}
                >
                  Clear search <IconX size={16} />
                </button>
                <label className="sort-control">
                  <IconSortAscending size={15} />
                  <span>Sort</span>
                  <select aria-label="Sort jobs" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="match">Best match</option>
                    <option value="recent">Most recent</option>
                    <option value="salary">Salary</option>
                  </select>
                </label>
              </div>
            </section>
            {filterOpen && (
              <div className="filters">
                {["Remote", "Full-time", "Product design"].map((filter) => (
                  <button
                    key={filter}
                    className={activeFilters.includes(filter) ? "active" : ""}
                    aria-pressed={activeFilters.includes(filter)}
                    onClick={() => setActiveFilters((filters) => (filters.includes(filter) ? filters.filter((item) => item !== filter) : [...filters, filter]))}
                  >
                    {filter}
                    <IconX size={13} />
                  </button>
                ))}
                <span>Results update as you refine preferences.</span>
              </div>
            )}
            <div className="jobs-layout">
              <div className="job-list">
                {filtered
                  .filter((j) => page !== "My jobs" || j.saved)
                  .map((job) => (
                    <JobRow key={job.id} job={job} selected={selected?.id === job.id} click={() => setSelected(job)} save={() => toggleSave(job.id)} />
                  ))}
                {!filtered.filter((j) => page !== "My jobs" || j.saved).length && (
                  <div className="empty">
                    <IconSearch size={26} />
                    <h3>No matching roles</h3>
                    <p>Try a different search or add a job lead.</p>
                  </div>
                )}
              </div>
              {selected && <JobDetail job={jobs.find((j) => j.id === selected.id) || selected} save={() => toggleSave(selected.id)} update={(changes) => updateJob(selected.id, changes)} apply={() => setModal("apply")} />}
            </div>
          </div>
        )}
      </section>
      {toast && (
        <div className="toast" role="status">
          <IconCircleCheck size={18} />
          {toast}
        </div>
      )}
      {modal === "lead" && <LeadModal close={() => setModal(null)} add={addLead} />} {modal === "sources" && <Sources close={() => setModal(null)} toast={setToast} />}{" "}
      {modal === "apply" && <Apply job={selected} profile={profile} close={() => setModal(null)} submit={() => applied(selected.id)} />}
      {commandOpen && <CommandPalette close={() => setCommandOpen(false)} query={query} setQuery={setQuery} setPage={setPage} />}
    </main>
  );
}
function CommandPalette({ close, query, setQuery, setPage }) {
  const go = (nextPage) => {
    setPage(nextPage);
    close();
  };
  return (
    <div className="command-backdrop" onMouseDown={close}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Quick search" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-input">
          <IconSearch size={18} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your workspace" />
          <kbd>ESC</kbd>
        </div>
        <p>Jump to a workspace</p>
        <button onClick={() => go("Discover")}><IconHome2 size={17} /> Discover <span>⌘ 1</span></button>
        <button onClick={() => go("My jobs")}><IconInbox size={17} /> My jobs <span>⌘ 2</span></button>
        <button onClick={() => go("Applications")}><IconFileText size={17} /> Applications <span>⌘ 3</span></button>
        <button onClick={() => go("Profile")}><IconUserCircle size={17} /> Profile <span>⌘ 4</span></button>
      </section>
    </div>
  );
}
function Stat({ icon: I, number, label }) {
  return (
    <div className="stat">
      <span>
        <I size={19} />
      </span>
      <div>
        <strong>{number}</strong>
        <small>{label}</small>
      </div>
      <IconArrowUpRight className="stat-arrow" size={17} />
    </div>
  );
}
function JobRow({ job, selected, click, save }) {
  return (
    <article className={`job-row ${selected ? "selected" : ""}`} onClick={click} onKeyDown={(event) => event.key === "Enter" && click()} tabIndex="0" role="button">
      <div className="company-logo">{job.company[0]}</div>
      <div className="job-main">
        <div className="job-title">
          <h3>{job.title}</h3>
          <span className={job.status.toLowerCase().replaceAll(" ", "-")}>{job.status}</span>
        </div>
        <p>
          {job.company} <span>·</span> {job.location} <span>·</span> {job.type}
        </p>
        <div className="tags">
          {job.tags.slice(0, 2).map((t) => (
            <span key={t}>{t}</span>
          ))}
          <small>{job.age}</small>
        </div>
      </div>
      <div className="score">
        <strong>{job.score}%</strong>
        <small>match</small>
      </div>
      <button
        aria-label="Save job"
        className={`heart ${job.saved ? "saved" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          save();
        }}
      >
        <IconHeart size={19} fill={job.saved ? "currentColor" : "none"} />
      </button>
    </article>
  );
}
function JobDetail({ job, save, update, apply }) {
  const checklist = { ...defaultChecklist, ...(job.checklist || {}) };
  return (
    <aside className="job-detail">
      <div className="detail-top">
        <div className="company-logo large">{job.company[0]}</div>
        <button aria-label={job.saved ? "Remove from saved jobs" : "Save job"} className={`heart ${job.saved ? "saved" : ""}`} onClick={save}>
          <IconHeart size={20} fill={job.saved ? "currentColor" : "none"} />
        </button>
      </div>
      <h2>{job.title}</h2>
      <p className="company-name">{job.company}</p>
      <div className="meta">
        <span>
          <IconMapPin size={16} />
          {job.location}
        </span>
        <span>
          <IconBriefcase2 size={16} />
          {job.type}
        </span>
        <span>
          <IconClock size={16} />
          {job.age}
        </span>
      </div>
      <button className="primary wide" onClick={apply}>
        {job.status === "Applied" ? (
          <>
            <IconCheck size={17} />
            Applied
          </>
        ) : (
          <>
            <IconSend size={17} />
            Prepare application
          </>
        )}
      </button>
      <div className="workflow-controls">
        <label>
          <span>Stage</span>
          <select value={job.status} onChange={(event) => update({ status: event.target.value })}>
            {["New", "Ready to apply", "Applied", "In review", "Interview", "Offer", "Closed"].map((stage) => <option key={stage}>{stage}</option>)}
          </select>
        </label>
        <label>
          <span>Follow up</span>
          <input type="date" value={job.followUp || ""} onChange={(event) => update({ followUp: event.target.value })} />
        </label>
      </div>
      {job.url ? (
        <a className="external" href={job.url} target="_blank" rel="noreferrer">
          <IconExternalLink size={16} />
          View original posting
        </a>
      ) : (
        <span className="external muted">
          <IconExternalLink size={16} />
          Original posting link not added
        </span>
      )}
      <section className="fit-box">
        <div className="fit-head">
          <span>
            <IconSparkles size={17} />
            Why this fits
          </span>
          <strong>{job.score}%</strong>
        </div>
        <p>{job.note}</p>
        <div className="fit-items">
          <span>
            <IconCheck size={14} />
            Matches your seniority
          </span>
          <span>
            <IconCheck size={14} />
            Fits location preference
          </span>
          <span>
            <IconCheck size={14} />
            Uses 3 core skills
          </span>
        </div>
      </section>
      <section className="detail-section">
        <h3>Application checklist</h3>
        <label>
          <input type="checkbox" checked={checklist.resume} onChange={(event) => update({ checklist: { ...checklist, resume: event.target.checked } })} />
          Tailored CV ready
        </label>
        <label>
          <input type="checkbox" checked={checklist.portfolio} onChange={(event) => update({ checklist: { ...checklist, portfolio: event.target.checked } })} />
          Portfolio selected
        </label>
        <label>
          <input type="checkbox" checked={checklist.answers} onChange={(event) => update({ checklist: { ...checklist, answers: event.target.checked } })} />
          Review application answers
        </label>
      </section>
    </aside>
  );
}
function Profile({ profile, setProfile, toast }) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(profile);
  const change = (field, value) => setDraft({ ...draft, [field]: value });
  const saveProfile = () => {
    setProfile({ ...draft, skills: draft.skills.filter(Boolean), preferences: draft.preferences.filter(Boolean) });
    setEditing(false);
    toast("Profile updated");
  };
  return (
    <div className="profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your career profile</p>
          <h1>Everything the system uses to match you.</h1>
          <p className="lede">Keep this current. It is the source for every recommendation and application draft.</p>
        </div>
        <button className="primary" onClick={() => (editing ? saveProfile() : (setDraft(profile), setEditing(true)))}>
          {editing ? (
            <>
              <IconCheck size={17} />
              Save profile
            </>
          ) : (
            <>
              <IconFileText size={17} />
              Edit profile
            </>
          )}
        </button>
      </div>
      <div className="profile-grid">
        <section className="profile-card identity">
          <span className="profile-avatar">DR</span>
          {editing ? <div className="identity-fields">
            <input value={draft.name} onChange={(event) => change("name", event.target.value)} aria-label="Full name" />
            <div className="inline-fields">
              <input value={draft.role} onChange={(event) => change("role", event.target.value)} aria-label="Role" />
              <input value={draft.location} onChange={(event) => change("location", event.target.value)} aria-label="Location" />
            </div>
          </div> : <div>
            <h2>{profile.name}</h2>
            <p>{profile.role} · {profile.location}</p>
          </div>}
          <span className="profile-score">
            <IconCircleCheck size={16} />
            Complete
          </span>
          <p className="about">{editing ? <textarea value={draft.about} onChange={(e) => setDraft({ ...draft, about: e.target.value })} /> : profile.about}</p>
        </section>
        <section className="profile-card">
          <h3>Core skills</h3>
          <div className="skill-cloud">
            {profile.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          {editing && (
            <input
              value={draft.skills.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  skills: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              aria-label="Skills"
            />
          )}
        </section>
        <section className="profile-card">
          <h3>Application assets</h3>
          {editing ? <div className="asset-fields">
            <label><span>Resume filename</span><input value={draft.resume} onChange={(event) => change("resume", event.target.value)} /></label>
            <label><span>Portfolio URL</span><input value={draft.portfolio} onChange={(event) => change("portfolio", event.target.value)} /></label>
          </div> : <>
            <Asset icon={IconFileText} title={profile.resume} sub="Primary resume" />
            <Asset icon={IconExternalLink} title={profile.portfolio} sub="Portfolio" />
          </>}
        </section>
        <section className="profile-card preference">
          <h3>Job preferences</h3>
          {(editing ? draft.preferences : profile.preferences).map((p, index) => (
            <span key={`${p}-${index}`}>
              <IconCheck size={14} />
              {editing ? <input value={p} onChange={(event) => {
                const preferences = [...draft.preferences];
                preferences[index] = event.target.value;
                change("preferences", preferences);
              }} aria-label={`Preference ${index + 1}`} /> : p}
            </span>
          ))}
          {editing && <button className="text-button add-preference" onClick={() => change("preferences", [...draft.preferences, ""])}><IconPlus size={14} /> Add preference</button>}
        </section>
      </div>
    </div>
  );
}
function Asset({ icon: I, title, sub }) {
  return (
    <div className="asset">
      <I />
      <span>
        <strong>{title}</strong>
        <small>{sub}</small>
      </span>
      <IconCheck size={17} />
    </div>
  );
}
function Applications({ jobs, select, updateJob }) {
  return (
    <div className="profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Application tracker</p>
          <h1>Keep momentum without losing context.</h1>
          <p className="lede">Every role stays connected to its resume, portfolio and follow-up plan.</p>
        </div>
      </div>
      <div className="application-board">
        {["New", "Ready to apply", "Applied", "In review", "Interview"].map((stage) => (
          <section key={stage}>
            <h3>
              {stage}
              <span>{jobs.filter((j) => j.status === stage).length}</span>
            </h3>
            {jobs
              .filter((j) => j.status === stage)
              .map((j) => (
                <article className="application-card" onClick={() => select(j)} onKeyDown={(event) => event.key === "Enter" && select(j)} tabIndex="0" role="button" key={j.id}>
                  <div className="company-logo">{j.company[0]}</div>
                  <strong>{j.title}</strong>
                  <small>{j.company}</small>
                  <p>{j.location}</p>
                  {j.followUp && <small className="follow-up">Follow up {j.followUp}</small>}
                  <label className="card-stage" onClick={(event) => event.stopPropagation()}>
                    <span>Move to</span>
                    <select value={j.status} onChange={(event) => updateJob(j.id, { status: event.target.value })}>
                      {["New", "Ready to apply", "Applied", "In review", "Interview", "Offer", "Closed"].map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                </article>
              ))}
            {!jobs.some((j) => j.status === stage) && <p className="column-empty">Nothing here yet</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
function Settings({ settings, setSettings, toast, jobs, profile, exportData, importData }) {
  return (
    <div className="profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Set your search boundaries.</h1>
          <p className="lede">Your system will prioritize only roles that respect these preferences.</p>
        </div>
      </div>
      <div className="settings-card">
        <h2>Autonomy and safety</h2>
        <p>Pathway prepares applications, but you review each submission before it is sent.</p>
        <Toggle title="Require approval before applying" sub="Always keep final submission in your hands." checked={settings.approvalRequired} onChange={(value) => setSettings({ ...settings, approvalRequired: value })} />
        <Toggle title="Notify me about high-fit matches" sub="Get a digest when a role scores over 80%." checked={settings.notifications} onChange={(value) => setSettings({ ...settings, notifications: value })} />
        <button className="primary" onClick={() => toast("Settings saved")}>
          <IconCheck size={17} />
          Save settings
        </button>
      </div>
      <div className="settings-card backup-card">
        <div className="backup-heading">
          <div>
            <h2>Keep a portable copy</h2>
            <p>Pathway stores your workspace in this browser. Export a backup before clearing site data or moving devices.</p>
          </div>
          <span className="backup-count">{jobs.length} roles</span>
        </div>
        <div className="backup-actions">
          <button className="secondary" onClick={exportData}><IconDownload size={16} /> Export backup</button>
          <label className="secondary file-button"><IconUpload size={16} /> Restore backup<input type="file" accept="application/json" onChange={(event) => importData(event.target.files?.[0])} /></label>
        </div>
        <small className="backup-footnote">Includes {profile.name}'s profile, role notes, stages and checklists.</small>
      </div>
    </div>
  );
}
function Toggle({ title, sub, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{title}</strong>
        <small>{sub}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
function LeadModal({ close, add }) {
  const [form, setForm] = useState({ title: "", company: "", location: "", source: "Company site", type: "Full-time", salary: "Not listed", url: "", description: "" });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <Modal title="Add a job lead" sub="Paste in a role from a company site, referral, or social post." close={close}>
      <div className="form-grid">
        <Field label="Job title">
          <input name="title" value={form.title} onChange={change} placeholder="e.g. Product Designer" autoFocus />
        </Field>
        <Field label="Company">
          <input name="company" value={form.company} onChange={change} placeholder="Company name" />
        </Field>
        <Field label="Location">
          <input name="location" value={form.location} onChange={change} placeholder="Remote, Jakarta..." />
        </Field>
        <Field label="Source">
          <select name="source" value={form.source} onChange={change}>
            <option>Company site</option>
            <option>LinkedIn alert</option>
            <option>Indeed alert</option>
            <option>JobStreet alert</option>
            <option>Instagram lead</option>
            <option>Referral</option>
          </select>
        </Field>
      </div>
      <Field label="Original posting URL">
        <input name="url" type="url" value={form.url} onChange={change} placeholder="https://company.com/careers/..." />
      </Field>
      <Field label="Job description">
        <textarea name="description" value={form.description} onChange={change} placeholder="Paste key requirements for your own review." />
      </Field>
      <div className="modal-actions">
        <button className="secondary" onClick={close}>
          Cancel
        </button>
        <button className="primary" disabled={!form.title || !form.company} onClick={() => add(form)}>
          <IconPlus size={17} />
          Add lead
        </button>
      </div>
    </Modal>
  );
}
function Sources({ close, toast }) {
  return (
    <Modal title="Connected sources" sub="Use email alerts and permitted feeds to bring relevant roles into your inbox." close={close}>
      <div className="source-list">
        {[
          ["LinkedIn", "Email alerts only", "Connected"],
          ["Indeed", "Email alerts only", "Connected"],
          ["JobStreet", "Email alerts only", "Connected"],
          ["Company career pages", "RSS & direct links", "Connected"],
          ["Instagram", "Manual lead capture", "Available"],
        ].map(([name, type, state]) => (
          <div className="source-line" key={name}>
            <span className="source-icon">
              <IconBolt size={16} />
            </span>
            <span>
              <strong>{name}</strong>
              <small>{type}</small>
            </span>
            <button onClick={() => toast(`${name} source settings opened`)}>
              {state}
              <IconChevronDown size={15} />
            </button>
          </div>
        ))}
      </div>
      <p className="compliance">
        <IconCircleCheck size={16} />
        Pathway does not scrape or automate third-party accounts. It works with alerts, approved feeds, and links you add.
      </p>
    </Modal>
  );
}
function Apply({ job, profile, close, submit }) {
  const [step, setStep] = useState("review");
  return (
    <Modal
      title={step === "review" ? "Prepare your application" : "Application ready"}
      sub={step === "review" ? `A tailored pack for ${job.company}. Nothing is sent without your approval.` : "Review the final package before opening the employer’s application."}
      close={close}
    >
      <div className="application-pack">
        <Pack icon={IconFileText} title="Tailored resume" sub={profile.resume} />
        <Pack icon={IconSparkles} title="Application note" sub={`Personalized for ${job.title}`} />
        <Pack icon={IconExternalLink} title="Portfolio selection" sub="3 relevant case studies chosen" />
      </div>
      <div className="review-note">
        <IconCheck size={17} />
        <p>
          <strong>Human approval is on.</strong> Pathway will open the official application page and leave final submission to you.
        </p>
      </div>
      <div className="modal-actions">
        <button className="secondary" onClick={close}>
          Back
        </button>
        <button className="primary" onClick={() => (step === "review" ? setStep("ready") : submit())}>
          {step === "review" ? (
            <>
              <IconSparkles size={17} />
              Generate final pack
            </>
          ) : (
            <>
              <IconSend size={17} />
              Mark as submitted
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
function Pack({ icon: I, title, sub }) {
  return (
    <div className="pack-item">
      <span>
        <I size={18} />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{sub}</small>
      </div>
      <button>Preview</button>
    </div>
  );
}
function Modal({ title, sub, close, children }) {
  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="modal-close" onClick={close}>
          <IconX size={20} />
        </button>
        <h2>{title}</h2>
        <p>{sub}</p>
        {children}
      </section>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

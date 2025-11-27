"use client";

import { useMemo, useState } from "react";

type Sighting = {
  id: string;
  description: string;
  location: string;
  imageUrl: string;
  createdAt: number;
};

const demoSightings: Sighting[] = [
  {
    id: "demo-1",
    description: "Tiny beetles near the vending machines. @<Science Atrium>",
    location: "Science Atrium",
    imageUrl: "https://images.unsplash.com/photo-1504518633247-6bf4c7c6f62c?auto=format&fit=crop&w=400&q=80",
    createdAt: Date.now() - 1000 * 60 * 45
  },
  {
    id: "demo-2",
    description: "Fruit flies around the compost bin. @<Cafe Patio>",
    location: "Cafe Patio",
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95ef33822f8?auto=format&fit=crop&w=400&q=80",
    createdAt: Date.now() - 1000 * 60 * 90
  },
  {
    id: "demo-3",
    description: "Mosquito swarm close to the south pond @<Lakeside Lawn>",
    location: "Lakeside Lawn",
    imageUrl: "https://images.unsplash.com/photo-1438109491414-7198515b166b?auto=format&fit=crop&w=400&q=80",
    createdAt: Date.now() - 1000 * 60 * 150
  }
];

async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function extractLocation(text: string): string {
  const match = text.match(/@<([^>]+)>/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "Unspecified";
}

function prettyTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function HomePage() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>(demoSightings);
  const [errors, setErrors] = useState<string | null>(null);

  const distribution = useMemo(() => {
    const counts = new Map<string, number>();
    sightings.forEach((s) => {
      counts.set(s.location, (counts.get(s.location) ?? 0) + 1);
    });
    const items = Array.from(counts.entries()).map(([location, count]) => ({ location, count }));
    items.sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));
    return items;
  }, [sightings]);

  const totalSightings = sightings.length;
  const topCount = distribution[0]?.count ?? 1;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors(null);

    if (!description.trim()) {
      setErrors("Describe the bug and include @<location>.");
      return;
    }

    if (!file) {
      setErrors("Attach a photo so others can verify the sighting.");
      return;
    }

    try {
      const imageUrl = await readFile(file);
      const location = extractLocation(description);

      const newSighting: Sighting = {
        id: crypto.randomUUID(),
        description,
        location,
        imageUrl,
        createdAt: Date.now()
      };

      setSightings((prev) => [newSighting, ...prev]);
      setDescription("");
      setFile(null);
    } catch (error) {
      setErrors(error instanceof Error ? error.message : "Could not upload file");
    }
  };

  return (
    <main>
      <div className="container">
        <div className="hero">
          <span className="badge">Bugwatch</span>
          <h1 className="hero-title">Campus bug sightings, organized by location.</h1>
          <p className="helper-text" style={{ maxWidth: "720px", margin: 0 }}>
            Upload a photo, include a quick note, and tag the spot with <strong>@&lt;location&gt;</strong>. We keep a
            live tally of where bugs are turning up most often.
          </p>
        </div>

        <section className="card" style={{ marginBottom: "1.25rem" }}>
          <div className="section-title">
            <h2>Upload details</h2>
            <span className="badge">{totalSightings} sightings</span>
          </div>

          <form onSubmit={handleSubmit} className="grid" style={{ alignItems: "end" }}>
            <div className="cards-column">
              <label className="input-group">
                <span>Description</span>
                <textarea
                  className="textarea"
                  placeholder="Example: Line of ants by the trash bins @<East Quad>"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <p className="helper-text">Use one @&lt;location&gt; tag so the sighting is bucketed automatically.</p>
              </label>
            </div>

            <div className="cards-column" style={{ gap: "0.5rem" }}>
              <label className="input-group">
                <span>Bug photo</span>
                <input
                  className="file-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <button type="submit" className="button">
                Submit sighting
              </button>
              {errors ? <p style={{ color: "#b91c1c", margin: 0 }}>{errors}</p> : null}
            </div>
          </form>
        </section>

        <section className="card" style={{ marginBottom: "1rem" }}>
          <div className="section-title">
            <h2>Distribution by location</h2>
            <span className="helper-text">Sorted by most sightings</span>
          </div>
          <div className="distribution-grid">
            {distribution.map((item) => (
              <div className="distribution-card" key={item.location}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>@{item.location}</strong>
                  <span style={{ color: "var(--muted)" }}>{item.count} reports</span>
                </div>
                <div className="progress" aria-label={`${item.location} sightings`}>
                  <div
                    className="progress-bar"
                    style={{ width: `${Math.max(6, Math.round((item.count / topCount) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-title">
            <h2>Latest uploads</h2>
            <span className="helper-text">Freshest first</span>
          </div>
          <div className="cards-column">
            {sightings.map((sighting) => (
              <article className="sighting-card" key={sighting.id}>
                <img src={sighting.imageUrl} alt={sighting.location} />
                <div className="sighting-details">
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="location-pill">@{sighting.location}</span>
                    <span className="timestamp">{prettyTime(sighting.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{sighting.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

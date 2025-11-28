"use client";

import { useEffect, useMemo, useState } from "react";

type Sighting = {
  id: string;
  description: string;
  location: string;
  imageUrl: string;
  createdAt: number;
};

const locationCatalog = [
  { code: "SMN", name: "Séraphin-Marion 133-135 (Academic Hall)" },
  { code: "HGN", name: "Séraphin-Marion 115 (Hagen)" },
  { code: "WCA", name: "University 52 (William Commanda)" },
  { code: "TBT", name: "Cumberland 550 (Tabaret)" },
  { code: "LRR", name: "Laurier 100" },
  { code: "MHN", name: "Laurier 70 (Hamelin)" },
  { code: "MRT", name: "University 65 (Morisset)" },
  { code: "UCU", name: "University 85 (University Centre / Jock-Turcot)" },
  { code: "LPR", name: "Louis Pasteur 141" },
  { code: "THN", name: "University 45 (Thompson Residence)" },
  { code: "MNT", name: "University 125 (Montpetit)" },
  { code: "PRZ", name: "University 50 (Pérez)" },
  { code: "90U", name: "University 90 (residence)" },
  { code: "MRD", name: "University 110 (Marchand Residence)" },
  { code: "LMX-CRX", name: "Jean-Jacques Lussier 145 (Lamoureux + Learning Crossroads)" },
  { code: "BRS", name: "Thomas-More 100 (Brooks Residence)" },
  { code: "CBY", name: "Louis Pasteur 161 (Colonel By Hall)" },
  { code: "LBC", name: "Louis Pasteur 45 (Leblanc Residence)" },
  { code: "MCE", name: "Marie Curie 100" },
  { code: "CRG", name: "Marie Curie 20 (Bioscience Phase I / CAREG)" },
  { code: "FTX", name: "Louis Pasteur 57 (Fauteux Hall)" },
  { code: "SMD", name: "University 60 (Simard)" },
  { code: "VNR", name: "Jean-Jacques Lussier 136 (Vanier Hall)" },
  { code: "GNN", name: "Marie Curie 30 (Bioscience Phase III / Gendron Hall)" },
  { code: "MRN", name: "Louis Pasteur 140 (Marion Hall)" },
  { code: "STN", name: "University 100 (Stanton Residence)" },
  { code: "HSY", name: "Laurier 157 (Hyman Soloway Residence)" },
  { code: "STE", name: "S.I.T.E. Building (Engineering/Technology)" },
  { code: "DRO", name: "D’Iorio Hall" }
];

const locationMap = Object.fromEntries(locationCatalog.map((item) => [item.code, item.name]));

const seedCodes = [
  "SMN",
  "HGN",
  "WCA",
  "TBT",
  "LRR",
  "MHN",
  "MRT",
  "UCU",
  "LPR",
  "THN",
  "MNT",
  "PRZ",
  "90U",
  "MRD",
  "LMX-CRX",
  "BRS",
  "CBY",
  "LBC",
  "MCE",
  "CRG",
  "FTX",
  "SMD",
  "VNR",
  "GNN",
  "MRN",
  "STN",
  "HSY",
  "STE",
  "DRO"
];

const buildSighting = (code: string, minutesAgo = 5): Sighting => {
  const name = locationMap[code];
  return {
    id: `seed-${code}`,
    description: `Seed sighting @<${code}>${name ? ` | ${name}` : ""}`,
    location: code,
    imageUrl: "https://placehold.co/200x120/ffffff/000000?text=Bug",
    createdAt: Date.now() - minutesAgo * 60000
  };
};

function createSeedSightings(initialCode = seedCodes[0]): Sighting[] {
  if (!initialCode) return [];
  return [buildSighting(initialCode)];
}

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

export default function HomePage() {
  const [locationTag, setLocationTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>(() => createSeedSightings());
  const [errors, setErrors] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (seedCodes.length === 0) return;
    const randomCode = seedCodes[Math.floor(Math.random() * seedCodes.length)];
    setSightings((prev) => {
      const hasUserEntry = prev.some((item) => !item.id.startsWith("seed-"));
      if (hasUserEntry) return prev;
      return [buildSighting(randomCode)];
    });
  }, []);

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

  const validateImage = async (fileToCheck: File) => {
    // Simulated verification hook; replace with a real API call when available.
    const allowed = fileToCheck.type.startsWith("image/") && fileToCheck.size > 0;
    await new Promise((resolve) => setTimeout(resolve, 200));
    return allowed;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors(null);
    setStatus(null);

    if (!locationTag.trim()) {
      setErrors("Add a building code so we can place the sighting.");
      return;
    }

    const code = locationTag.trim().toUpperCase();
    const locationName = locationMap[code];

    if (!locationName) {
      setErrors("Use a known building code (example: SMN, HGN, WCA).");
      return;
    }

    if (!file) {
      setErrors("Please attach a photo of the bug so others can verify the sighting.");
      return;
    }

    try {
      setVerifying(true);
      const isValid = await validateImage(file);
      if (!isValid) {
        setErrors("Image failed verification. Try another photo.");
        return;
      }

      const imageUrl = await readFile(file);
      const description = `Bug sighting @<${code}> | ${locationName}`;

      const newSighting: Sighting = {
        id: crypto.randomUUID(),
        description,
        location: code,
        imageUrl,
        createdAt: Date.now()
      };

      setSightings((prev) => [newSighting, ...prev]);
      setLocationTag("");
      setFile(null);
      setStatus("Sighting verified and added.");
    } catch (error) {
      setErrors(error instanceof Error ? error.message : "Could not upload file");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <h1>where are the bed bugs</h1>
          <a
            href="#report"
            className="link-button"
            onClick={(event) => {
              event.preventDefault();
              setShowModal(true);
            }}
          >
            report a sighting
          </a>
        </header>

        <section className="panel distribution-panel">
          <div className="section-head">
            <h2>be careful of these places</h2>
            <span className="pill">{totalSightings} sightings</span>
          </div>

          <div className="distribution-grid">
            {distribution.map((item) => (
              <div className="distribution-card" key={item.location}>
                <div className="distribution-top">
                  <div>
                    <strong>@{item.location}</strong>
                    <div className="muted-text">{locationMap[item.location] ?? "Unknown building"}</div>
                  </div>
                  <span>{item.count} {item.count === 1 ? "report" : "reports"}</span>
                </div>
                <div className="bar" aria-label={`${item.location} sightings`}>
                  <div
                    className="bar-fill"
                    style={{ width: `${Math.max(8, Math.round((item.count / topCount) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {showModal ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal">
              <div className="modal-head">
                <h2>report a sighting</h2>
                <button className="link-button" type="button" onClick={() => setShowModal(false)}>
                  close
                </button>
              </div>
              <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-row column-row">
                  <label className="field condensed">
                    <span>photo</span>
                    <input
                      className="file-input"
                      type="file"
                      accept="image/*"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  <label className="field condensed">
                    <span>campus building</span>
                    <input
                      className="input"
                      type="text"
                      placeholder="SMN"
                      value={locationTag}
                      list="location-codes"
                      onChange={(event) => setLocationTag(event.target.value.toUpperCase())}
                    />
                  </label>
                  <button type="submit" className="button" disabled={verifying}>
                    {verifying ? "verifying..." : "report sighting"}
                  </button>
                </div>

                {errors ? <p className="error">{errors}</p> : null}
                {status ? <p className="success">{status}</p> : null}
                <datalist id="location-codes">
                  {locationCatalog.map((item) => (
                    <option key={item.code} value={item.code}>{`${item.code} — ${item.name}`}</option>
                  ))}
                </datalist>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

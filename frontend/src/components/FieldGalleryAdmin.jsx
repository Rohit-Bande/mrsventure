import { useEffect, useRef, useState } from "react";
import {
  API,
  adminUploadImage,
  adminUploadVideo,
  adminGetFieldGallery,
  adminAddFieldGallery,
  adminDeleteFieldGallery,
} from "@/lib/api";

function imageAddress(src) {
  return new URL(src, new URL(API, window.location.origin)).href;
}

export default function FieldGalleryAdmin({ token }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Honey Harvesting");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInput = useRef(null);
  const [mediaType, setMediaType] = useState("image");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    adminGetFieldGallery(token)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setError("Could not load gallery. Check your login.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function save(event) {
    event.preventDefault();
    if (saving || deleting || loading) return;

    setError("");
    setMessage("");

if (!file) {
  setError("Please choose an image or video.");
  return;
}

const allowedTypes =
  mediaType === "video"
    ? ["video/mp4"]
    : ["image/jpeg", "image/png", "image/webp"];

const maxSize =
  mediaType === "video"
    ? 25 * 1024 * 1024
    : 5 * 1024 * 1024;

if (!allowedTypes.includes(file.type) || file.size > maxSize) {
  setError(
    mediaType === "video"
      ? "Choose an MP4 video up to 25 MB."
      : "Choose a JPEG, PNG, or WebP image up to 5 MB."
  );
  return;
}

    if (!title.trim() || !category.trim()) {
      setError("Enter a title and category.");
      return;
    }

    setSaving(true);

    try {
      const uploaded =
  mediaType === "video"
    ? await adminUploadVideo(token, file)
    : await adminUploadImage(token, file);

      // Save a relative path so it also works after VPS deployment.
      const src = new URL(uploaded.url, window.location.origin).pathname;

      const item = await adminAddFieldGallery(token, {
  title: title.trim(),
  category: category.trim(),
  src,
  type: mediaType,
});

      setItems((previous) => [item, ...previous]);
      setTitle("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";

      setMessage("Media added to From the Field.");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Could not save the gallery image."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (saving || deleting) return;

    setDeleting(id);
    setError("");
    setMessage("");

    try {
      await adminDeleteFieldGallery(token, id);
      setItems((previous) => previous.filter((item) => item.id !== id));
      setMessage("Gallery entry removed.");
    } catch {
      setError("Could not remove the entry. Please try again.");
    } finally {
      setDeleting("");
    }
  }

  return (
    <section className="max-w-5xl">
      <h2 className="font-serif text-3xl text-forest-deep">
        From the Field
      </h2>

      <p className="mt-3 text-slate-600">
        Upload genuine photographs from your work. Saved entries appear
        in the public gallery.
      </p>

      {error && (
        <p role="alert" className="mt-5 text-red-600">{error}</p>
      )}

      {message && (
        <p role="status" className="mt-5 text-green-700">{message}</p>
      )}

      <form
        onSubmit={save}
        className="mt-6 rounded-2xl border border-forest/10 bg-white p-6"
      >
        <fieldset
          disabled={loading || saving || Boolean(deleting)}
          className="space-y-5"
        >
            <label htmlFor="gallery-media-type" className="block">
  Media Type
  <select
    id="gallery-media-type"
    value={mediaType}
    onChange={(event) => {
      setMediaType(event.target.value);
      setFile(null);
      setError("");
      setMessage("");
      if (fileInput.current) fileInput.current.value = "";
    }}
    className="mt-2 w-full rounded-xl border border-forest/20 p-3"
  >
    <option value="image">Image</option>
    <option value="video">Video</option>
  </select>
</label>

          <label htmlFor="gallery-title" className="block">
            Image Title *
            <input
              id="gallery-title"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-forest/20 p-3"
            />
          </label>

          <label htmlFor="gallery-category" className="block">
            Category *
            <input
              id="gallery-category"
              required
              maxLength={100}
              list="gallery-categories"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-xl border border-forest/20 p-3"
            />
            <datalist id="gallery-categories">
              {[
                "Honey Harvesting",
                "Natural Honeycombs",
                "Bees",
                "Bee Hive Relocation",
                "Makhana Sourcing",
                "Makhana Processing",
                "MAUJI Products",
                "Farmer Visits",
                "Dry Fruit Sourcing",
                "Spice Sourcing",
                "Innovation Prototypes",
                "Product Development",
              ].map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </label>

          <label htmlFor="gallery-file" className="block">
  {mediaType === "video" ? "Video *" : "Photograph *"}

  <input
    ref={fileInput}
    id="gallery-file"
    type="file"
    required
    accept={
      mediaType === "video"
        ? "video/mp4"
        : "image/jpeg,image/png,image/webp"
    }
    onChange={(event) => setFile(event.target.files?.[0] || null)}
    className="mt-2 block w-full"
  />

  <span className="mt-2 block text-sm text-slate-500">
    {mediaType === "video"
      ? "MP4, maximum 25 MB. Use H.264 video and AAC audio."
      : "JPEG, PNG, or WebP. Maximum 5 MB."}
  </span>
</label>

          <button
            type="submit"
            className="rounded-full bg-forest text-white px-6 py-3"
          >
            {saving ? "Uploading & Saving..." : "Add Gallery Media"}
          </button>
        </fieldset>
      </form>

      {loading ? (
        <p className="mt-6">Loading gallery...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-slate-600">No gallery images yet.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-forest/10 bg-white"
            >
              {item.type === "video" ? (
  <video
    controls
    playsInline
    preload="metadata"
    aria-label={item.title}
    className="w-full aspect-video object-contain bg-black"
  >
    <source src={imageAddress(item.src)} type="video/mp4" />
    Your browser does not support video playback.
  </video>
) : (
  <img
    src={imageAddress(item.src)}
    alt={item.title}
    loading="lazy"
    className="w-full aspect-video object-cover"
  />
)}

              <div className="p-5">
                <p className="text-sm text-amber-brand">{item.category}</p>
                <h3 className="mt-2 font-serif text-xl text-forest-deep">
                  {item.title}
                </h3>

                <button
                  type="button"
                  disabled={saving || Boolean(deleting)}
                  onClick={() => remove(item.id)}
                  className="mt-4 text-red-600 disabled:opacity-50"
                >
                  {deleting === item.id ? "Removing..." : "Remove Entry"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
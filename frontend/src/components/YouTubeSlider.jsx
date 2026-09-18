import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Youtube } from "lucide-react";
import {
  YOUTUBE_CHANNEL_URL,
  YOUTUBE_VIDEOS,
} from "@/lib/youtubeVideos";

export default function YouTubeSlider() {
  const sliderRef = useRef(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const videos = YOUTUBE_VIDEOS.filter((video) =>
    /^[A-Za-z0-9_-]{11}$/.test(video.id)
  );

  const slide = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction * slider.clientWidth * 0.85,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  if (!videos.length) return null;

  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-brand">
              Watch Madhulogy
            </p>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-forest-deep">
              Our Story, In Motion
            </h2>

            <p className="mt-3 text-slate-600">
              Discover our products and follow the Madhulogy journey.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => slide(-1)}
              aria-label="Previous videos"
              aria-controls="youtube-video-slider"
              className="rounded-full border border-forest/20 p-3 text-forest-deep hover:bg-beige"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => slide(1)}
              aria-label="Next videos"
              aria-controls="youtube-video-slider"
              className="rounded-full border border-forest/20 p-3 text-forest-deep hover:bg-beige"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          id="youtube-video-slider"
          ref={sliderRef}
          className="mt-8 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
        >
          {videos.map((video) => (
            <article
              key={video.id}
              className="w-[85%] sm:w-[48%] lg:w-[32%] shrink-0 snap-start overflow-hidden rounded-2xl border border-forest/10 bg-white"
            >
              <div className="relative aspect-video bg-forest-deep">
                {activeVideo === video.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1`}
                    title={video.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveVideo(video.id)}
                    aria-label={`Play ${video.title}`}
                    className="group relative h-full w-full"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute inset-0 grid place-items-center bg-black/20 group-hover:bg-black/35 transition">
                      <span className="rounded-full bg-red-600 p-4 text-white shadow-lg">
                        <Play className="h-6 w-6 fill-current" />
                      </span>
                    </span>
                  </button>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-forest-deep">
                  {video.title}
                </h3>

                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-slate-600 underline"
                >
                  Watch on YouTube
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3 text-sm font-semibold text-cream"
          >
            <Youtube className="h-5 w-5" />
            Visit Our YouTube Channel
          </a>
        </div>
      </div>
    </section>
  );
}
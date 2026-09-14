import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock3,
  ExternalLink,
  Globe2,
  Menu,
  Play,
  Radio,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
  Youtube,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type Video = {
  id: string;
  title: string;
  description?: string;
  publishedAt: string;
  thumbnailUrl?: string;
  videoUrl: string;
};

type Channel = {
  name: string;
  handle: string;
  description: string;
  channelUrl: string;
  avatarUrl?: string;
  bannerUrl?: string;
  subscribers?: number | string;
  videoCount?: number | string;
};

type Feed = { channel: Channel; videos: Video[] };

const queryClient = new QueryClient();
const channelFallback: Channel = {
  name: 'Sefa in Brief',
  handle: '@SefainBrief',
  description: 'How power, policies and capital shape our world.',
  channelUrl: 'https://www.youtube.com/@SefainBrief',
  subscribers: '2.7K',
  videoCount: 53,
};

const fallbackVideos: Video[] = [
  { id: 'fallback-1', title: "Europe's energy is no longer a footnote", description: 'Gas, grids, and the strategic choices reshaping Europe’s next decade.', publishedAt: '2025-02-18T09:00:00Z', videoUrl: 'https://www.youtube.com/@SefainBrief' },
  { id: 'fallback-2', title: 'Why Turkey keeps drawing the line', description: 'A country turning geography into leverage — again.', publishedAt: '2025-02-13T09:00:00Z', videoUrl: 'https://www.youtube.com/@SefainBrief' },
  { id: 'fallback-3', title: 'China’s leverage is not just trade', description: 'The supply chains and quiet dependencies behind the headlines.', publishedAt: '2025-02-08T09:00:00Z', videoUrl: 'https://www.youtube.com/@SefainBrief' },
  { id: 'fallback-4', title: 'What the new arms race is really about', description: 'Security is moving faster than the treaties meant to contain it.', publishedAt: '2025-02-02T09:00:00Z', videoUrl: 'https://www.youtube.com/@SefainBrief' },
  { id: 'fallback-5', title: 'Canada, Europe and the middle power moment', description: 'Why influence now belongs to the countries between the giants.', publishedAt: '2025-01-26T09:00:00Z', videoUrl: 'https://www.youtube.com/@SefainBrief' },
];

const topics = [
  { label: 'Geopolitics', note: 'The map is never neutral.', icon: Globe2 },
  { label: 'Trade & capital', note: 'Follow the incentive.', icon: TrendingUp },
  { label: 'Security', note: 'Read the signal early.', icon: ShieldCheck },
  { label: 'International relations', note: 'Power has a grammar.', icon: BarChart3 },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return 'Latest dispatch';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatSubscribers(value: Channel['subscribers']) {
  if (typeof value === 'string') return value;
  if (!value) return '2.7K';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[0.22em] ${light ? 'text-white/55' : 'text-slate-500'}`}>
      <span className={`h-2 w-2 rounded-full ${light ? 'bg-[#f6d34a]' : 'bg-[#d9362e]'}`} />
      <span>{children}</span>
    </div>
  );
}

function ImageOrInitials({ src, alt, name, className }: { src?: string; alt: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-[#d9362e] ${className ?? ''}`}>
      {!failed && src ? <img src={src} alt={alt} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" /> : null}
      {failed || !src ? <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-bold text-[#f9f5ea]">{initials(name)}</span> : null}
    </div>
  );
}

function Thumbnail({ video, index }: { video: Video; index: number }) {
  const hues = ['bg-[#152e4a]', 'bg-[#b62f2d]', 'bg-[#394d3f]', 'bg-[#27344e]', 'bg-[#c2a633]'];
  return (
    <div className={`thumbnail-grid relative aspect-[16/9] overflow-hidden ${hues[index % hues.length]}`}>
      {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/65 via-transparent to-white/10" />
      <div className="absolute left-4 top-4 font-mono-ui text-[10px] tracking-[0.2em] text-white/70">SIB / {String(index + 1).padStart(2, '0')}</div>
      <div className="play-disc absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f9f5ea] text-[#152e4a]">
        <Play size={15} fill="currentColor" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="animate-pulse overflow-hidden rounded-[2px] border border-[#d8d2c6] bg-[#f9f5ea]"><div className="aspect-[16/9] bg-[#e3ded4]" /><div className="space-y-3 p-4"><div className="h-3 w-1/3 rounded bg-[#e3ded4]" /><div className="h-5 w-11/12 rounded bg-[#e3ded4]" /><div className="h-3 w-3/4 rounded bg-[#e3ded4]" /></div></div>;
}

function Home() {
  const [channel, setChannel] = useState<Channel>(channelFallback);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [feedAttempt, setFeedAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadFeed = () => {
      fetch('/api/channel-feed', { signal: controller.signal, credentials: 'include' })
        .then((response) => {
          if (!response.ok) throw new Error('Feed unavailable');
          return response.json() as Promise<Feed>;
        })
        .then((data) => {
          if (data.channel) setChannel({ ...channelFallback, ...data.channel });
          setVideos(Array.isArray(data.videos) ? data.videos : []);
          setFeedError(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) setFeedError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    };

    loadFeed();
    const refreshTimer = window.setInterval(loadFeed, 5 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, [feedAttempt]);

  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    }), { threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [loading, videos.length]);

  const displayVideos = useMemo(() => feedError || (!loading && videos.length === 0) ? fallbackVideos : videos, [feedError, loading, videos]);
  const featured = displayVideos[0];
  const rest = displayVideos.slice(1);
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <main className="site-shell min-h-[100dvh]">
      <div className="top-rule" />
      <div className="border-b border-[#d8d2c6] bg-[#152e4a] px-5 py-2 text-[#f9f5ea] sm:px-8">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 font-mono-ui text-[9px] uppercase tracking-[0.18em]">
          <span className="flex items-center gap-2"><Radio size={12} className="text-[#f6d34a]" /> Field notes / issue 01</span>
          <span className="hidden sm:block text-white/60">Power, policies & capital shape our world.</span>
          <a data-testid="link-youtube-top" href={channel.channelUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-[#f6d34a]">YouTube <ExternalLink size={11} /></a>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-[#d8d2c6]/90 bg-[#f9f5ea]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8 lg:py-5">
          <button data-testid="button-brand-home" onClick={() => scrollTo('top')} className="focus-ring flex items-center gap-2 text-left">
            <span className="font-display text-[20px] font-bold uppercase leading-[.8] tracking-[-0.08em] text-[#152e4a] sm:text-[24px]">Sefa<br /><span className="text-[#d9362e]">in Brief</span></span>
            <span className="hidden border-l border-[#d8d2c6] pl-3 font-mono-ui text-[8px] uppercase tracking-[0.13em] text-slate-500 sm:block">The power<br />desk</span>
          </button>
          <nav className="hidden items-center gap-9 md:flex" aria-label="Main navigation">
            <button data-testid="button-nav-latest" onClick={() => scrollTo('latest')} className="nav-link font-mono-ui text-[10px] uppercase tracking-[0.17em]">Latest dispatches</button>
            <button data-testid="button-nav-beat" onClick={() => scrollTo('beat')} className="nav-link font-mono-ui text-[10px] uppercase tracking-[0.17em]">The beat</button>
            <button data-testid="button-nav-archive" onClick={() => scrollTo('archive')} className="nav-link font-mono-ui text-[10px] uppercase tracking-[0.17em]">Archive</button>
          </nav>
          <div className="flex items-center gap-3">
            <a data-testid="link-subscribe-desktop" href={channel.channelUrl} target="_blank" rel="noreferrer" className="signal-button hidden items-center gap-2 bg-[#d9362e] px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-[#f9f5ea] md:flex">Subscribe <ArrowUpRight size={13} /></a>
            <button data-testid="button-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} className="focus-ring flex h-10 w-10 items-center justify-center border border-[#d8d2c6] md:hidden">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
        </div>
        {mobileOpen ? <div className="border-t border-[#d8d2c6] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4 font-mono-ui text-[11px] uppercase tracking-[0.15em]">
            <button data-testid="button-mobile-latest" onClick={() => scrollTo('latest')} className="text-left">Latest dispatches</button>
            <button data-testid="button-mobile-beat" onClick={() => scrollTo('beat')} className="text-left">The beat</button>
            <button data-testid="button-mobile-archive" onClick={() => scrollTo('archive')} className="text-left">Archive</button>
            <a data-testid="link-subscribe-mobile" href={channel.channelUrl} target="_blank" rel="noreferrer" className="w-fit bg-[#d9362e] px-3 py-2 text-[#f9f5ea]">Subscribe on YouTube</a>
          </nav>
        </div> : null}
      </header>

      <div className="overflow-hidden border-b border-[#d8d2c6] bg-[#f6d34a] py-2">
        <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap font-mono-ui text-[9px] uppercase tracking-[0.17em] text-[#152e4a]">
          {Array.from({ length: 2 }).map((_, group) => <div key={group} className="flex items-center gap-8"><span>Now reading the room</span><span className="text-[#d9362e]">×</span><span>Geopolitics / trade / security / power</span><span className="text-[#d9362e]">×</span><span>New briefings when the signal changes</span><span className="text-[#d9362e]">×</span></div>)}
        </div>
      </div>

      <section id="top" className="relative overflow-hidden bg-[#152e4a] text-[#f9f5ea]">
        <div className="absolute -right-8 top-16 hidden h-72 w-72 rounded-full border border-[#f9f5ea]/10 lg:block" />
        <div className="absolute right-20 top-44 hidden h-72 w-72 rounded-full border border-[#f9f5ea]/10 lg:block" />
        <div className="arrow-mark right-[14%] top-20 rotate-[-8deg] opacity-90" />
        <div className="arrow-mark right-[4%] top-36 scale-[.65] rotate-[8deg] opacity-70" />
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 pb-14 pt-12 sm:gap-14 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.18fr_.82fr] lg:items-end lg:gap-20 lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <div className="reveal"><SectionLabel light>Independent analysis / straight to the point</SectionLabel></div>
            <h1 className="reveal delay-1 mt-6 max-w-4xl font-display text-[clamp(3rem,13vw,8.6rem)] font-bold leading-[.86] tracking-[-0.085em] sm:mt-7 sm:leading-[.82]">
              Power<br /><span className="text-[#d9362e]">made</span> legible.
            </h1>
            <p className="reveal delay-2 mt-8 max-w-xl text-base leading-7 text-white/70 sm:text-lg">Sefa in Brief breaks down the decisions, deals and rivalries moving the world — without the theatre.</p>
            <div className="reveal delay-3 mt-9 flex flex-wrap items-center gap-4">
              <button data-testid="button-hero-latest" onClick={() => scrollTo('latest')} className="signal-button flex items-center gap-2 bg-[#f9f5ea] px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-[#152e4a]">Read the latest <ArrowDownRight size={14} /></button>
              <a data-testid="link-hero-youtube" href={channel.channelUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-[#f6d34a]"><Youtube size={15} /> Visit the channel</a>
            </div>
          </div>
          <div className="reveal delay-2 relative z-10 flex justify-end lg:pb-2">
            <div className="w-full max-w-[390px]">
              <div className="mb-4 flex items-center justify-between font-mono-ui text-[9px] uppercase tracking-[0.16em] text-white/50"><span>On the desk</span><span className="text-[#f6d34a]">Signal / live</span></div>
              <div className="avatar-frame relative aspect-square max-h-[320px] overflow-hidden bg-[#b42e2d] sm:aspect-[4/5] sm:max-h-[430px]">
                {channel.bannerUrl ? <img src={channel.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen" /> : null}
                <div className="absolute inset-x-7 bottom-7 z-10 border-t border-white/40 pt-4">
                  <div className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/65">Sefa in Brief</div>
                  <div className="mt-1 font-display text-3xl font-bold leading-none text-white">The world,<br />in context.</div>
                </div>
                <ImageOrInitials src={channel.avatarUrl} alt="Sefa, host of Sefa in Brief" name={channel.name} className="absolute inset-x-[10%] top-[8%] h-[78%] bg-transparent sm:inset-x-[12%] sm:top-[12%] sm:h-[70%]" />
                <div className="absolute -right-2 top-8 h-20 w-20 rounded-full border-[10px] border-[#f6d34a]/80" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div><div className="font-display text-xl font-bold">{channel.name}</div><div className="mt-1 font-mono-ui text-[9px] uppercase tracking-[0.16em] text-white/50">{channel.handle} / YouTube</div></div>
                <div className="text-right"><div className="font-display text-xl font-bold">{formatSubscribers(channel.subscribers)}</div><div className="font-mono-ui text-[9px] uppercase tracking-[0.16em] text-white/50">viewers & counting</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="latest" className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">
          <div className="reveal flex flex-wrap items-end justify-between gap-5 border-b border-[#d8d2c6] pb-5">
          <div><SectionLabel>Latest dispatches</SectionLabel><h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.06em] text-[#152e4a] sm:text-6xl">What matters now.</h2></div>
          <div className="flex max-w-xs items-end gap-3 text-right font-mono-ui text-[10px] uppercase leading-5 tracking-[0.12em] text-slate-500">
            <span>{feedError ? 'Live feed is resting — showing the desk archive.' : loading ? 'Connecting to the live desk…' : `${displayVideos.length} briefings / newest first`}</span>
            {feedError ? <button data-testid="button-retry-feed" onClick={() => { setFeedError(false); setLoading(true); setFeedAttempt((attempt) => attempt + 1); }} className="shrink-0 border-b border-[#d9362e] pb-1 text-[#d9362e] transition-colors hover:text-[#152e4a]">Retry</button> : null}
          </div>
        </div>
        {loading ? <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><SkeletonCard /><div className="space-y-4"><SkeletonCard /><SkeletonCard /></div></div> : <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1.2fr_.8fr]">
          {featured ? <a data-testid={`card-featured-video-${featured.id}`} href={featured.videoUrl} target="_blank" rel="noreferrer" className="reveal group paper-panel block p-3 sm:p-4">
            <Thumbnail video={featured} index={0} />
            <div className="grid gap-5 p-2 pt-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><div className="mb-3 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[0.16em] text-[#d9362e]"><Clock3 size={12} /> {formatDate(featured.publishedAt)} <span className="text-slate-400">/</span> Lead story</div><h3 className="max-w-2xl font-display text-3xl font-bold leading-[.95] tracking-[-0.05em] text-[#152e4a] sm:text-5xl">{featured.title}</h3><p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">{featured.description || 'A clear-eyed briefing on the forces behind the headline.'}</p></div><span className="hidden h-11 w-11 items-center justify-center border border-[#d8d2c6] text-[#d9362e] transition-colors group-hover:bg-[#d9362e] group-hover:text-[#f9f5ea] sm:flex"><ArrowUpRight size={18} /></span></div>
          </a> : null}
          <div className="space-y-4">
            {rest.slice(0, 3).map((video, index) => <a data-testid={`row-video-${video.id}`} key={video.id} href={video.videoUrl} target="_blank" rel="noreferrer" className="reveal delay-1 group flex flex-col gap-3 border-b border-[#d8d2c6] pb-5 sm:flex-row sm:gap-4 sm:pb-4">
              <div className="w-full shrink-0 sm:w-[42%]"><Thumbnail video={video} index={index + 1} /></div>
              <div className="flex flex-col justify-between py-0.5 sm:py-1"><div><div className="font-mono-ui text-[9px] uppercase tracking-[0.13em] text-slate-500">{formatDate(video.publishedAt)}</div><h3 className="mt-2 font-display text-xl font-bold leading-[.98] tracking-[-0.04em] text-[#152e4a] transition-colors group-hover:text-[#d9362e] sm:text-2xl">{video.title}</h3></div><span className="mt-3 flex items-center gap-1 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-[#d9362e]">Open briefing <ChevronRight size={12} /></span></div>
            </a>)}
          </div>
        </div>}
      </section>

      <section id="beat" className="bg-[#152e4a] text-[#f9f5ea]">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-24 lg:py-28">
          <div className="reveal"><SectionLabel light>The beat</SectionLabel><h2 className="mt-5 max-w-md font-display text-5xl font-bold leading-[.88] tracking-[-0.07em] sm:text-7xl">Less noise.<br /><span className="text-[#f6d34a]">More signal.</span></h2><p className="mt-7 max-w-sm text-sm leading-6 text-white/60">Every briefing starts with a simple question: who gains leverage, who loses it, and what should you watch next?</p><div className="mt-8 flex items-center gap-3 font-mono-ui text-[9px] uppercase tracking-[0.15em] text-white/45"><Search size={14} className="text-[#f6d34a]" /> Curious is a strategy.</div></div>
          <div className="grid border-t border-white/20 sm:grid-cols-2">
            {topics.map(({ label, note, icon: Icon }, index) => <div key={label} className={`reveal delay-${index + 1} group border-b border-white/20 py-7 sm:px-7 ${index % 2 === 0 ? 'sm:border-r' : ''}`}>
              <div className="flex items-start justify-between"><Icon size={21} strokeWidth={1.5} className="text-[#f6d34a]" /><span className="font-mono-ui text-[10px] text-white/30">0{index + 1}</span></div>
              <h3 className="mt-12 font-display text-2xl font-bold tracking-[-0.04em] transition-colors group-hover:text-[#f6d34a]">{label}</h3>
              <p className="mt-2 font-mono-ui text-[10px] uppercase tracking-[0.12em] text-white/45">{note}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section id="archive" className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="reveal flex flex-wrap items-end justify-between gap-5"><div><SectionLabel>The archive</SectionLabel><h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.06em] text-[#152e4a] sm:text-6xl">Keep your edge.</h2></div><a data-testid="link-archive-youtube" href={channel.channelUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.13em] text-[#d9362e]">Browse on YouTube <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a></div>
        {feedError ? <div data-testid="status-feed-fallback" className="mt-5 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.12em] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-[#f6d34a]" /> Preview archive / live feed unavailable</div> : null}
        <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((video, index) => <a data-testid={`card-archive-video-${video.id}`} key={`${video.id}-archive`} href={video.videoUrl} target="_blank" rel="noreferrer" className="video-card reveal group block">
            <Thumbnail video={video} index={index + 1} />
            <div className="mt-4 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-slate-500">{formatDate(video.publishedAt)}</div>
            <h3 className="mt-2 font-display text-2xl font-bold leading-[.95] tracking-[-0.045em] text-[#152e4a] group-hover:text-[#d9362e]">{video.title}</h3>
          </a>)}
        </div>
        <div className="reveal mt-16 border-y border-[#d8d2c6] py-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-slate-500">The promise</div><p className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-[#152e4a]">No hot takes. No easy villains. Just better questions.</p></div><a data-testid="link-promise-subscribe" href={channel.channelUrl} target="_blank" rel="noreferrer" className="signal-button flex w-fit items-center gap-2 bg-[#152e4a] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-[0.13em] text-[#f9f5ea]">Join the briefing <ArrowUpRight size={14} /></a></div></div>
      </section>

      <section className="relative overflow-hidden bg-[#d9362e] text-[#f9f5ea]">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full border-[20px] border-[#f6d34a]/70 sm:right-[12%] sm:top-[-100px] sm:h-96 sm:w-96" />
        <div className="relative mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-24">
          <div className="max-w-3xl"><SectionLabel light>Stay in the room</SectionLabel><h2 className="mt-5 font-display text-5xl font-bold leading-[.87] tracking-[-0.07em] sm:text-8xl">The next move<br /><span className="text-[#f6d34a]">is already forming.</span></h2><p className="mt-7 max-w-lg text-base leading-7 text-white/75">Subscribe to Sefa in Brief on YouTube. Come for the headline. Stay for the context.</p><a data-testid="link-final-subscribe" href={channel.channelUrl} target="_blank" rel="noreferrer" className="signal-button mt-8 inline-flex items-center gap-2 bg-[#f9f5ea] px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[0.15em] text-[#152e4a]">Subscribe to Sefa in Brief <Youtube size={15} /></a></div>
        </div>
      </section>

      <footer className="bg-[#152e4a] px-5 py-10 text-[#f9f5ea] sm:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><div className="font-display text-3xl font-bold uppercase leading-[.8] tracking-[-0.08em]">Sefa<br /><span className="text-[#d9362e]">in Brief</span></div><div className="mt-5 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/45">Independent analysis for a complicated world.</div></div><div className="flex flex-col items-start gap-3 sm:items-end"><a data-testid="link-footer-youtube" href={channel.channelUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-[#f6d34a] hover:text-white">YouTube channel <ExternalLink size={12} /></a><span className="font-mono-ui text-[9px] uppercase tracking-[0.12em] text-white/35">© 2025 Sefa in Brief / Made for the curious</span></div></div>
      </footer>
    </main>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
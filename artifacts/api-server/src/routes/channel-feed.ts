import { Router, type IRouter } from "express";
import { GetChannelFeedResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const CHANNEL_ID = "UCV1haSg1f6u8wfwuAsCJR_A";
const CHANNEL_URL = "https://www.youtube.com/@SefainBrief";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const AVATAR_URL =
  "https://yt3.googleusercontent.com/QBa_ijrd1Xg_XQ0VR5msNjFoA-S0RDCJxAf4MjYMBkh3gltuO383EMgeoNkK0ceeK20qxd928oM=s900-c-k-c0x00ffffff-no-rj";
const BANNER_URL =
  "https://yt3.googleusercontent.com/4lDBK2dXJ-FhZKvW4tndrKb7W0KuG5gXS7sSWiUFEBgfIgs9yFceh3W7SQBr8uVFsZ9rLBK7=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj";

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .trim();
}

function readTag(block: string, tag: string) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`),
  );
  return match ? decodeHtml(match[1]) : "";
}

function readAttribute(block: string, tag: string, attribute: string) {
  const match = block.match(
    new RegExp(`<${tag}[^>]*\\s${attribute}="([^"]+)"`),
  );
  return match ? decodeHtml(match[1]) : "";
}

function excerpt(value: string, limit = 320) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= limit) return compact;
  return `${compact.slice(0, limit).replace(/\s+\S*$/, "")}…`;
}

router.get("/channel-feed", async (req, res) => {
  try {
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "SefaInBriefSite/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      req.log.warn({ status: response.status }, "YouTube feed request failed");
      return res.status(502).json({ error: "The YouTube feed is unavailable." });
    }

    const xml = await response.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(
      (match) => match[1],
    );

    const videos = entries
      .map((entry) => ({
        id: readTag(entry, "yt:videoId"),
        title: readTag(entry, "title"),
        description: excerpt(readTag(entry, "media:description")),
        publishedAt: readTag(entry, "published"),
        thumbnailUrl: readAttribute(entry, "media:thumbnail", "url"),
        videoUrl: readAttribute(entry, "link", "href"),
      }))
      .filter(
        (video) =>
          video.id &&
          video.title &&
          video.publishedAt &&
          video.thumbnailUrl &&
          video.videoUrl,
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      );

    const data = GetChannelFeedResponse.parse({
      channel: {
        name: "Sefa in Brief",
        handle: "@SefainBrief",
        description:
          "Sefa Er breaks down geopolitics, international relations, trade, and the forces reshaping our world.",
        channelUrl: CHANNEL_URL,
        avatarUrl: AVATAR_URL,
        bannerUrl: BANNER_URL,
        subscribers: "2.75K",
        videoCount: 53,
      },
      videos,
    });

    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    return res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Unable to read YouTube channel feed");
    return res.status(502).json({ error: "The YouTube feed is unavailable." });
  }
});

export default router;
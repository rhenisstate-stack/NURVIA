"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nurviaApi } from "@/lib/api-client";
import type { CommunityPostDto } from "@/lib/api-types";
import { MessageSquare, Heart, Plus, Send, Trash2 } from "lucide-react";

const CHANNELS = [
  { id: "all", label: "All Channels" },
  { id: "nclex-cohorts", label: "NCLEX 2026 Cohorts" },
  { id: "ati-hesi-debriefs", label: "ATI & HESI Debriefs" },
  { id: "clinical-cases", label: "NGN Case Studies" },
  { id: "wellness-support", label: "Resilience & Wellness" },
];

export default function CommunityPage() {
  const [posts, setPosts] = React.useState<CommunityPostDto[]>([]);
  const [selectedPost, setSelectedPost] = React.useState<CommunityPostDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [channelId, setChannelId] = React.useState("all");

  const [showCreate, setShowCreate] = React.useState(false);
  const [newChannel, setNewChannel] = React.useState("nclex-cohorts");
  const [newCohort, setNewCohort] = React.useState("RN Pre-Licensure Track");
  const [newTitle, setNewTitle] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [posting, setPosting] = React.useState(false);

  const [replyText, setReplyText] = React.useState("");
  const [replying, setReplying] = React.useState(false);

  const loadPosts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getCommunityPosts({
      channelId: channelId === "all" ? undefined : channelId,
    });
    if (res.success && res.data) {
      setPosts(res.data);
    } else {
      setError(res.message || "Unable to load community discussions.");
    }
    setLoading(false);
  }, [channelId]);

  React.useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    const res = await nurviaApi.createCommunityPost({
      channelId: newChannel,
      cohortLabel: newCohort,
      title: newTitle,
      content: newContent,
    });
    if (res.success) {
      setNewTitle("");
      setNewContent("");
      setShowCreate(false);
      await loadPosts();
    } else {
      setError(res.message || "Unable to publish discussion.");
    }
    setPosting(false);
  };

  const handleToggleLike = async (postId: string) => {
    const res = await nurviaApi.toggleCommunityLike(postId);
    if (res.success && res.data) {
      const { liked, likeCount } = res.data;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likedByCaller: liked, likeCount } : p))
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => (prev ? { ...prev, likedByCaller: liked, likeCount } : prev));
      }
    }
  };

  const handleOpenPost = async (postId: string) => {
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
      return;
    }
    const res = await nurviaApi.getCommunityPost(postId);
    if (res.success && res.data) {
      setSelectedPost(res.data);
    }
  };

  const handleReply = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    const res = await nurviaApi.addCommunityReply(postId, replyText);
    if (res.success && res.data) {
      setReplyText("");
      const detailRes = await nurviaApi.getCommunityPost(postId);
      if (detailRes.success && detailRes.data) {
        setSelectedPost(detailRes.data);
      }
      await loadPosts();
    } else {
      setError(res.message || "Unable to post reply.");
    }
    setReplying(false);
  };

  const handleDelete = async (postId: string) => {
    const res = await nurviaApi.deleteCommunityPost(postId);
    if (res.success) {
      if (selectedPost?.id === postId) setSelectedPost(null);
      await loadPosts();
    }
  };

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="teal">Peer Learning</Badge>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              Student Cohort Community
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Connect with fellow nursing candidates preparing for ATI proctored assessments and NCLEX licensure.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="gap-1.5 bg-brand-teal hover:bg-brand-tealDark text-white"
          >
            <Plus className="w-4 h-4" />
            {showCreate ? "Close Form" : "Start Discussion"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CHANNELS.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={channelId === c.id ? "primary" : "outline"}
              onClick={() => setChannelId(c.id)}
              className="text-xs h-8"
            >
              {c.label}
            </Button>
          ))}
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {showCreate && (
          <Card className="p-6">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <h2 className="font-brand text-base font-bold text-foreground">New Community Discussion</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="comm-channel">Channel</Label>
                  <select
                    id="comm-channel"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                  >
                    {CHANNELS.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="comm-cohort">Cohort / Track</Label>
                  <Input id="comm-cohort" value={newCohort} onChange={(e) => setNewCohort(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="comm-title">Title</Label>
                <Input id="comm-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="comm-content">Discussion Prompt</Label>
                <Textarea id="comm-content" value={newContent} onChange={(e) => setNewContent(e.target.value)} required rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={posting} className="bg-brand-teal text-white">
                  {posting ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <Card className="p-8 text-center text-sm text-foreground-secondary">Loading discussions…</Card>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-foreground-secondary">No discussions in this channel yet.</Card>
        ) : (
          <div className="space-y-4">
            {posts.map((d) => {
              const isExpanded = selectedPost?.id === d.id;
              return (
                <Card key={d.id} className="p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-muted border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{d.authorName}</span>
                      <span>•</span>
                      <span>{d.cohortLabel}</span>
                      <Badge variant="outline" className="text-[10px]">{d.channelName}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{new Date(d.createdAtUtc).toLocaleDateString()}</span>
                      {d.isOwnedByCaller && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDelete(d.id)}
                          className="h-6 px-2 text-rose-600 hover:text-rose-700 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-base text-foreground font-bold">{d.title}</CardTitle>
                  <p className="text-xs text-foreground-secondary leading-relaxed whitespace-pre-line">{d.content}</p>

                  <div className="pt-2 flex items-center gap-3 text-xs">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleOpenPost(d.id)}
                      className="h-7 px-2 gap-1 text-xs text-foreground-secondary hover:text-foreground"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{d.replyCount} {d.replyCount === 1 ? "reply" : "replies"}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleToggleLike(d.id)}
                      className={`h-7 px-2 gap-1 text-xs ${d.likedByCaller ? "text-rose-600 font-semibold" : "text-foreground-secondary"}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${d.likedByCaller ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
                      <span>{d.likeCount} {d.likeCount === 1 ? "like" : "likes"}</span>
                    </Button>
                  </div>

                  {isExpanded && selectedPost && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <div className="space-y-2">
                        {(selectedPost.replies ?? []).map((r) => (
                          <div key={r.id} className="rounded-lg bg-surface-muted p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-foreground-muted">
                              <span className="font-semibold text-foreground">{r.authorName}</span>
                              <span>{new Date(r.createdAtUtc).toLocaleString()}</span>
                            </div>
                            <p className="text-foreground-secondary">{r.content}</p>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={(e) => void handleReply(e, d.id)} className="flex gap-2">
                        <Input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a supportive clinical reply..."
                          className="h-9 text-xs"
                          required
                        />
                        <Button type="submit" size="sm" disabled={replying} className="gap-1 bg-brand-teal text-white">
                          <Send className="w-3.5 h-3.5" /> Reply
                        </Button>
                      </form>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}

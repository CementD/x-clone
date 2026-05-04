import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addComment = mutation({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, postId, content } = args;

    const commentId = await ctx.db.insert("comments", {
      userId,
      postId,
      content,
      createdAt: Date.now(),
    });

    const post = await ctx.db.get(postId);
    if (post) {
      await ctx.db.patch(postId, {
        comments: post.comments + 1,
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_created", (q) =>
        q.eq("postId", args.postId)
      )
      .order("asc")
      .collect();

    return comments;
  },
});
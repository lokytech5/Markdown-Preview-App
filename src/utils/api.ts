export async function saveMarkdownAPI(body: string): Promise<void> {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ title: "Markdown Note", body, userId: 1 }),
  });
}

export async function loadMarkdownAPI(): Promise<string> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Array<{ body?: string }> = await res.json();
  return posts.length ? posts[0].body ?? "" : "";
}

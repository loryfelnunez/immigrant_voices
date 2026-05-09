export function getTavilyApiKey() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TAVILY_API_KEY");
  }

  return apiKey;
}

export const preferredDomains = [
  "reddit.com",
  "quora.com",
  "medium.com",
  "mydolcecasa.com",
  "expatforum.com",
  "teamblind.com"
];

export async function searchTavily(query: string, maxResults = 6) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: getTavilyApiKey(),
      query,
      search_depth: "advanced",
      max_results: maxResults,
      include_domains: preferredDomains,
      include_raw_content: true
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily search failed: ${response.status} ${text}`);
  }

  return (await response.json()) as {
    results?: Array<{
      url: string;
      title?: string;
      raw_content?: string;
      content?: string;
    }>;
  };
}

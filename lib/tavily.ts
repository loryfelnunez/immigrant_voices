export function getTavilyApiKey() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TAVILY_API_KEY");
  }

  return apiKey;
}

export const curatedQueries = [
  "\"first credit card\" immigrant USA reddit no credit history",
  "\"I wish I had known\" credit card new immigrant America",
  "secured credit card immigrant story experience reddit",
  "Nova Credit immigrant first credit card review",
  "building credit from scratch immigrant USA personal story",
  "ITIN credit card application experience immigrant",
  "authorized user immigrant build credit story",
  "\"moved to the US\" first credit card reddit startup immigrant",
  "\"new to America\" secured card personal story immigrant",
  "\"first credit score\" immigrant credit card forum story"
];

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

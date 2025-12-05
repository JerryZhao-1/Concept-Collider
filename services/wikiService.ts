
// Service to handle Graph Theory Bridging via Wikipedia API
// Uses heuristic bidirectional search to find logical paths between concepts.

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// Expanded Stop List: Hub nodes that provide no semantic value in a logical chain
// We filter out geography, years, generic top-level concepts, and meta-pages.
const STOP_LIST = new Set([
  'united states', 'united kingdom', 'france', 'germany', 'china', 'japan', 'europe', 'asia', 'north america', 'africa',
  'english language', 'latin', 'greek language', 'french language', 'german language', 'spanish language',
  'wikipedia', 'wikimedia commons', 'isbn', 'issn', 'pmid', 'doi (identifier)', 's2cid', 'wayback machine', 'bibcode', 'oclc',
  'main page', 'current events', 'search', 'help:contents', 'portal:current events',
  '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2010s', '2020s', '21st century', '20th century',
  'world war i', 'world war ii',
  'human', 'earth', 'universe', 'science', 'technology', 'nature', 'matter', 'life', 'time', 'history', 'culture', 'society',
  'philosophy', 'mathematics', 'physics', 'chemistry', 'biology', 'psychology', 'sociology', 'economics', 'politics',
  'identifier', 'reference', 'external link', 'see also', 'bibliography'
]);

const isStopWord = (title: string): boolean => {
  const lower = title.toLowerCase();
  if (STOP_LIST.has(lower)) return true;
  // Filter namespaces (Category:, Template:, etc.) and lists
  if (lower.includes(':')) return true;
  if (lower.startsWith('list of')) return true;
  if (lower.startsWith('outline of')) return true;
  if (lower.startsWith('index of')) return true;
  return false;
};

// Helper to fetch data from Wiki API with CORS handling
const fetchWikiData = async (params: Record<string, string>) => {
  const url = new URL(WIKI_API);
  url.search = new URLSearchParams({
    origin: '*',
    format: 'json',
    ...params
  }).toString();

  const response = await fetch(url);
  if (!response.ok) throw new Error('Wiki API Error');
  return response.json();
};

export const findLogicPath = async (startTerm: string, endTerm: string): Promise<string[]> => {
  console.log(`[Graph] Searching path: ${startTerm} -> ${endTerm}`);

  try {
    // 1. Sanitize inputs (Capitalize first letter for Wiki format)
    const formatTerm = (t: string) => t.charAt(0).toUpperCase() + t.slice(1).trim();
    const start = formatTerm(startTerm);
    const end = formatTerm(endTerm);

    if (start === end) return [start];

    // 2. Fetch "Links From" Start (Forward Search)
    // We get the top 500 links to cast a wide net
    const startData = await fetchWikiData({
      action: 'query',
      titles: start,
      prop: 'links',
      pllimit: '500', 
      plnamespace: '0' // Only articles
    });
    
    const startPageId = Object.keys(startData.query.pages)[0];
    if (startPageId === '-1') return [start, end]; // Page not found

    const rawForwardLinks = startData.query.pages[startPageId].links || [];
    const forwardLinks = new Set<string>();
    
    for (const l of rawForwardLinks) {
      if (!isStopWord(l.title)) {
        forwardLinks.add(l.title);
      }
    }

    // 3. Direct Connection Check
    if (forwardLinks.has(end)) {
      console.log("[Graph] Direct link found.");
      return [start, end];
    }

    // 4. Fetch "Links To" End (Backward Search / Backlinks)
    // Who points to the destination?
    const endData = await fetchWikiData({
      action: 'query',
      list: 'backlinks',
      bltitle: end,
      bllimit: '500',
      blnamespace: '0'
    });

    const rawBackLinks = endData.query.backlinks || [];
    const backLinks = new Set<string>();
    
    for (const l of rawBackLinks) {
      if (!isStopWord(l.title)) {
        backLinks.add(l.title);
      }
    }

    // 5. Intersection (The "Pivot" Node)
    // Find a node X where Start -> X and X -> End
    // Optimization: Prefer pivots that are NOT in the stop list (already filtered)
    // and ideally, prefer longer titles as a heuristic for specificity (avoiding hidden generic terms)
    
    const pivots: string[] = [];
    
    for (const link of forwardLinks) {
      if (backLinks.has(link)) {
        pivots.push(link);
      }
    }

    if (pivots.length > 0) {
      // Sort by length desc (Longer titles often = more specific concepts, avoiding broad hubs)
      pivots.sort((a, b) => b.length - a.length);
      const bestPivot = pivots[0];
      
      console.log(`[Graph] Bridge found (${pivots.length} options). Best: ${start} -> ${bestPivot} -> ${end}`);
      return [start, bestPivot, end];
    }

    // 6. Fallback: No 1-hop bridge found.
    // Real BFS for depth > 2 is too slow for client-side API.
    // Return endpoints to let AI fill the gap.
    console.log("[Graph] No direct bridge found. Returning endpoints.");
    return [start, end];

  } catch (error) {
    console.error("Wiki Graph Error:", error);
    // Fail gracefully -> Return start/end so logic continues without the bridge
    return [startTerm, endTerm];
  }
};

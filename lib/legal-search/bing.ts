import type { SearchResult } from '@/lib/types'

const SITE_FILTER = 'site:law.gov.cn OR site:court.gov.cn OR site:pkulaw.com OR site:wkinfo.com.cn OR site:npc.gov.cn'

export async function bingLegalSearch(query: string, searchType?: string): Promise<SearchResult[]> {
  const apiKey = process.env.BING_SEARCH_API_KEY
  if (!apiKey) {
    return getMockResults(query)
  }

  const fullQuery = `${query} ${SITE_FILTER}`
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(fullQuery)}&mkt=zh-CN&count=10&freshness=Year`

  const res = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  })

  if (!res.ok) return getMockResults(query)

  const data = await res.json()
  const pages = data?.webPages?.value || []

  return pages.map((p: { name: string; url: string; snippet: string; displayUrl: string }) => ({
    title: p.name,
    url: p.url,
    snippet: p.snippet,
    source: p.displayUrl,
  }))
}

function getMockResults(query: string): SearchResult[] {
  return [
    {
      title: `关于"${query}"的法律规定`,
      url: 'https://www.law.gov.cn',
      snippet: '（示例）根据《中华人民共和国民法典》相关规定...',
      source: 'law.gov.cn',
    },
  ]
}

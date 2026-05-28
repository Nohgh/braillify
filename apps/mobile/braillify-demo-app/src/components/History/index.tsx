import { useState, useEffect, useMemo } from "react";
import {
  getHistory,
  removeHistory,
  toggleFavorite,
  type HistoryItem,
} from "../../shared/api/store";
import { copyText } from "../../shared/lib/clipboard";

type TabType = "recent" | "favorites";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("recent");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function refresh() {
    const data = await getHistory();
    setHistory(data);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history
      .filter(it => (tab === "favorites" ? it.favorite : true))
      .filter(it => {
        if (!q) return true;
        return it.input.toLowerCase().includes(q) || it.output.toLowerCase().includes(q);
      });
  }, [history, tab, query]);

  async function handleCopy(item: HistoryItem) {
    try {
      await copyText(item.output);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(cur => (cur === item.id ? null : cur)), 1200);
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    await removeHistory(id);
    await refresh();
  }

  async function handleToggleFavorite(id: string) {
    await toggleFavorite(id);
    await refresh();
  }

  return (
    <div className="page">
      {/* 헤더 */}
      <div className="history-header">
        <h1 className="page-title">점역 히스토리</h1>
        <p className="page-desc">최근 점역 작업 내역과 즐겨찾기를 관리합니다.</p>
      </div>

      {/* 탭 */}
      <div className="history-tabs">
        <button
          className={`history-tab${tab === "recent" ? " active" : ""}`}
          onClick={() => setTab("recent")}
        >
          🕐 최근 작업
        </button>
        <button
          className={`history-tab${tab === "favorites" ? " active" : ""}`}
          onClick={() => setTab("favorites")}
        >
          ⭐ 즐겨찾기
        </button>
      </div>

      {/* 검색 */}
      <div className="history-search-wrap">
        <input
          className="history-search"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="검색..."
        />
      </div>

      {/* 리스트 */}
      {loading ? (
        <div className="history-skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-output">
          <p className="empty-braille">⠿ ⠿⠄ ⠐⠿</p>
          <p className="empty-text">
            {tab === "favorites"
              ? "즐겨찾기한 항목이 없습니다"
              : query
                ? "검색 결과가 없습니다"
                : "아직 변환 기록이 없습니다"}
          </p>
        </div>
      ) : (
        <ul className="history-list">
          {filtered.map(item => {
            const isExpanded = expanded === item.id;
            return (
              <li key={item.id} className="history-card">
                <div className="history-card-main">
                  <div className="history-card-text">
                    <div className="history-input">{item.input}</div>
                    <div className={`history-output${isExpanded ? " expanded" : ""}`}>
                      {item.output}
                    </div>
                  </div>
                  <div className="history-card-actions">
                    <button
                      className="history-action-btn history-star"
                      aria-label={item.favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                      aria-pressed={item.favorite}
                      onClick={() => handleToggleFavorite(item.id)}
                    >
                      {item.favorite ? "⭐" : "☆"}
                    </button>
                    <button
                      className="history-action-btn history-copy"
                      onClick={() => handleCopy(item)}
                    >
                      {copiedId === item.id ? "복사됨" : "복사"}
                    </button>
                    <button
                      className="history-action-btn history-delete"
                      aria-label="삭제"
                      onClick={() => handleDelete(item.id)}
                    >
                      ×
                    </button>
                    <button
                      className="history-action-btn history-expand"
                      aria-label={isExpanded ? "접기" : "펼치기"}
                      onClick={() => setExpanded(isExpanded ? null : item.id)}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>
                <div className="history-meta">
                  {new Date(item.createAt).toLocaleString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

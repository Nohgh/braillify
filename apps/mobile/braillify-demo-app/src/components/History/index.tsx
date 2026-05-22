import { useState, useEffect } from "react";
import { getHistory, type HistoryItem } from "../../shared/api/store";

type TabType = "recent" | "favorites";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("recent");

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

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
          className={`history-tab ${tab === "recent" ? "active" : ""}`}
          onClick={() => setTab("recent")}
        >
          🕐 최근 작업
        </button>
        <button
          className={`history-tab ${tab === "favorites" ? "active" : ""}`}
          onClick={() => setTab("favorites")}
        >
          ⭐ 즐겨찾기
        </button>
      </div>

      {/* 검색 */}
      <div className="history-search-wrap">
        <input className="history-search" type="text" placeholder="검색..." readOnly />
      </div>

      {/* 리스트 */}
      {loading ? (
        <div className="history-skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : tab === "favorites" ? (
        <div className="empty-output">
          <p className="empty-braille">⠿ ⠿⠄ ⠐⠿</p>
          <p className="empty-text">즐겨찾기한 항목이 없습니다</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-output">
          <p className="empty-braille">⠿ ⠿⠄ ⠐⠿</p>
          <p className="empty-text">아직 변환 기록이 없습니다</p>
        </div>
      ) : (
        <ul className="history-list">
          {history.map(item => (
            <li key={item.id} className="history-card">
              <div className="history-card-main">
                <div className="history-card-text">
                  <div className="history-input">{item.input}</div>
                  <div className="history-output">{item.output}</div>
                </div>
                <div className="history-card-actions">
                  <button className="history-action-btn history-star" aria-label="즐겨찾기">
                    ☆
                  </button>
                  <button className="history-action-btn history-copy" aria-label="복사">
                    복사
                  </button>
                  <button className="history-action-btn history-delete" aria-label="삭제">
                    ✕
                  </button>
                  <button className="history-action-btn history-expand" aria-label="펼치기">
                    ▾
                  </button>
                </div>
              </div>
              <div className="history-meta">
                {new Date((item as any).createdAt ?? (item as any).createAt).toLocaleString(
                  "ko-KR",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

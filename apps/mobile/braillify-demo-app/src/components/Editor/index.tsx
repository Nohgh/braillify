import { useMemo, useState } from "react";
import {
  masksToString,
  mirrorMask,
  parseBrailleString,
  toggleDot,
  type DotNumber,
} from "../../shared/lib/braille";
import { copyText } from "../../shared/lib/clipboard";

const DOT_BITS: Record<DotNumber, number> = {
  1: 0x01,
  2: 0x02,
  3: 0x04,
  4: 0x08,
  5: 0x10,
  6: 0x20,
};

const DOT_LAYOUT: Array<{ dot: DotNumber }> = [
  { dot: 1 },
  { dot: 2 },
  { dot: 3 },
  { dot: 4 },
  { dot: 5 },
  { dot: 6 },
];

export function EditorPage() {
  const [cells, setCells] = useState<number[]>([0]);
  const [intaglio, setIntaglio] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const previewMasks = useMemo(() => (intaglio ? cells.map(mirrorMask) : cells), [cells, intaglio]);
  const previewString = useMemo(() => masksToString(previewMasks), [previewMasks]);

  function handleToggleDot(cellIndex: number, dot: DotNumber) {
    setCells(prev => prev.map((m, i) => (i === cellIndex ? toggleDot(m, dot) : m)));
  }

  function handleAddCell() {
    setCells(prev => [...prev, 0]);
  }

  function handleReset() {
    setCells([0]);
  }

  function handleRemoveCell(cellIndex: number) {
    setCells(prev => {
      if (prev.length <= 1) return [0];
      return prev.filter((_, i) => i !== cellIndex);
    });
  }

  function handleImport() {
    const trimmed = importInput.trim();
    if (!trimmed) {
      setImportError("점자 문자열을 붙여넣어주세요.");
      return;
    }
    const parsed = parseBrailleString(trimmed);
    if (parsed === null) {
      setImportError("U+2800 범위의 점자 문자만 사용할 수 있어요.");
      return;
    }
    setImportError(null);
    setCells(parsed.length > 0 ? parsed : [0]);
    setImportInput("");
  }

  async function handleCopy() {
    try {
      await copyText(previewString);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1500);
    }
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">점자 편집기</h1>
        <p className="page-desc">
          점 단위로 직접 점자를 조합하고 음각으로 양각 인쇄 레이아웃을 확인하세요.
        </p>
      </div>

      {/* 미리보기 카드 */}
      <div className="editor-card">
        <div className="editor-card-header">
          <span className="editor-card-title">미리보기</span>
          <div className="editor-card-actions">
            <label className="editor-toggle-wrap">
              <span className="editor-toggle-label">음각</span>
              <div
                className={`editor-toggle${intaglio ? " active" : ""}`}
                role="switch"
                aria-checked={intaglio}
                onClick={() => setIntaglio(v => !v)}
              >
                <div className="editor-toggle-thumb" />
              </div>
            </label>
            <button className="editor-outline-btn" onClick={handleCopy}>
              {copyState === "copied" ? "복사됨" : copyState === "error" ? "복사 실패" : "복사"}
            </button>
          </div>
        </div>
        <div className="editor-preview-text">{previewString || " "}</div>
      </div>

      {/* 가져오기 카드 */}
      <div className="editor-card">
        <span className="editor-card-title">점자 가져오기</span>
        <div className="editor-import-input-wrap">
          <input
            className={`editor-import-input${importError ? " error" : ""}`}
            value={importInput}
            onChange={e => {
              setImportInput(e.target.value);
              setImportError(null);
            }}
            placeholder="점자 문자열을 붙여넣으세요 (U+2800 범위)"
          />
          {importInput && (
            <button
              className="editor-import-clear"
              onClick={() => {
                setImportInput("");
                setImportError(null);
              }}
              aria-label="지우기"
            >
              ×
            </button>
          )}
        </div>
        {importError && <p className="editor-error-msg">{importError}</p>}
        <button className="editor-primary-btn" onClick={handleImport}>
          가져오기
        </button>
      </div>

      {/* 셀 편집 카드 */}
      <div className="editor-card">
        <div className="editor-card-header">
          <span className="editor-card-title">점자 셀 편집 ({cells.length}셀)</span>
          <div className="editor-card-actions">
            <button className="editor-outline-btn" onClick={handleAddCell}>
              + 셀
            </button>
            <button className="editor-danger-btn" onClick={handleReset}>
              초기화
            </button>
          </div>
        </div>
        <div className="editor-cell-grid">
          {cells.map((mask, i) => (
            <EditableBrailleCell
              key={i}
              mask={mask}
              index={i}
              onToggleDot={dot => handleToggleDot(i, dot)}
              onRemove={() => handleRemoveCell(i)}
            />
          ))}
        </div>
      </div>

      {/* 점 번호 힌트 카드 */}
      <div className="editor-card">
        <span className="editor-card-title">점 번호</span>
        <p className="page-desc">왼쪽: 1·2·3 / 오른쪽: 4·5·6</p>
      </div>
    </div>
  );
}

function EditableBrailleCell({
  mask,
  index,
  onToggleDot,
  onRemove,
}: {
  mask: number;
  index: number;
  onToggleDot: (dot: DotNumber) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="editor-cell-wrap">
      <span className="editor-cell-index">#{index + 1}</span>
      <div className="editor-cell-body">
        <div className="editor-dot-grid">
          {DOT_LAYOUT.map(({ dot }) => {
            const active = (mask & DOT_BITS[dot]) !== 0;
            return (
              <button
                key={dot}
                type="button"
                className={`editor-dot${active ? " active" : ""}`}
                aria-label={`${index + 1}번 셀 점 ${dot}`}
                aria-pressed={active}
                onClick={() => onToggleDot(dot)}
              />
            );
          })}
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          className="editor-cell-remove"
          aria-label="셀 삭제"
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

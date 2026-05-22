import { useState } from "react";
import { translate } from "../../shared/api/braillify";
import { addHistory } from "../../shared/api/store";

export function TranslatePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleTranslate = async () => {
    try {
      const result = translate(input);
      setOutput(result);
      await addHistory(input, result);
    } catch (e) {
      setOutput(`오류: ${e}`);
    }
  };

  return (
    <main className="page">
      <h1 className="page-title">점역기</h1>
      <p className="page-desc">
        한글 텍스트를 입력하면 2024 개정 한국 점자 규정에 따라 점역합니다.
      </p>

      <div className="input-box">
        <div className="input-header">
          <span className="input-label">입력 텍스트</span>
          <span className="input-count">{input.length}자</span>
        </div>
        <textarea
          className="translate-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="점역할 텍스트를 입력하세요..."
          rows={5}
        />
        <div className="input-footer">
          <span className="input-hint">탭하여 변환</span>
          <button className="translate-button" onClick={handleTranslate}>
            점역하기
          </button>
        </div>
      </div>

      {output ? (
        <div className="output-box">
          <p className="output-text">{output}</p>
        </div>
      ) : (
        <div className="empty-output">
          <p className="empty-braille">⠿ ⠿⠄ ⠐⠿ ⠿⠂ ⠠⠿ ⠿⠢ ⠐⠿</p>
          <p className="empty-text">텍스트를 입력하고 점역을 시작해보세요</p>
        </div>
      )}
    </main>
  );
}

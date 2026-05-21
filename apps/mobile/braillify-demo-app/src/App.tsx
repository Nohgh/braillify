import { useState } from "react";
import "./App.css";
import { translate } from "./shared/api/braillify";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleTranslate = () => {
    try {
      setOutput(translate(input));
    } catch (e) {
      setOutput(`오류: ${e}`);
    }
  };

  return (
    <main className="container">
      <div style={{ padding: 24 }}>
        <h1>점자 변환기</h1>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="변환할 텍스트 입력"
          rows={4}
          style={{ width: "100%", fontSize: 16 }}
        />

        <button onClick={handleTranslate} style={{ marginTop: 8, padding: "8px 16px" }}>
          점역하기
        </button>

        {output && <div style={{ marginTop: 16, fontSize: 32, letterSpacing: 4 }}>{output}</div>}
      </div>
    </main>
  );
}

export default App;

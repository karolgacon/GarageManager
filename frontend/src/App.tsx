import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [response, setResponse] = useState("");

const updateResponse = async () => {
    console.log("Kliknięto przycisk");
  try {
    const res = await fetch("http://localhost:8000/api/v1/users");
    const data = await res.json();
    console.log("Dane z API:", data);

    if (Array.isArray(data) && data.length > 0) {
      setResponse(data[0].email); // Wyświetli e-mail pierwszego użytkownika
    } else {
      setResponse("Brak użytkowników w bazie");
    }
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
    setResponse("Błąd podczas pobierania danych");
  }
};
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => updateResponse()}>
          response is: {response}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
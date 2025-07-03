import { useState } from "react";
import axios from "axios";
import { Loading } from "./components/Loading/Loading";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const url = "http://localhost:4000/" || process.env.REACT_APP_API_URL;

  const getData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}`);
      console.log(response.data);
      setData(response.data.message);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setData(error.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn" onClick={getData}>
        Make Call
      </button>
      {loading && <Loading />}
      {data && <p>{data}</p>}
    </>
  );
}

export default App;

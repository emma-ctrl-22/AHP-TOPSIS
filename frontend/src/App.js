import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/uploadfile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setData(response.data);
      console.log(response.data);
      setError(null);
    } catch (error) {
      setError("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Upload and Analyze Criteria</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <input 
          type="file" 
          onChange={handleFileChange} 
          style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          onClick={handleUpload} 
          disabled={loading} 
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: loading ? '#ccc' : '#007BFF',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ color: '#333' }}>Results</h2>
          {data.results.map((result, index) => (
            <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <h3 style={{ color: '#007BFF' }}>{result.engineer}</h3>
              <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '5px', backgroundColor: '#f2f2f2' }}>Row</th>
                    <th style={{ padding: '5px', backgroundColor: '#f2f2f2' }}>Col</th>
                    <th style={{ padding: '5px', backgroundColor: '#f2f2f2' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.matrix.map((row, rowIndex) =>
                    row.map((value, colIndex) => (
                      <tr key={`${rowIndex}-${colIndex}`}>
                        <td style={{ padding: '5px', textAlign: 'center' }}>{rowIndex + 1}</td>
                        <td style={{ padding: '5px', textAlign: 'center' }}>{colIndex + 1}</td>
                        <td style={{ padding: '5px', textAlign: 'center' }}>{value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <p><strong>Weights:</strong> {result.weights.join(', ')}</p>
              <p><strong>Max Eigenvalue:</strong> {result.max_eigenvalue}</p>
              <p><strong>Consistency Index (CI):</strong> {result.ci}</p>
              <p><strong>Consistency Ratio (CR):</strong> {result.cr}</p>
              <p><strong>Random Index (RI):</strong> {result.ri}</p>
            </div>
          ))}

          {data.aggregate_result && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <h2 style={{ color: '#007BFF' }}>Aggregate Results</h2>
              <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '5px', backgroundColor: '#f2f2f2' }}>Row</th>
                    <th style={{ padding: '5px', backgroundColor: '#f2f2f2' }}>Col</th>
                    <th style={{ padding: '5px', backgroundColor: '#f2f2f2' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.aggregate_result.aggregate_matrix.map((row, rowIndex) =>
                    row.map((value, colIndex) => (
                      <tr key={`${rowIndex}-${colIndex}`}>
                        <td style={{ padding: '5px', textAlign: 'center' }}>{rowIndex + 1}</td>
                        <td style={{ padding: '5px', textAlign: 'center' }}>{colIndex + 1}</td>
                        <td style={{ padding: '5px', textAlign: 'center' }}>{value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <p><strong>Weights:</strong> {data.aggregate_result.weights.join(', ')}</p>
              <p><strong>Max Eigenvalue:</strong> {data.aggregate_result.max_eigenvalue}</p>
              <p><strong>Consistency Index (CI):</strong> {data.aggregate_result.ci}</p>
              <p><strong>Consistency Ratio (CR):</strong> {data.aggregate_result.cr}</p>
              <p><strong>Random Index (RI):</strong> {data.aggregate_result.ri}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

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
        <input type="file" onChange={handleFileChange} style={{ margin: '10px 0' }} />
        <button onClick={handleUpload} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
          Upload File
        </button>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
          <div style={{ marginTop: '20px', width: '100%', maxWidth: '800px' }}>
            <h2>Results</h2>
            {data.results.map((result, index) => (
              <div key={index} style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                <h3>{result.engineer}</h3>
                <p><strong>Pairwise Comparison Matrix:</strong></p>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <tbody>
                    {result.matrix.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((value, colIndex) => (
                          <td key={colIndex} style={{ border: '1px solid #ccc', padding: '5px' }}>{value}</td>
                        ))}
                      </tr>
                    ))}
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
              <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                <h3>Aggregate Results</h3>
                <p><strong>Aggregate Pairwise Comparison Matrix:</strong></p>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <tbody>
                    {data.aggregate_result.aggregate_matrix.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((value, colIndex) => (
                          <td key={colIndex} style={{ border: '1px solid #ccc', padding: '5px' }}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p><strong>Weights:</strong> {data.aggregate_result.weights.join(', ')}</p>
                <p><strong>Max Eigenvalue:</strong> {data.aggregate_result.max_eigenvalue}</p>
                <p><strong>Consistency Index (CI):</strong> {data.aggregate_result.ci}</p>
                <p><strong>Consistency Ratio (CR):</strong> {data.aggregate_result.cr}</p>
                <p><strong>Random Index (RI):</strong> {data.aggregate_result.ri}</p>
              </div>
            )}
            {data.document && (
              <div style={{ marginTop: '20px' }}>
                <a href={`http://localhost:8000/${data.document}`} download style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
                  Download Report
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

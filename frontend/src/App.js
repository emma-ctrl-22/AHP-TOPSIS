import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

function App() {
  const [files, setFiles] = useState([null]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (index) => (event) => {
    const newFiles = [...files];
    newFiles[index] = event.target.files[0];
    setFiles(newFiles);
  };

  const handleAddFile = () => {
    setFiles([...files, null]);
  };

  const handleUpload = async () => {
    if (files.some(file => !file)) {
      setError("Please select all files to upload.");
      return;
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/uploadfile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setData(response.data.data);
      console.log(response.data.data);
      setError(null);
    } catch (error) {
      setError("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    data.forEach((fileData, fileIndex) => {
      fileData.results.forEach((result, index) => {
        doc.text(`Engineer: ${result.engineer}`, 10, 10 + (index * 50) + (fileIndex * 250));
        doc.text(`Weights: ${result.weights.join(', ')}`, 10, 20 + (index * 50) + (fileIndex * 250));
        doc.text(`Max Eigenvalue: ${result.max_eigenvalue}`, 10, 30 + (index * 50) + (fileIndex * 250));
        doc.text(`Consistency Index (CI): ${result.ci}`, 10, 40 + (index * 50) + (fileIndex * 250));
        doc.text(`Consistency Ratio (CR): ${result.cr}`, 10, 50 + (index * 50) + (fileIndex * 250));
        doc.text(`Random Index (RI): ${result.ri}`, 10, 60 + (index * 50) + (fileIndex * 250));
      });

      if (fileData.aggregate_result) {
        doc.addPage();
        doc.text('Aggregate Results', 10, 10);
        doc.text(`Weights: ${fileData.aggregate_result.weights.join(', ')}`, 10, 20);
        doc.text(`Max Eigenvalue: ${fileData.aggregate_result.max_eigenvalue}`, 10, 30);
        doc.text(`Consistency Index (CI): ${fileData.aggregate_result.ci}`, 10, 40);
        doc.text(`Consistency Ratio (CR): ${fileData.aggregate_result.cr}`, 10, 50);
        doc.text(`Random Index (RI): ${fileData.aggregate_result.ri}`, 10, 60);
      }
    });

    doc.save('results.pdf');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Upload and Analyze Criteria</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        {files.map((file, index) => (
          <input key={index} type="file" onChange={handleFileChange(index)} style={{ margin: '10px 0' }} />
        ))}
        <button onClick={handleAddFile} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
          Add Another File
        </button>
        <button onClick={handleUpload} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', margin: '10px 0' }}>
          Upload Files
        </button>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
          <div style={{ marginTop: '20px', width: '100%', maxWidth: '800px' }}>
            <button onClick={() => setShowResults(!showResults)} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
              {showResults ? 'Hide Results' : 'Show Results'}
            </button>
            {showResults && (
              <div>
                <h2>Results</h2>
                {data.map((fileData, fileIndex) => (
                  <div key={fileIndex}>
                    <h3>File: {fileData.filename}</h3>
                    {fileData.results.map((result, index) => (
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
                    {fileData.aggregate_result && (
                      <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                        <h3>Aggregate Results</h3>
                        <p><strong>Aggregate Pairwise Comparison Matrix:</strong></p>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                          <tbody>
                            {fileData.aggregate_result.aggregate_matrix.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((value, colIndex) => (
                                  <td key={colIndex} style={{ border: '1px solid #ccc', padding: '5px' }}>{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p><strong>Weights:</strong> {fileData.aggregate_result.weights.join(', ')}</p>
                        <p><strong>Max Eigenvalue:</strong> {fileData.aggregate_result.max_eigenvalue}</p>
                        <p><strong>Consistency Index (CI):</strong> {fileData.aggregate_result.ci}</p>
                        <p><strong>Consistency Ratio (CR):</strong> {fileData.aggregate_result.cr}</p>
                        <p><strong>Random Index (RI):</strong> {fileData.aggregate_result.ri}</p>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={generatePDF} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px' }}>
                  Generate PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

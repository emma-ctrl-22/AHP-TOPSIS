import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

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

      setData(response.data);
      console.log(response.data);
      setError(null);
    } catch (error) {
      setError("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    data.results.forEach((result, index) => {
      doc.text(`Engineer: ${result.engineer}`, 10, 10 + (index * 50));
      doc.text(`Weights: ${result.weights.join(', ')}`, 10, 20 + (index * 50));
      doc.text(`Max Eigenvalue: ${result.max_eigenvalue}`, 10, 30 + (index * 50));
      doc.text(`Consistency Index (CI): ${result.ci}`, 10, 40 + (index * 50));
      doc.text(`Consistency Ratio (CR): ${result.cr}`, 10, 50 + (index * 50));
      doc.text(`Random Index (RI): ${result.ri}`, 10, 60 + (index * 50));
    });

    if (data.aggregate_result) {
      doc.addPage();
      doc.text('Aggregate Results', 10, 10);
      doc.text(`Weights: ${data.aggregate_result.weights.join(', ')}`, 10, 20);
      doc.text(`Max Eigenvalue: ${data.aggregate_result.max_eigenvalue}`, 10, 30);
      doc.text(`Consistency Index (CI): ${data.aggregate_result.ci}`, 10, 40);
      doc.text(`Consistency Ratio (CR): ${data.aggregate_result.cr}`, 10, 50);
      doc.text(`Random Index (RI): ${data.aggregate_result.ri}`, 10, 60);
    }

    doc.save('results.pdf');
  };

  return (
    <div className="font-sans mx-4">
      <h1 className="text-center text-gray-800 text-3xl my-8">Upload and Analyze Criteria</h1>
      <div className="flex flex-col items-center">
        {files.map((file, index) => (
          <input key={index} type="file" onChange={handleFileChange(index)} className="my-2" />
        ))}
        <Button onClick={handleAddFile} variant="contained" color="primary" className="my-2">
          Add Another File
        </Button>
        <Button onClick={handleUpload} variant="contained" color="primary" className="my-2">
          Upload Files
        </Button>
        {loading && <CircularProgress className="my-4" />}
        {error && <p className="text-red-600">{error}</p>}
        {data && (
          <div className="w-full max-w-screen-lg mt-8">
            <Button onClick={() => setShowResults(!showResults)} variant="contained" color="primary">
              {showResults ? 'Hide Results' : 'Show Results'}
            </Button>
            {showResults && (
              <div>
                <h2 className="text-2xl mt-4">Results</h2>
                {data.results.map((result, index) => (
                  <Paper key={index} className="p-4 my-4">
                    <h3 className="text-xl mb-2">{result.engineer}</h3>
                    <p><strong>Pairwise Comparison Matrix:</strong></p>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {result.matrix.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((value, colIndex) => (
                                <TableCell key={colIndex}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <p><strong>Weights:</strong> {result.weights.join(', ')}</p>
                    <p><strong>Max Eigenvalue:</strong> {result.max_eigenvalue}</p>
                    <p><strong>Consistency Index (CI):</strong> {result.ci}</p>
                    <p><strong>Consistency Ratio (CR):</strong> {result.cr}</p>
                    <p><strong>Random Index (RI):</strong> {result.ri}</p>
                  </Paper>
                ))}
                {data.aggregate_result && (
                  <Paper className="p-4 my-4">
                    <h3 className="text-xl mb-2">Aggregate Results</h3>
                    <p><strong>Aggregate Pairwise Comparison Matrix:</strong></p>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {data.aggregate_result.aggregate_matrix.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((value, colIndex) => (
                                <TableCell key={colIndex}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <p><strong>Weights:</strong> {data.aggregate_result.weights.join(', ')}</p>
                    <p><strong>Max Eigenvalue:</strong> {data.aggregate_result.max_eigenvalue}</p>
                    <p><strong>Consistency Index (CI):</strong> {data.aggregate_result.ci}</p>
                    <p><strong>Consistency Ratio (CR):</strong> {data.aggregate_result.cr}</p>
                    <p><strong>Random Index (RI):</strong> {data.aggregate_result.ri}</p>
                  </Paper>
                )}
                <Button onClick={generatePDF} variant="contained" color="success" className="my-4">
                  Download Report
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

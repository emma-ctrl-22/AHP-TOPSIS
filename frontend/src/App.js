import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [documentLink, setDocumentLink] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/uploadfile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage(response.data.message);
            setDocumentLink(response.data.document);
        } catch (error) {
            setMessage('Error uploading file');
            console.error(error);
        }
    };

    return (
        <div className="App">
            <h1>Upload CSV File</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {message && <p>{message}</p>}
            {documentLink && (
                <p>
                    <a href={`http://localhost:8000/${documentLink}`} download>
                        Download the generated Word document
                    </a>
                </p>
            )}
        </div>
    );
}

export default App;

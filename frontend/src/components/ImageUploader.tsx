import React, { useState } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import Papa from 'papaparse';

interface Row {
  id: number;
  local: string;
  estabelecimento: string;
  valor: string;
  data: string;
  categoria: string;
}

const ImageUploader: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles) {
      setError('Please select files to upload.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    setIsLoading(true);
    setError(null);
    setRows([]);

    try {
      const response = await axios.post('http://localhost:3001/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newRows: Row[] = [...rows];
      let idCounter = rows.length;
      response.data.forEach((d: { text: string }) => {
        const lines = d.text.split('\n').filter(line => line.trim() !== '');
        lines.forEach(line => {
          const parts = line.split(/\s+/);
          const newRow: Row = {
            id: idCounter++,
            data: parts[0] || '',
            estabelecimento: parts[1] || '',
            local: '',
            valor: parts[parts.length - 1] || '',
            categoria: '',
          };

          const isDuplicate = newRows.some(
            (row) =>
              row.data === newRow.data &&
              row.estabelecimento === newRow.estabelecimento &&
              row.valor === newRow.valor
          );

          if (!isDuplicate) {
            newRows.push(newRow);
          }
        });
      });

      setRows(newRows);
    } catch (err) {
      setError('An error occurred during the upload. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorize = async () => {
    const prompt = `
      Categorize the following expenses into one of these categories: Food, Transport, Shopping, Health, Entertainment, Bills, Other.
      Return a JSON array where each object has an "id" and a "categoria".
      Do not include any other text in your response.

      Expenses:
      ${JSON.stringify(rows)}
    `;

    try {
      const response = await axios.post('http://localhost:3001/api/v1/chat/completions', {
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
      });

      const result = JSON.parse(response.data.choices[0].message.content);
      const updatedRows = rows.map(row => {
        const categoryInfo = result.find((r: any) => r.id === row.id);
        return categoryInfo ? { ...row, categoria: categoryInfo.categoria } : row;
      });
      setRows(updatedRows);

    } catch (error) {
      console.error("Error categorizing expenses:", error);
      setError("Failed to categorize expenses.");
    }
  };

  const handleChatSubmit = async () => {
    const prompt = `
      Based on the following expense data, answer the user's question.
      Data: ${JSON.stringify(rows)}
      Question: ${chatMessage}
    `;

    try {
      const response = await axios.post('http://localhost:3001/api/v1/chat/completions', {
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
      });
      setChatResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error with chat:", error);
      setChatResponse("An error occurred. Please try again.");
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'expenses.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Upload Images</h2>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload and Extract'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {rows.length > 0 && (
        <div>
          <h3>Extracted Data:</h3>
          <div>
            <label htmlFor="month-select">Reference Month:</label>
            <select id="month-select">
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
          </div>
          <DataTable rows={rows} onRowsChange={setRows} />
          <button onClick={handleCategorize}>Categorize with AI</button>
          <button onClick={handleExport} style={{ marginLeft: '10px' }}>Export to CSV</button>

          <div style={{ marginTop: '20px' }}>
            <h3>Chat with AI</h3>
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              rows={4}
              cols={50}
              placeholder="Ask a question about your expenses..."
            />
            <br />
            <button onClick={handleChatSubmit}>Ask</button>
            {chatResponse && (
              <div style={{ marginTop: '10px' }}>
                <h4>AI Response:</h4>
                <p>{chatResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

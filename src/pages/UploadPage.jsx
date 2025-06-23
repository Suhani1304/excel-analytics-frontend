import { useState } from "react";
import * as XLSX from "xlsx";

export default function UploadPage() {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      console.log(json);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Excel</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button className="bg-purple-600 text-white py-2 px-4 rounded mt-2" onClick={handleUpload}>Upload</button>
    </div>
  );
}

"use client";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "../api/uploadthing/core";
import { useState } from "react";
import type { FileValidationResult, UploadedFile, ProcessingOptions, ProcessingResponse } from "#/types";
import ProcessingOptionsComponent from "./ProcessingOptions";
import { processFiles } from "../actions";
import Results from "./Results";

interface UploaderProps {
  isAuthenticated: boolean;
}

export default function Uploader({ isAuthenticated }: UploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [validationResult, setValidationResult] = useState<FileValidationResult>({ valid: true, errors: [] });
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResponse | null>(null);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    mode: 'analyze',
    sanitization: { removeMetadata: false, normalizeEncoding: false, stripMalicious: false },
    validation: { verifyStructure: false, checkSecurity: false },
    corrections: { fixEncoding: false, repairStructure: false, standardizeFormat: false },
  });

  const handleProcessing = async () => {
    setProcessing(true);
    setResults(null);
    try {
      const result = await processFiles(files, processingOptions);
      setResults(result);
    } catch (error) {
      console.error(error);
      alert("An error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const validateFiles = (newFiles: UploadedFile[]) => {
    const errors = [];
    const maxFiles = isAuthenticated ? 20 : 10;
    if (newFiles.length > maxFiles) {
      errors.push({ code: "max_file_count", message: `You can upload a maximum of ${maxFiles} files.` });
    }
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        errors.push({ code: "max_file_size", message: `File "${file.name}" exceeds the 5MB limit.` });
      }
    }
    const valid = errors.length === 0;
    setValidationResult({ valid, errors });
    return valid;
  };

  const removeFile = (fileName: string) => {
    const newFiles = files.filter(f => f.name !== fileName);
    setFiles(newFiles);
    validateFiles(newFiles);
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
      <UploadDropzone<OurFileRouter>
        endpoint={isAuthenticated ? "authenticatedUploader" : "anonymousUploader"}
        config={{
          folderUpload: isAuthenticated,
        }}
        onClientUploadComplete={(res) => {
          if (!res) return;
          const uploadedFiles = res.map((file) => ({
            id: file.key,
            name: file.name,
            size: file.size,
            type: file.type,
            path: file.url,
            selected: true,
          }));
          setFiles(uploadedFiles);
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
        onBeforeUploadBegin={(files) => {
          setFiles([]);
          const uploadedFiles = files.map(f => ({
            id: crypto.randomUUID(),
            name: f.name,
            size: f.size,
            type: f.type,
            selected: true,
          }));
          validateFiles(uploadedFiles);
          return files;
        }}
      />
      {!validationResult.valid && (
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-400 rounded-md">
          <h3 className="font-bold">Validation Errors</h3>
          <ul>
            {validationResult.errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold">Selected Files</h3>
          <ul className="mt-4 space-y-2">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                <span>{file.name} - {(file.size / 1024).toFixed(2)} KB</span>
                <button
                  onClick={() => removeFile(file.name)}
                  className="px-2 py-1 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p>Total Files: {files.length}</p>
            <p>Total Size: {(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <ProcessingOptionsComponent options={processingOptions} setOptions={setProcessingOptions} />
          <button
            onClick={handleProcessing}
            disabled={processing}
            className="w-full px-4 py-2 mt-4 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {processing ? "Processing..." : "Process Files"}
          </button>
        </div>
      )}
      {results && <Results response={results} />}
    </div>
  );
}

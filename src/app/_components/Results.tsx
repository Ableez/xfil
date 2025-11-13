"use client";

import type { ProcessingResponse } from "#/types";

interface ResultsProps {
  response: ProcessingResponse;
}

export default function Results({ response }: ResultsProps) {
  return (
    <div className="p-8 mt-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">Processing Results</h2>

      {/* Summary */}
      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold">Summary</h3>
        <p>Total Files: {response.summary.totalFiles}</p>
        <p>Successes: {response.summary.successCount}</p>
        <p>Errors: {response.summary.errorCount}</p>
        <p>Processing Time: {response.summary.totalProcessingTime.toFixed(2)}s</p>
      </div>

      {/* Individual File Results */}
      <div>
        <h3 className="text-lg font-semibold">File Details</h3>
        <ul className="space-y-4">
          {response.results.map((result, index) => (
            <li key={index} className="p-4 border border-gray-200 rounded-md">
              <p className="font-bold">{result.originalFile.name}</p>
              {result.correctedFile && (
                <a href={result.correctedFile.url} download className="text-blue-500 hover:underline">
                  Download Corrected File
                </a>
              )}
              {result.analysis && (
                <div className="mt-2 text-sm">
                  <p>Is Valid: {result.analysis.isValid ? "Yes" : "No"}</p>
                  <p>Issues Found: {result.analysis.issues.length}</p>
                  <ul className="pl-4 list-disc">
                    {result.analysis.issues.map((issue, i) => (
                      <li key={i}>{issue.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

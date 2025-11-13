"use server";

import type { UploadedFile, ProcessingOptions, ProcessingResponse, CleanerResult, ProcessingResult } from "#/types";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = util.promisify(exec);

export async function processFiles(
  files: UploadedFile[],
  options: ProcessingOptions
): Promise<ProcessingResponse> {
  console.log("Processing files:", files);
  console.log("Processing options:", options);

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "file-processing-"));
  const startTime = Date.now();

  try {
    for (const file of files) {
      if (!file.path) continue;
      const response = await fetch(file.path);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(path.join(tempDir, file.name), buffer);
    }

    const optionsJson = JSON.stringify(options);
    const command = `python src/server/actions/cleaner.py -d ${tempDir} --report-mode quiet --json-options '${optionsJson}'`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error("Python script error:", stderr);
    }

    const parsedResults = JSON.parse(stdout);
    const cleanerResults: CleanerResult[] = (Array.isArray(parsedResults) ? parsedResults : []).filter(
      (result: any): result is CleanerResult =>
        typeof result === "object" &&
        result !== null &&
        typeof result.filepath === "string" &&
        typeof result.had_marker_or_change === "boolean" &&
        typeof result.detected_markers === "number" &&
        typeof result.processed_markers === "number"
    );

    const results: ProcessingResult[] = [];
    for (const cr of cleanerResults) {
      const originalFile = files.find(f => f.name === path.basename(cr.filepath));
      results.push({
        originalFile: {
          name: originalFile?.name ?? path.basename(cr.filepath),
          url: originalFile?.path ?? '',
          size: originalFile?.size ?? 0,
        },
        analysis: {
          isValid: !cr.error,
          issues: cr.error ? [{ severity: 'error', code: 'processing_error', message: cr.error }] : [],
          // These are placeholder values, as the Python script does not provide them.
          fileType: '',
          encoding: '',
          metadata: {},
          processingTime: 0,
        },
        correctedFile: null,
        error: cr.error,
      });

      if (cr.temp_file_path) {
        const { stdout: curlStdout } = await execAsync(
          `curl -F "file=@${cr.temp_file_path}" https://file.io`
        );
        const fileIoResponse = JSON.parse(curlStdout);
        if (fileIoResponse.success) {
          results[results.length - 1].correctedFile = {
            name: `corrected_${originalFile?.name ?? path.basename(cr.filepath)}`,
            url: fileIoResponse.link,
            size: (await fs.stat(cr.temp_file_path)).size,
          };
        }
      }
    }

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    const errorCount = results.filter(r => r.error).length;

    return {
      success: true,
      results: results,
      summary: {
        totalFiles: files.length,
        successCount: results.length - errorCount,
        errorCount: errorCount,
        totalProcessingTime: processingTime,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    console.error("Error processing files:", error);
    return {
      success: false,
      results: [],
      summary: {
        totalFiles: files.length,
        successCount: 0,
        errorCount: files.length,
        totalProcessingTime: processingTime,
        timestamp: new Date().toISOString(),
      },
      error: "Failed to process files.",
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

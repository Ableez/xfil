"use client";
import type { ProcessingOptions } from "#/types";

interface ProcessingOptionsProps {
  options: ProcessingOptions;
  setOptions: (options: ProcessingOptions) => void;
}

export default function ProcessingOptionsComponent({ options, setOptions }: ProcessingOptionsProps) {
  const setPreset = (preset: 'quick' | 'full' | 'deep') => {
    if (preset === 'quick') {
      setOptions({
        mode: 'analyze',
        sanitization: { removeMetadata: true, normalizeEncoding: true, stripMalicious: true },
        validation: { verifyStructure: true, checkSecurity: true },
        corrections: { fixEncoding: false, repairStructure: false, standardizeFormat: false },
      });
    } else if (preset === 'full') {
      setOptions({
        mode: 'correct',
        sanitization: { removeMetadata: true, normalizeEncoding: true, stripMalicious: true },
        validation: { verifyStructure: true, checkSecurity: true },
        corrections: { fixEncoding: true, repairStructure: true, standardizeFormat: true },
      });
    } else {
      setOptions({
        mode: 'both',
        sanitization: { removeMetadata: true, normalizeEncoding: true, stripMalicious: true },
        validation: { verifyStructure: true, checkSecurity: true },
        corrections: { fixEncoding: true, repairStructure: true, standardizeFormat: true },
      });
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">Processing Options</h2>

      {/* Presets */}
      <div className="flex space-x-4">
        <button onClick={() => setPreset('quick')} className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md">Quick Scan</button>
        <button onClick={() => setPreset('full')} className="px-4 py-2 font-semibold text-white bg-green-500 rounded-md">Full Cleanup</button>
        <button onClick={() => setPreset('deep')} className="px-4 py-2 font-semibold text-white bg-purple-500 rounded-md">Deep Analysis</button>
      </div>

      {/* Mode */}
      <div>
        <h3 className="text-lg font-semibold">Mode</h3>
        <div className="flex space-x-4">
          <label><input type="radio" name="mode" value="analyze" checked={options.mode === 'analyze'} onChange={() => setOptions({ ...options, mode: 'analyze' })} /> Analysis Only</label>
          <label><input type="radio" name="mode" value="correct" checked={options.mode === 'correct'} onChange={() => setOptions({ ...options, mode: 'correct' })} /> Generate Corrected File</label>
          <label><input type="radio" name="mode" value="both" checked={options.mode === 'both'} onChange={() => setOptions({ ...options, mode: 'both' })} /> Both</label>
        </div>
      </div>

      {/* Sanitization */}
      <div>
        <h3 className="text-lg font-semibold">Sanitization</h3>
        <label><input type="checkbox" checked={options.sanitization.removeMetadata} onChange={e => setOptions({ ...options, sanitization: { ...options.sanitization, removeMetadata: e.target.checked } })} /> Remove Metadata</label>
        <label><input type="checkbox" checked={options.sanitization.normalizeEncoding} onChange={e => setOptions({ ...options, sanitization: { ...options.sanitization, normalizeEncoding: e.target.checked } })} /> Normalize Encoding</label>
        <label><input type="checkbox" checked={options.sanitization.stripMalicious} onChange={e => setOptions({ ...options, sanitization: { ...options.sanitization, stripMalicious: e.target.checked } })} /> Strip Malicious Content</label>
      </div>

      {/* Validation */}
      <div>
        <h3 className="text-lg font-semibold">Validation</h3>
        <label><input type="checkbox" checked={options.validation.verifyStructure} onChange={e => setOptions({ ...options, validation: { ...options.validation, verifyStructure: e.target.checked } })} /> Verify Structure</label>
        <label><input type="checkbox" checked={options.validation.checkSecurity} onChange={e => setOptions({ ...options, validation: { ...options.validation, checkSecurity: e.target.checked } })} /> Security Scan</label>
      </div>

      {/* Corrections */}
      <div>
        <h3 className="text-lg font-semibold">Corrections</h3>
        <label><input type="checkbox" checked={options.corrections.fixEncoding} onChange={e => setOptions({ ...options, corrections: { ...options.corrections, fixEncoding: e.target.checked } })} /> Fix Encoding Issues</label>
        <label><input type="checkbox" checked={options.corrections.repairStructure} onChange={e => setOptions({ ...options, corrections: { ...options.corrections, repairStructure: e.target.checked } })} /> Repair Corrupted Structures</label>
        <label><input type="checkbox" checked={options.corrections.standardizeFormat} onChange={e => setOptions({ ...options, corrections: { ...options.corrections, standardizeFormat: e.target.checked } })} /> Standardize Formatting</label>
      </div>
    </div>
  );
}

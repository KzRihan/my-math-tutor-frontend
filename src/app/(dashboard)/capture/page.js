'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MathRenderer from '@/components/chat/MathRenderer';

// Backend API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function CapturePage() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, done, error
  const [ocrResult, setOcrResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [pollingStatus, setPollingStatus] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Helper function to normalize OCR result and ensure blocks are always present
  const normalizeOcrResult = (result) => {
    if (!result) return null;

    // Start with a normalized structure, handling both camelCase and snake_case
    const normalized = {
      blocks: [],
      layoutMarkdown: result.layoutMarkdown || result.layout_markdown || result.markdown || result.latex || result.content || '',
      qualityScore: result.qualityScore || result.quality_score || result.score || 0,
      processingTime: result.processingTime || result.processing_time_ms || result.time || 0,
      imageInfo: result.imageInfo || result.image_info || { width: 0, height: 0, format: '' },
      warnings: result.warnings || [],
    };

    // Try to get blocks from result (check multiple naming conventions)
    const rawBlocks = result.blocks || result.content_blocks || result.contentBlocks || result.res || [];
    if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
      normalized.blocks = rawBlocks.map(block => ({
        type: block.type || (block.latex ? 'formula' : 'text'),
        latex: block.latex || (block.type === 'formula' ? block.content : undefined),
        content: block.content || block.latex || '',
        confidence: block.confidence !== undefined ? block.confidence : 0.9,
        bbox: block.bbox || [0, 0, 0, 0],
      }));
    }
    // If no blocks but we have layoutMarkdown, create a synthetic block from it
    else if (normalized.layoutMarkdown && normalized.layoutMarkdown.trim()) {
      const content = normalized.layoutMarkdown.trim();
      // Check if it looks like LaTeX/math content
      const hasLatex = content.includes('\\') ||
        content.includes('$') ||
        /[×÷∑∏∫√∞±≤≥≠≈]/.test(content);

      normalized.blocks = [{
        type: hasLatex ? 'formula' : 'text',
        latex: hasLatex ? content : undefined,
        content: content,
        confidence: 0.8,
        bbox: [0, 0, 0, 0],
      }];
    }

    console.log('📊 Normalized OCR Result:', normalized);
    return normalized;
  };

  // Get progress stage description
  const getProgressDescription = (progress) => {
    if (progress <= 10) return '🚀 Starting job processing...';
    if (progress <= 20) return '📦 Decoding image...';
    if (progress <= 30) return '📋 Preparing data...';
    if (progress <= 40) return '🔌 Connecting to OCR service...';
    if (progress <= 50) return '📤 Sending image to OCR...';
    if (progress <= 60) return '📥 Receiving OCR response...';
    if (progress <= 70) return '✅ Validating results...';
    if (progress <= 80) return '🔄 Transforming data...';
    if (progress <= 90) return '📝 Finalizing results...';
    return '✨ Almost done!';
  };

  // Poll for job status
  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ocr/job/${jobId}`);
      const data = await response.json();

      console.log('📊 Job Status:', data);

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to get job status');
      }

      const { status, progress: jobProgress, result, error } = data.data;

      // Update progress
      if (jobProgress !== undefined) {
        setProgress(jobProgress);
        // Update polling status with descriptive message
        setPollingStatus(`${getProgressDescription(jobProgress)} (${jobProgress}%)`);
      }

      // Update polling status for UI based on job status
      switch (status) {
        case 'waiting':
          setPollingStatus('⏳ Job queued, waiting for worker...');
          setProgress(5);
          break;
        case 'active':
          // Progress and status already set above
          break;
        case 'completed':
          // Job completed - stop polling and show result
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPollingStatus('🎉 Processing complete!');
          // Normalize the result to ensure consistent structure
          const normalizedResult = normalizeOcrResult(result);
          setOcrResult(normalizedResult);
          setProgress(100);
          setUploadState('done');
          console.log('✅ OCR Complete:', normalizedResult);
          break;
        case 'failed':
          // Job failed - stop polling and show error
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          throw new Error(error || 'OCR processing failed');
      }

    } catch (error) {
      console.error('Polling Error:', error);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setErrorMessage(error.message || 'Failed to process image');
      setUploadState('error');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Process file and call OCR API
  const processFile = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload JPG, PNG, HEIC, or WebP images.');
      setUploadState('error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File too large. Maximum size is 10MB.');
      setUploadState('error');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setJobId(null);
    setPollingStatus('');

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Start upload state
    setUploadState('uploading');
    setProgress(0);

    try {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 100);

      // Create FormData for API call
      const formData = new FormData();
      formData.append('file', file);
      formData.append('strategy', 'pix2tex_only');
      formData.append('language', 'en');

      console.log('📤 Uploading to backend...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Call backend OCR capture API
      const response = await fetch(`${API_BASE_URL}/ocr/capture`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      console.log('📋 Job Created:', data);

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create OCR job');
      }

      // Job created - now poll for status
      const newJobId = data.data.jobId;
      setJobId(newJobId);
      setUploadState('processing');
      setProgress(0);
      setPollingStatus('Job created, starting processing...');

      // Start polling for job status
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(newJobId);
      }, 1500); // Poll every 1.5 seconds

      // Do an immediate first poll
      pollJobStatus(newJobId);

    } catch (error) {
      console.error('OCR API Error:', error);
      setErrorMessage(error.message || 'Failed to process image. Please try again.');
      setUploadState('error');
    }
  };

  // Navigate to solve page with session data
  const handleStartSolving = () => {
    if (!ocrResult) return;

    // Generate a unique session ID
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    const sessionId = `session_${timestamp}_${randomPart}`;

    // Prepare session data
    const sessionData = {
      sessionId,
      jobId: jobId || null,
      fileName: selectedFile?.name || 'uploaded_image',
      strategy: 'formula_only',
      blocks: ocrResult.blocks || [],
      layoutMarkdown: ocrResult.layoutMarkdown || '',
      qualityScore: ocrResult.qualityScore || 0,
      processingTime: ocrResult.processingTime || 0,
      imageInfo: ocrResult.imageInfo || {},
      imageBase64: imagePreview?.split(',')[1] || '', // Remove data:image/xxx;base64, prefix
      topic: 'algebra', // Default topic
    };

    // Store session data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
    }

    console.log('✅ Session created:', sessionId);

    // Navigate to solve page with session ID
    router.push(`/solve?session=${sessionId}`);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle choose file button
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Handle take photo button
  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Reset state
  const reset = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setUploadState('idle');
    setOcrResult(null);
    setProgress(0);
    setSelectedFile(null);
    setImagePreview(null);
    setErrorMessage('');
    setJobId(null);
    setPollingStatus('');
    setIsSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">
          Capture Math Problem 📸
        </h1>
        <p className="text-foreground-secondary">
          Snap or upload a photo of any math problem and we&apos;ll convert it to digital format
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {uploadState === 'idle' && (
            <Card
              className={`border-2 border-dashed transition-all cursor-pointer ${dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                : 'border-[var(--card-border)] hover:border-primary-300'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-4xl mb-6">
                  📷
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload or Drag Image</h3>
                <p className="text-foreground-secondary mb-6 max-w-sm mx-auto">
                  Take a photo of your math problem from homework, textbook, or whiteboard
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleChooseFile}>
                    📁 Choose File
                  </Button>
                  <Button variant="secondary" onClick={handleTakePhoto}>
                    📷 Take Photo
                  </Button>
                </div>
                <p className="text-xs text-foreground-secondary mt-4">
                  Supports JPG, PNG, HEIC, WebP • Max 10MB
                </p>
              </CardContent>
            </Card>
          )}

          {uploadState === 'uploading' && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-3xl mb-4 animate-pulse">
                  ⬆️
                </div>
                <h3 className="text-lg font-semibold mb-4">Uploading Image...</h3>
                <div className="w-full max-w-xs mx-auto">
                  <div className="progress-bar h-3 mb-2">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-foreground-secondary">{progress}%</p>
                </div>
              </CardContent>
            </Card>
          )}

          {uploadState === 'processing' && (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-3xl mb-4">
                  <span className="animate-spin">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Processing Image...</h3>

                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto mt-6">
                  <div className="flex justify-between text-xs text-foreground-secondary mb-2">
                    <span>Progress</span>
                    <span className="font-semibold text-primary-500">{progress}%</span>
                  </div>
                  <div className="progress-bar h-3 mb-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="progress-bar-fill h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Progress Steps */}
                  <div className="flex justify-between mt-4 mb-4">
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all ${progress >= step
                          ? 'bg-primary-500 scale-125'
                          : 'bg-neutral-300 dark:bg-neutral-600'
                          }`}
                        title={`${step}%`}
                      />
                    ))}
                  </div>
                </div>

                {/* Current Status */}
                {pollingStatus && (
                  <div className="mt-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800">
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {pollingStatus}
                    </p>
                  </div>
                )}

                {/* Job ID */}
                {jobId && (
                  <p className="text-xs text-foreground-secondary mt-4 font-mono opacity-60">
                    Job: {jobId}
                  </p>
                )}

                {/* Loading dots */}
                <div className="flex justify-center gap-1 mt-4">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </CardContent>
            </Card>
          )}

          {uploadState === 'done' && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-3xl mb-4">
                  ✓
                </div>
                <h3 className="text-lg font-semibold mb-2 text-green-600">
                  Successfully Processed!
                </h3>
                <p className="text-foreground-secondary text-sm mb-2">
                  Your math problem has been converted to digital format
                </p>
                {ocrResult?.processingTime && (
                  <p className="text-xs text-foreground-secondary mb-6">
                    Processed in {ocrResult.processingTime}ms
                  </p>
                )}
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleStartSolving}
                    className="min-w-[140px]"
                  >
                    Start Solving →
                  </Button>
                  <Button variant="secondary" onClick={reset}>
                    Upload Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {uploadState === 'error' && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl mb-4">
                  ❌
                </div>
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  Processing Failed
                </h3>
                <p className="text-foreground-secondary text-sm mb-6">
                  {errorMessage}
                </p>
                <Button onClick={reset}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Image Preview (when uploading/processing/done) */}
          {imagePreview && uploadState !== 'idle' && (
            <Card>
              <CardContent>
                <h3 className="font-semibold mb-3">📷 Uploaded Image</h3>
                <div className="relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={imagePreview}
                    alt="Uploaded math problem"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
                {ocrResult?.imageInfo && (
                  <p className="text-xs text-foreground-secondary mt-2">
                    {ocrResult.imageInfo.width} × {ocrResult.imageInfo.height} • {ocrResult.imageInfo.format}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card variant="glass">
            <CardContent>
              <h3 className="font-semibold mb-3">📝 Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Write clearly with good contrast
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Ensure good lighting, avoid shadows
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Focus on the math problem area
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Avoid blurry or cropped images
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Detected Content</h3>
                {ocrResult && (
                  <span className="text-xs text-green-500 font-medium">✓ Results Available</span>
                )}
              </div>

              {!ocrResult ? (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-4 opacity-30">🔍</div>
                  <p className="text-foreground-secondary">
                    Upload an image to see the detected content
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Processing Info */}
                  {ocrResult.processingTime > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Processed in {ocrResult.processingTime}ms
                      </span>
                    </div>
                  )}

                  {/* Quality Score */}
                  {ocrResult.qualityScore > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <span className="text-sm font-medium">Quality Score:</span>
                      <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ocrResult.qualityScore >= 0.8 ? 'bg-green-500' :
                            ocrResult.qualityScore >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${ocrResult.qualityScore * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground-secondary">
                        {Math.round(ocrResult.qualityScore * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Image Info */}
                  {ocrResult.imageInfo && ocrResult.imageInfo.width > 0 && (
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <span className="text-sm text-foreground-secondary">
                        📐 Image: {ocrResult.imageInfo.width} × {ocrResult.imageInfo.height} ({ocrResult.imageInfo.format})
                      </span>
                    </div>
                  )}

                  {/* Warnings */}
                  {ocrResult.warnings && ocrResult.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ {ocrResult.warnings.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Detected Blocks */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground-secondary mb-3">
                      Detected Blocks ({ocrResult.blocks?.length || 0})
                    </h4>
                    {ocrResult.blocks && ocrResult.blocks.length > 0 ? (
                      <div className="space-y-3">
                        {ocrResult.blocks.map((block, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-lg ${block.type === 'formula'
                              ? 'bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800'
                              : 'bg-neutral-50 dark:bg-neutral-800'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${block.type === 'formula'
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                                }`}>
                                {block.type === 'formula' ? '🧮 Formula' : '📝 Text'}
                              </span>
                              <span className="text-xs text-foreground-secondary">
                                {Math.round((block.confidence || 0) * 100)}% confidence
                              </span>
                            </div>
                            {block.type === 'formula' && block.latex ? (
                              <div className="py-2 overflow-x-auto">
                                <MathRenderer latex={block.latex} display />
                              </div>
                            ) : (
                              <p className="text-foreground">{block.content || block.latex || 'No content'}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-center">
                        <p className="text-foreground-secondary">No content blocks detected</p>
                      </div>
                    )}
                  </div>

                  {/* Full Markdown Preview */}
                  {ocrResult.layoutMarkdown && (
                    <div className="mt-6 p-4 bg-neutral-900 rounded-lg text-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-neutral-400">Generated LaTeX:</p>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(ocrResult.layoutMarkdown);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (err) {
                              console.error('Failed to copy:', err);
                            }
                          }}
                          className={`text-xs transition-colors ${copied ? 'text-green-400' : 'text-primary-400 hover:text-primary-300'}`}
                        >
                          {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                      <pre className="text-sm whitespace-pre-wrap font-mono break-all">
                        {ocrResult.layoutMarkdown}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


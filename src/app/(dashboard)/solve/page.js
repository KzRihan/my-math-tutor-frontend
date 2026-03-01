'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import MathRenderer, { MathText } from '@/components/chat/MathRenderer';
import { getInitials } from '@/lib/utils';
import { IoIosArrowForward } from "react-icons/io";
import { RiLightbulbLine } from "react-icons/ri";
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '@/store/userApi';
import {
  FaRobot,
  FaLightbulb,
  FaCheckCircle,
  FaHandPaper,
  FaExclamationTriangle,
  FaCamera,
  FaBook,
  FaHashtag,
} from 'react-icons/fa';


// Backend API Base URL for streaming chat
const STREAM_API_URL = process.env.NEXT_PUBLIC_STREAM_API_URL || 'http://192.168.0.125:8502';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8001';

function SolvePageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const reduxUser = useSelector((state) => state.auth.user);
  const { data: userData } = useGetMeQuery();
  const user = userData?.data || reduxUser;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  // Generate a unique agent session ID on the frontend
  const [agentSessionId] = useState(() => {
    // Generate a unique session ID using timestamp + random string
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `session_${timestamp}_${randomPart}`;
  });
  const [gradeLevel, setGradeLevel] = useState('primary'); // Default grade level
  const messagesEndRef = useRef(null);
  const controllerRef = useRef(null); // For aborting streaming requests
  const messageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createMessageId = () => {
    messageIdRef.current += 1;
    return `msg-${Date.now()}-${messageIdRef.current}`;
  };

  const getUserProfileImageUrl = () => {
    if (user?.profileImage) {
      if (user.profileImage.startsWith('http')) return user.profileImage;
      return `${SERVER_BASE_URL}${user.profileImage}`;
    }
    return null;
  };

  const userProfileImageUrl = getUserProfileImageUrl();

  // Get auth headers
  const getAuthHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  };

  // Smart Spacing Heuristic:
  // Decides whether to insert a space between two chunks of text.
  // Goal: Add spaces between words ("Hello" "World" -> "Hello World")
  //       BUT keep LaTeX commands together and preserve LaTeX blocks
  const shouldAddSpace = (prev, next) => {
    if (!prev || !next) return false;

    // 0. Check if we're inside a LaTeX block (between $...$ or $$...$$)
    // Count unpaired $ signs - if odd, we're inside a LaTeX block
    const dollarCount = (prev.match(/\$/g) || []).length;
    if (dollarCount % 2 === 1) {
      // We're inside a LaTeX block - don't add spaces
      return false;
    }

    // Also check for $$ blocks
    const doubleDollarCount = (prev.match(/\$\$/g) || []).length;
    if (doubleDollarCount % 2 === 1) {
      // We're inside a $$ block - don't add spaces
      return false;
    }

    // 1. Don't add space if previous chunk ends with '\' (start of command)
    if (prev.endsWith('\\')) return false;

    // 2. Don't add space if we are in the middle of a command
    //    (prev ends with '\' + letters, next starts with letters)
    //    e.g. "\te" + "xt" -> "\text"
    //    BUT exception: if the command so far is a known 'standalone' like \cdot, allow space.
    const standaloneCommands = [
      'cdot', 'times', 'pi', 'theta', 'alpha', 'beta', 'gamma', 'sigma', 'omega', 'phi', 'psi', 'rho', 'mu', 'nu', 'lambda', 'tau', 'epsilon', 'eta', 'zeta', 'delta', 'chi', 'xi', 'kappa', 'iota', 'upsilon', 'omicron',
      'sub', 'sup', 'int', 'sum', 'prod', 'lim', 'infty', 'pm', 'mp', 'neq', 'leq', 'geq', 'approx', 'sim', 'cong', 'equiv', 'propto', 'mnplus', 'cup', 'cap', 'subset', 'supset', 'in', 'notin', 'forall', 'exists',
      'partial', 'nabla', 'angle', 'perp', 'parallel', 'triangle', 'square', 'diamond', 'lozenge', 'top', 'bot', 'vdash', 'dashv',
      'sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'exp', 'det', 'dim', 'ker', 'deg', 'gcd', 'min', 'max', 'sup', 'inf', 'lim', 'liminf', 'limsup', 'mod', 'div', 'quad', 'qquad'
    ];

    const match = prev.match(/\\([a-zA-Z]+)$/);
    if (match && /^[a-zA-Z]/.test(next)) {
      const cmd = match[1];
      if (!standaloneCommands.includes(cmd)) {
        return false; // Glue it (e.g. \te + xt -> \text)
      }
      // If it IS a standalone command (e.g. \cdot), we fall through to "Add Space" (return true)
    }

    // 3. Don't add space if next chunk starts with $ (beginning of LaTeX)
    if (next.startsWith('$')) return false;

    // 4. Don't add space if prev chunk ends with $ (end of LaTeX, next should be regular text)
    // Actually, if prev ends with $, we should add space before next text
    // So this case is handled by the default return true

    // 5. Don't add space if next chunk is punctuation
    if (/^[.,!?:;)'"]/.test(next)) return false;

    // 6. Don't add space if prev chunk is opening punctuation
    if (/['"(]$/.test(prev)) return false;

    // Default: Add a space
    return true;
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch session data and call streaming API with problem
  useEffect(() => {
    const fetchSessionAndStartChat = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        console.log('[session] Fetching session:', sessionId);

        // Check localStorage first
        let sessionData = null;
        if (typeof window !== 'undefined') {
          const storedSession = localStorage.getItem(`session_${sessionId}`);
          if (storedSession) {
            try {
              sessionData = JSON.parse(storedSession);
              console.log('[session] Loaded from localStorage:', sessionData);
            } catch (e) {
              console.error('Error parsing stored session:', e);
            }
          }
        }

        // If not in localStorage, try API
        if (!sessionData) {
          const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error?.message || 'Failed to fetch session');
          }

          sessionData = data.data;
          console.log('[session] Loaded from API:', sessionData);
        }

        setSession(sessionData);

        // Extract grade level from user profile if available
        const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.gradeLevel) {
              setGradeLevel(user.gradeLevel);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }

        // Get current problem/question from session
        const getProblemQuestion = () => {
          const blocks = sessionData.blocks || [];

          // Try to get LaTeX from formula blocks
          const formulaBlock = blocks.find(b => b.type === 'formula' && b.latex);
          if (formulaBlock && formulaBlock.latex) {
            return formulaBlock.latex;
          }

          // Try to get text from text blocks
          const textBlock = blocks.find(b => b.type === 'text' && b.content);
          if (textBlock && textBlock.content) {
            return textBlock.content;
          }

          // Fallback to layoutMarkdown
          return sessionData.layoutMarkdown || 'Help me solve this problem';
        };

        const problemQuestion = getProblemQuestion();

        if (!problemQuestion) {
          throw new Error('No problem data found in session');
        }

        // Call streaming API with the problem/question
        console.log('[chat] Using agent session ID:', agentSessionId);
        console.log('[chat] Sending problem:', problemQuestion);
        console.log('[chat] Stream API URL:', `${STREAM_API_URL}/chat`);

        setIsTyping(true);
        controllerRef.current = new AbortController();

        // Create assistant message ID but don't create placeholder yet
        // We'll create it when we receive the first chunk of data
        const assistantMessageId = createMessageId();
        let messageCreated = false;

        const requestBody = {
          session_id: agentSessionId,
          student_message: problemQuestion,
          stream: true
        };

        console.log('[chat] Request body:', JSON.stringify(requestBody, null, 2));

        let streamResponse;
        try {
          streamResponse = await fetch(`${STREAM_API_URL}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controllerRef.current.signal
          });
        } catch (fetchError) {
          console.error('[chat] Fetch error details:', fetchError);
          if (fetchError.name === 'AbortError') {
            throw new Error('Request was aborted');
          }
          throw new Error(`Network error: ${fetchError.message}. Please check if the streaming API server is running at ${STREAM_API_URL}`);
        }

        if (!streamResponse.ok) {
          const errorText = await streamResponse.text().catch(() => 'Unknown error');
          console.error('[chat] Response error:', streamResponse.status, errorText);
          throw new Error(`HTTP error! status: ${streamResponse.status}, message: ${errorText}`);
        }

        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder('utf-8');

        // Use ref to track current RAW text to avoid corruption by heuristic
        let rawTextAccumulator = '';
        let buffer = '';

        const updateMessage = (newText) => {
          // Only create message when we have actual content
          if (!newText || !newText.trim()) return;

          // No longer using textRef here as we pass the full text each time

          // Create message on first update if not created yet
          if (!messageCreated) {
            messageCreated = true;
            setIsTyping(false); // Hide "Thinking..." indicator when message is created
            setMessages(prev => [...prev, {
              id: assistantMessageId,
              role: 'teacher',
              message: newText,
              type: 'teaching',
              timestamp: new Date().toISOString()
            }]);
            return;
          }

          // Update existing message
          setMessages(prev => {
            const updated = [...prev];
            const assistantIndex = updated.findIndex(msg => msg.id === assistantMessageId);
            if (assistantIndex !== -1) {
              updated[assistantIndex] = {
                ...updated[assistantIndex],
                message: newText
              };
            }
            return updated;
          });
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          console.log("chunk", chunk);

          buffer += chunk;

          const lines = buffer.split('\n');
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue; // Skip empty lines

            if (!line.startsWith('data:')) continue;

            let data = line.replace(/^data:\s*/, ''); // Remove 'data:' prefix but preserve spaces
            if (data.trim() === '[DONE]') {
              setIsTyping(false);
              return;
            }

            // Try to parse as JSON, if it fails, use as plain text
            try {
              const parsed = JSON.parse(data);
              // If it's a JSON object with text/content field, extract it
              if (parsed.text) {
                data = parsed.text;
              } else if (parsed.content) {
                data = parsed.content;
              } else if (parsed.message) {
                data = parsed.message;
              } else if (typeof parsed === 'string') {
                data = parsed;
              }
            } catch (e) {
              // Not JSON, use as-is (preserve spaces)
            }

            // Append raw data directly
            // Smart spacing: Only add space if heuristic says so
            if (shouldAddSpace(rawTextAccumulator, data)) {
              rawTextAccumulator += ' ' + data;
            } else {
              rawTextAccumulator += data;
            }

            updateMessage(rawTextAccumulator);
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          if (buffer.startsWith('data:')) {
            let data = buffer.replace(/^data:\s*/, '');
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) data = parsed.text;
              else if (parsed.content) data = parsed.content;
              else if (parsed.message) data = parsed.message;
              else if (typeof parsed === 'string') data = parsed;
            } catch (e) {
              // Not JSON, use as-is
            }
            // Append raw data directly
            // Smart spacing: Only add space if heuristic says so
            if (shouldAddSpace(rawTextAccumulator, data)) {
              rawTextAccumulator += ' ' + data;
            } else {
              rawTextAccumulator += data;
            }

            updateMessage(rawTextAccumulator);
          }
        }

        setIsTyping(false);

      } catch (err) {
        console.error('Error fetching session or starting chat:', err);
        setError(err.message);
        setIsTyping(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndStartChat();
  }, [sessionId, agentSessionId]);

  // If /solve is opened directly, allow immediate typed chat without capture.
  useEffect(() => {
    if (!loading && !sessionId && messages.length === 0) {
      setMessages([
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'teacher',
          message: 'Hi! You can type any math question here. Capturing a problem is optional.',
          type: 'welcome',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [loading, sessionId, messages.length]);

  // Stop streaming
  const stopStream = () => {
    controllerRef.current?.abort();
    setIsTyping(false);
  };

  // Send message with streaming
  const sendMessage = async (messageText, messageType = 'teaching') => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: createMessageId(),
      role: 'student',
      message: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    setInputValue('');
    setIsTyping(true);

    // Create assistant message ID but don't create placeholder yet
    // We'll create it when we receive the first chunk of data
    const assistantMessageId = createMessageId();
    let messageCreated = false;

    // Create abort controller for this request
    controllerRef.current = new AbortController();

    try {
      const requestBody = {
        session_id: agentSessionId,
        student_message: messageText,
        stream: true
      };

      console.log('[chat] Sending message to:', `${STREAM_API_URL}/chat`);
      console.log('[chat] Request body:', JSON.stringify(requestBody, null, 2));

      let response;
      try {
        response = await fetch(`${STREAM_API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controllerRef.current.signal
        });
      } catch (fetchError) {
        console.error('[chat] Fetch error details:', fetchError);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request was aborted');
        }
        throw new Error(`Network error: ${fetchError.message}. Please check if the streaming API server is running at ${STREAM_API_URL}`);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[chat] Response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      // Use variable to track current RAW text to avoid corruption by heuristic
      let rawTextAccumulator = '';
      let buffer = '';

      const updateMessage = (newText) => {
        // Only create message when we have actual content
        if (!newText || !newText.trim()) return;

        // Message updated with full text each time

        // Create message on first update if not created yet
        if (!messageCreated) {
          messageCreated = true;
          setIsTyping(false); // Hide "Thinking..." indicator when message is created
          setMessages(prev => [...prev, {
            id: assistantMessageId,
            role: 'teacher',
            message: newText,
            type: messageType,
            timestamp: new Date().toISOString()
          }]);
          return;
        }

        // Update existing message
        setMessages(prev => {
          const updated = [...prev];
          const assistantIndex = updated.findIndex(msg => msg.id === assistantMessageId);
          if (assistantIndex !== -1) {
            updated[assistantIndex] = {
              ...updated[assistantIndex],
              message: newText
            };
          }
          return updated;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue; // Skip empty lines

          if (!line.startsWith('data:')) continue;

          let data = line.replace(/^data:\s*/, ''); // Remove 'data:' prefix but preserve spaces
          if (data.trim() === '[DONE]') {
            setIsTyping(false);
            return;
          }

          // Try to parse as JSON, if it fails, use as plain text
          try {
            const parsed = JSON.parse(data);
            // If it's a JSON object with text/content field, extract it
            if (parsed.text) {
              data = parsed.text;
            } else if (parsed.content) {
              data = parsed.content;
            } else if (parsed.message) {
              data = parsed.message;
            } else if (typeof parsed === 'string') {
              data = parsed;
            }
          } catch (e) {
            // Not JSON, use as-is (preserve spaces)
            // Log first few chunks to debug space issues
            if (rawTextAccumulator.length < 100) {
              console.log('[chat] Raw data chunk:', JSON.stringify(data));
            }
          }

          // Append raw data directly
          // Smart spacing: Only add space if heuristic says so
          if (shouldAddSpace(rawTextAccumulator, data)) {
            rawTextAccumulator += ' ' + data;
          } else {
            rawTextAccumulator += data;
          }

          updateMessage(rawTextAccumulator);
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        if (buffer.startsWith('data:')) {
          let data = buffer.replace(/^data:\s*/, '');
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) data = parsed.text;
            else if (parsed.content) data = parsed.content;
            else if (parsed.message) data = parsed.message;
            else if (typeof parsed === 'string') data = parsed;
          } catch (e) {
            // Not JSON, use as-is
          }
          // Append raw data directly
          // Smart spacing: Only add space if heuristic says so
          if (shouldAddSpace(rawTextAccumulator, data)) {
            rawTextAccumulator += ' ' + data;
          } else {
            rawTextAccumulator += data;
          }

          updateMessage(rawTextAccumulator);
        }
      }

      setIsTyping(false);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }

      console.error('Error sending message:', error);

      // Remove placeholder and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== assistantMessageId);
        return [...filtered, {
          id: createMessageId(),
          role: 'teacher',
          message: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          type: 'error',
          timestamp: new Date().toISOString()
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue.trim(), 'teaching');
  };

  const handleHint = async () => {
    await sendMessage('I need a hint', 'hint');
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
  };

  const renderMessage = (msg) => {
    const isTeacher = msg.role === 'teacher';

    return (
      <div
        key={msg.id}
        className={`flex gap-4 ${isTeacher ? '' : 'flex-row-reverse'} animate-fade-in`}
      >
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg ${isTeacher
          ? 'bg-gradient-to-br from-violet-500 to-purple-600'
          : 'bg-gradient-to-br from-blue-500 to-cyan-500 relative overflow-hidden'
          }`}>
          {isTeacher ? (
            <FaRobot />
          ) : userProfileImageUrl ? (
            <Image src={userProfileImageUrl} alt="Your profile" fill className="object-cover" />
          ) : (
            getInitials(user?.firstName, user?.lastName)
          )}
        </div>

        {/* Message */}
        <div className={`max-w-[80%] ${isTeacher ? '' : 'text-right'}`}>
          {/* Name and time */}
          <div className={`flex items-center gap-2 mb-1 ${isTeacher ? '' : 'justify-end'}`}>
            <span className="text-sm font-medium text-foreground">{isTeacher ? 'Math Tutor' : 'You'}</span>
            <span className="text-xs text-foreground-secondary">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div
            className={`rounded-2xl px-5 py-4 ${isTeacher ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}
            style={{
              background: isTeacher ? 'var(--card-bg)' : 'var(--gradient-primary)',
              border: isTeacher ? '1px solid var(--card-border)' : 'none',
              color: isTeacher ? 'var(--foreground)' : 'white',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Type indicator */}
            {msg.type === 'hint' && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-3 badge-warning">
                <FaLightbulb /> Hint
              </div>
            )}
            {msg.type === 'success' && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-3 badge-success">
                <FaCheckCircle /> Correct!
              </div>
            )}
            {msg.type === 'welcome' && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-3 badge-primary">
                <FaHandPaper /> Welcome
              </div>
            )}

            {/* Message content */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {renderMessageContent(msg.message)}
            </div>

            {/* LaTeX blocks if present */}
            {msg.latexBlocks && msg.latexBlocks.length > 0 && (
              <div className="mt-4 space-y-3">
                {msg.latexBlocks.map((latex, idx) => (
                  <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                    <MathRenderer latex={latex} display />
                  </div>
                ))}
              </div>
            )}
            {/* Fallback to single latex if no blocks */}
            {!msg.latexBlocks && msg.latex && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <MathRenderer latex={msg.latex} display />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMessageContent = (text) => {
    if (!text) return '';

    // Use MathText component which handles LaTeX properly
    // It splits by $$...$$ (display) and $...$ (inline) correctly
    return <MathText text={text} className="inline" />;
  };

  // Get problem data for display
  const getProblemDisplay = () => {
    if (!session || !session.blocks || session.blocks.length === 0) {
      return {
        text: 'Type your question below, or capture a problem for image-based solving.',
        latex: null,
      };
    }
    const firstFormula = session.blocks.find(b => b.type === 'formula');
    if (firstFormula && firstFormula.latex) {
      return {
        text: 'Solve the following equation:',
        latex: firstFormula.latex,
      };
    }
    const firstText = session.blocks.find(b => b.type === 'text');
    return {
      text: firstText?.content || 'Type your question below, or capture a problem for image-based solving.',
      latex: null,
    };
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="fixed inset-0 lg:ml-64 flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl mb-6 shadow-xl animate-pulse">
            <FaRobot />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Loading Your Session...</h3>
          <p className="text-foreground-secondary">
            Preparing your math problem
          </p>
          <div className="flex justify-center gap-1 mt-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="fixed inset-0 lg:ml-64 flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-4xl mb-6 shadow-xl">
            <FaExclamationTriangle />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Oops! Something went wrong</h3>
          <p className="text-foreground-secondary mb-8">
            {error}
          </p>
          <Link href="/capture">
            <Button size="lg" className="shadow-lg">
              Capture New Problem
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  const problemDisplay = getProblemDisplay();

  return (
    <div
      className="fixed inset-0 lg:ml-64 flex flex-col lg:flex-row h-screen overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Problem Sidebar (Desktop) */}
      <div
        className="hidden lg:flex lg:flex-col w-96 h-full overflow-hidden"
        style={{
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--card-border)',
        }}
      >
        <div 
          className="flex-1 overflow-y-auto min-h-0"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {/* Header */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
                <FaBook />
              </div>
              <div>
                <h2 className="font-bold text-foreground">{session ? 'Current Problem' : 'AI Tutor'}</h2>
                <p className="text-xs text-foreground-secondary">
                  {session ? `Step ${currentStep} of 5` : 'No capture required'}
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            {session && (
              <div className="mt-4 progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Problem Card */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <p className="text-sm text-foreground-secondary mb-3">{problemDisplay.text}</p>
              {problemDisplay.latex && (
                <div className="p-4 rounded-xl card">
                  <MathRenderer latex={problemDisplay.latex} display />
                </div>
              )}
              {/* Show all blocks if multiple */}
              {session?.blocks && session.blocks.length > 1 && (
                <div className="mt-3 space-y-2">
                  {session.blocks.slice(1).map((block, i) => (
                    <div key={i} className="p-3 rounded-xl card">
                      {block.type === 'formula' && block.latex ? (
                        <MathRenderer latex={block.latex} display />
                      ) : (
                        <p className="text-sm text-foreground">{block.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Preview (if available) */}
            {session?.imageBase64 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaCamera className="text-lg" />
                  <h3 className="font-semibold text-foreground">Original Image</h3>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '2px solid var(--card-border)' }}>
                  <img
                    src={`data:image/jpeg;base64,${session.imageBase64}`}
                    alt="Captured problem"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <Link href="/capture" className="block">
              <Button variant="secondary" className="w-full">
                Scan New Problem
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden"
        style={{ background: 'var(--background-secondary)' }}
      >
        {/* Header - Fixed */}
        <div
          className="flex-shrink-0 px-6 py-4"
          style={{
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                <FaRobot />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">AI Math Tutor</h1>
                <p className="text-sm text-foreground-secondary">
                  Step-by-step problem solving
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full badge-success">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {messages.map(renderMessage)}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
                <FaRobot />
              </div>
              <div>
                <div className="text-sm font-medium mb-1 text-foreground">Math Tutor</div>
                <div
                  className="flex items-center gap-2 px-5 py-4 rounded-2xl rounded-tl-sm"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-foreground-secondary ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length < 3 && (
          <div className="flex-shrink-0 px-6 pb-2">
            <div className="flex flex-wrap gap-2">
              {[
                { icon: FaHashtag, text: 'Identify equation type', action: "I think this is a quadratic equation" },
                { icon: FaBook, text: 'Explain first step', action: "Can you explain the first step?" },
                { icon: FaLightbulb, text: 'Show similar example', action: "Show me a similar example" },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(item.action)}
                  className="px-4 py-2 rounded-full text-sm transition-all hover-lift"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <item.icon />
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Fixed */}
        <div
          className="flex-shrink-0 p-2 sm:p-4 overflow-visible pb-[85px] lg:pb-4"
          style={{
            background: 'var(--card-bg)',
            borderTop: '1px solid var(--card-border)',
            position: 'relative',
            zIndex: 10,
            width: '100%',
          }}
        >
          <div className="flex flex-row gap-2 sm:gap-3 w-full overflow-visible justify-center items-center">
            <div className="flex-1 relative min-w-0" style={{ maxWidth: 'calc(100% - 180px)' }}>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer or ask a question..."
                rows={2}
                className="resize-none rounded-2xl input !p-3 sm:!p-4 w-full"
                disabled={isTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <div 
              className="flex flex-row gap-2 flex-shrink-0 overflow-visible" 
              style={{ minWidth: '160px', maxWidth: '180px' }}
            >
              {isTyping ? (
                <Button
                  onClick={stopStream}
                  variant="secondary"
                  className="px-3 sm:px-6 rounded-xl min-h-[44px] whitespace-nowrap text-sm sm:text-base"
                  style={{ minWidth: '70px', flex: '1' }}
                >
                  Stop
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="px-3 sm:px-4 rounded-xl shadow-lg min-h-[44px] flex items-center justify-center whitespace-nowrap text-sm sm:text-base gap-1"
                    style={{ minWidth: '70px', flex: '1' }}
                  >
                    <span className="hidden lg:inline">Send</span>
                    <IoIosArrowForward 
                      className="lg:ml-1 text-[1.5rem] lg:text-[1.25rem] w-[1.5rem] h-[1.5rem] lg:w-[1.25rem] lg:h-[1.25rem]" 
                    />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleHint}
                    className="px-3 sm:px-6 rounded-xl min-h-[44px] flex items-center justify-center whitespace-nowrap text-sm sm:text-base gap-1"
                    style={{ minWidth: '50px', flex: '1' }}
                  >
                    <RiLightbulbLine 
                      className="text-[1.75rem] lg:text-[1.5rem] w-[1.75rem] h-[1.75rem] lg:w-[1.5rem] lg:h-[1.5rem]"
                    />
                    <span className="hidden lg:inline">Hint</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolvePage() {
  return (
    <Suspense fallback={
      <div
        className="fixed inset-0 lg:ml-64 flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl mb-6 shadow-xl animate-pulse">
            <FaRobot />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Loading...</h3>
        </div>
      </div>
    }>
      <SolvePageContent />
    </Suspense>
  );
}



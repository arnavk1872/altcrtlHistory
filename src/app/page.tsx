'use client';

import { useState, useEffect } from 'react';
import Aurora from './Aurora';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [isRealisticMode, setIsRealisticMode] = useState(true);
  
  const samplePrompts = {
    "Historical": {
      cover: "🏛️",
      hook: "Rewrite the past, reshape the future",
      scenarios: [
        "What if dinosaurs survived?",
        "What if Rome never fell?",
        "What if the internet existed in 1800?",
        "What if the moon landing was fake?",
        "What if electricity was never discovered?",
        "What if the printing press was invented in 2000?",
        "What if the Cold War went hot?",
        "What if the Industrial Revolution happened in 1000 AD?"
      ]
    },
    "Anime & Manga": {
      cover: "⚡",
      hook: "Bend the rules of anime reality",
      scenarios: [
        "What if Madara Uchiha was the first Hokage?",
        "What if Goku never fell to Earth?",
        "What if All Might never got injured?",
        "What if Luffy ate a different Devil Fruit?",
        "What if Naruto was born in the Leaf Village?",
        "What if Ichigo never met Rukia?",
        "What if the Titans never existed in aot?",
        "What if the Hero Association never formed?"
      ]
    },
    "Movies & TV": {
      cover: "🎬",
      hook: "Reimagine your favorite stories",
      scenarios: [
        "What if the Avengers never formed?",
        "What if Harry Potter was sorted into Slytherin?",
        "What if the Matrix was real?",
        "What if Luke Skywalker joined the Dark Side?",
        "What if Frodo never left the Shire?",
        "What if Tony Stark never built the suit?",
        "What if the TARDIS never found the Doctor?",
        "What if Walter White never cooked meth?"
      ]
    },
    "Sci-fi & Fantasy": {
      cover: "🚀",
      hook: "Explore impossible possibilities",
      scenarios: [
        "What if time travel was discovered in 1950?",
        "What if humans evolved underwater?",
        "What if magic was real in medieval times?",
        "What if aliens made first contact in 1969?",
        "What if the world was ruled by AI in 2020?",
        "What if dragons existed in modern times?",
        "What if teleportation was invented?",
        "What if parallel universes were accessible?"
      ]
    }
  };
  
  const refusalMessages = [
    "History is unionized. You've exceeded today's quota.",
    "The time machine ran out of AA batteries.",
    "Timeline closed. Please consult another dimension.",
    "That's it, buddy. Go touch grass."
  ];
  
  const [currentRefusalMessage, setCurrentRefusalMessage] = useState(1); // Set to index 1 (second message)
  
  useEffect(() => {
    // Check localStorage on component mount
    const submitted = localStorage.getItem('altctrlhistory_submitted');
    if (submitted === 'true') {
      setHasSubmitted(true);
    }
  }, []);
  
  const handleChipClick = (prompt: string) => {
    if (!hasSubmitted && !isLoading) {
      setInputValue(prompt);
    }
  };

  const handleRandomTimeline = () => {
    if (!hasSubmitted && !isLoading) {
      const categories = Object.keys(samplePrompts);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const categoryData = samplePrompts[randomCategory as keyof typeof samplePrompts];
      const randomScenario = categoryData.scenarios[Math.floor(Math.random() * categoryData.scenarios.length)];
      setInputValue(randomScenario);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !hasSubmitted && !isLoading) {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            input: inputValue,
            mode: isRealisticMode ? 'realistic' : 'chaotic'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate response');
        }
        
        const data = await response.json();
        setAiResponse(data.response);
        
        // Only mark as submitted if this was a real alternate history response
        if (data.countsAsSubmission) {
          setHasSubmitted(true);
          localStorage.setItem('altctrlhistory_submitted', 'true');
        }
        
      } catch (err) {
        setError('Failed to generate response. Please try again.');
        console.error('Submission error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSubmitted && !isLoading) {
      setInputValue(e.target.value);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !hasSubmitted && !isLoading) {
      handleSubmit(e as any);
    }
  };

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-purple-900/20 to-black/50 pointer-events-none z-10"></div>
      
      {/* Mode Toggle */}
      <div className="absolute top-8 right-8 flex items-center space-x-3 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/20 z-20">
        <div className="relative">
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setIsRealisticMode(true)}
              disabled={hasSubmitted || isLoading}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 ${
                isRealisticMode 
                  ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/30' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title="Generate historically plausible alternate timelines with realistic consequences and social impacts"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Realistic</span>
              </div>
            </button>
            <button
              onClick={() => setIsRealisticMode(false)}
              disabled={hasSubmitted || isLoading}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 ${
                !isRealisticMode 
                  ? 'text-white bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title="Generate wild, absurd alternate timelines with chaotic butterfly effects and over-the-top consequences"
            >
              <div className="flex items-center space-x-2">
                <span>Chaotic</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </button>
          </div>
          {/* Animated background */}
          <div className={`absolute inset-0 rounded-lg transition-all duration-500 ${
            isRealisticMode 
              ? 'bg-gradient-to-r from-green-600/20 to-green-500/20' 
              : 'bg-gradient-to-r from-purple-600/20 to-purple-500/20'
          } blur-xl -z-10`}></div>
        </div>
      </div>
      
      {/* Main Heading */}
      <h1 className="text-6xl font-bold mb-4 text-center relative z-10 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
        altCtrlHistory
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl text-purple-300 mb-8 text-center relative z-10">
        Change one thing, break everything.
      </p>

      {/* Primary CTA */}
      <div className="mb-12 relative z-10">
        <button
          onClick={handleRandomTimeline}
          disabled={hasSubmitted || isLoading}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold text-lg rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 disabled:shadow-gray-500/20 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative flex items-center space-x-3 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span>Roll a Timeline</span>
          </div>
        </button>
      </div>
      
      {/* Search/Command Bar */}
      <div className="w-full max-w-2xl mb-6 relative z-10">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a what-if..."
            disabled={isLoading || hasSubmitted}
            className="w-full px-6 py-4 pr-20 bg-gray-900/80 backdrop-blur-sm text-white rounded-xl border border-purple-500/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-200 placeholder-gray-400 shadow-lg shadow-purple-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || hasSubmitted}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-purple-500/30"
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
        
        {/* Search Suggestions */}
        {inputValue.length > 0 && !hasSubmitted && !isLoading && (
          <div className="mt-3 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/20 overflow-hidden">
            <div className="p-3 border-b border-purple-500/20">
              <span className="text-sm text-purple-300 font-medium">Quick suggestions:</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {Object.entries(samplePrompts).flatMap(([category, data]) => 
                data.scenarios
                  .filter(scenario => 
                    scenario.toLowerCase().includes(inputValue.toLowerCase())
                  )
                  .slice(0, 3)
                  .map((scenario, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => handleChipClick(scenario)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-purple-600/20 transition-colors duration-200 border-b border-purple-500/10 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-sm">{scenario}</span>
                        <span className="text-xs text-purple-400 ml-auto">{category}</span>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Centered Input Box or Refusal Message */}
      <div className="w-full max-w-2xl mb-8 relative z-10">
        {hasSubmitted && (
          <div className="w-full px-6 py-4 bg-gray-900/80 backdrop-blur-sm text-gray-300 rounded-xl border border-purple-500/50 text-center shadow-lg shadow-purple-500/20 animate-pulse">
            <svg className="inline-block w-6 h-6 mr-2 text-yellow-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {refusalMessages[currentRefusalMessage]}
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="w-full max-w-2xl mb-8 text-center relative z-10">
          <div className="px-6 py-4 bg-purple-900/50 backdrop-blur-sm text-purple-200 rounded-xl border border-purple-400/50 shadow-lg shadow-purple-400/20">
            <svg className="inline-block w-6 h-6 mr-2 text-purple-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recalculating timelines…
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="w-full max-w-2xl mb-8 text-center relative z-10">
          <div className="px-6 py-4 bg-red-900/50 backdrop-blur-sm text-red-200 rounded-xl border border-red-400/50 shadow-lg shadow-red-400/20">
            {error}
          </div>
        </div>
      )}
      
      {/* AI Response */}
      {aiResponse && (
        <div className="w-full max-w-4xl mb-8 relative z-10">
          <div className="px-8 py-6 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm text-white rounded-2xl border border-purple-400/50 shadow-2xl shadow-purple-400/30 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-lg text-purple-200">
                <svg className="w-6 h-6 mr-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Alternate Timeline Generated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-300">Timeline Active</span>
              </div>
            </div>

            {/* Timeline Visualization */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-blue-400 to-purple-400"></div>
              
              {/* Timeline Content */}
              <div className="space-y-6 ml-8">
                {aiResponse.split('.').filter(sentence => sentence.trim().length > 10).map((sentence, index) => (
                  <div key={index} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-12 top-2 w-4 h-4 bg-purple-400 rounded-full border-4 border-purple-900 shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                    
                    {/* Content Card */}
                    <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 transform hover:-translate-y-1">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white leading-relaxed">
                            {sentence.trim()}
                            {!sentence.endsWith('.') && '.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-purple-500/30">
              <div className="flex items-center justify-between text-sm text-purple-300">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Butterfly Effect: {aiResponse.split('.').filter(s => s.trim().length > 10).length} cascading changes
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Probability: {isRealisticMode ? 'High' : 'Low'} plausibility
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-purple-400 mb-1">Generated in {isRealisticMode ? 'Realistic' : 'Chaotic'} Mode</div>
                  <div className="text-xs text-purple-500">Timeline ID: {Date.now().toString(36)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Tiles Grid */}
      
          
    </main>
  );
}

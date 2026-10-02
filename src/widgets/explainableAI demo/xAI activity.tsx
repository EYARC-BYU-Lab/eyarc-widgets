import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Info, ArrowRight } from 'lucide-react';

const XAIDemoWidget = () => {
  const [selectedExample, setSelectedExample] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  
  const examples = [
    {
      id: "1",
      prompt: "Recommend a vacation destination for a couple who loves hiking and wants warm weather in December.",
      scenario: "Travel Recommendation",
      standardAI: "Recommended destination: Costa Rica.",
      xaiResponse: {
        conclusion: "Recommended destination: Costa Rica.",
        confidence: "Confidence Level: 90%",
        analysis: [
          {
            step: "Climate Match",
            detail: "Average December temperatures of 75-82°F align with the warm-weather request"
          },
          {
            step: "Activity Match",
            detail: "Extensive trail network across six national parks suits the hiking preference"
          },
          {
            step: "Seasonal Pricing",
            detail: "December falls in the shoulder season, with rates roughly 20% below peak"
          },
          {
            step: "Travel Safety",
            detail: "Currently has no active travel advisories or health notices"
          }
        ]
      }
    },
    {
      id: "2",
      prompt: "Determine whether this email is a phishing attempt.",
      scenario: "Phishing Detection",
      standardAI: "This email is likely a phishing attempt. Do not click any links.",
      xaiResponse: {
        conclusion: "This email is likely a phishing attempt. Do not click any links.",
        confidence: "Confidence Level: 96%",
        analysis: [
          {
            step: "Sender Domain Check",
            detail: "Domain closely mimics a known retailer but isn't an exact match"
          },
          {
            step: "Urgency Language",
            detail: "Uses high-pressure phrasing like \"verify immediately or lose access\""
          },
          {
            step: "Link Inspection",
            detail: "Button text shows one address but links to an unrelated URL"
          },
          {
            step: "Formatting Pattern",
            detail: "Layout differs from the sender's past verified emails in several ways"
          }
        ]
      }
    },
    {
      id: "3",
      prompt: "Evaluate this candidate's resume for a Marketing Manager role.",
      scenario: "Candidate Screening",
      standardAI: "Candidate recommended for interview.",
      xaiResponse: {
        conclusion: "Candidate recommended for interview.",
        confidence: "Confidence Level: 89%",
        analysis: [
          {
            step: "Experience Match",
            detail: "6 years of relevant campaign experience, above the 4-year minimum"
          },
          {
            step: "Skill Alignment",
            detail: "Resume lists 8 of the 10 skills mentioned in the job posting"
          },
          {
            step: "Achievement Evidence",
            detail: "Past roles show quantified results, like growing an email list 40%"
          },
          {
            step: "Career Trajectory",
            detail: "Steady growth in scope and title across the last three positions"
          }
        ]
      }
    }
  ];

  const handleExampleSelect = (value) => {
    const example = examples.find(ex => ex.id === value);
    setSelectedExample(example);
    setShowSteps(false);
    setTimeout(() => setShowSteps(true), 100);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <div className="font-medium text-lg">Select a prompt to analyze:</div>
        <Select onValueChange={handleExampleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a prompt..." />
          </SelectTrigger>
          <SelectContent>
            {examples.map((example) => (
              <SelectItem key={example.id} value={example.id}>
                {example.prompt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedExample && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Standard AI Output
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                {selectedExample.standardAI}
              </div>
              
              <div className="text-sm text-gray-500">
                The standard AI provides only the final conclusion without explaining its reasoning process.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Explainable AI Output
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="font-medium">
                  {selectedExample.xaiResponse.conclusion}
                </div>
                
                <div className="text-sm text-blue-600">
                  {selectedExample.xaiResponse.confidence}
                </div>

                {showSteps && (
                  <div className="space-y-3 pt-2">
                    <div className="font-medium text-sm">Analysis Process:</div>
                    {selectedExample.xaiResponse.analysis.map((step, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-2"
                        style={{
                          animation: `fadeIn 0.5s ease-out ${idx * 0.2}s forwards`,
                          opacity: 0
                        }}
                      >
                        <div className="mt-1">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{step.step}</div>
                          <div className="text-sm text-gray-600">{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500">
                The explainable AI provides a complete analysis showing how it arrived at its conclusion, including confidence levels and specific supporting evidence.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedExample && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select a prompt above to see the comparison between standard AI and explainable AI responses.
          </AlertDescription>
        </Alert>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default XAIDemoWidget;
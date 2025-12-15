/**
 * QuizResultPage Component
 * Displays score, percentage, time taken, correct/incorrect breakdown
 * Shows answer review with explanations
 * Requirements: 4.3, 5.6
 */

import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import { Header } from '@/shared/layouts';
import { Breadcrumb, ResponsiveContainer, MarkdownRenderer } from '@/shared/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Target,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useQuiz } from '../hooks/useQuiz';
import { useQuizResults } from '../hooks/useQuizResults';
import type { QuizResult, UserAnswer } from '../types';
import { useLanguage } from '@/shared/contexts/language-hooks';
import { getLocalizedValue } from '@/shared/utils/localization';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

/**
 * Confetti component for celebration effect
 * Enhanced for perfect scores with more pieces and golden colors
 */
function Confetti({ isPerfect = false }: { isPerfect?: boolean }) {
  const normalColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const perfectColors = ['#FFD700', '#FFC107', '#FFEB3B', '#FFE082', '#FFF59D', '#FFFFFF'];
  const colors = isPerfect ? perfectColors : normalColors;
  const pieceCount = isPerfect ? 100 : 50;
  
  const pieces = Array.from({ length: pieceCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: `${(isPerfect ? 10 : 8) + Math.random() * (isPerfect ? 12 : 8)}px`,
  }));

  return (
    <div className="quiz-confetti">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="quiz-confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            boxShadow: isPerfect ? `0 0 6px ${piece.color}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Format time in seconds to a readable string
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Get score grade based on percentage
 */
function getGrade(percentage: number): { grade: string; color: string; message: string } {
  if (percentage >= 90) {
    return { grade: 'A+', color: 'text-green-500', message: 'Excellent!' };
  }
  if (percentage >= 80) {
    return { grade: 'A', color: 'text-green-500', message: 'Great job!' };
  }
  if (percentage >= 70) {
    return { grade: 'B', color: 'text-blue-500', message: 'Good work!' };
  }
  if (percentage >= 60) {
    return { grade: 'C', color: 'text-yellow-500', message: 'Not bad!' };
  }
  if (percentage >= 50) {
    return { grade: 'D', color: 'text-orange-500', message: 'Keep practicing!' };
  }
  return { grade: 'F', color: 'text-destructive', message: 'Try again!' };
}

const QuizResultPage = () => {
  const { unique_key } = useParams<{ unique_key: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  // Get result from navigation state or load from storage
  const passedResult = location.state?.result as QuizResult | undefined;
  const { quiz, questions, isLoading: quizLoading } = useQuiz(unique_key);
  const { results } = useQuizResults({ quizId: unique_key });

  // Use passed result or most recent result
  const result = passedResult || (results.length > 0 ? results[0] : null);

  // State for celebration effect
  const [showConfetti, setShowConfetti] = useState(false);
  const [showScoreReveal, setShowScoreReveal] = useState(false);

  // Set document title
  const quizName = quiz ? getLocalizedValue(quiz.name, currentLanguage) : '';
  useDocumentTitle(
    result
      ? `${t('quiz.results') || 'Results'}: ${quizName}`
      : t('quiz.results') || 'Quiz Results'
  );

  // Calculate grade
  const grade = result ? getGrade(result.percentage) : null;

  // Check for perfect score and high score
  const isPerfectScore = result && result.percentage === 100;
  const isHighScore = result && result.percentage >= 80;

  // Map answers to questions for review (moved up to be used by wrongAnswers)
  const answerReview = useMemo(() => {
    if (!result || !questions.length) return [];

    return result.answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      return {
        answer,
        question,
      };
    });
  }, [result, questions]);

  // Get wrong answers for review
  const wrongAnswers = useMemo(() => {
    if (!result) return [];
    return answerReview.filter(({ answer }) => !answer.isCorrect);
  }, [result, answerReview]);

  // State for filtering to wrong answers only
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  // Filtered answers based on toggle
  const displayedAnswers = showOnlyWrong ? wrongAnswers : answerReview;

  useEffect(() => {
    if (result) {
      // Trigger score reveal animation
      setShowScoreReveal(true);

      // Show confetti for high scores (80%+) or perfect scores
      if (isHighScore || isPerfectScore) {
        setShowConfetti(true);
        // Hide confetti after animation (longer for perfect scores)
        const timer = setTimeout(() => setShowConfetti(false), isPerfectScore ? 6000 : 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [result, isHighScore, isPerfectScore]);

  // Loading state
  if (quizLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="py-6 sm:py-8" tabIndex={-1}>
          <ResponsiveContainer>
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                {t('quiz.loading') || 'Loading results...'}
              </p>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    );
  }

  // No result found
  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="py-6 sm:py-8" tabIndex={-1}>
          <ResponsiveContainer>
            <Breadcrumb
              items={[
                { label: t('nav.quizzes') || 'Quizzes', href: '/quizzes' },
                { label: t('quiz.results') || 'Results' },
              ]}
            />
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {t('quiz.noResults') || 'No Results Found'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('quiz.noResultsMessage') ||
                  "You haven't completed this quiz yet."}
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/quizzes">
                  <Button variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    {t('quiz.backToQuizzes') || 'Back to Quizzes'}
                  </Button>
                </Link>
                {quiz && (
                  <Link to={`/quizzes/${unique_key}/take`}>
                    <Button>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {t('quiz.takeQuiz') || 'Take Quiz'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Confetti celebration effect */}
      {showConfetti && <Confetti isPerfect={isPerfectScore} />}

      <main id="main-content" className="py-6 sm:py-8" tabIndex={-1}>
        <ResponsiveContainer>
          <Breadcrumb
            items={[
              { label: t('nav.quizzes') || 'Quizzes', href: '/quizzes' },
              { label: quizName, href: `/quizzes/${unique_key}` },
              { label: t('quiz.results') || 'Results' },
            ]}
          />

          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Score Card */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 shadow-card mb-6">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4">
                  {/* Trophy Icon */}
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Trophy className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  {/* Quiz Name */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {result.quizName}
                  </h1>

                  {/* Grade */}
                  {grade && (
                    <div className="space-y-1">
                      {isPerfectScore && (
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                          <span className="text-lg font-bold text-yellow-500">
                            {t('quiz.perfectScore') || 'PERFECT SCORE!'}
                          </span>
                          <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                        </div>
                      )}
                      <div className={`text-6xl font-bold ${isPerfectScore ? 'quiz-celebration bg-clip-text text-transparent' : grade.color}`}>
                        {grade.grade}
                      </div>
                      <p className="text-lg text-muted-foreground">
                        {isPerfectScore ? (t('quiz.perfectMessage') || 'Absolutely flawless!') : grade.message}
                      </p>
                    </div>
                  )}

                  {/* Score */}
                  <div className="flex justify-center items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">
                      {result.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto">
                    <Progress value={result.percentage} className="h-3" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
                      <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                      <span className="text-2xl font-bold text-foreground">
                        {result.correctCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('quiz.correct') || 'Correct'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
                      <XCircle className="h-6 w-6 text-destructive mb-2" />
                      <span className="text-2xl font-bold text-foreground">
                        {result.totalQuestions - result.correctCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('quiz.incorrect') || 'Incorrect'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
                      <Target className="h-6 w-6 text-primary mb-2" />
                      <span className="text-2xl font-bold text-foreground">
                        {result.score}/{result.maxScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('quiz.score') || 'Score'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
                      <Clock className="h-6 w-6 text-primary mb-2" />
                      <span className="text-2xl font-bold text-foreground">
                        {formatTime(result.timeTaken)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('quiz.timeTaken') || 'Time'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link to={`/quizzes/${unique_key}/take`}>
                <Button>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('quiz.tryAgain') || 'Try Again'}
                </Button>
              </Link>
              {wrongAnswers.length > 0 && (
                <Button
                  variant={showOnlyWrong ? 'default' : 'outline'}
                  onClick={() => setShowOnlyWrong(!showOnlyWrong)}
                  className={showOnlyWrong ? 'bg-destructive hover:bg-destructive/90' : ''}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {showOnlyWrong 
                    ? (t('quiz.showAll') || 'Show All') 
                    : (t('quiz.reviewWrong') || `Review Wrong (${wrongAnswers.length})`)}
                </Button>
              )}
              <Link to="/quizzes">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  {t('quiz.moreQuizzes') || 'More Quizzes'}
                </Button>
              </Link>
            </div>

            {/* Answer Review */}
            {answerReview.length > 0 && (
              <Card className="border-border/50 bg-card shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {showOnlyWrong 
                        ? (t('quiz.wrongAnswersReview') || 'Wrong Answers Review')
                        : (t('quiz.answerReview') || 'Answer Review')}
                    </CardTitle>
                    {showOnlyWrong && (
                      <Badge variant="destructive">
                        {wrongAnswers.length} {t('quiz.wrong') || 'wrong'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2" defaultValue={showOnlyWrong && displayedAnswers.length > 0 ? displayedAnswers[0].answer.questionId : undefined}>
                    {displayedAnswers.map(({ answer, question }) => {
                      // Find original index for display
                      const originalIndex = answerReview.findIndex(a => a.answer.questionId === answer.questionId);
                      return (
                      <AccordionItem
                        key={answer.questionId}
                        value={answer.questionId}
                        className={`border rounded-lg px-4 ${!answer.isCorrect ? 'border-destructive/30 bg-destructive/5' : ''}`}
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            {answer.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              Q{originalIndex + 1}
                            </span>
                            <span className="font-medium text-foreground line-clamp-1">
                              {question?.content.split('\n')[0] || 'Question'}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          {question && (
                            <>
                              {/* Question Content */}
                              <div className="prose-custom text-sm">
                                <MarkdownRenderer
                                  content={question.content}
                                  enableToc={false}
                                />
                              </div>

                              {/* Options Review */}
                              {(question.type === 'single_choice' ||
                                question.type === 'multiple_choice') && (
                                <div className="space-y-2">
                                  {question.options.map((option) => {
                                    const isSelected =
                                      answer.selectedOptions.includes(option.id);
                                    const isCorrectOption = option.isCorrect;

                                    let optionClass =
                                      'p-3 rounded-lg border text-sm';
                                    if (isCorrectOption) {
                                      optionClass +=
                                        ' border-green-500 bg-green-500/10';
                                    } else if (isSelected && !isCorrectOption) {
                                      optionClass +=
                                        ' border-destructive bg-destructive/10';
                                    } else {
                                      optionClass += ' border-border';
                                    }

                                    return (
                                      <div key={option.id} className={optionClass}>
                                        <div className="flex items-center gap-2">
                                          {isCorrectOption && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          )}
                                          {isSelected && !isCorrectOption && (
                                            <XCircle className="h-4 w-4 text-destructive" />
                                          )}
                                          <span>{option.text}</span>
                                          {isSelected && (
                                            <Badge
                                              variant="outline"
                                              className="ml-auto text-xs"
                                            >
                                              {t('quiz.yourAnswer') || 'Your answer'}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Text Input Review */}
                              {question.type === 'text_input' && (
                                <div className="space-y-2">
                                  <div className="p-3 rounded-lg border border-border">
                                    <span className="text-sm text-muted-foreground">
                                      {t('quiz.yourAnswer') || 'Your answer'}:{' '}
                                    </span>
                                    <span
                                      className={
                                        answer.isCorrect
                                          ? 'text-green-500'
                                          : 'text-destructive'
                                      }
                                    >
                                      {answer.textAnswer || '(no answer)'}
                                    </span>
                                  </div>
                                  {!answer.isCorrect && question.correctAnswer && (
                                    <div className="p-3 rounded-lg border border-green-500 bg-green-500/10">
                                      <span className="text-sm text-muted-foreground">
                                        {t('quiz.correctAnswer') || 'Correct answer'}:{' '}
                                      </span>
                                      <span className="text-green-500 font-medium">
                                        {question.correctAnswer}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Explanation */}
                              {question.explanation && (
                                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                                  <span className="font-medium text-foreground">
                                    {t('quiz.explanation') || 'Explanation'}:{' '}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {question.explanation}
                                  </span>
                                </div>
                              )}

                              {/* Time Taken */}
                              <div className="text-xs text-muted-foreground">
                                {t('quiz.answeredIn') || 'Answered in'}{' '}
                                {formatTime(answer.timeTaken)}
                              </div>
                            </>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default QuizResultPage;

import React from "react";
import { Utensils, Dumbbell, Camera, Scale, Award, Target, TrendingUp } from "lucide-react";

// ============================================================================
// BASE EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  heading: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  emoji,
  heading,
  description,
  buttonText,
  onButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-12 text-center ${className}`}
    >
      {/* Icon or Emoji */}
      <div className="mb-4">
        {emoji ? (
          <div className="text-5xl">{emoji}</div>
        ) : icon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cloud text-slate">
            {icon}
          </div>
        ) : null}
      </div>

      {/* Heading */}
      <h3 className="mb-2 text-2xl font-semibold text-charcoal">{heading}</h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-base text-slate">{description}</p>

      {/* Buttons */}
      {(buttonText || secondaryButtonText) && (
        <div className="flex gap-3">
          {buttonText && onButtonClick && (
            <button
              onClick={onButtonClick}
              className="rounded-md bg-primary px-6 py-3 font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
            >
              {buttonText}
            </button>
          )}
          {secondaryButtonText && onSecondaryButtonClick && (
            <button
              onClick={onSecondaryButtonClick}
              className="rounded-md border border-line-strong px-6 py-3 font-semibold text-charcoal transition-all hover:bg-cloud"
            >
              {secondaryButtonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 1. NO PROTEIN LOGS
// ============================================================================

interface NoProteinLogsProps {
  onAddFood?: () => void;
  className?: string;
}

export function NoProteinLogs({ onAddFood, className }: NoProteinLogsProps) {
  return (
    <EmptyState
      emoji="🍗"
      heading="No food logged yet"
      description="Track your first meal to see your progress! Hit your daily protein target to maintain muscle while losing weight."
      buttonText={onAddFood ? "Add Food" : undefined}
      onButtonClick={onAddFood}
      className={className}
    />
  );
}

// Alternative with icon instead of emoji
export function NoProteinLogsIcon({ onAddFood, className }: NoProteinLogsProps) {
  return (
    <EmptyState
      icon={<Utensils className="h-10 w-10" />}
      heading="No food logged yet"
      description="Track your first meal to see your progress! Hit your daily protein target to maintain muscle while losing weight."
      buttonText={onAddFood ? "Add Food" : undefined}
      onButtonClick={onAddFood}
      className={className}
    />
  );
}

// ============================================================================
// 2. NO WORKOUTS
// ============================================================================

interface NoWorkoutsProps {
  onChooseProgram?: () => void;
  onStartWorkout?: () => void;
  className?: string;
}

export function NoWorkouts({
  onChooseProgram,
  onStartWorkout,
  className,
}: NoWorkoutsProps) {
  return (
    <EmptyState
      emoji="💪"
      heading="No workouts logged"
      description="Start a workout program to build strength while losing weight. Strength training is crucial for maintaining muscle mass on GLP-1."
      buttonText={onChooseProgram ? "Choose a Program" : undefined}
      onButtonClick={onChooseProgram}
      secondaryButtonText={onStartWorkout ? "Quick Workout" : undefined}
      onSecondaryButtonClick={onStartWorkout}
      className={className}
    />
  );
}

// Alternative with icon
export function NoWorkoutsIcon({
  onChooseProgram,
  onStartWorkout,
  className,
}: NoWorkoutsProps) {
  return (
    <EmptyState
      icon={<Dumbbell className="h-10 w-10" />}
      heading="No workouts logged"
      description="Start a workout program to build strength while losing weight. Strength training is crucial for maintaining muscle mass on GLP-1."
      buttonText={onChooseProgram ? "Choose a Program" : undefined}
      onButtonClick={onChooseProgram}
      secondaryButtonText={onStartWorkout ? "Quick Workout" : undefined}
      onSecondaryButtonClick={onStartWorkout}
      className={className}
    />
  );
}

// ============================================================================
// 3. NO PROGRESS PHOTOS
// ============================================================================

interface NoProgressPhotosProps {
  onUploadPhotos?: () => void;
  className?: string;
}

export function NoProgressPhotos({ onUploadPhotos, className }: NoProgressPhotosProps) {
  return (
    <EmptyState
      emoji="📸"
      heading="No progress photos yet"
      description="Take your first set of photos to track visual changes. Photos often show progress that the scale doesn't!"
      buttonText={onUploadPhotos ? "Upload Photos" : undefined}
      onButtonClick={onUploadPhotos}
      className={className}
    />
  );
}

// Alternative with icon
export function NoProgressPhotosIcon({ onUploadPhotos, className }: NoProgressPhotosProps) {
  return (
    <EmptyState
      icon={<Camera className="h-10 w-10" />}
      heading="No progress photos yet"
      description="Take your first set of photos to track visual changes. Photos often show progress that the scale doesn't!"
      buttonText={onUploadPhotos ? "Upload Photos" : undefined}
      onButtonClick={onUploadPhotos}
      className={className}
    />
  );
}

// ============================================================================
// 4. NO WEIGHT LOGS
// ============================================================================

interface NoWeightLogsProps {
  onLogWeight?: () => void;
  className?: string;
}

export function NoWeightLogs({ onLogWeight, className }: NoWeightLogsProps) {
  return (
    <EmptyState
      emoji="⚖️"
      heading="No weight entries"
      description="Log your weight to track your progress over time. Consistent tracking helps you understand your body's response to GLP-1."
      buttonText={onLogWeight ? "Log Weight" : undefined}
      onButtonClick={onLogWeight}
      className={className}
    />
  );
}

// Alternative with icon
export function NoWeightLogsIcon({ onLogWeight, className }: NoWeightLogsProps) {
  return (
    <EmptyState
      icon={<Scale className="h-10 w-10" />}
      heading="No weight entries"
      description="Log your weight to track your progress over time. Consistent tracking helps you understand your body's response to GLP-1."
      buttonText={onLogWeight ? "Log Weight" : undefined}
      onButtonClick={onLogWeight}
      className={className}
    />
  );
}

// ============================================================================
// ADDITIONAL EMPTY STATES
// ============================================================================

// No Active Workout Session
interface NoActiveWorkoutProps {
  onStartWorkout?: () => void;
  onBrowsePrograms?: () => void;
  className?: string;
}

export function NoActiveWorkout({
  onStartWorkout,
  onBrowsePrograms,
  className,
}: NoActiveWorkoutProps) {
  return (
    <EmptyState
      emoji="🏋️"
      heading="No active workout"
      description="You don't have an active workout session. Choose a workout from your program to get started!"
      buttonText={onStartWorkout ? "Start Workout" : undefined}
      onButtonClick={onStartWorkout}
      secondaryButtonText={onBrowsePrograms ? "Browse Programs" : undefined}
      onSecondaryButtonClick={onBrowsePrograms}
      className={className}
    />
  );
}

// No Program Selected
interface NoProgramSelectedProps {
  onChooseProgram?: () => void;
  className?: string;
}

export function NoProgramSelected({ onChooseProgram, className }: NoProgramSelectedProps) {
  return (
    <EmptyState
      icon={<Target className="h-10 w-10" />}
      heading="No program selected"
      description="Choose a workout program that matches your fitness level to get started with structured training."
      buttonText={onChooseProgram ? "Choose a Program" : undefined}
      onButtonClick={onChooseProgram}
      className={className}
    />
  );
}

// No Exercise Sets
interface NoExerciseSetsProps {
  onLogSet?: () => void;
  className?: string;
}

export function NoExerciseSets({ onLogSet, className }: NoExerciseSetsProps) {
  return (
    <EmptyState
      emoji="📝"
      heading="No sets logged"
      description="Start logging your sets to track your strength progress and ensure proper workout completion."
      buttonText={onLogSet ? "Log First Set" : undefined}
      onButtonClick={onLogSet}
      className={className}
    />
  );
}

// No Personal Records
interface NoPersonalRecordsProps {
  onStartTracking?: () => void;
  className?: string;
}

export function NoPersonalRecords({ onStartTracking, className }: NoPersonalRecordsProps) {
  return (
    <EmptyState
      icon={<Award className="h-10 w-10" />}
      heading="No personal records yet"
      description="Keep logging your workouts to track your personal records and celebrate your strength gains!"
      buttonText={onStartTracking ? "Start Tracking" : undefined}
      onButtonClick={onStartTracking}
      className={className}
    />
  );
}

// No Progress Data
interface NoProgressDataProps {
  onGetStarted?: () => void;
  className?: string;
}

export function NoProgressData({ onGetStarted, className }: NoProgressDataProps) {
  return (
    <EmptyState
      icon={<TrendingUp className="h-10 w-10" />}
      heading="Not enough data yet"
      description="Keep logging your meals, workouts, and weight to see detailed progress charts and trends."
      buttonText={onGetStarted ? "Get Started" : undefined}
      onButtonClick={onGetStarted}
      className={className}
    />
  );
}

// Generic Empty State (for custom use cases)
interface GenericEmptyStateProps {
  emoji?: string;
  icon?: React.ReactNode;
  heading: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

export function GenericEmptyState({
  emoji = "📭",
  icon,
  heading,
  description,
  buttonText,
  onButtonClick,
  className,
}: GenericEmptyStateProps) {
  return (
    <EmptyState
      emoji={emoji}
      icon={icon}
      heading={heading}
      description={description}
      buttonText={buttonText}
      onButtonClick={onButtonClick}
      className={className}
    />
  );
}

// ============================================================================
// COMPACT EMPTY STATES (for smaller containers)
// ============================================================================

interface CompactEmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export function CompactEmptyState({ message, icon, className = "" }: CompactEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg bg-cloud p-8 text-center ${className}`}
    >
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-slate">
          {icon}
        </div>
      )}
      <p className="text-sm text-slate">{message}</p>
    </div>
  );
}

// ============================================================================
// INLINE EMPTY STATES (for list items)
// ============================================================================

interface InlineEmptyStateProps {
  message: string;
  className?: string;
}

export function InlineEmptyState({ message, className = "" }: InlineEmptyStateProps) {
  return (
    <div className={`rounded-lg border border-dashed border-line-strong bg-cloud p-6 text-center ${className}`}>
      <p className="text-sm text-slate">{message}</p>
    </div>
  );
}


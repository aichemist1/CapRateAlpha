type OnboardingStepperProps = {
  current: number;
};

const steps = [
  "Account",
  "Workspace",
  "Vacancy",
  "Media",
  "Copy",
  "Flyer",
  "Publish"
];

export function OnboardingStepper({ current }: OnboardingStepperProps) {
  return (
    <div className="stepper" aria-label="Onboarding progress">
      {steps.map((step, index) => (
        <div
          className={`step${index === current ? " is-active" : ""}`}
          key={step}
        >
          <span className="step-number">{index + 1}</span>
          <span className="step-label">{step}</span>
        </div>
      ))}
    </div>
  );
}

// Dynamically import all components from the Tutorials folder.
const tutorialModules = import.meta.glob(
  "@/components/TaskComponents/Tutorials/*.jsx",
  { eager: true }
);

const tutorials = Object.entries(tutorialModules).map(([path, module]) => {
  return { Component: module.default };
});

function TaskComponentTutorial() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Component Tutorials
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </div>
    </div>
  );
}

export default TaskComponentTutorial;

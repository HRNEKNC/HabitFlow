import { HabitFlowHabitList } from "./HabitFlowHabitList";

function App() {
  // Test için sahte alışkanlık verileri
  const mockHabits = [
    {
      id: "1",
      title: "Sabah meditasyonu",
      streakWeeks: 3,
      lastDoneLabel: "Bugün",
    },
    {
      id: "2",
      title: "İngilizce kelime ezberi",
      streakWeeks: 1,
      lastDoneLabel: "Dün",
    },
    { id: "3", title: "10.000 adım", streakWeeks: 0, lastDoneLabel: undefined },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "50px",
        backgroundColor: "#000",
        minHeight: "100vh",
      }}
    >
      <HabitFlowHabitList habits={mockHabits} />
    </div>
  );
}

export default App;

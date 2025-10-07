import Card from "../components/Card";

export default function Home() {
  return (
    <div className="p-4">
      <Card>
        <h1 className="text-xl font-bold mb-2">Welcome to Golf Shot Tracker</h1>
        <p className="text-gray-600">Start logging your rounds and tracking stats.</p>
      </Card>
    </div>
  );
}

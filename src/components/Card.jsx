export default function Card({ children }) {
  return (
    <div className="bg-white shadow rounded-xl p-4 mb-4">
      {children}
    </div>
  );
}
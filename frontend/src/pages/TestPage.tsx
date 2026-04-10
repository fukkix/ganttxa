export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Tailwind Test</h1>
        <p className="text-gray-600">If you see colors and styling, Tailwind is working!</p>
        <div className="mt-4 space-y-2">
          <div className="bg-primary text-on-primary p-4 rounded-xl">Custom Primary Color</div>
          <div className="bg-secondary text-on-secondary p-4 rounded-xl">Custom Secondary Color</div>
          <div className="bg-tertiary text-on-tertiary p-4 rounded-xl">Custom Tertiary Color</div>
        </div>
      </div>
    </div>
  )
}

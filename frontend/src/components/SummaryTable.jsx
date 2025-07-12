import React from "react"

const SummaryTable = ({ summaryRows, title = "Summary (TL;DR)" }) => (
  <div className="mb-8 lg:mb-12">
    <h3 className="text-xl sm:text-2xl font-bold text-teal-700 mb-4 lg:mb-6 text-center">{title}</h3>
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <table className="w-full">
        <tbody>
          {summaryRows.map((row, i) => (
            <tr key={i} className={`${i % 2 === 0 ? 'bg-teal-50/50' : 'bg-white/50'} hover:bg-teal-100/50 transition-colors`}>
              <td className="px-6 py-4 font-bold text-teal-800 border-r border-teal-100">{row.label}</td>
              <td className="px-6 py-4 text-gray-700 font-medium">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
 
export default SummaryTable

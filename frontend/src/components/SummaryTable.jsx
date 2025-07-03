import React from "react"

const SummaryTable = ({ summaryRows, title = "Summary (TL;DR)" }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold text-teal-700 mb-2 text-center">{title}</h3>
    <table className="w-full border border-teal-200 rounded mb-4">
      <tbody>
        {summaryRows.map((row, i) => (
          <tr key={i}>
            <td className="px-3 py-2 font-semibold text-teal-800">{row.label}</td>
            <td className="px-3 py-2">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
 
export default SummaryTable

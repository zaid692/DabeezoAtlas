
'use client';
import React, { useState, useEffect } from "react";
import { getToken } from "../lib/auth";
import Navbar from "../components/Navbar";

interface SizeChart {
  _id: string;
  name: string;
  description: string;
  tableData: {
    headers: string[];
    rows: string[][];
  };
  createdAt: string;
}

export default function SizeChartsPage() {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSizeChart, setSelectedSizeChart] = useState<SizeChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Simple form state
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  // Simple table state - just a 2D array
  const [tableData, setTableData] = useState<string[][]>([[]]);

  useEffect(() => {
    const token = getToken();
    if (token) setIsAdmin(true);
    fetchSizeCharts();
  }, []);

  const fetchSizeCharts = async () => {
    try {
      setError("");
      const res = await fetch(`https://dabeez-backend.fly.dev/api/sizechart`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setSizeCharts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load size charts");
    }
  };

  // Initialize a simple table with headers
  const initializeTable = () => {
    const initialTable = [
      ["Description", "S", "M", "L"], // Headers
      ["Length", "", "", ""],
      ["Width", "", "", ""]
    ];
    setTableData(initialTable);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setTableData(prev => {
      const updated = prev.map(r => [...r]);
      if (!updated[rowIndex]) {
        updated[rowIndex] = [];
      }
      updated[rowIndex][colIndex] = value;
      return updated;
    });
  };

  const addRow = () => {
    const newRow = Array(tableData[0]?.length || 1).fill("");
    setTableData(prev => [...prev, newRow]);
  };

  const addColumn = () => {
    setTableData(prev => prev.map(row => [...row, ""]));
  };

  const removeRow = (index: number) => {
    setTableData(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeColumn = (index: number) => {
    setTableData(prev => {
      if (!prev[0] || prev[0].length <= 1) return prev;
      return prev.map(row => row.filter((_, i) => i !== index));
    });
  };

  const handleAddSizeChart = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("❌ Name and description are required!");
      return;
    }

    if (tableData.length === 0 || tableData[0].length === 0) {
      alert("❌ Please create a table first!");
      return;
    }

    setLoading(true);
    const token = getToken();
    if (!token) {
      alert("❌ Please login as admin");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/api/sizechart`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tableData: {
            headers: tableData[0] || [],
            rows: tableData.slice(1) || []
          }
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create");

      setSizeCharts(prev => [...prev, result]);
      setShowAddModal(false);
      resetForm();
      alert("✅ Size chart created!");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setTableData([[]]);
  };

  const handleDeleteSizeChart = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size chart?")) return;

    const token = getToken();
    if (!token) {
      alert("❌ Please login as admin");
      return;
    }

    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/api/sizechart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      setSizeCharts(prev => prev.filter(chart => chart._id !== id));
      setSelectedSizeChart(null);
      alert("✅ Size chart deleted!");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mt-4 pt-2   ">Size Guide</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect fit with our comprehensive size charts.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setTimeout(initializeTable, 100);
                }}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                + Add New Size Chart
              </button>
            )}
          </div>

          {/* Size Charts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sizeCharts.map((chart) => (
              <div
                key={chart._id}
                className="min-w-0 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedSizeChart(chart)}
              >
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 text-center">
                    {chart.name}
                  </h3>
                  <p className="text-gray-600 text-sm text-center line-clamp-2">
                    {chart.description}
                  </p>

                  <div className="mt-3 text-xs text-gray-500 text-center">
                    <p>
                      Table: {chart.tableData?.headers?.length || 0} columns × 
                      {(chart.tableData?.rows?.length || 0) + 1} rows
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sizeCharts.length === 0 && !error && (
            <div className="text-center py-16 text-gray-600">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl">No size charts available yet.</p>
              {isAdmin && (
                <p className="text-gray-500 mt-2">Create your first size chart using the button above.</p>
              )}
            </div>
          )}
        </div>

        {/* SIMPLIFIED Add Size Chart Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Create Size Chart</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chart Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Basic Trousers"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Measurements in inches"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Table Controls */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Table Builder</h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={initializeTable}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Create Table
                      </button>
                      <button
                        onClick={addRow}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        + Add Row
                      </button>
                      <button
                        onClick={addColumn}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        + Add Column
                      </button>
                    </div>
                  </div>

                  {/* Simple Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-max w-full border-collapse">
                        <tbody>
                          {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} className="border border-gray-300 p-0 align-top">
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                    placeholder={rowIndex === 0 ? `Header ${colIndex + 1}` : `Value ${rowIndex}-${colIndex}`}
                                    className={`w-full p-3 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${
                                      rowIndex === 0 ? 'bg-blue-100 font-bold' : 'bg-white'
                                    }`}
                                  />
                                </td>
                              ))}
                              {/* Remove buttons */}
                              <td className="border border-gray-300 p-2 w-20 align-top">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => removeRow(rowIndex)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                    disabled={tableData.length <= 1}
                                  >
                                    Remove Row
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {/* Remove column buttons */}
                          <tr>
                            {tableData[0]?.map((_, colIndex) => (
                              <td key={colIndex} className="border border-gray-300 p-2">
                                <button
                                  onClick={() => removeColumn(colIndex)}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs w-full hover:bg-red-600"
                                  disabled={tableData[0]?.length <= 1}
                                >
                                  Remove Column
                                </button>
                              </td>
                            ))}
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 How to create your size chart:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>1. Click <strong>"Create Table"</strong> to start</li>
                      <li>2. Fill in the <strong>first row</strong> with sizes (S, M, L, etc.)</li>
                      <li>3. Fill in the <strong>first column</strong> with measurements</li>
                      <li>4. Add more rows/columns as needed</li>
                      <li>5. Fill in the measurement values</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold bg-gray-300 hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSizeChart}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? "Creating..." : "Create Size Chart"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Size Chart Modal */}
        {selectedSizeChart && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{selectedSizeChart?.name || 'Size Chart'}</h3>
                  <p className="text-gray-600 mt-1">{selectedSizeChart?.description || ''}</p>
                </div>
                <button
                  onClick={() => setSelectedSizeChart(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 sm:p-6">
                {selectedSizeChart?.tableData?.headers ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-max w-full border-collapse">
                        <thead>
                          <tr className="bg-blue-600 text-white">
                            {selectedSizeChart.tableData.headers?.map((header, index) => (
                              <th key={index} className="p-3 sm:p-4 font-bold text-left border-b border-blue-700">
                                {header || `Header ${index + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSizeChart.tableData.rows?.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              {row?.map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-3 sm:p-4 border-b border-gray-200 align-top">
                                  {cell || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No table data available for this size chart.</p>
                    {isAdmin && (
                      <p className="text-sm mt-2">This chart was created with an older format.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600 mb-3 sm:mb-0">
                  Created: {selectedSizeChart?.createdAt ? new Date(selectedSizeChart.createdAt).toLocaleDateString() : 'Unknown date'}
                </div>

                {isAdmin && selectedSizeChart?._id && (
                  <button
                    onClick={() => handleDeleteSizeChart(selectedSizeChart._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete Chart
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

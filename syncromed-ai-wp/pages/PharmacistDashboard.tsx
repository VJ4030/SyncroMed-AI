import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Pill, AlertCircle, TrendingUp, Search, ShoppingCart, CheckCircle, Trash2, Plus, Stethoscope, Check, X, ShoppingBag } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { Medicine } from '../types';

interface CartItem extends Medicine {
  quantity: number;
}

export const PharmacistDashboard = () => {
  const { medicines, updateInventory, patients, generateBill, pharmacyRequests, updatePharmacyRequestStatus, activeTab } = useApp();
  // Local state for sub-tabs within Inventory
  const [inventoryView, setInventoryView] = useState<'ALL' | 'LOW_STOCK' | 'REQUESTS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [forecast, setForecast] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Cart state for Medi Shop
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const isMediShop = activeTab === 'MEDI_SHOP';

  useEffect(() => {
    // Only fetch forecast if in inventory view
    if (!isMediShop) {
        setLoading(true);
        GeminiService.forecastInventory(medicines.slice(0, 20)).then(res => {
            setForecast(res);
            setLoading(false);
        });
    }
  }, [isMediShop]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const displayedMedicines = medicines.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.category.toLowerCase().includes(searchTerm.toLowerCase());
      if (!isMediShop && inventoryView === 'LOW_STOCK') {
          return matchesSearch && m.stock < m.minLevel;
      }
      return matchesSearch;
  });

  const addToCart = (med: Medicine) => {
      setCart(prev => {
          const existing = prev.find(item => item.id === med.id);
          if (existing) {
              return prev.map(item => item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...prev, { ...med, quantity: 1 }];
      });
  };

  const removeFromCart = (id: string) => {
      setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
      return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleGenerateBill = () => {
      if (cart.length === 0) return alert("Cart is empty!");
      if (!selectedPatientId) return alert("Please select a patient!");
      
      const total = calculateTotal();
      const patientName = patients.find(p => p.id === selectedPatientId)?.name;
      
      generateBill(selectedPatientId, total);
      
      // Update inventory (simulation)
      cart.forEach(item => {
          updateInventory(item.id, item.stock - item.quantity);
      });

      alert(`Bill of ₹${total} generated for ${patientName} successfully!`);
      setCart([]);
      setSelectedPatientId('');
  };

  const handleQuickRestock = (id: string, currentStock: number) => {
      updateInventory(id, currentStock + 50);
      alert("Added 50 units to stock.");
  };

  // --- MEDI SHOP VIEW (POS) ---
  if (isMediShop) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Panel: Search & Add to Cart */}
            <div className="lg:col-span-8 glass-card p-6 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <ShoppingBag className="text-cyan-400" />
                        <span>Medi Shop Catalog</span>
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search to sell..." 
                            className="glass-input pl-10 pr-4 py-2 rounded-lg text-sm w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/5 uppercase text-xs font-medium sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Price</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayedMedicines.map(m => (
                                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{m.name}</td>
                                    <td className={`p-3 ${m.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>{m.stock}</td>
                                    <td className="p-3">₹{m.price}</td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => addToCart(m)}
                                            disabled={m.stock <= 0}
                                            className="text-xs bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded flex items-center justify-center ml-auto space-x-1"
                                        >
                                            <ShoppingCart size={14} />
                                            <span>Add</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Panel: Cart & Checkout */}
            <div className="lg:col-span-4 flex flex-col space-y-6 h-full">
                <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                        <ShoppingCart className="text-green-400" />
                        <span>Current Bill</span>
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar bg-black/20 rounded-xl p-2 border border-white/5">
                        {cart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                                Empty Cart
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-sm">
                                            <p className="text-white font-medium">{item.name}</p>
                                            <p className="text-xs text-gray-400">{item.quantity} x ₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-white font-bold">₹{item.price * item.quantity}</span>
                                            <button 
                                                onClick={() => removeFromCart(item.id)} 
                                                className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Bill To Patient</label>
                            <select 
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="w-full glass-input p-2 rounded-lg text-sm text-white focus:border-green-500 outline-none"
                            >
                                <option value="">-- Select Patient --</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Total</span>
                            <span className="text-2xl font-bold text-white">₹{calculateTotal()}</span>
                        </div>
                        <button 
                            onClick={handleGenerateBill}
                            disabled={cart.length === 0 || !selectedPatientId}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <CheckCircle size={18} />
                            <span>Process Bill</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- INVENTORY VIEW (Management) ---
  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      {/* Feature Toolbar Buttons */}
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={() => setInventoryView('ALL')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${inventoryView === 'ALL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
          <Pill size={20} />
          <span>Inventory</span>
        </button>
        <button 
          onClick={() => setInventoryView('LOW_STOCK')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${inventoryView === 'LOW_STOCK' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
          <AlertCircle size={20} />
          <span>Limited Stock ({medicines.filter(m => m.stock < m.minLevel).length})</span>
        </button>
        <button 
          onClick={() => setInventoryView('REQUESTS')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${inventoryView === 'REQUESTS' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
          <Stethoscope size={20} />
          <span>Doctor Requests ({pharmacyRequests.filter(r => r.status === 'PENDING').length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl flex flex-col overflow-hidden">
            
            {inventoryView === 'REQUESTS' ? (
                <>
                    <h3 className="text-xl font-bold text-white mb-6">Medicine Requests from Doctors</h3>
                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4">
                        {pharmacyRequests.length === 0 ? (
                            <p className="text-center text-gray-500 mt-10">No requests yet.</p>
                        ) : pharmacyRequests.map(req => (
                            <div key={req.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-white text-lg">{req.medicineName}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                            req.status === 'PENDING' ? 'border-yellow-500 text-yellow-500' :
                                            req.status === 'AVAILABLE' ? 'border-green-500 text-green-500' :
                                            'border-red-500 text-red-500'
                                        }`}>{req.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Asked by: {req.doctorName}</p>
                                    <p className="text-xs text-gray-500">{req.timestamp}</p>
                                </div>
                                {req.status === 'PENDING' && (
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => updatePharmacyRequestStatus(req.id, 'AVAILABLE')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center space-x-1"
                                        >
                                            <Check size={16} />
                                            <span>Available</span>
                                        </button>
                                        <button 
                                            onClick={() => updatePharmacyRequestStatus(req.id, 'UNAVAILABLE')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center space-x-1"
                                        >
                                            <X size={16} />
                                            <span>Unavailable</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <h3 className="text-xl font-bold text-white">
                            {inventoryView === 'LOW_STOCK' ? 'Critical Stock List' : 'Medicine Database'}
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search inventory..." 
                                className="glass-input pl-10 pr-4 py-2 rounded-lg text-sm w-64"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-white/5 uppercase text-xs font-medium sticky top-0 backdrop-blur-md z-10">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3">Price (₹)</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayedMedicines.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">No medicines found.</td></tr>
                                ) : displayedMedicines.map(m => (
                                    <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-3 font-medium text-white">{m.name}</td>
                                        <td className="p-3"><span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded text-xs">{m.category}</span></td>
                                        <td className={`p-3 font-mono font-bold ${m.stock < m.minLevel ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                                            {m.stock}
                                        </td>
                                        <td className="p-3">₹{m.price}</td>
                                        <td className="p-3 text-right">
                                            {inventoryView === 'LOW_STOCK' && (
                                                <button 
                                                    onClick={() => handleQuickRestock(m.id, m.stock)}
                                                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded flex items-center justify-center ml-auto space-x-1"
                                                >
                                                    <Plus size={14} />
                                                    <span>Restock</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>

        {/* Right Panel: AI Forecast (Only in Inventory View) */}
        <div className="lg:col-span-4 flex flex-col space-y-6 overflow-hidden">
            <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                    <TrendingUp className="text-purple-400" />
                    <span>Inventory Intelligence</span>
                </h3>
                <div className="bg-black/20 p-4 rounded-xl text-xs text-gray-300 leading-relaxed border border-white/5 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="animate-pulse">Gemini analyzing stock patterns...</span>
                        </div>
                    ) : (
                        <div className="whitespace-pre-line">
                            {forecast || "No forecast available."}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

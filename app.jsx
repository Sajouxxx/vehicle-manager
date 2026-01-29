const { useState, useEffect } = React;

function VehicleManager() {
  const defaultVehicles = [
    { id: 1, name: 'Audi A3', type: 'car', details: '1.6 8P Petrol - 2011', vin: '', photos: [], documents: [], tuv: { date: '', cost: 0 }, oil: { lastChange: '', lastKm: 0, interval: 15000, intervalMonths: 12 }, tax: { amount: 0, dueDate: '' }, insurance: { amount: 0, dueDate: '' }, repairs: [], currentKm: 0 },
    { id: 2, name: 'Honda FR-V', type: 'car', details: '2.2 Diesel', vin: '', photos: [], documents: [], tuv: { date: '', cost: 0 }, oil: { lastChange: '', lastKm: 0, interval: 15000, intervalMonths: 12 }, tax: { amount: 0, dueDate: '' }, insurance: { amount: 0, dueDate: '' }, repairs: [], currentKm: 0 },
    { id: 3, name: 'Golf 4', type: 'car', details: '1.6 Petrol', vin: '', photos: [], documents: [], tuv: { date: '', cost: 0 }, oil: { lastChange: '', lastKm: 0, interval: 15000, intervalMonths: 12 }, tax: { amount: 0, dueDate: '' }, insurance: { amount: 0, dueDate: '' }, repairs: [], currentKm: 0 },
    { id: 4, name: 'BMW R1100RT', type: 'bike', details: 'Motorrad', vin: '', photos: [], documents: [], tuv: { date: '', cost: 0 }, oil: { lastChange: '', lastKm: 0, interval: 8000, intervalMonths: 24 }, tax: { amount: 0, dueDate: '' }, insurance: { amount: 0, dueDate: '' }, repairs: [], currentKm: 0 },
    { id: 5, name: 'Kymco Maxi 400i', type: 'bike', details: 'Roller', vin: '', photos: [], documents: [], tuv: { date: '', cost: 0 }, oil: { lastChange: '', lastKm: 0, interval: 8000, intervalMonths: 24 }, tax: { amount: 0, dueDate: '' }, insurance: { amount: 0, dueDate: '' }, repairs: [], currentKm: 0 },
    { id: 6, name: 'SYM Fiddle 3', type: 'bike', details: '200i Roller', vin: '', photos: [], documents: [], tuv: { date: '', cost: 0 }, oil: { lastChange: '', lastKm: 0, interval: 8000, intervalMonths: 24 }, tax: { amount: 0, dueDate: '' }, insurance: { amount: 0, dueDate: '' }, repairs: [], currentKm: 0 }
  ];

  const loadVehicles = () => {
    try {
      const saved = localStorage.getItem('vehicleData');
      return saved ? JSON.parse(saved) : defaultVehicles;
    } catch {
      return defaultVehicles;
    }
  };

  const [vehicles, setVehicles] = useState(loadVehicles());
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newRepair, setNewRepair] = useState({ date: '', description: '', cost: 0 });
  const [newVehicle, setNewVehicle] = useState({ name: '', type: 'car', details: '' });

  useEffect(() => {
    localStorage.setItem('vehicleData', JSON.stringify(vehicles));
  }, [vehicles]);

  const calculateDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getOilChangeStatus = (vehicle) => {
    if (!vehicle.oil.lastChange || !vehicle.oil.lastKm) return 'Keine Daten';
    const monthsSince = (new Date() - new Date(vehicle.oil.lastChange)) / (1000 * 60 * 60 * 24 * 30);
    const kmSince = vehicle.currentKm - vehicle.oil.lastKm;
    const monthsRemaining = vehicle.oil.intervalMonths - monthsSince;
    const kmRemaining = vehicle.oil.interval - kmSince;
    if (monthsRemaining <= 0 || kmRemaining <= 0) return 'Überfällig!';
    if (monthsRemaining <= 2 || kmRemaining <= 2000) return 'Bald fällig';
    return `OK (${Math.round(kmRemaining)} km / ${Math.round(monthsRemaining)} Monate)`;
  };

  const getVehicleTotalCost = (vehicle) => {
    return (vehicle.tuv.cost || 0) + (vehicle.tax.amount || 0) + (vehicle.insurance.amount || 0) + vehicle.repairs.reduce((sum, r) => sum + (r.cost || 0), 0);
  };

  const getTotalYearlyCost = () => vehicles.reduce((sum, v) => sum + getVehicleTotalCost(v), 0);

  const updateVehicle = (id, updates) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    if (selectedVehicle?.id === id) setSelectedVehicle(prev => ({ ...prev, ...updates }));
  };

  const addRepair = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    updateVehicle(vehicleId, { repairs: [...vehicle.repairs, { ...newRepair, id: Date.now() }] });
    setNewRepair({ date: '', description: '', cost: 0 });
    setShowRepairForm(false);
  };

  const addVehicle = () => {
    const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
    setVehicles([...vehicles, { 
      ...newVehicle, 
      id: newId, 
      vin: '', 
      photos: [], 
      documents: [], 
      tuv: { date: '', cost: 0 }, 
      oil: { lastChange: '', lastKm: 0, interval: newVehicle.type === 'car' ? 15000 : 8000, intervalMonths: newVehicle.type === 'car' ? 12 : 24 }, 
      tax: { amount: 0, dueDate: '' }, 
      insurance: { amount: 0, dueDate: '' }, 
      repairs: [], 
      currentKm: 0 
    }]);
    setNewVehicle({ name: '', type: 'car', details: '' });
    setShowAddVehicle(false);
  };

  const exportToExcel = () => {
    try {
      let csvContent = "Fahrzeug,Typ,Details,VIN,KM-Stand,TÜV Datum,TÜV Kosten,Ölwechsel Datum,Ölwechsel KM,Steuer,Steuer Fällig,Versicherung,Versicherung Fällig,Reparaturen Gesamt,Gesamtkosten\n";
      vehicles.forEach(v => {
        const repairsTotal = v.repairs.reduce((sum, r) => sum + (r.cost || 0), 0);
        const row = [v.name, v.type === 'car' ? 'Auto' : 'Motorrad/Roller', v.details, v.vin || '', v.currentKm || 0, v.tuv.date || '', v.tuv.cost || 0, v.oil.lastChange || '', v.oil.lastKm || 0, v.tax.amount || 0, v.tax.dueDate || '', v.insurance.amount || 0, v.insurance.dueDate || '', repairsTotal.toFixed(2), getVehicleTotalCost(v).toFixed(2)];
        csvContent += row.map(field => `"${field}"`).join(',') + "\n";
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fahrzeuge_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const exportToJSON = () => {
    try {
      const dataStr = JSON.stringify(vehicles, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fahrzeuge_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup error:', error);
    }
  };

  const importFromFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) setVehicles(imported);
        } catch {
          console.error('Import failed');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (vehicleId, type, e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        updateVehicle(vehicleId, { [type === 'photo' ? 'photos' : 'documents']: [...vehicle[type === 'photo' ? 'photos' : 'documents'], event.target.result] });
      };
      reader.readAsDataURL(file);
    });
  };

  if (!selectedVehicle) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Fahrzeugverwaltung</h1>
              <p className="text-gray-400">Vehicle Management System</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowAddVehicle(true)} className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <div>
                  <div>Neues Fahrzeug</div>
                  <div className="text-xs italic">New Vehicle</div>
                </div>
              </button>
              <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <div>
                  <div>Excel</div>
                  <div className="text-xs italic">Export</div>
                </div>
              </button>
              <button onClick={exportToJSON} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <div>
                  <div>Backup</div>
                  <div className="text-xs italic">Download</div>
                </div>
              </button>
              <label className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <div>
                  <div>Import</div>
                  <div className="text-xs italic">Upload</div>
                </div>
                <input type="file" accept=".json" onChange={importFromFile} className="hidden" />
              </label>
            </div>
          </div>

          {showAddVehicle && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Neues Fahrzeug hinzufügen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" value={newVehicle.name} onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })} placeholder="Name" className="bg-gray-700 rounded px-3 py-2" />
                <select value={newVehicle.type} onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })} className="bg-gray-700 rounded px-3 py-2">
                  <option value="car">Auto</option>
                  <option value="bike">Motorrad/Roller</option>
                </select>
                <input type="text" value={newVehicle.details} onChange={(e) => setNewVehicle({ ...newVehicle, details: e.target.value })} placeholder="Details" className="bg-gray-700 rounded px-3 py-2 md:col-span-2" />
              </div>
              <div className="flex gap-3">
                <button onClick={addVehicle} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Hinzufügen</button>
                <button onClick={() => setShowAddVehicle(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Abbrechen</button>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Jahreskosten Gesamt
              <span className="block text-sm font-normal italic text-gray-200">Total Annual Cost</span>
            </h2>
            <p className="text-4xl font-bold">€{getTotalYearlyCost().toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => {
              const tuvDays = calculateDaysUntil(vehicle.tuv.date);
              const oilStatus = getOilChangeStatus(vehicle);
              return (
                <div key={vehicle.id} className="bg-gray-800 rounded-lg p-6 relative group">
                  <button
                    onClick={() => setVehicles(prev => prev.filter(v => v.id !== vehicle.id))}
                    className="absolute top-4 right-4 p-2 bg-red-600 rounded-lg hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                  <div onClick={() => setSelectedVehicle(vehicle)} className="cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      {vehicle.type === 'car' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="11" width="2" height="10"></rect><path d="M7 19V9c0-1.1.9-2 2-2h9l3 3v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"></path><circle cx="8.5" cy="19.5" r="1.5"></circle><circle cx="15.5" cy="19.5" r="1.5"></circle></svg>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{vehicle.name}</h3>
                        <p className="text-gray-400 text-sm">{vehicle.details}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          TÜV: <span className="text-xs italic">Inspection</span>
                        </span>
                        <span className={tuvDays !== null && tuvDays < 30 ? 'text-red-400' : 'text-green-400'}>
                          {vehicle.tuv.date || <span>Nicht eingetragen <span className="italic text-xs">Not entered</span></span>}
                          {tuvDays !== null && ` (${tuvDays}T)`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Ölwechsel: <span className="text-xs italic">Oil Change</span>
                        </span>
                        <span className={oilStatus.includes('fällig') ? 'text-red-400' : 'text-green-400'}>{oilStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Gesamtkosten: <span className="text-xs italic">Total Cost</span>
                        </span>
                        <span className="text-blue-400 font-bold">€{getVehicleTotalCost(vehicle).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Detail view - I'll send in next message (too long)
  return <div className="min-h-screen bg-gray-900 text-white p-6"><p className="text-center py-8">Loading detail view...</p></div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<VehicleManager />);

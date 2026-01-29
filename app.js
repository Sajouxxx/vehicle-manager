import React from 'https://cdn.skypack.dev/react@18';
import ReactDOM from 'https://cdn.skypack.dev/react-dom@18/client';

const icons = await import('https://cdn.skypack.dev/lucide-react');
const { Car, Bike, DollarSign, Wrench, AlertCircle, Plus, Camera, FileText, Download, Upload, Trash2 } = icons;

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

  const [vehicles, setVehicles] = React.useState(loadVehicles());
  const [selectedVehicle, setSelectedVehicle] = React.useState(null);
  const [showRepairForm, setShowRepairForm] = React.useState(false);
  const [showAddVehicle, setShowAddVehicle] = React.useState(false);
  const [newRepair, setNewRepair] = React.useState({ date: '', description: '', cost: 0 });
  const [newVehicle, setNewVehicle] = React.useState({ name: '', type: 'car', details: '' });

  React.useEffect(() => {
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
    return React.createElement('div', { className: "min-h-screen bg-gray-900 text-white p-6" },
      React.createElement('div', { className: "max-w-7xl mx-auto" },
        React.createElement('div', { className: "flex justify-between items-center mb-8 flex-wrap gap-4" },
          React.createElement('div', {},
            React.createElement('h1', { className: "text-4xl font-bold mb-2" }, 'Fahrzeugverwaltung'),
            React.createElement('p', { className: "text-gray-400" }, 'Vehicle Management System')
          ),
          React.createElement('div', { className: "flex gap-3 flex-wrap" },
            React.createElement('button', { onClick: () => setShowAddVehicle(true), className: "px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 flex items-center gap-2" },
              React.createElement(Plus, { size: 20 }),
              React.createElement('div', {},
                React.createElement('div', {}, 'Neues Fahrzeug'),
                React.createElement('div', { className: "text-xs italic" }, 'New Vehicle')
              )
            ),
            React.createElement('button', { onClick: exportToExcel, className: "px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2" },
              React.createElement(Download, { size: 20 }),
              React.createElement('div', {},
                React.createElement('div', {}, 'Excel'),
                React.createElement('div', { className: "text-xs italic" }, 'Export')
              )
            ),
            React.createElement('button', { onClick: exportToJSON, className: "px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2" },
              React.createElement(Download, { size: 20 }),
              React.createElement('div', {},
                React.createElement('div', {}, 'Backup'),
                React.createElement('div', { className: "text-xs italic" }, 'Download')
              )
            ),
            React.createElement('label', { className: "px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2 cursor-pointer" },
              React.createElement(Upload, { size: 20 }),
              React.createElement('div', {},
                React.createElement('div', {}, 'Import'),
                React.createElement('div', { className: "text-xs italic" }, 'Upload')
              ),
              React.createElement('input', { type: "file", accept: ".json", onChange: importFromFile, className: "hidden" })
            )
          )
        ),

        showAddVehicle && React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 mb-8" },
          React.createElement('h2', { className: "text-2xl font-bold mb-4" }, 'Neues Fahrzeug hinzufügen'),
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" },
            React.createElement('input', { type: "text", value: newVehicle.name, onChange: (e) => setNewVehicle({ ...newVehicle, name: e.target.value }), placeholder: "Name", className: "bg-gray-700 rounded px-3 py-2" }),
            React.createElement('select', { value: newVehicle.type, onChange: (e) => setNewVehicle({ ...newVehicle, type: e.target.value }), className: "bg-gray-700 rounded px-3 py-2" },
              React.createElement('option', { value: "car" }, 'Auto'),
              React.createElement('option', { value: "bike" }, 'Motorrad/Roller')
            ),
            React.createElement('input', { type: "text", value: newVehicle.details, onChange: (e) => setNewVehicle({ ...newVehicle, details: e.target.value }), placeholder: "Details", className: "bg-gray-700 rounded px-3 py-2 md:col-span-2" })
          ),
          React.createElement('div', { className: "flex gap-3" },
            React.createElement('button', { onClick: addVehicle, className: "px-4 py-2 bg-green-600 rounded hover:bg-green-700" }, 'Hinzufügen'),
            React.createElement('button', { onClick: () => setShowAddVehicle(false), className: "px-4 py-2 bg-gray-600 rounded hover:bg-gray-700" }, 'Abbrechen')
          )
        ),
        
        React.createElement('div', { className: "bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8" },
          React.createElement('h2', { className: "text-2xl font-bold mb-2" },
            'Jahreskosten Gesamt',
            React.createElement('span', { className: "block text-sm font-normal italic text-gray-200" }, 'Total Annual Cost')
          ),
          React.createElement('p', { className: "text-4xl font-bold" }, `€${getTotalYearlyCost().toFixed(2)}`)
        ),

        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
          vehicles.map(vehicle => {
            const tuvDays = calculateDaysUntil(vehicle.tuv.date);
            const oilStatus = getOilChangeStatus(vehicle);
            return React.createElement('div', { key: vehicle.id, className: "bg-gray-800 rounded-lg p-6 relative group" },
              React.createElement('button', {
                onClick: () => setVehicles(prev => prev.filter(v => v.id !== vehicle.id)),
                className: "absolute top-4 right-4 p-2 bg-red-600 rounded-lg hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
              }, React.createElement(Trash2, { size: 16 })),
              React.createElement('div', { onClick: () => setSelectedVehicle(vehicle), className: "cursor-pointer" },
                React.createElement('div', { className: "flex items-center gap-3 mb-4" },
                  vehicle.type === 'car' ? React.createElement(Car, { size: 32 }) : React.createElement(Bike, { size: 32 }),
                  React.createElement('div', {},
                    React.createElement('h3', { className: "text-xl font-bold" }, vehicle.name),
                    React.createElement('p', { className: "text-gray-400 text-sm" }, vehicle.details)
                  )
                ),
                React.createElement('div', { className: "space-y-2 text-sm" },
                  React.createElement('div', { className: "flex justify-between" },
                    React.createElement('span', { className: "text-gray-400" },
                      'TÜV: ',
                      React.createElement('span', { className: "text-xs italic" }, 'Inspection')
                    ),
                    React.createElement('span', { className: tuvDays !== null && tuvDays < 30 ? 'text-red-400' : 'text-green-400' },
                      vehicle.tuv.date || React.createElement('span', {}, 'Nicht eingetragen'),
                      tuvDays !== null && ` (${tuvDays}T)`
                    )
                  ),
                  React.createElement('div', { className: "flex justify-between" },
                    React.createElement('span', { className: "text-gray-400" },
                      'Ölwechsel: ',
                      React.createElement('span', { className: "text-xs italic" }, 'Oil Change')
                    ),
                    React.createElement('span', { className: oilStatus.includes('fällig') ? 'text-red-400' : 'text-green-400' }, oilStatus)
                  ),
                  React.createElement('div', { className: "flex justify-between" },
                    React.createElement('span', { className: "text-gray-400" },
                      'Gesamtkosten: ',
                      React.createElement('span', { className: "text-xs italic" }, 'Total')
                    ),
                    React.createElement('span', { className: "text-blue-400 font-bold" }, `€${getVehicleTotalCost(vehicle).toFixed(2)}`)
                  )
                )
              )
            );
          })
        )
      )
    );
  }

  // Detail view
  return React.createElement('div', { className: "min-h-screen bg-gray-900 text-white p-6" },
    React.createElement('div', { className: "max-w-6xl mx-auto" },
      React.createElement('button', { onClick: () => setSelectedVehicle(null), className: "mb-6 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700" }, '← Zurück'),
      
      React.createElement('div', { className: "flex items-center gap-4 mb-8" },
        selectedVehicle.type === 'car' ? React.createElement(Car, { size: 48 }) : React.createElement(Bike, { size: 48 }),
        React.createElement('div', {},
          React.createElement('h1', { className: "text-4xl font-bold" }, selectedVehicle.name),
          React.createElement('p', { className: "text-gray-400" }, selectedVehicle.details)
        )
      ),

      React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" },
        React.createElement('div', { className: "bg-gray-800 rounded-lg p-6" },
          React.createElement('div', { className: "flex justify-between items-center mb-4" },
            React.createElement('h2', { className: "text-2xl font-bold flex items-center gap-2" },
              React.createElement(FileText, { size: 24 }),
              React.createElement('div', {},
                React.createElement('div', {}, 'Basis Informationen'),
                React.createElement('div', { className: "text-sm font-normal italic text-gray-400" }, 'Basic Information')
              )
            ),
            React.createElement('button', {
              onClick: () => {
                setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
                setSelectedVehicle(null);
              },
              className: "p-2 bg-red-600 rounded-lg hover:bg-red-700"
            }, React.createElement(Trash2, { size: 20 }))
          ),
          React.createElement('div', { className: "space-y-4" },
            React.createElement('div', {},
              React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
                'VIN / FIN',
                React.createElement('span', { className: "block text-xs italic" }, 'Vehicle ID')
              ),
              React.createElement('input', { type: "text", value: selectedVehicle.vin || '', onChange: (e) => updateVehicle(selectedVehicle.id, { vin: e.target.value }), className: "w-full bg-gray-700 rounded px-3 py-2" })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
                'KM-Stand',
                React.createElement('span', { className: "block text-xs italic" }, 'Mileage')
              ),
              React.createElement('input', { type: "number", value: selectedVehicle.currentKm || '', onChange: (e) => updateVehicle(selectedVehicle.id, { currentKm: parseInt(e.target.value) || 0 }), className: "w-full bg-gray-700 rounded px-3 py-2" })
            )
          )
        ),

        React.createElement('div', { className: "bg-gray-800 rounded-lg p-6" },
          React.createElement('h2', { className: "text-2xl font-bold mb-4 flex items-center gap-2" },
            React.createElement(Camera, { size: 24 }),
            React.createElement('div', {},
              React.createElement('div', {}, 'Fotos & Dokumente'),
              React.createElement('div', { className: "text-sm font-normal italic text-gray-400" }, 'Photos & Documents')
            )
          ),
          React.createElement('div', { className: "space-y-4" },
            React.createElement('div', {},
              React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
                'Fahrzeugfotos',
                React.createElement('span', { className: "block text-xs italic" }, 'Vehicle Photos')
              ),
              React.createElement('input', { type: "file", accept: "image/*", multiple: true, onChange: (e) => handleImageUpload(selectedVehicle.id, 'photo', e), className: "w-full bg-gray-700 rounded px-3 py-2 text-sm" }),
              React.createElement('div', { className: "flex gap-2 mt-2 flex-wrap" },
                selectedVehicle.photos.map((photo, idx) => React.createElement('img', { key: idx, src: photo, alt: "Vehicle", className: "w-20 h-20 object-cover rounded" }))
              )
            ),
            React.createElement('div', {},
              React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
                'Fahrzeugschein',
                React.createElement('span', { className: "block text-xs italic" }, 'Registration')
              ),
              React.createElement('input', { type: "file", accept: "image/*", multiple: true, onChange: (e) => handleImageUpload(selectedVehicle.id, 'document', e), className: "w-full bg-gray-700 rounded px-3 py-2 text-sm" }),
              React.createElement('div', { className: "flex gap-2 mt-2 flex-wrap" },
                selectedVehicle.documents.map((doc, idx) => React.createElement('img', { key: idx, src: doc, alt: "Doc", className: "w-20 h-20 object-cover rounded" }))
              )
            )
          )
        )
      ),

      React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 mb-6" },
        React.createElement('h2', { className: "text-2xl font-bold mb-4 flex items-center gap-2" },
          React.createElement(AlertCircle, { size: 24 }),
          React.createElement('div', {},
            React.createElement('div', {}, 'TÜV / HU'),
            React.createElement('div', { className: "text-sm font-normal italic text-gray-400" }, 'Technical Inspection')
          )
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
          React.createElement('div', {},
            React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
              'Datum',
              React.createElement('span', { className: "block text-xs italic" }, 'Date')
            ),
            React.createElement('input', { type: "date", value: selectedVehicle.tuv.date || '', onChange: (e) => updateVehicle(selectedVehicle.id, { tuv: { ...selectedVehicle.tuv, date: e.target.value } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
          ),
          React.createElement('div', {},
            React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
              'Kosten (€)',
              React.createElement('span', { className: "block text-xs italic" }, 'Cost')
            ),
            React.createElement('input', { type: "number", step: "0.01", value: selectedVehicle.tuv.cost || '', onChange: (e) => updateVehicle(selectedVehicle.id, { tuv: { ...selectedVehicle.tuv, cost: parseFloat(e.target.value) || 0 } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
          ),
          React.createElement('div', {},
            React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
              'Verbleibend',
              React.createElement('span', { className: "block text-xs italic" }, 'Remaining')
            ),
            React.createElement('div', { className: "bg-gray-700 rounded px-3 py-2 h-[42px] flex items-center" },
              calculateDaysUntil(selectedVehicle.tuv.date) !== null ? `${calculateDaysUntil(selectedVehicle.tuv.date)} Tage` : '-'
            )
          )
        )
      ),

      React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 mb-6" },
        React.createElement('h2', { className: "text-2xl font-bold mb-4 flex items-center gap-2" },
          React.createElement(Wrench, { size: 24 }),
          React.createElement('div', {},
            React.createElement('div', {}, 'Ölwechsel'),
            React.createElement('div', { className: "text-sm font-normal italic text-gray-400" }, 'Oil Change')
          )
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" },
          React.createElement('div', {},
            React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
              'Letzter Wechsel',
              React.createElement('span', { className: "block text-xs italic" }, 'Last Change')
            ),
            React.createElement('input', { type: "date", value: selectedVehicle.oil.lastChange || '', onChange: (e) => updateVehicle(selectedVehicle.id, { oil: { ...selectedVehicle.oil, lastChange: e.target.value } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
          ),
          React.createElement('div', {},
            React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
              'KM beim Wechsel',
              React.createElement('span', { className: "block text-xs italic" }, 'Mileage at Change')
            ),
            React.createElement('input', { type: "number", value: selectedVehicle.oil.lastKm || '', onChange: (e) => updateVehicle(selectedVehicle.id, { oil: { ...selectedVehicle.oil, lastKm: parseInt(e.target.value) || 0 } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
          )
        ),
        React.createElement('div', { className: "bg-gray-700 rounded p-4" },
          React.createElement('p', { className: "text-sm text-gray-400" },
            `Intervall: ${selectedVehicle.oil.interval} km / ${selectedVehicle.oil.intervalMonths} Monate`,
            React.createElement('span', { className: "block text-xs italic" }, `Interval: ${selectedVehicle.oil.interval} km / ${selectedVehicle.oil.intervalMonths} months`)
          ),
          React.createElement('p', { className: "text-lg font-bold mt-2" }, getOilChangeStatus(selectedVehicle))
        )
      ),

      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" },
        React.createElement('div', { className: "bg-gray-800 rounded-lg p-6" },
          React.createElement('h2', { className: "text-2xl font-bold mb-4 flex items-center gap-2" },
React.createElement(DollarSign, { size: 24 }),
React.createElement('div', {},
React.createElement('div', {}, 'KFZ-Steuer'),
React.createElement('div', { className: "text-sm font-normal italic text-gray-400" }, 'Vehicle Tax')
)
),
React.createElement('div', { className: "space-y-4" },
React.createElement('div', {},
React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
'Jährlich (€)',
React.createElement('span', { className: "block text-xs italic" }, 'Annual')
),
React.createElement('input', { type: "number", step: "0.01", value: selectedVehicle.tax.amount || '', onChange: (e) => updateVehicle(selectedVehicle.id, { tax: { ...selectedVehicle.tax, amount: parseFloat(e.target.value) || 0 } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
),
React.createElement('div', {},
React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
'Fällig am',
React.createElement('span', { className: "block text-xs italic" }, 'Due Date')
),
React.createElement('input', { type: "date", value: selectedVehicle.tax.dueDate || '', onChange: (e) => updateVehicle(selectedVehicle.id, { tax: { ...selectedVehicle.tax, dueDate: e.target.value } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
)
)
),React.createElement('div', { className: "bg-gray-800 rounded-lg p-6" },
      React.createElement('h2', { className: "text-2xl font-bold mb-4 flex items-center gap-2" },
        React.createElement(DollarSign, { size: 24 }),
        React.createElement('div', {},
          React.createElement('div', {}, 'Versicherung'),
          React.createElement('div', { className: "text-sm font-normal italic text-gray-400" }, 'Insurance')
        )
      ),
      React.createElement('div', { className: "space-y-4" },
        React.createElement('div', {},
          React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
            'Jährlich (€)',
            React.createElement('span', { className: "block text-xs italic" }, 'Annual')
          ),
          React.createElement('input', { type: "number", step: "0.01", value: selectedVehicle.insurance.amount || '', onChange: (e) => updateVehicle(selectedVehicle.id, { insurance: { ...selectedVehicle.insurance, amount: parseFloat(e.target.value) || 0 } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
        ),
        React.createElement('div', {},
          React.createElement('label', { className: "block text-sm text-gray-400 mb-2" },
            'Fällig am',
            React.createElement('span', { className: "block text-xs italic" }, 'Due Date')
          ),
          React.createElement('input', { type: "date", value: selectedVehicle.insurance.dueDate || '', onChange: (e) => updateVehicle(selectedVehicle.id, { insurance: { ...selectedVehicle.insurance, dueDate: e.target.value } }), className: "w-full bg-gray-700 rounded px-3 py-2" })
        )
      )
    )
  ),

  React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 mb-6" },
    React.createElement('div', { className: "flex justify-between items-center mb-4" },
      React.createElement('h2', { className: "text-2xl font-bold flex items-center gap-2" },
        React.createElement(Wrench, { size: 24 }),
        React.createElement('div', {},
          React.createElement('div', {}, 'Reparaturen'),
          React.createElement('div', { className: "text-sm font-normal italic text-gray-400" }, 'Repairs')
        )
      ),
      React.createElement('button', { onClick: () => setShowRepairForm(!showRepairForm), className: "px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2" },
        React.createElement(Plus, { size: 20 }), ' Neue Reparatur'
      )
    ),

    showRepairForm && React.createElement('div', { className: "bg-gray-700 rounded-lg p-4 mb-4" },
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" },
        React.createElement('input', { type: "date", value: newRepair.date || '', onChange: (e) => setNewRepair({ ...newRepair, date: e.target.value }), className: "bg-gray-600 rounded px-3 py-2" }),
        React.createElement('input', { type: "text", value: newRepair.description || '', onChange: (e) => setNewRepair({ ...newRepair, description: e.target.value }), placeholder: "Beschreibung", className: "bg-gray-600 rounded px-3 py-2" }),
        React.createElement('input', { type: "number", step: "0.01", value: newRepair.cost || '', onChange: (e) => setNewRepair({ ...newRepair, cost: parseFloat(e.target.value) || 0 }), placeholder: "Kosten (€)", className: "bg-gray-600 rounded px-3 py-2" })
      ),
      React.createElement('button', { onClick: () => addRepair(selectedVehicle.id), className: "px-4 py-2 bg-green-600 rounded hover:bg-green-700" }, 'Speichern')
    ),

    React.createElement('div', { className: "space-y-2" },
      selectedVehicle.repairs.length === 0 ? React.createElement('p', { className: "text-gray-400 text-center py-4" }, 'Keine Reparaturen') :
      selectedVehicle.repairs.map(repair =>
        React.createElement('div', { key: repair.id, className: "bg-gray-700 rounded p-3" },
          React.createElement('div', { className: "flex justify-between items-start" },
            React.createElement('div', { className: "flex-1" },
              React.createElement('p', { className: "font-bold" }, repair.description),
              React.createElement('p', { className: "text-sm text-gray-400" }, repair.date)
            ),
            React.createElement('p', { className: "text-lg font-bold text-red-400" }, `€${repair.cost.toFixed(2)}`)
          ),
          React.createElement('button', {
            onClick: () => {
              setVehicles(prev => prev.map(v => {
                if (v.id === selectedVehicle.id) {
                  return { ...v, repairs: v.repairs.filter(r => r.id !== repair.id) };
                }
                return v;
              }));
              setSelectedVehicle(prev => ({ ...prev, repairs: prev.repairs.filter(r => r.id !== repair.id) }));
            },
            className: "mt-2 w-full px-3 py-2 bg-red-600 rounded hover:bg-red-700 text-white font-bold"
          }, 'LÖSCHEN / DELETE')
        )
      )
    )
  ),

  React.createElement('div', { className: "bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6" },
    React.createElement('h2', { className: "text-2xl font-bold mb-4" },
      `Gesamtkosten ${selectedVehicle.name}`,
      React.createElement('span', { className: "block text-sm font-normal italic" }, `Total Cost ${selectedVehicle.name}`)
    ),
    React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center" },
      React.createElement('div', {},
        React.createElement('p', { className: "text-sm" }, 'TÜV'),
        React.createElement('p', { className: "text-2xl font-bold" }, `€${selectedVehicle.tuv.cost.toFixed(2)}`)
      ),
      React.createElement('div', {},
        React.createElement('p', { className: "text-sm" }, 'Steuer'),
        React.createElement('p', { className: "text-2xl font-bold" }, `€${selectedVehicle.tax.amount.toFixed(2)}`)
      ),
      React.createElement('div', {},
        React.createElement('p', { className: "text-sm" }, 'Versicherung'),
        React.createElement('p', { className: "text-2xl font-bold" }, `€${selectedVehicle.insurance.amount.toFixed(2)}`)
      ),
      React.createElement('div', {},
        React.createElement('p', { className: "text-sm" }, 'Reparaturen'),
        React.createElement('p', { className: "text-2xl font-bold" }, `€${selectedVehicle.repairs.reduce((s, r) => s + r.cost, 0).toFixed(2)}`)
      )
    ),
    React.createElement('div', { className: "mt-6 pt-6 border-t border-white/20 text-center" },
      React.createElement('p', { className: "text-sm mb-2" }, 'GESAMT / TOTAL'),
      React.createElement('p', { className: "text-4xl font-bold" }, `€${getVehicleTotalCost(selectedVehicle).toFixed(2)}`)
    )
  )
));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(VehicleManager));

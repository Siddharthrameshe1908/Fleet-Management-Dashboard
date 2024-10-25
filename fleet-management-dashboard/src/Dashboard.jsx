import { useState, useEffect } from "react";
import axios from 'axios'

const Dashboard = () => {
    const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    batteryPercentage: '',
    totalDistance: '',
    lastChargeTime: '',
    status: 'Idle',
    scheduledChargeTime: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Fetch vehicles from json-server on component mount
  useEffect(() => {
    axios.get('http://localhost:4000/vehicles')
      .then(response => setVehicles(response.data))
      .catch(error => console.error('Error fetching vehicles:', error));
  }, []);

  // Low Battery Warning
  useEffect(() => {
    const lowBatteryVehicles = vehicles.filter(vehicle => vehicle.batteryPercentage < 15);
    if (lowBatteryVehicles.length > 0) {
      alert(`Warning: ${lowBatteryVehicles.length} vehicle(s) have low battery!`);
    }
  }, [vehicles]);

  // Submit handler for adding or updating a vehicle
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      // Update vehicle if in edit mode
      axios.put(`http://localhost:4000/vehicles/${currentEditId}`, formData)
        .then(response => {
          const updatedVehicles = vehicles.map(vehicle =>
            vehicle.id === currentEditId ? response.data : vehicle
          );
          setVehicles(updatedVehicles);
          setEditMode(false);
          setCurrentEditId(null);
        })
        .catch(error => console.error('Error updating vehicle:', error));
    } else {
      // Add new vehicle if not in edit mode
      axios.post('http://localhost:4000/vehicles', formData)
        .then(response => {
          setVehicles([...vehicles, response.data]);
        })
        .catch(error => console.error('Error adding vehicle:', error));
    }

    // Reset form after submit
    setFormData({
      vehicleId: '',
      batteryPercentage: '',
      totalDistance: '',
      lastChargeTime: '',
      status: 'Idle',
      scheduledChargeTime: null,
    });
  };

  // Edit vehicle: populate form fields with the selected vehicle’s data
  const handleEdit = (vehicleId) => {
    const vehicleToEdit = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicleToEdit) {
      setFormData(vehicleToEdit);
      setEditMode(true);
      setCurrentEditId(vehicleId);
    }
  };

  // Delete a vehicle from the list
  const handleDelete = (vehicleId) => {
    axios.delete(`http://localhost:4000/vehicles/${vehicleId}`)
      .then(() => {
        const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
        setVehicles(updatedVehicles);
      })
      .catch(error => console.error('Error deleting vehicle:', error));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Fleet Management System</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-100 shadow-lg rounded-lg space-y-4">
        <div>
          <input
            type="text"
            placeholder="Vehicle ID"
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            className="input-field w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-indigo-500"
            required
            disabled={editMode}
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Battery %"
            value={formData.batteryPercentage}
            onChange={(e) => setFormData({ ...formData, batteryPercentage: e.target.value })}
            className="input-field w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Total Distance (km)"
            value={formData.totalDistance}
            onChange={(e) => setFormData({ ...formData, totalDistance: e.target.value })}
            className="input-field w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <input
            type="datetime-local"
            value={formData.lastChargeTime}
            onChange={(e) => setFormData({ ...formData, lastChargeTime: e.target.value })}
            className="input-field w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-indigo-500" required>
            <option value="Idle">Idle</option>
            <option value="In Transit">In Transit</option>
            <option value="Charging">Charging</option>
          </select>
        </div>
        <button type="submit" className="w-full py-3 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-600">
          {editMode ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-5">Fleet Vehicles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className={`p-6 rounded-lg shadow-lg ${vehicle.batteryPercentage < 15 ? 'bg-red-100 border border-red-400' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-2">{vehicle.vehicleId}</h2>
            <p>Battery: {vehicle.batteryPercentage}%</p>
            <p>Total Distance: {vehicle.totalDistance} km</p>
            <p>Status: {vehicle.status}</p>
            <p>Last Charge: {vehicle.lastChargeTime}</p>

            <div className="mt-4 space-x-2">
              <button onClick={() => handleEdit(vehicle.id)} className="btn btn-secondary bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Edit
              </button>
              <button onClick={() => handleDelete(vehicle.id)} className="btn btn-danger bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard
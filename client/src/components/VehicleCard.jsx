import StatusBadge from './StatusBadge';
import { BASE_URL } from '../api/axios';

const VehicleCard = ({ vehicle }) => {
    const photoUrl = vehicle.photo_path
        ? `${BASE_URL}${vehicle.photo_path}`
        : null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            {/* Vehicle Photo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                {photoUrl ? (
                    <img src={photoUrl} alt={vehicle.vehicle_number} className="w-full h-full object-cover" />
                ) : (
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-3m-9 0h10M12 17v-5m0 0l-3 3m3-3l3 3" />
                    </svg>
                )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{vehicle.vehicle_number}</p>
                <p className="text-xs text-gray-500 mt-0.5">{vehicle.vehicle_type}</p>
                <p className="text-xs text-gray-500 truncate">👤 {vehicle.driver_name}</p>
            </div>
            <StatusBadge status={vehicle.status} />
        </div>
    );
};

export default VehicleCard;

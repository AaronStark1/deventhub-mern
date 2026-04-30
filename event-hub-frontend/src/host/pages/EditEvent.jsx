import { useParams } from "react-router-dom";
import { useState } from "react";
import { updateEventAPI } from "../../services/allAPIs";

export default function EditEvent() {
  const { id } = useParams();
  const [capacity, setCapacity] = useState("");

  const handleUpdate = async () => {
    await updateEventAPI(id, { capacity });
    alert("Event updated");
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit Event
      </h1>

      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        className="w-full p-3 rounded border mb-4"
      />

      <button
        onClick={handleUpdate}
        className="w-full py-3 bg-primary text-white rounded-lg"
      >
        Save Changes
      </button>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateEventAPI } from "../../services/allAPIs";
import { getErrorMessage } from "../../services/api";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (!capacity || Number(capacity) < 1) {
      alert("Enter a valid capacity");
      return;
    }

    try {
      setSaving(true);
      await updateEventAPI(id, { capacity: Number(capacity) });
      alert("Event updated");
      navigate("/host/dashboard");
    } catch (err) {
      alert(getErrorMessage(err, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit Event
      </h1>

      <input
        type="number"
        min="1"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        className="w-full p-3 rounded border mb-4"
      />

      <button
        onClick={handleUpdate}
        disabled={saving}
        className="w-full py-3 bg-primary text-white rounded-lg disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

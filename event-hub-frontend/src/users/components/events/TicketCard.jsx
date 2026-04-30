import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TicketCard({ event, user }) {
  const ticketRef = useRef();
  const ticketId = `${event._id.slice(-6)}-${user.email.split("@")[0]}`;

  const downloadTicket = async () => {
    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${event.title.replace(/\s+/g, "_")}_${ticketId}.pdf`);
  };

  return (
    <div className="flex flex-col items-center gap-8">

      {/* A4 SHEET EXACT SIZE */}
<div
  ref={ticketRef}
  className="w-[794px] h-[1123px] bg-white font-sans flex flex-col"
>

  {/* HEADER */}
  <div className="bg-[#1f3f43] text-white px-12 py-10 flex items-center justify-between">
    <div>
      <h1 className="text-4xl font-bold tracking-wide">
        {event.title}
      </h1>
      <p className="mt-2 text-lg opacity-90">
        Official Entry Pass
      </p>
    </div>

    <img
      src="/default.png"
      alt="DEVentHub"
      className="h-20 w-auto object-contain"
    />
  </div>

  {/* BODY */}
  <div className="flex-1 px-14 py-8 text-gray-900 flex flex-col">

    {/* POSTER */}
    <div className="flex justify-center mb-8">
      <img
        src={event.poster}
        alt={event.title}
        className="max-h-[520px] w-auto object-contain"
      />
    </div>

    {/* DETAILS */}
    <div className="grid grid-cols-2 gap-10 text-lg font-medium mb-10">
      <p>📅 {new Date(event.date).toDateString()}</p>
      <p>⏰ {event.time}</p>
      <p>📍 {event.isOnline ? "Online Event" : event.location}</p>
      <p>
        🎟 {event.priceType === "free"
          ? "Free Entry"
          : `₹${event.price}`}
      </p>
    </div>

    {/* ATTENDEE */}
    <div className="border-t pt-6 space-y-2 text-base mt-auto">
      <p><span className="font-semibold">Attendee:</span> {user.name}</p>
      <p><span className="font-semibold">Email:</span> {user.email}</p>
      <p>
        <span className="font-semibold">Ticket ID:</span>{" "}
        <span className="font-mono text-gray-700">{ticketId}</span>
      </p>
    </div>

  </div>

  {/* FOOTER — FULL WIDTH NOW */}
  <div className="bg-[#1f3f43] text-white px-12 py-6 text-center">
    <div className="text-sm opacity-90 mb-3">
      Please present this ticket (printed or digital) at the event entrance.
    </div>

    <div className="flex items-center justify-center gap-3 text-xs opacity-80">
      <span>Powered by</span>
      <img
        src="/cover.png"
        alt="DEVentHub"
        className="h-6 w-auto object-contain"
      />
    </div>
  </div>

</div>


      <button
        onClick={downloadTicket}
        className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition shadow"
      >
        Download Ticket
      </button>

    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// The ticket is laid out at A4 size (at 96dpi) so the PDF is pixel-exact.
// On narrower screens it's scaled down to fit; the capture ignores that scale.
const TICKET_WIDTH = 794;
const TICKET_HEIGHT = 1123;

export default function TicketCard({ event, user }) {
  const ticketRef = useRef();
  const frameRef = useRef();
  const scaledRef = useRef();
  const [generating, setGenerating] = useState(false);

  const ticketId = `${event._id.slice(-6)}-${user.email.split("@")[0]}`;

  // Fit the fixed-size ticket into whatever width is available. Done with
  // direct style writes so a resize doesn't re-render the whole card.
  useEffect(() => {
    const frame = frameRef.current;
    const scaled = scaledRef.current;
    if (!frame || !scaled) return;

    const fit = () => {
      const scale = Math.min(1, frame.clientWidth / TICKET_WIDTH);
      scaled.style.transform = `scale(${scale})`;
      frame.style.height = `${Math.round(TICKET_HEIGHT * scale)}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const downloadTicket = async () => {
    try {
      setGenerating(true);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        // Give the clone a viewport wide enough for the unscaled ticket.
        windowWidth: Math.max(window.innerWidth, TICKET_WIDTH + 64),
        windowHeight: Math.max(window.innerHeight, TICKET_HEIGHT + 64),
        // Capture at natural size: undo the on-screen fit in the clone only.
        onclone: (doc) => {
          const clonedScaled = doc.querySelector("[data-ticket-scaled]");
          const clonedFrame = doc.querySelector("[data-ticket-frame]");
          if (clonedScaled) clonedScaled.style.transform = "none";
          if (clonedFrame) {
            clonedFrame.style.height = "auto";
            clonedFrame.style.overflow = "visible";
          }
        },
      });

      // JPEG: a lossless PNG of an A4 page at 2x is ~10 MB; this is ~1 MB
      // with no visible difference on a white ticket.
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${event.title.replace(/\s+/g, "_")}_${ticketId}.pdf`);
    } catch (err) {
      console.error("Ticket export failed", err);
      alert("Could not generate the ticket PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">

      {/* Responsive frame: height is set to the scaled ticket height */}
      <div
        ref={frameRef}
        data-ticket-frame
        className="w-full max-w-[794px] overflow-hidden shadow-xl"
      >
        <div ref={scaledRef} data-ticket-scaled className="origin-top-left">

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
        </div>
      </div>

      <button
        onClick={downloadTicket}
        disabled={generating}
        className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition shadow disabled:opacity-60"
      >
        {generating ? "Preparing PDF…" : "Download Ticket"}
      </button>

    </div>
  );
}

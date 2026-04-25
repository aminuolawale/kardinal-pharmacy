export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2348134567890"
      className="whatsapp-btn"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 2C7.373 2 2 7.373 2 14c0 2.147.56 4.163 1.54 5.914L2 26l6.302-1.517A11.94 11.94 0 0014 26c6.627 0 12-5.373 12-12S20.627 2 14 2z" fill="white" />
        <path d="M10.5 9.5c.3 0 .65.02.9.6l1.1 2.6c.15.35.05.75-.2 1.05l-.6.7c.5 1 1.4 1.9 2.4 2.4l.7-.6c.3-.25.7-.35 1.05-.2l2.6 1.1c.58.25.6.6.6.9v1.4c0 .55-.4 1-1 1C12.5 20.5 7.5 15.5 7.5 10c0-.6.45-1 1-1h2z" fill="#25D366" />
      </svg>
    </a>
  )
}

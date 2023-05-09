type ButtonProps = {
  onClick: () => void;
}

export default function RFAddButton({onClick}: ButtonProps) {
  return (
    <button
      className="bg-black hover:bg-blue-500 transition-colors p-2"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 stroke-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </button>
  )
}
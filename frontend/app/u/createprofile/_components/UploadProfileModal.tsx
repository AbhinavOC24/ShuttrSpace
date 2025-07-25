import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
export default function UploadProfileModal({
  isOpen,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className=" w-[400px] h-fit rounded-5xl   relative  bg-black border border-[#4d4d4d] shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)]">
        <button
          onClick={onClose}
          className="absolute topp-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
